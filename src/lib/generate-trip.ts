import {
  arrangeDay,
  buildTimeline,
  LATE_RETURN,
  lodgingLeg,
  rankLodging,
  type LodgingPoint,
  type LodgingRank,
  type PlanStop,
  type SunWindow,
} from "./planner";
import { addDays } from "./dates";
import { acrossClosedRoad, bestRoadDay, openChance, ROAD_LIKELY, roadDecides, roadFor, roadStatus } from "./roads";
import { runsOn } from "./tours";
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
  /** 园内片区 */
  area?: string;
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
  /** 第 day 天的日期（班车季要坐班车）；只定了月份时是那个月 15 号左右 */
  dateFor?: (day: number) => string | null;
}

/** 没排进去的景点和原因，攻略说明里列出来 */
export interface GuideSkipped {
  permit: string[];
  closed: string[];
  tooHard: string[];
  noTime: string[];
  /** 离其他景点太远、要专门绕路（旧版行程没有） */
  tooFar?: string[];
  /** 季节性山路这几天封着、在路的另一侧要绕到园外（旧版行程没有） */
  across?: string[];
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
/** 补一个景点，它那天多开的车不能超过它本身的停留时间，至少也给这么多分钟（不为了 20 分钟的观景点多绕三小时） */
const FILL_DETOUR_MIN = 30;
/** 一个片区当天只排了这么几个不是必去的景点时，看是不是为了它们专门绕路 */
const REMOTE_GROUP_MAX = 2;
/** 为它们当天多开的车超过它们停留时间的这么多倍（至少这么多分钟），就去掉 */
const REMOTE_DETOUR_FACTOR = 1.5;
const REMOTE_DETOUR_MIN = 60;
/** 为了让山路上的景点排到把握大的那天、两天整天对调时，整趟最多多开这么久的车 */
const SWAP_DRIVE_MAX = 90;
/**
 * 单个山路景点挪到别的天：通车的把握至少多这么多（往年 20 年里多 4 年）才挪，
 * 多开的车不超过它本身的停留（至少 FILL_DETOUR_MIN）；45% 挪到 55% 不值得多开一个多小时
 */
const MOVE_GAIN_MIN = 0.2;
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
  const skipped: Required<GuideSkipped> = { permit: [], closed: [], tooHard: [], noTime: [], tooFar: [], across: [] };
  const available: GuideStop[] = [];
  // 季节性道路：定了日期就看这几天里最有把握的一天，往年通车的年份不到一半就当去不了；
  // 路通了就能去的景点不再按开放月份算（月份只是粗算），路通了还要等步道化雪的两个都要看
  const tripDates = input.startDate ? Array.from({ length: input.days }, (_, day) => addDays(input.startDate, day)) : [];
  const closed = (stop: GuideStop) => {
    // 有固定班次的游船、导览团：出发这几天都不开（比如冰川的红色老爷车团 6 月 20 日才开）
    if (tripDates.length > 0 && !tripDates.some((date) => runsOn(stop.id, date))) return true;
    const byMonth = stop.openMonths !== undefined && !stop.openMonths.includes(input.month);
    const road = roadFor(stop.id);
    const best = road && tripDates.length > 0 ? bestRoadDay(road, tripDates) : null;
    if (!road || !best) return byMonth;
    return (byMonth && (!roadDecides(road, stop.id) || stop.openMonths?.length === 0)) || best.chance < ROAD_LIKELY;
  };
  for (const stop of context.stops) {
    if (closed(stop)) skipped.closed.push(stop.id);
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
  const dateFor = (day: number) => context.dateFor?.(day) ?? null;

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
    days: planTrip(current, stopById, sunFor, (night) => resolve(current.nights[night]), 0, dateFor),
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
      const ranking = rankLodging(lodgingChoices, lastStop, nextStop, { back: dateFor(night - 1), out: dateFor(night) }).sort(
        (a, b) => cost(a) - cost(b),
      );
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
  const dayContexts = (current: Trip) => {
    let previous: PlanStop | undefined;
    return current.days.map((day, d) => {
      const stops = day.map((item) => stopById.get(item.id)).filter((stop): stop is PlanStop => stop !== undefined);
      const context = {
        sun: sunFor(d),
        from: resolve(current.nights[d]),
        to: resolve(current.nights[d + 1]),
        previous,
        date: dateFor(d),
      };
      previous = stops.at(-1) ?? previous;
      return { stops, context };
    });
  };
  const timelines = (current: Trip) =>
    dayContexts(current).map(({ stops, context }) => ({ stops, timeline: buildTimeline(stops, context) }));
  /** 这个景点让它那天多开了多少车：那天的车程减去去掉它、其他顺序不变的车程（一天只有它的不算绕路） */
  const detourOf = (current: Trip, id: string) => {
    const day = dayContexts(current).find(({ stops }) => stops.length > 1 && stops.some((stop) => stop.id === id));
    if (!day) return 0;
    const without = day.stops.filter((stop) => stop.id !== id);
    return buildTimeline(day.stops, day.context).driveMin - buildTimeline(without, day.context).driveMin;
  };
  /** 有固定班次的游船、导览团，按这天的安排赶不上最后一班 */
  const missed = (timeline: ReturnType<typeof buildTimeline>) =>
    timeline.entries.filter((entry) => entry.warnings.includes("missDeparture")).length;
  const tooLong = (timeline: ReturnType<typeof buildTimeline>) =>
    timeline.overloaded || timeline.lateReturn || timeline.activeMin > DAY_LIMIT[input.pace] || missed(timeline) > 0;

  // 还有太满、回住处太晚或者赶不上游船班次的天：去掉那天分数最低的景点（尽量不动必去），重新排
  for (let round = 0; round < 12; round++) {
    // 只剩一个景点的天一般不动，除非它不是必去、又是为了它才超时（比如最后一天绕去 Nabesna Road 再回机场）
    const removable = (stops: PlanStop[]) =>
      stops.length > 1 || (stops.length === 1 && !context.stops.find((stop) => stop.id === stops[0].id)?.mustSee);
    const busyDay = timelines(trip).findIndex(({ stops, timeline }) => removable(stops) && tooLong(timeline));
    if (busyDay < 0) break;
    const candidates = trip.days[busyDay]
      .map((item) => context.stops.find((stop) => stop.id === item.id)!)
      .sort((a, b) => Number(Boolean(a.mustSee)) - Number(Boolean(b.mustSee)) || scores.get(a.id)! - scores.get(b.id)!);
    const victim = candidates[0];
    skipped.noTime.push(victim.id);
    const without = (day: TripItem[]) => day.filter((item) => item.id !== victim.id);
    trip = plan(chooseLodging(plan({ ...trip, days: trip.days.map(without) })));
  }

  // 偏远片区当天只排了一两个不是必去的景点、为它们要多开很久的车（比如摩押几天里顺带去峡谷地的 Needles 片区）：
  // 去掉，后面补景点时补更顺路的。一整天都在那个片区的不动（专门去的）；那个片区别的天还有景点的也不动（只是分到了这天）
  const guideById = new Map(context.stops.map((stop) => [stop.id, stop]));
  const areaKey = (stop: PlanStop) => `${stop.park}|${guideById.get(stop.id)?.area ?? stop.id}`;
  for (let round = 0; round < 4; round++) {
    const inTrip = new Map<string, number>();
    for (const item of trip.days.flat()) {
      const stop = stopById.get(item.id);
      if (stop) inTrip.set(areaKey(stop), (inTrip.get(areaKey(stop)) ?? 0) + 1);
    }
    const remote = dayContexts(trip).flatMap(({ stops, context: day }) => {
      const groups = new Map<string, GuideStop[]>();
      for (const stop of stops) groups.set(areaKey(stop), [...(groups.get(areaKey(stop)) ?? []), guideById.get(stop.id)!]);
      return [...groups.entries()].flatMap(([key, group]) => {
        if (group.length > REMOTE_GROUP_MAX || group.length === stops.length || inTrip.get(key) !== group.length) return [];
        if (group.some((stop) => stop.mustSee)) return [];
        const without = stops.filter((stop) => !group.some((member) => member.id === stop.id));
        const detour = buildTimeline(stops, day).driveMin - buildTimeline(without, day).driveMin;
        const visit = group.reduce((sum, stop) => sum + stop.durationMin, 0);
        return detour > Math.max(REMOTE_DETOUR_MIN, visit * REMOTE_DETOUR_FACTOR) ? [group] : [];
      });
    });
    if (remote.length === 0) break;
    const far = new Set(remote.flat().map((stop) => stop.id));
    skipped.tooFar.push(...far);
    trip = plan(chooseLodging(plan({ ...trip, days: trip.days.map((day) => day.filter((item) => !far.has(item.id))) })));
  }

  // 按节奏还有空的天：把没排进去的景点按分数试着加回来，排完没有哪天变得更满、也没有为它绕远路才留下。
  // 回住处太晚按晚了多少分钟算（已经晚了的天再加景点也算更满）；赶不上游船班次和太满一样算
  const excess = (current: Trip) =>
    timelines(current).reduce(
      (sum, { timeline }) =>
        sum +
        Math.max(0, timeline.activeMin - DAY_LIMIT[input.pace]) +
        (timeline.overloaded ? 1000 : 0) +
        missed(timeline) * 1000 +
        (timeline.lateReturn ? 1000 + (timeline.returnAt ?? LATE_RETURN) - LATE_RETURN : 0),
      0,
    );
  // 和补景点之前比：整个补景点过程加起来最多多超 FILL_SLACK_MIN 分钟
  const baseExcess = excess(trip);
  const planned = new Set(trip.days.flat().map((item) => item.id));
  for (const stop of ranked.filter((candidate) => !planned.has(candidate.id)).slice(0, FILL_TRIES)) {
    const trial = plan(chooseLodging(plan({ ...trip, pool: [stop.id] })));
    const trialExcess = excess(trial);
    if (trialExcess <= baseExcess + FILL_SLACK_MIN && detourOf(trial, stop.id) <= Math.max(FILL_DETOUR_MIN, stop.durationMin)) {
      trip = trial;
      skipped.noTime = skipped.noTime.filter((id) => id !== stop.id);
      skipped.tooFar = skipped.tooFar.filter((id) => id !== stop.id);
    }
  }

  // 季节性山路上的景点排到了往年通车不到一半的日子、这几天里又有把握大的一天（比如 6 月下旬去冰川，向阳大道排在第 2 天）：
  // 试着把这两天整天对调（每天里面的顺序、每晚住哪重新排），没有变得更满、多开的车不多才换。
  // 有固定班次的游船、导览团排到了不开的那天，也一样当成去不了，挪到开的日子
  if (tripDates.length > 0) {
    const chanceOn = (id: string, day: number) => {
      if (!runsOn(id, tripDates[day])) return 0;
      const road = roadFor(id);
      const status = road ? roadStatus(road, tripDates[day]) : null;
      return status ? openChance(status) : 1;
    };
    const badCount = (current: Trip) =>
      current.days.reduce((sum, day, d) => sum + day.filter((item) => chanceOn(item.id, d) < ROAD_LIKELY).length, 0);
    const totalDrive = (current: Trip) => timelines(current).reduce((sum, { timeline }) => sum + timeline.driveMin, 0);
    const arrangeAll = (current: Trip): Trip => ({
      ...current,
      days: dayContexts(current).map(({ stops, context: day }) =>
        arrangeDay(stops, day).map((stop): TripItem => ({ id: stop.id, status: "planned" })),
      ),
    });
    for (let bad = 0; bad < trip.days.length; bad++) {
      if (!trip.days[bad].some((item) => chanceOn(item.id, bad) < ROAD_LIKELY)) continue;
      const before = { bad: badCount(trip), excess: excess(trip), drive: totalDrive(trip) };
      let best: { trip: Trip; drive: number } | null = null;
      for (let other = 0; other < trip.days.length; other++) {
        if (other === bad) continue;
        const days = [...trip.days];
        [days[bad], days[other]] = [days[other], days[bad]];
        const trial = arrangeAll(chooseLodging(arrangeAll({ ...trip, days })));
        const drive = totalDrive(trial);
        if (badCount(trial) >= before.bad || excess(trial) > before.excess + FILL_SLACK_MIN) continue;
        if (drive - before.drive > SWAP_DRIVE_MAX || (best && drive >= best.drive)) continue;
        best = { trip: trial, drive };
      }
      if (best) trip = best.trip;
    }

    // 整天对调完还剩的：单个景点挪到把握大的那天（比如冰川的隐湖观景点，跟着向阳大道去洛根山口的那天），
    // 那天放不下就把那天的一个景点挪去别的一天；同样不能变得更满，把握要多不少、多开的车不能比它本身的停留还多
    const startExcess = excess(trip);
    for (let round = 0; round < 6; round++) {
      const before = { bad: badCount(trip), drive: totalDrive(trip) };
      if (before.bad === 0) break;
      let best: { trip: Trip; drive: number } | null = null;
      for (let d = 0; d < trip.days.length; d++) {
        for (const item of trip.days[d]) {
          const now = chanceOn(item.id, d);
          if (now >= ROAD_LIKELY) continue;
          const extraMax = Math.max(FILL_DETOUR_MIN, guideById.get(item.id)?.durationMin ?? 0);
          const without = trip.days.map((day, index) => (index === d ? day.filter((other) => other.id !== item.id) : day));
          for (let target = 0; target < trip.days.length; target++) {
            const then = chanceOn(item.id, target);
            if (target === d || then < ROAD_LIKELY || then - now < MOVE_GAIN_MIN) continue;
            const options = [without.map((day, index) => (index === target ? [...day, item] : day))];
            // 那天放不下：把那天的一个景点挪去别的一天（比如冰川第 5 天的雪松步道挪到同在西边的第 1 天）
            for (const swap of trip.days[target]) {
              for (let to = 0; to < trip.days.length; to++) {
                if (to === target || chanceOn(swap.id, to) < ROAD_LIKELY) continue;
                options.push(
                  without.map((day, index) =>
                    index === target ? [...day.filter((other) => other.id !== swap.id), item] : index === to ? [...day, swap] : day,
                  ),
                );
              }
            }
            for (const days of options) {
              const trial = arrangeAll(chooseLodging(arrangeAll({ ...trip, days })));
              const drive = totalDrive(trial);
              if (badCount(trial) >= before.bad || excess(trial) > startExcess + FILL_SLACK_MIN) continue;
              if (drive - before.drive > extraMax || (best && drive >= best.drive)) continue;
              best = { trip: trial, drive };
            }
          }
        }
      }
      if (!best) break;
      trip = best.trip;
    }

    // 还排在不开那天的游船、导览团（开的那几天排不下）：去掉，攻略说明里列为没时间
    const stranded = trip.days.flatMap((day, d) => day.filter((item) => !runsOn(item.id, tripDates[d])).map((item) => item.id));
    if (stranded.length > 0) {
      skipped.noTime.push(...stranded);
      const days = trip.days.map((day) => day.filter((item) => !stranded.includes(item.id)));
      trip = arrangeAll(chooseLodging(arrangeAll({ ...trip, days })));
    }
  }

  // 没排进去的里面，这几天山路一直封着、在路另一侧的（比如 5 月 Trail Ridge Road 没通时西边的 Grand Lake 一带）单独说
  if (tripDates.length > 0) {
    const across = [...skipped.noTime, ...skipped.tooFar].filter((id) => acrossClosedRoad(id, tripDates));
    skipped.across = across;
    skipped.noTime = skipped.noTime.filter((id) => !across.includes(id));
    skipped.tooFar = skipped.tooFar.filter((id) => !across.includes(id));
  }

  const guide: GuideInfo = { parks: input.parks, pace: input.pace, lodgingPref: input.lodgingPref, skipped };
  return { trip: { ...trip, guide }, guide };
}
