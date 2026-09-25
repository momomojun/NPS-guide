import {
  buildTimeline,
  lodgingLeg,
  rankLodging,
  type LodgingPoint,
  type LodgingRank,
  type PlanStop,
  type SunWindow,
} from "./planner";
import { planTrip } from "./trip-plan";
import type { Trip, TripItem, TripLodging } from "./trip-store";

export type Pace = "relaxed" | "normal" | "packed";
/** 住宿偏好：不限 / 只住酒店和园内住宿 / 优先民宿（Airbnb 等整套房子） */
export type LodgingPref = "any" | "hotel" | "rental";

type Endpoint = Extract<TripLodging, { kind: "custom" }>;

/** 自动生成攻略的输入：月份（或具体日期）、天数、公园（可以几个顺路一起玩）、出发地和回程地、节奏、住宿偏好 */
export interface GenerateInput {
  parks: string[];
  month: number;
  /** 具体出发日期，没有就是空字符串 */
  startDate: string;
  days: number;
  origin: Endpoint;
  destination: Endpoint;
  pace: Pace;
  lodgingPref: LodgingPref;
}

/** 参与挑选的景点：排行程需要的字段 + 热度、季节、许可证 */
export interface GuideStop extends PlanStop {
  mustSee?: boolean;
  hotRank?: number;
  openMonths?: number[];
  bestMonths?: number[];
  permit?: string;
  lottery?: boolean;
  outsidePark?: boolean;
  hike?: { difficulty: "easy" | "moderate" | "hard" };
}

export interface GuideLodging extends LodgingPoint {
  inPark: boolean;
  /** 民宿区 */
  rental?: boolean;
  /** 能在 Airbnb 上搜到房子的地方（民宿区和门户小镇） */
  airbnb?: string;
}

export interface GenerateContext {
  /** 所选公园的全部景点 */
  stops: GuideStop[];
  /** 所选公园的推荐住宿（含民宿区） */
  lodging: GuideLodging[];
  /** 第 day 天的日出日落 */
  sunFor: (day: number) => SunWindow;
}

/** 没排进去的景点和原因，攻略说明里列出来 */
export interface GuideSkipped {
  permit: string[];
  closed: string[];
  tooHard: string[];
  noTime: string[];
}

export interface GuideInfo {
  /** 所选公园；旧版行程没有，用 guideParks() 读 */
  parks?: string[];
  /** 旧版只有一个公园 */
  park?: string;
  pace: Pace;
  lodgingPref?: LodgingPref;
  skipped: GuideSkipped;
}

/** 攻略涉及的公园（兼容旧版只存了一个公园的行程） */
export function guideParks(guide: GuideInfo): string[] {
  return guide.parks ?? (guide.park ? [guide.park] : []);
}

/** 每天活动 + 园内开车的目标分钟数 */
const DAILY_BUDGET: Record<Pace, number> = { relaxed: 390, normal: 480, packed: 570 };
/** 一天从出发到回住处（含开车）的上限，超过就去掉景点；有空时也按这个往回加 */
const DAY_LIMIT: Record<Pace, number> = { relaxed: 510, normal: 600, packed: 660 };
/** 最后补景点时最多试几个 */
const FILL_TRIES = 8;
/** 补景点后重新分天，车程取整会差几分钟；超出不到这么多也算没变满 */
const FILL_SLACK_MIN = 15;
/** 超过这么久的徒步不自动排（可以手动加） */
const MAX_HIKE_MIN: Record<Pace, number> = { relaxed: 240, normal: 420, packed: 600 };
/** 园内景点之间平均每天开车的分钟数，估算时间预算用 */
const PARK_DRIVING_PER_DAY = 45;
/** 连住同一家：换一家只省不到这么多分钟车程就不换 */
const STAY_PUT_MIN = 30;
/** 园内住宿按少开这么多分钟算（省去进出大门） */
const IN_PARK_BONUS = 10;
/** 优先民宿时，专门的民宿区比门户小镇多算这么多分钟的优势 */
const RENTAL_BONUS = 20;

function score(stop: GuideStop, month: number, parkSize: number): number {
  let value = 0;
  if (stop.mustSee) value += 50;
  if (stop.hotRank !== undefined) value += 40 * (1 - (stop.hotRank - 1) / Math.max(parkSize, 1));
  if (stop.bestMonths?.includes(month)) value += 12;
  // 瀑布过了最佳月份水量小，有的会断流
  else if (stop.kind === "waterfall" && stop.bestMonths) value -= 30;
  if (stop.kind === "visitor") value -= 20;
  if (stop.outsidePark) value -= 25;
  // 同样热门时，短的优先，能多看几个地方
  value -= stop.durationMin / 25;
  return value;
}

export function generateTrip(input: GenerateInput, context: GenerateContext): { trip: Trip; guide: GuideInfo } {
  const skipped: GuideSkipped = { permit: [], closed: [], tooHard: [], noTime: [] };
  const available: GuideStop[] = [];
  for (const stop of context.stops) {
    if (stop.openMonths && !stop.openMonths.includes(input.month)) skipped.closed.push(stop.id);
    else if (stop.permit && stop.lottery) skipped.permit.push(stop.id);
    else if (
      stop.kind === "hike" &&
      (stop.durationMin > MAX_HIKE_MIN[input.pace] || (input.pace === "relaxed" && stop.hike?.difficulty === "hard"))
    ) {
      skipped.tooHard.push(stop.id);
    } else available.push(stop);
  }

  // 热度名次是按公园排的，按各自公园的景点数折算
  const parkSize = new Map<string, number>();
  for (const stop of context.stops) parkSize.set(stop.park, (parkSize.get(stop.park) ?? 0) + 1);
  const scores = new Map(available.map((stop) => [stop.id, score(stop, input.month, parkSize.get(stop.park) ?? 1)]));
  const ranked = [...available].sort((a, b) => scores.get(b.id)! - scores.get(a.id)!);

  // 时间预算：扣掉从出发地开到公园、从公园开到回程地的时间（按最近的景点算）
  const reach = (point: LodgingPoint) =>
    available.length > 0 ? Math.min(...available.map((stop) => lodgingLeg(point, stop, "out"))) : 0;
  let budget =
    input.days * DAILY_BUDGET[input.pace] -
    reach(input.origin) -
    reach(input.destination) -
    input.days * PARK_DRIVING_PER_DAY;
  const chosen: GuideStop[] = [];
  for (const stop of ranked) {
    if (stop.durationMin <= budget) {
      chosen.push(stop);
      budget -= stop.durationMin + 15;
    } else if (stop.mustSee || (stop.hotRank ?? 99) <= 5) {
      skipped.noTime.push(stop.id);
    }
  }

  const stopById = new Map<string, PlanStop>(context.stops.map((stop) => [stop.id, stop]));
  const lodgingById = new Map(context.lodging.map((option) => [option.id, option]));
  // 只住酒店：去掉民宿区；优先民宿：只在能订 Airbnb 的民宿区和门户小镇里挑（这个公园没有的话不限）
  const rentalChoices = context.lodging.filter((option) => option.rental || (option.airbnb && !option.inPark));
  const lodgingChoices =
    input.lodgingPref === "hotel"
      ? context.lodging.filter((option) => !option.rental)
      : input.lodgingPref === "rental" && rentalChoices.length > 0
        ? rentalChoices
        : context.lodging;
  const resolve = (lodging: TripLodging | null | undefined): LodgingPoint | undefined =>
    !lodging ? undefined : lodging.kind === "custom" ? lodging : lodgingById.get(lodging.id);
  const sunFor = (day: number) => context.sunFor(day);

  const nights: (TripLodging | null)[] = Array.from({ length: input.days + 1 }, () => null);
  nights[0] = input.origin;
  nights[input.days] = input.destination;
  let trip: Trip = {
    version: 2,
    startDate: input.startDate,
    month: input.startDate ? undefined : input.month,
    dayCount: input.days,
    days: Array.from({ length: input.days }, () => []),
    pool: chosen.map((stop) => stop.id),
    nights,
  };

  const plan = (current: Trip): Trip => ({
    ...current,
    days: planTrip(current, stopById, sunFor, (night) => resolve(current.nights[night])),
    pool: [],
  });

  // 每晚住哪：当天最后一站回去 + 第二天去第一站的车程最短；差不多时连住同一家
  const chooseLodging = (current: Trip): Trip => {
    const next = [...current.nights];
    for (let night = 1; night < current.dayCount; night++) {
      const lastStop = stopById.get(current.days[night - 1].at(-1)?.id ?? "");
      const nextStop = stopById.get(current.days[night][0]?.id ?? "");
      const bonus = (lodging: GuideLodging) =>
        input.lodgingPref === "rental" ? (lodging.rental ? RENTAL_BONUS : 0) : lodging.inPark ? IN_PARK_BONUS : 0;
      const cost = (rank: LodgingRank<GuideLodging>) => (rank.backMin ?? 0) + (rank.outMin ?? 0) - bonus(rank.lodging);
      const ranking = rankLodging(lodgingChoices, lastStop, nextStop).sort((a, b) => cost(a) - cost(b));
      if (ranking.length === 0) continue;
      const previous = next[night - 1];
      const stay = previous?.kind === "option" ? ranking.find((rank) => rank.lodging.id === previous.id) : undefined;
      const best = stay && cost(stay) <= cost(ranking[0]) + STAY_PUT_MIN ? stay : ranking[0];
      next[night] = { kind: "option", id: best.lodging.id };
    }
    return { ...current, nights: next };
  };

  trip = plan(trip);
  trip = plan(chooseLodging(trip));
  trip = plan(chooseLodging(trip));

  // 按现在的住处算每天的时间线
  const timelines = (current: Trip) => {
    let previous: PlanStop | undefined;
    return current.days.map((day, d) => {
      const stops = day.map((item) => stopById.get(item.id)).filter((stop): stop is PlanStop => stop !== undefined);
      const timeline = buildTimeline(stops, {
        sun: sunFor(d),
        from: resolve(current.nights[d]),
        to: resolve(current.nights[d + 1]),
        previous,
      });
      previous = stops.at(-1) ?? previous;
      return { stops, timeline };
    });
  };
  const tooLong = (timeline: ReturnType<typeof buildTimeline>) =>
    timeline.overloaded || timeline.lateReturn || timeline.activeMin > DAY_LIMIT[input.pace];

  // 还有太满或回住处太晚的天：去掉那天分数最低的景点（尽量不动必去），重新排
  for (let round = 0; round < 12; round++) {
    const busyDay = timelines(trip).findIndex(({ stops, timeline }) => stops.length > 1 && tooLong(timeline));
    if (busyDay < 0) break;
    const candidates = trip.days[busyDay]
      .map((item) => context.stops.find((stop) => stop.id === item.id)!)
      .sort((a, b) => Number(Boolean(a.mustSee)) - Number(Boolean(b.mustSee)) || scores.get(a.id)! - scores.get(b.id)!);
    const victim = candidates[0];
    skipped.noTime.push(victim.id);
    const without = (day: TripItem[]) => day.filter((item) => item.id !== victim.id);
    trip = plan(chooseLodging(plan({ ...trip, days: trip.days.map(without) })));
  }

  // 按节奏还有空的天：把没排进去的景点按分数试着加回来，排完没有哪天变得更满才留下
  const excess = (current: Trip) =>
    timelines(current).reduce(
      (sum, { timeline }) =>
        sum +
        Math.max(0, timeline.activeMin - DAY_LIMIT[input.pace]) +
        (timeline.overloaded || timeline.lateReturn ? 1000 : 0),
      0,
    );
  // 和补景点之前比：整个补景点过程加起来最多多超 FILL_SLACK_MIN 分钟
  const baseExcess = excess(trip);
  const planned = new Set(trip.days.flat().map((item) => item.id));
  for (const stop of ranked.filter((candidate) => !planned.has(candidate.id)).slice(0, FILL_TRIES)) {
    const trial = plan(chooseLodging(plan({ ...trip, pool: [stop.id] })));
    const trialExcess = excess(trial);
    if (trialExcess <= baseExcess + FILL_SLACK_MIN) {
      trip = trial;
      skipped.noTime = skipped.noTime.filter((id) => id !== stop.id);
    }
  }

  const guide: GuideInfo = { parks: input.parks, pace: input.pace, lodgingPref: input.lodgingPref, skipped };
  return { trip: { ...trip, guide }, guide };
}
