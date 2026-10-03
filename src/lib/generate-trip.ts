import {
  arrangeDay,
  buildTimeline,
  LATE_RETURN,
  lodgingLeg,
  onlyAt,
  rankLodging,
  type LodgingPoint,
  type LodgingRank,
  type PlanStop,
  type SunWindow,
  type TimelineEntry,
} from "./planner";
import { addDays } from "./dates";
import { acrossClosedRoad, bestRoadDay, openChance, ROAD_LIKELY, roadDecides, roadFor, roadStatus } from "./roads";
import { datedSchedule, runsOn, tourScheduleOf } from "./tours";
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
/** 选住处时，车程最省的前几家再看前后两天排出来会不会太满、赶不上班次 */
const LODGING_CHECK = 3;
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
    if (tripDates.length > 0 && !tripDates.some((date) => runsOn(stop.id, date, true))) return true;
    const byMonth = stop.openMonths !== undefined && !stop.openMonths.includes(input.month);
    const road = roadFor(stop.id);
    const best = road && tripDates.length > 0 ? bestRoadDay(road, tripDates) : null;
    if (!road || !best) return byMonth;
    return (byMonth && (!roadDecides(road, stop.id) || stop.openMonths?.length === 0)) || best.chance < ROAD_LIKELY;
  };
  // 只定了月份：按每年公布的日期举行的（满月徒步、卢塞罗湖导览）不知道这个月哪天有，不自动排；
  // 攻略说明的特别活动里列了日期，可以自己加进去
  const datedTour = (stop: GuideStop) => {
    const schedule = tourScheduleOf(stop.id);
    return schedule !== undefined && datedSchedule(schedule);
  };
  for (const stop of context.stops) {
    if (tripDates.length === 0 && datedTour(stop)) continue;
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
  // 排行程时每天的日出日落、日期要查上百万次，每天算一次存起来
  const suns = new Map<number, SunWindow>();
  const sunFor = (day: number) => {
    let sun = suns.get(day);
    if (!sun) suns.set(day, (sun = context.sunFor(day)));
    return sun;
  };
  const dates = new Map<number, string | null>();
  const dateFor = (day: number) => {
    if (!dates.has(day)) dates.set(day, context.dateFor?.(day) ?? null);
    return dates.get(day) ?? null;
  };

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
  /**
   * 时间不对：有固定班次的游船、导览团这天不开或者赶不上最后一班，过了能进去的时间（洞穴入场、游客中心关门），
   * 日落、晚上的活动排到了别的时间，或者日落才有的活动（日落漫步）赶不上日落
   */
  const mistimed = (entry: TimelineEntry) =>
    entry.warnings.some(
      (warning) => warning === "noService" || warning === "missDeparture" || warning === "afterHours" || warning === "offTime",
    ) ||
    (entry.warnings.includes("missSunset") && onlyAt(stopById.get(entry.id)!) === "sunset");
  const missed = (timeline: ReturnType<typeof buildTimeline>) => timeline.entries.filter(mistimed).length;
  /** 按节奏算一天有多累：开车加游玩的分钟数。天黑以后才去的（看星空）不算，白天的景点用不了那段时间，回住处太晚另外算 */
  const dayLoad = (timeline: ReturnType<typeof buildTimeline>) =>
    timeline.activeMin -
    timeline.entries.reduce((sum, entry) => sum + (entry.slot === "night" ? entry.end - entry.start : 0), 0);
  /**
   * 一天排得有多超：超出节奏上限的分钟数；太满、赶不上班次（或过了能进去的时间）各算 1000，
   * 回住处太晚算 1000 加晚了的分钟数（已经晚了的天再加景点也算更满）
   */
  const dayExcess = (timeline: ReturnType<typeof buildTimeline>) =>
    Math.max(0, dayLoad(timeline) - DAY_LIMIT[input.pace]) +
    (timeline.overloaded ? 1000 : 0) +
    missed(timeline) * 1000 +
    (timeline.lateReturn ? 1000 + (timeline.returnAt ?? LATE_RETURN) - LATE_RETURN : 0);

  // 每晚住哪：当天最后一站回去 + 第二天去第一站的车程最短；差不多时连住同一家。
  // 车程最省的几家里再看前后两天排出来的样子：省一点车程却让第二天赶不上游船、导览或者太满的不住
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
      let best = stay && cost(stay) <= cost(ranking[0]) + STAY_PUT_MIN ? stay : ranking[0];
      const strain = (rank: LodgingRank<GuideLodging>) => {
        const nights = [...next];
        nights[night] = { kind: "option", id: rank.lodging.id };
        const days = timelines({ ...current, nights });
        return dayExcess(days[night - 1].timeline) + dayExcess(days[night].timeline);
      };
      // 车程最省的这家前后两天本来就没问题（大多数时候），不用再比
      const bestStrain = strain(best);
      if (bestStrain > 0) {
        const others = ranking.slice(0, LODGING_CHECK).filter((rank) => rank !== best);
        const least = others.map((rank) => ({ rank, strain: strain(rank) })).find((option) => option.strain < bestStrain);
        if (least) best = least.rank;
      }
      next[night] = { kind: "option", id: best.lodging.id };
    }
    return { ...current, nights: next };
  };

  trip = plan(trip);
  trip = plan(chooseLodging(trip));
  trip = plan(chooseLodging(trip));

  /** 这个景点让它那天多开了多少车：那天的车程减去去掉它、其他顺序不变的车程（一天只有它的不算绕路） */
  const detourOf = (current: Trip, id: string) => {
    const day = dayContexts(current).find(({ stops }) => stops.length > 1 && stops.some((stop) => stop.id === id));
    if (!day) return 0;
    const without = day.stops.filter((stop) => stop.id !== id);
    return buildTimeline(day.stops, day.context).driveMin - buildTimeline(without, day.context).driveMin;
  };
  // 时间不对的（赶不上班次、日落活动赶不上日落）先不在这里去掉，后面先试着挪到别的天，挪不开再去掉
  const tooLong = (timeline: ReturnType<typeof buildTimeline>) =>
    timeline.overloaded || timeline.lateReturn || dayLoad(timeline) > DAY_LIMIT[input.pace];

  // 还有太满、回住处太晚的天：去掉那天分数最低的景点（尽量不动必去），重新排
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

  // 按节奏还有空的天：把没排进去的景点按分数试着加回来，排完没有哪天变得更满、也没有为它绕远路才留下
  const excess = (current: Trip) => timelines(current).reduce((sum, { timeline }) => sum + dayExcess(timeline), 0);
  /** 这个景点在第 day 天去的把握：季节性山路往年通车的比例，有固定班次的这天不开是 0；没定日期的都算 1 */
  const chanceOn = (id: string, day: number) => {
    if (tripDates.length === 0) return 1;
    if (!runsOn(id, tripDates[day], true)) return 0;
    const road = roadFor(id);
    const status = road ? roadStatus(road, tripDates[day]) : null;
    return status ? openChance(status) : 1;
  };
  const badCount = (current: Trip) =>
    current.days.reduce((sum, day, d) => sum + day.filter((item) => chanceOn(item.id, d) < ROAD_LIKELY).length, 0);
  /**
   * 排在这天去不了的景点：季节性山路往年这天多半没通、游船导览这天不开（定了日期才看），
   * 或者按时间线赶不上班次、过了能进去的时间、日落和晚上的活动排到了别的时间（timing）
   */
  const troubled = (current: Trip) => {
    const lines = timelines(current);
    return current.days.flatMap((day, d) =>
      day.flatMap((item) => {
        const entry = lines[d].timeline.entries.find((candidate) => candidate.id === item.id);
        const timing = entry !== undefined && mistimed(entry);
        return chanceOn(item.id, d) < ROAD_LIKELY || timing ? [{ day: d, item, timing }] : [];
      }),
    );
  };
  const totalDrive = (current: Trip) => timelines(current).reduce((sum, { timeline }) => sum + timeline.driveMin, 0);
  /** 第 d 天去的公园 */
  const parksOn = (current: Trip, d: number) => new Set(current.days[d].map((item) => stopById.get(item.id)?.park));
  /** 景点只往同一座公园的那几天（或者还空着的天）挪、补：多公园的行程里往别的公园的日子挪只会白算 */
  const samePark = (current: Trip, d: number, id: string) => {
    const parks = parksOn(current, d);
    return parks.size === 0 || parks.has(stopById.get(id)?.park);
  };
  /** 每天里面重新排顺序（哪天去哪些景点不变）；which 给了就只排这几天（一天七八个景点时逐一比较顺序很费时间） */
  const arrangeAll = (current: Trip, which?: number[]): Trip => ({
    ...current,
    days: dayContexts(current).map(({ stops, context: day }, d) =>
      which && !which.includes(d)
        ? current.days[d]
        : arrangeDay(stops, day).map((stop): TripItem => ({ id: stop.id, status: "planned" })),
    ),
  });
  /** 改了某几天的景点以后：只重排这几天，重新选住处，再把住处变了可能受影响的前后一天也排一下 */
  const rearrange = (current: Trip, changed: number[]): Trip => {
    const near = [...new Set(changed.flatMap((d) => [d - 1, d, d + 1]))].filter((d) => d >= 0 && d < current.days.length);
    return arrangeAll(chooseLodging(arrangeAll(current, changed)), near);
  };

  // 和补景点之前比：整个补景点过程加起来最多多超 FILL_SLACK_MIN 分钟
  const baseExcess = excess(trip);
  const planned = new Set(trip.days.flat().map((item) => item.id));
  for (const stop of ranked.filter((candidate) => !planned.has(candidate.id)).slice(0, FILL_TRIES)) {
    const detourMax = Math.max(FILL_DETOUR_MIN, stop.durationMin);
    const fits = (candidate: Trip) => excess(candidate) <= baseExcess + FILL_SLACK_MIN && detourOf(candidate, stop.id) <= detourMax;
    let added: Trip | null = plan(chooseLodging(plan({ ...trip, pool: [stop.id] })));
    if (!fits(added)) {
      // 整趟重排放不下（比如会把一条长步道又挤回同一天）：直接放进某一天试试，别的天不动，挑多开车最少的
      added = null;
      let leastDrive = Infinity;
      const current = timelines(trip);
      for (let d = 0; d < trip.days.length; d++) {
        // 这天加上它就明显超过节奏的上限，不用试（晚上才去的不算）
        const load = dayLoad(current[d].timeline) + (stop.bestTime?.includes("night") ? 0 : stop.durationMin);
        if (chanceOn(stop.id, d) < ROAD_LIKELY || load > DAY_LIMIT[input.pace] || !samePark(trip, d, stop.id)) continue;
        const days = trip.days.map((day, index) => (index === d ? [...day, { id: stop.id, status: "planned" as const }] : day));
        const candidate = rearrange({ ...trip, days }, [d]);
        const drive = totalDrive(candidate);
        if (fits(candidate) && drive < leastDrive) {
          added = candidate;
          leastDrive = drive;
        }
      }
    }
    if (!added && trip.days.some((_, d) => chanceOn(stop.id, d) < ROAD_LIKELY)) {
      // 只有某几天能去的（定了日期的满月徒步、山路通了才能去的）那几天都放不下：把那天的一个景点挪去别的一天
      let leastDrive = Infinity;
      for (let d = 0; d < trip.days.length; d++) {
        if (chanceOn(stop.id, d) < ROAD_LIKELY || !samePark(trip, d, stop.id)) continue;
        for (const swap of trip.days[d]) {
          for (let to = 0; to < trip.days.length; to++) {
            if (to === d || chanceOn(swap.id, to) < ROAD_LIKELY || !samePark(trip, to, swap.id)) continue;
            const days = trip.days.map((day, index) =>
              index === d
                ? [...day.filter((other) => other.id !== swap.id), { id: stop.id, status: "planned" as const }]
                : index === to
                  ? [...day, swap]
                  : day,
            );
            const candidate = rearrange({ ...trip, days }, [d, to]);
            const drive = totalDrive(candidate);
            if (fits(candidate) && drive < leastDrive) {
              added = candidate;
              leastDrive = drive;
            }
          }
        }
      }
    }
    if (added) {
      trip = added;
      skipped.noTime = skipped.noTime.filter((id) => id !== stop.id);
      skipped.tooFar = skipped.tooFar.filter((id) => id !== stop.id);
    }
  }

  // 季节性山路上的景点排到了往年通车不到一半的日子、这几天里又有把握大的一天（比如 6 月下旬去冰川，向阳大道排在第 2 天）：
  // 试着把这两天整天对调（每天里面的顺序、每晚住哪重新排），没有变得更满、多开的车不多才换。
  // 有固定班次的游船、导览团排到了不开的那天，也一样当成去不了，挪到开的日子
  if (tripDates.length > 0) {
    for (let bad = 0; bad < trip.days.length; bad++) {
      if (!trip.days[bad].some((item) => chanceOn(item.id, bad) < ROAD_LIKELY)) continue;
      const before = { bad: badCount(trip), excess: excess(trip), drive: totalDrive(trip) };
      let best: { trip: Trip; drive: number } | null = null;
      const badParks = parksOn(trip, bad);
      for (let other = 0; other < trip.days.length; other++) {
        // 只和同一座公园的日子对调
        if (other === bad || ![...parksOn(trip, other)].some((park) => badParks.has(park))) continue;
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

  }

  // 整天对调完还剩的、或者按时间排不开的：单个景点挪到别的天（比如冰川的隐湖观景点，跟着向阳大道去洛根山口的那天；
  // 白沙的日落漫步，挪到住在白沙附近、能看完日落再回去的那天），那天放不下就把那天的一个景点挪去别的一天。
  // 同样不能变得更满、多开的车不能比它本身的停留还多；山路景点通车的把握还要多不少才挪
  {
    const startExcess = excess(trip);
    for (let round = 0; round < 6; round++) {
      const problems = troubled(trip);
      if (problems.length === 0) break;
      const before = { bad: problems.length, drive: totalDrive(trip) };
      let best: { trip: Trip; drive: number } | null = null;
      for (const { day: d, item, timing } of problems) {
        const now = chanceOn(item.id, d);
        const extraMax = Math.max(FILL_DETOUR_MIN, guideById.get(item.id)?.durationMin ?? 0);
        const without = trip.days.map((day, index) => (index === d ? day.filter((other) => other.id !== item.id) : day));
        for (let target = 0; target < trip.days.length; target++) {
          const then = chanceOn(item.id, target);
          if (target === d || then < ROAD_LIKELY || (!timing && then - now < MOVE_GAIN_MIN) || !samePark(trip, target, item.id)) continue;
          const options = [{ days: without.map((day, index) => (index === target ? [...day, item] : day)), changed: [d, target] }];
          // 那天放不下：把那天的一个景点挪去别的一天（比如冰川第 5 天的雪松步道挪到同在西边的第 1 天）
          for (const swap of trip.days[target]) {
            for (let to = 0; to < trip.days.length; to++) {
              if (to === target || chanceOn(swap.id, to) < ROAD_LIKELY || !samePark(trip, to, swap.id)) continue;
              options.push({
                days: without.map((day, index) =>
                  index === target ? [...day.filter((other) => other.id !== swap.id), item] : index === to ? [...day, swap] : day,
                ),
                changed: [d, target, to],
              });
            }
          }
          for (const { days, changed } of options) {
            const trial = rearrange({ ...trip, days }, changed);
            const drive = totalDrive(trial);
            if (troubled(trial).length >= before.bad || excess(trial) > startExcess + FILL_SLACK_MIN) continue;
            if (drive - before.drive > extraMax || (best && drive >= best.drive)) continue;
            best = { trip: trial, drive };
          }
        }
      }
      if (!best) break;
      trip = best.trip;
    }
  }

  if (tripDates.length > 0) {
    // 还排在不开那天的游船、导览团（开的那几天排不下）：去掉，攻略说明里列为没时间
    const stranded = trip.days.flatMap((day, d) =>
      day.filter((item) => !runsOn(item.id, tripDates[d], true)).map((item) => item.id),
    );
    if (stranded.length > 0) {
      skipped.noTime.push(...stranded);
      const days = trip.days.map((day) => day.filter((item) => !stranded.includes(item.id)));
      trip = arrangeAll(chooseLodging(arrangeAll({ ...trip, days })));
    }
  }

  // 挪了还是时间不对的（比如满月徒步和日落漫步只能排在同一个傍晚）：去掉其中分数低的，攻略说明里列为没时间
  for (let round = 0; round < 6; round++) {
    const wrong = timelines(trip).flatMap(({ timeline }) => timeline.entries.filter(mistimed).map((entry) => entry.id));
    if (wrong.length === 0) break;
    const victim = wrong
      .map((id) => guideById.get(id)!)
      .sort((a, b) => Number(Boolean(a.mustSee)) - Number(Boolean(b.mustSee)) || scores.get(a.id)! - scores.get(b.id)!)[0];
    skipped.noTime.push(victim.id);
    const days = trip.days.map((day) => day.filter((item) => item.id !== victim.id));
    trip = arrangeAll(chooseLodging(arrangeAll({ ...trip, days })));
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
