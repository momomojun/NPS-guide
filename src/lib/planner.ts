import type { AttractionKind, TimeOfDay } from "../data/attractions/types";
import { lastBusMinutes, shuttleLeg, shuttleOptions, type ShuttleRide } from "./shuttle";
import { gatewayNode, travelMinutes } from "./travel";

export interface PlanStop {
  id: string;
  park: string;
  kind: AttractionKind;
  durationMin: number;
  bestTime?: TimeOfDay[];
  lat: number;
  lon: number;
  /** 停车 / 出发点，开车按这里算 */
  start?: { lat: number; lon: number };
}

/**
 * 住处。推荐住宿的 id 以公园代码开头，车程查预先生成的表；
 * 自定义住处（id 以 "custom-" 开头）带着加入时向 OSRM 查好的车程。
 */
export interface LodgingPoint {
  id: string;
  lat: number;
  lon: number;
  /** 自定义住处到各景点的车程（分钟） */
  minutes?: Record<string, number>;
  /** 出发地 / 回程地（机场或城市）：刚到的那天不安排赶日出 */
  endpoint?: "origin" | "destination";
}

/** 当天第几分钟（当地时间） */
export interface SunWindow {
  sunrise: number;
  sunset: number;
}

/** 没设出发日期时用的大致日出日落 */
export const NOMINAL_SUN: SunWindow = { sunrise: 6 * 60 + 30, sunset: 18 * 60 + 30 };

export interface DayContext {
  sun: SunWindow;
  /** 前一晚住处，当天从这里出发 */
  from?: LodgingPoint;
  /** 当晚住处 */
  to?: LodgingPoint;
  /** 前一天最后去的景点；没设住处时用来算跨公园的来程 */
  previous?: PlanStop;
  /** 这一天的日期（"2026-10-05"）：班车季的景点要按坐班车算；不知道日期时照常按开车算 */
  date?: string | null;
}

/**
 * 要坐的班车：线路 id 和怎么坐——ride 同一条线上的两站之间只坐车，
 * in 开车到换乘点再坐进去，out 坐回换乘点再开车走，walk 同一站的两个景点之间走过去
 */
export interface ShuttleUse {
  line: string;
  mode: "ride" | "in" | "out" | "walk";
}

/** 一段路：多少分钟，要不要坐班车 */
interface Leg {
  minutes: number;
  shuttle?: ShuttleUse;
}

/** 每段车程额外算上停车、走到步道口的时间 */
const TRANSITION_MIN = 10;
/** 从住处出发的时间（没有日出安排时） */
const DEPART_FROM_LODGING = 8 * 60;
/** 不知道住哪时，第一个景点几点开始 */
const DAY_START = 8 * 60 + 30;
/** 活动 + 开车超过这个时长，算安排太满 */
const DAY_LIMIT_MIN = 11 * 60;
/** 晚于这个时间才回到住处，提示太晚 */
const LATE_RETURN = 22 * 60;
/** 早上开车超过这个时长，就不安排赶日出了 */
const SUNRISE_MAX_DRIVE = 60;
/** 单段车程超过这个时长，建议飞过去或者拆成两段旅行 */
export const FAR_TRANSFER_MIN = 10 * 60;
/** 超过这个数量就不逐一比较当天的顺序了（8! = 40320 种） */
const MAX_PERMUTE = 8;

export function legMinutes(from: string, to: string): number {
  return travelMinutes(from, to) + TRANSITION_MIN;
}

const RAD = Math.PI / 180;

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const h =
    Math.sin(((b.lat - a.lat) * RAD) / 2) ** 2 +
    Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(((b.lon - a.lon) * RAD) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** 住处到景点（out）或景点回住处（back）的车程 */
export function lodgingLeg(lodging: LodgingPoint, stop: PlanStop, direction: "out" | "back"): number {
  const known = lodging.minutes?.[stop.id];
  if (known !== undefined) return known + TRANSITION_MIN;
  if (!lodging.id.startsWith("custom-")) {
    const minutes = direction === "out" ? travelMinutes(lodging.id, stop.id) : travelMinutes(stop.id, lodging.id);
    return minutes + TRANSITION_MIN;
  }
  // 没查到路网车程时按直线估算：绕路系数 1.35、平均时速 55 公里
  return Math.round(((distanceKm(lodging, stop.start ?? stop) * 1.35) / 55) * 60) + TRANSITION_MIN;
}

/** 没有班车线时当成“不坐班车”这一种 */
const orWalkIn = (rides: ShuttleRide[]): (ShuttleRide | null)[] => (rides.length > 0 ? rides : [null]);

/** 两个景点之间：这一天要坐班车的话，按开到换乘点 + 等车 + 坐车算；在几条线上的取最快的坐法 */
function stopLeg(from: PlanStop, to: PlanStop, date: string | null | undefined): Leg {
  if (date) {
    let best: ReturnType<typeof shuttleLeg> = null;
    for (const a of orWalkIn(shuttleOptions(from.id, date))) {
      for (const b of orWalkIn(shuttleOptions(to.id, date))) {
        // 只能换乘的线：另一头得正好在换乘点（比如从露易丝湖坐接驳车去梦莲湖），不能开车过去上车
        if (!a && b?.system.transferOnly && from.id !== b.system.hub.node) continue;
        if (!b && a?.system.transferOnly && to.id !== a.system.hub.node) continue;
        const ride = shuttleLeg(a, b, date, (x, y) => travelMinutes(x ?? from.id, y ?? to.id));
        if (ride && (!best || ride.minutes < best.minutes)) best = ride;
      }
    }
    if (best) return { minutes: best.minutes + TRANSITION_MIN, shuttle: { line: best.system.id, mode: best.mode } };
  }
  return { minutes: legMinutes(from.id, to.id) };
}

/** 住处和景点之间（out = 从住处出发，back = 回住处） */
function stayLeg(lodging: LodgingPoint, stop: PlanStop, direction: "out" | "back", date: string | null | undefined): Leg {
  if (date) {
    // 住在班车线上的（比如峡谷里的 Zion Lodge）可以开车进出，只有去同一条线上的景点才坐班车
    const onLines = shuttleOptions(lodging.id, date, true);
    // 住处到换乘点：换乘点当成一个临时的“景点”，用住处的车程算法
    const hubStop = (node: string, hub: { lat: number; lon: number }): PlanStop => ({
      id: node,
      park: stop.park,
      kind: "visitor",
      durationMin: 0,
      lat: hub.lat,
      lon: hub.lon,
    });
    let best: ReturnType<typeof shuttleLeg> = null;
    for (const atStop of shuttleOptions(stop.id, date)) {
      const atLodging = onLines.find((ride) => ride.system === atStop.system) ?? null;
      if (atStop.system.transferOnly && !atLodging) continue;
      const [from, to] = direction === "out" ? [atLodging, atStop] : [atStop, atLodging];
      const ride = shuttleLeg(from, to, date, (a, b) => {
        const node = direction === "out" ? b : a;
        return node ? lodgingLeg(lodging, hubStop(node, atStop.system.hub), direction) - TRANSITION_MIN : 0;
      });
      if (ride && (!best || ride.minutes < best.minutes)) best = ride;
    }
    // 住处在不通车的线上（Kennecott 的酒店），景点在线外：先坐车回换乘点，再开车过去
    for (const atLodging of best ? [] : onLines.filter((ride) => ride.system.carFree)) {
      const [from, to] = direction === "out" ? [atLodging, null] : [null, atLodging];
      const ride = shuttleLeg(from, to, date, (a, b) => travelMinutes(a ?? stop.id, b ?? stop.id));
      if (ride && (!best || ride.minutes < best.minutes)) best = ride;
    }
    if (best) return { minutes: best.minutes + TRANSITION_MIN, shuttle: { line: best.system.id, mode: best.mode } };
  }
  return { minutes: lodgingLeg(lodging, stop, direction) };
}

/** 路线两头：从出发点到每个景点的车程；知道终点时，再加上从每个景点回终点的车程 */
interface RouteEnds {
  from: (stop: PlanStop) => number;
  to?: (stop: PlanStop) => number;
}

function routeCost(route: PlanStop[], ends: RouteEnds): number {
  if (route.length === 0) return 0;
  let cost = ends.from(route[0]);
  for (let k = 1; k < route.length; k++) cost += travelMinutes(route[k - 1].id, route[k].id);
  return cost + (ends.to?.(route[route.length - 1]) ?? 0);
}

/** 同一公园内：从出发点最近邻排出初始路线，再用 2-opt 消掉绕路（有终点时连回终点一起算） */
function orderWithinPark(stops: PlanStop[], ends: RouteEnds): PlanStop[] {
  const remaining = [...stops];
  const route: PlanStop[] = [];
  while (remaining.length > 0) {
    const last = route.at(-1);
    const cost = (stop: PlanStop) => (last ? travelMinutes(last.id, stop.id) : ends.from(stop));
    let best = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (cost(remaining[i]) < cost(remaining[best])) best = i;
    }
    route.push(...remaining.splice(best, 1));
  }

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const candidate = [...route.slice(0, i), ...route.slice(i, j + 1).reverse(), ...route.slice(j + 1)];
        if (routeCost(candidate, ends) < routeCost(route, ends)) {
          route.splice(0, route.length, ...candidate);
          improved = true;
        }
      }
    }
  }
  return route;
}

/** 多个公园：从第一个出现的公园开始，每次去最近的下一个公园 */
function orderParks(parks: string[]): string[] {
  const remaining = [...parks];
  const order = [remaining.shift()!];
  while (remaining.length > 0) {
    const last = gatewayNode(order[order.length - 1]);
    remaining.sort((a, b) => travelMinutes(last, gatewayNode(a)) - travelMinutes(last, gatewayNode(b)));
    order.push(remaining.shift()!);
  }
  return order;
}

/** 整段行程从哪出发、最后到哪（第一天出发前、最后一晚住的地方），知道的话路线从起点排到终点 */
export interface SequenceEnds {
  start?: LodgingPoint;
  end?: LodgingPoint;
}

/** 把景点排成一条游览顺序：公园之间按距离串起来，公园内按路线就近 */
export function sequenceStops(stops: PlanStop[], ends: SequenceEnds = {}): PlanStop[] {
  if (stops.length === 0) return [];
  const { start, end } = ends;
  const parkStops = (park: string) => stops.filter((stop) => stop.park === park);
  let parks = [...new Set(stops.map((stop) => stop.park))];
  // 有起点时，先去离起点最近的公园
  if (start && parks.length > 1) {
    const reach = (park: string) => Math.min(...parkStops(park).map((stop) => lodgingLeg(start, stop, "out")));
    const first = parks.reduce((best, park) => (reach(park) < reach(best) ? park : best));
    parks = [first, ...parks.filter((park) => park !== first)];
  }
  const order = orderParks(parks);
  return order.flatMap((park, index) =>
    orderWithinPark(parkStops(park), {
      from:
        index === 0 && start
          ? (stop) => lodgingLeg(start, stop, "out")
          : (stop) => travelMinutes(gatewayNode(park), stop.id),
      to: index === order.length - 1 && end ? (stop) => lodgingLeg(end, stop, "back") : undefined,
    }),
  );
}

/** 当天第一个景点的来程：只有从别的公园过来才算（同一公园默认住在附近） */
function inboundLeg(previous: PlanStop | undefined, first: PlanStop | undefined, date: string | null | undefined): Leg {
  if (!previous || !first || previous.park === first.park) return { minutes: 0 };
  return stopLeg(previous, first, date);
}

function morningLeg(context: Omit<DayContext, "sun">, first: PlanStop | undefined): Leg {
  if (!first) return { minutes: 0 };
  return context.from ? stayLeg(context.from, first, "out", context.date) : inboundLeg(context.previous, first, context.date);
}

function eveningLeg(context: Omit<DayContext, "sun">, last: PlanStop | undefined): Leg {
  return last && context.to ? stayLeg(context.to, last, "back", context.date) : { minutes: 0 };
}

function morningMinutes(context: Omit<DayContext, "sun">, first: PlanStop | undefined): number {
  return morningLeg(context, first).minutes;
}

function eveningMinutes(context: Omit<DayContext, "sun">, last: PlanStop | undefined): number {
  return eveningLeg(context, last).minutes;
}

export type LodgingLookup = (day: number) => { from?: LodgingPoint; to?: LodgingPoint; date?: string | null };

/**
 * 把排好顺序的景点切成 dayCount 天，让最忙的一天尽量轻松（线性划分，动态规划）。
 * 一天的工作量 = 景点停留时间 + 当天的车程（含从住处出发、回住处，或跨公园的来程）。
 */
export function splitIntoDays(sequence: PlanStop[], dayCount: number, lodgingFor?: LodgingLookup): PlanStop[][] {
  const n = sequence.length;
  const duration = [0];
  const legs = [0];
  // 景点之间要不要坐班车按第一天的日期算（一次行程一般在同一个季节里）
  const date = lodgingFor?.(0).date;
  for (let k = 0; k < n; k++) {
    duration.push(duration[k] + sequence[k].durationMin);
    legs.push(legs[k] + (k > 0 ? stopLeg(sequence[k - 1], sequence[k], date).minutes : 0));
  }
  // 第 day 天走第 i..j-1 个景点的工作量
  const load = (i: number, j: number, day: number) => {
    if (j <= i) return 0;
    const lodging = { ...lodgingFor?.(day), previous: sequence[i - 1] };
    return (
      duration[j] -
      duration[i] +
      (legs[j] - legs[i + 1]) +
      morningMinutes(lodging, sequence[i]) +
      eveningMinutes(lodging, sequence[j - 1])
    );
  };

  // best[d][j]：前 j 个景点分成 d 天时，最忙那天的最小工作量；cut 记录最后一天从哪开始
  const best = Array.from({ length: dayCount + 1 }, () => new Array<number>(n + 1).fill(Infinity));
  const cut = Array.from({ length: dayCount + 1 }, () => new Array<number>(n + 1).fill(0));
  best[0][0] = 0;
  for (let d = 1; d <= dayCount; d++) {
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= j; i++) {
        const value = Math.max(best[d - 1][i], load(i, j, d - 1));
        // 取等号时选更靠后的切点，让空闲日留在行程末尾
        if (value <= best[d][j]) {
          best[d][j] = value;
          cut[d][j] = i;
        }
      }
    }
  }

  const days: PlanStop[][] = [];
  let end = n;
  for (let d = dayCount; d >= 1; d--) {
    const start = cut[d][end];
    days.unshift(sequence.slice(start, end));
    end = start;
  }
  return days;
}

type Slot = "sunrise" | "sunset" | "night" | "any";

/** 只有当天第一个景点能卡日出（早上要开很久时不卡），最后一个能卡日落或夜晚 */
function slotsFor(stops: PlanStop[], allowSunrise: boolean): Slot[] {
  const slots: Slot[] = stops.map(() => "any");
  if (stops.length === 0) return slots;
  const prefers = (i: number, time: TimeOfDay) => stops[i].bestTime?.includes(time) ?? false;
  const last = stops.length - 1;
  const onlyStopPrefersSunrise = stops.length === 1 && stops[0].bestTime?.[0] === "sunrise" && allowSunrise;
  if (prefers(last, "night")) slots[last] = "night";
  else if (prefers(last, "sunset") && !onlyStopPrefersSunrise) slots[last] = "sunset";
  if (allowSunrise && slots[0] === "any" && prefers(0, "sunrise")) slots[0] = "sunrise";
  return slots;
}

export type StopWarning = "missSunset" | "dark" | "farTransfer" | "lastShuttle";

export interface TimelineEntry {
  id: string;
  /** 开过来的分钟数；当天第一个是从住处（或跨公园）开过来的 */
  driveMin: number;
  /** 为了赶日落、等天黑而空出来的分钟数 */
  waitMin: number;
  start: number;
  end: number;
  slot: Slot;
  warnings: StopWarning[];
  /** 过来这一段要坐的班车 */
  shuttle?: ShuttleUse;
}

export interface DayTimeline {
  entries: TimelineEntry[];
  /** 从前一晚住处出发的时间；不知道住哪时没有 */
  departAt?: number;
  returnDriveMin: number;
  /** 回住处这一段要坐的班车 */
  returnShuttle?: ShuttleUse;
  /** 回到当晚住处的时间；不知道住哪时没有 */
  returnAt?: number;
  driveMin: number;
  activeMin: number;
  overloaded: boolean;
  lateReturn: boolean;
}

/**
 * drives[k] = 开到第 k 个景点的分钟数（第 0 个是从住处或跨公园开过来的），returnDrive = 回住处的分钟数
 */
function simulate(
  stops: PlanStop[],
  drives: number[],
  returnDrive: number,
  sun: SunWindow,
  fromLodging: boolean,
  /** “今天”模式：从这个时间（当天第几分钟）出发，而不是按计划的出发时间 */
  startAt?: number,
  /** 从机场或城市出发的第一天：刚落地，不赶日出 */
  arriving = false,
): DayTimeline {
  const morning = drives[0] ?? 0;
  const sunriseStart = sun.sunrise - 20;
  const allowSunrise =
    !arriving &&
    (startAt !== undefined ? startAt + morning <= sunriseStart : fromLodging ? morning <= SUNRISE_MAX_DRIVE : morning === 0);
  const slots = slotsFor(stops, allowSunrise);
  const departAt =
    startAt !== undefined
      ? Math.max(startAt, slots[0] === "sunrise" ? sunriseStart - morning : startAt)
      : fromLodging
        ? slots[0] === "sunrise"
          ? sunriseStart - morning
          : DEPART_FROM_LODGING
        : undefined;
  let clock = departAt ?? (slots[0] === "sunrise" ? sunriseStart : DAY_START);
  let driveTotal = returnDrive;
  let activeTotal = returnDrive;

  const entries = stops.map((stop, index): TimelineEntry => {
    const warnings: StopWarning[] = [];
    const driveMin = drives[index];
    if (driveMin > FAR_TRANSFER_MIN) warnings.push("farTransfer");
    const arrive = clock + driveMin;

    let start = arrive;
    if (slots[index] === "sunset") {
      // 日落景点安排在日落后 15 分钟左右结束
      start = Math.max(arrive, sun.sunset + 15 - stop.durationMin);
      if (arrive > sun.sunset) warnings.push("missSunset");
    } else if (slots[index] === "night") {
      start = Math.max(arrive, sun.sunset + 60);
    }
    const end = start + stop.durationMin;
    if (stop.kind === "hike" && end > sun.sunset + 20) warnings.push("dark");

    driveTotal += driveMin;
    activeTotal += driveMin + stop.durationMin;
    clock = end;
    return { id: stop.id, driveMin, waitMin: start - arrive, start, end, slot: slots[index], warnings };
  });

  const returnAt = returnDrive > 0 && entries.length > 0 ? clock + returnDrive : undefined;
  return {
    entries,
    departAt: entries.length > 0 ? departAt : undefined,
    returnDriveMin: returnDrive,
    returnAt,
    driveMin: driveTotal,
    activeMin: activeTotal,
    overloaded: activeTotal > DAY_LIMIT_MIN,
    lateReturn: returnAt !== undefined && returnAt > LATE_RETURN,
  };
}

/** 这一站坐不上车：进去的最后一班到站以后才到，或者回程的末班车经过以后才走 */
function missesLastBus(stop: PlanStop, date: string, sunset: number, arrive: number, leave: number): boolean {
  // 在几条线上的，哪条都赶不上才算
  const rides = shuttleOptions(stop.id, date);
  return (
    rides.length > 0 &&
    rides.every((ride) => {
      const last = lastBusMinutes(ride.system, date, ride.stop, sunset);
      return last !== null && (leave > last.back || (last.inbound !== null && arrive > last.inbound));
    })
  );
}

/** 时间线加上班车：哪几段坐班车，赶不上末班车的景点提醒一下 */
function withShuttles(
  timeline: DayTimeline,
  stops: PlanStop[],
  legs: Leg[],
  back: Leg,
  date: string | null | undefined,
  sun: SunWindow,
): DayTimeline {
  if (!date || (legs.every((leg) => !leg.shuttle) && !back.shuttle)) return timeline;
  const entries = timeline.entries.map((entry, k) => {
    const late = missesLastBus(stops[k], date, sun.sunset, entry.start - entry.waitMin, entry.end);
    const warnings: StopWarning[] = late ? [...entry.warnings, "lastShuttle"] : entry.warnings;
    return { ...entry, warnings, ...(legs[k]?.shuttle ? { shuttle: legs[k].shuttle } : {}) };
  });
  return { ...timeline, entries, ...(back.shuttle ? { returnShuttle: back.shuttle } : {}) };
}

/** 按当天顺序推算几点出发、几点到每个景点、几点回到住处 */
export function buildTimeline(stops: PlanStop[], context: DayContext): DayTimeline {
  const legs = stops.map((stop, index) => (index === 0 ? morningLeg(context, stop) : stopLeg(stops[index - 1], stop, context.date)));
  const back = eveningLeg(context, stops.at(-1));
  const timeline = simulate(
    stops,
    legs.map((leg) => leg.minutes),
    back.minutes,
    context.sun,
    context.from !== undefined,
    undefined,
    context.from?.endpoint === "origin",
  );
  return withShuttles(timeline, stops, legs, back, context.date, context.sun);
}

/**
 * 没安排景点、但要换住处的一天（比如最后一天开回机场）：从前一晚住处直接去当晚住处。
 * 两处都是推荐住处时查车程表；牵涉机场、自定义住处，或者住处在不通车的班车线上时，
 * 按“住处 → 附近某个景点 → 另一处”里最快的一种估算（near 是附近公园的景点）。
 */
export function buildTransferTimeline(context: DayContext, near: PlanStop[]): DayTimeline | null {
  const { from, to, date } = context;
  if (!from || !to || from.id === to.id) return null;
  const carFree = (lodging: LodgingPoint) =>
    shuttleOptions(lodging.id, date, true).some((ride) => ride.system.carFree);
  let leg: Leg | null =
    !from.id.startsWith("custom-") && !to.id.startsWith("custom-") && !carFree(from) && !carFree(to)
      ? { minutes: travelMinutes(from.id, to.id) + TRANSITION_MIN }
      : null;
  for (const stop of near) {
    const out = stayLeg(from, stop, "out", date);
    const back = stayLeg(to, stop, "back", date);
    // 只是路过这个景点：两段各算了一次过渡时间，扣掉一次
    const minutes = out.minutes + back.minutes - TRANSITION_MIN;
    if (!leg || minutes < leg.minutes) leg = { minutes, shuttle: out.shuttle ?? back.shuttle };
  }
  if (!leg) return null;
  const returnAt = DEPART_FROM_LODGING + leg.minutes;
  return {
    entries: [],
    departAt: DEPART_FROM_LODGING,
    returnDriveMin: leg.minutes,
    ...(leg.shuttle ? { returnShuttle: leg.shuttle } : {}),
    returnAt,
    driveMin: leg.minutes,
    activeMin: leg.minutes,
    overloaded: leg.minutes > DAY_LIMIT_MIN,
    lateReturn: returnAt > LATE_RETURN,
  };
}

/**
 * “今天”模式：现在（now，当天第几分钟）从刚去过的景点（没有就是前一晚住处）出发，
 * 按原来的顺序推算剩下几个景点实际几点能到、几点回到住处。
 */
export function buildLiveTimeline(
  stops: PlanStop[],
  context: {
    now: number;
    sun: SunWindow;
    from?: PlanStop;
    lodging?: LodgingPoint;
    to?: LodgingPoint;
    date?: string | null;
    /** 已经到了第一站（当天第几分钟到的）：从那时算起，停够了再走，停得更久就从现在走 */
    arrivedAt?: number;
  },
): DayTimeline {
  const arrivedAt = stops.length > 0 ? context.arrivedAt : undefined;
  const live =
    arrivedAt === undefined
      ? stops
      : stops.map((stop, index) =>
          index === 0 ? { ...stop, durationMin: Math.max(stop.durationMin, context.now - arrivedAt) } : stop,
        );
  const legs = live.map((stop, index): Leg => {
    if (index === 0 && arrivedAt !== undefined) return { minutes: 0 };
    if (index > 0) return stopLeg(live[index - 1], stop, context.date);
    if (context.from) return stopLeg(context.from, stop, context.date);
    return context.lodging ? stayLeg(context.lodging, stop, "out", context.date) : { minutes: 0 };
  });
  const back = context.to && live.length > 0 ? stayLeg(context.to, live[live.length - 1], "back", context.date) : { minutes: 0 };
  const timeline = simulate(live, legs.map((leg) => leg.minutes), back.minutes, context.sun, true, arrivedAt ?? context.now);
  return withShuttles(timeline, live, legs, back, context.date, context.sun);
}

/** 一种当天顺序的代价：车程为主，天黑还在徒步、赶不上日落、回住处太晚要扣分，卡上日出日落加分 */
function orderCost(timeline: DayTimeline, stops: PlanStop[]): number {
  let cost = timeline.driveMin + (timeline.lateReturn ? 60 : 0);
  timeline.entries.forEach((entry, k) => {
    const prefers = stops[k].bestTime ?? [];
    if (entry.warnings.includes("dark")) cost += 240;
    if (entry.warnings.includes("missSunset")) cost += 60;
    if (entry.slot !== "any") cost -= 40;
    if (prefers.includes("morning") && entry.start > 12 * 60) cost += 15;
    if (prefers.includes("afternoon") && entry.start < 12 * 60) cost += 15;
  });
  return cost;
}

/** 当天的最佳顺序：景点不多时逐一比较所有顺序（Heap 算法），太多时保持路线顺序 */
export function arrangeDay(stops: PlanStop[], context: DayContext): PlanStop[] {
  const n = stops.length;
  if (n <= 1 || n > MAX_PERMUTE) return stops;

  // 先把当天用到的车程都算好（班车季按坐班车算），比较顺序时只查数组
  const legs = stops.map((a) => stops.map((b) => (a === b ? 0 : stopLeg(a, b, context.date).minutes)));
  const morning = stops.map((stop) => morningMinutes(context, stop));
  const evening = stops.map((stop) => eveningMinutes(context, stop));
  const date = context.date;
  const order = stops.map((_, i) => i);
  const evaluate = () => {
    const ordered = order.map((i) => stops[i]);
    const drives = order.map((i, k) => (k === 0 ? morning[i] : legs[order[k - 1]][i]));
    const timeline = simulate(
      ordered,
      drives,
      evening[order[n - 1]],
      context.sun,
      context.from !== undefined,
      undefined,
      context.from?.endpoint === "origin",
    );
    // 赶不上末班车的顺序尽量不要
    const stranded = date
      ? timeline.entries.filter((entry, k) =>
          missesLastBus(ordered[k], date, context.sun.sunset, entry.start - entry.waitMin, entry.end),
        ).length
      : 0;
    return orderCost(timeline, ordered) + stranded * 180;
  };

  let bestOrder = [...order];
  let bestCost = evaluate();
  const counters = new Array<number>(n).fill(0);
  let i = 1;
  while (i < n) {
    if (counters[i] < i) {
      const j = i % 2 === 0 ? 0 : counters[i];
      [order[j], order[i]] = [order[i], order[j]];
      const cost = evaluate();
      // 只有严格更好才替换，同分时保留路线顺序
      if (cost < bestCost) {
        bestCost = cost;
        bestOrder = [...order];
      }
      counters[i]++;
      i = 1;
    } else {
      counters[i] = 0;
      i++;
    }
  }
  return bestOrder.map((k) => stops[k]);
}

export interface LodgingRank<T extends LodgingPoint> {
  lodging: T;
  /** 当天最后一个景点回到这里 */
  backMin?: number;
  /** 第二天从这里去第一个景点 */
  outMin?: number;
}

/** 按“今晚回去 + 明早出发”的总车程给候选住处排序 */
export function rankLodging<T extends LodgingPoint>(
  candidates: T[],
  lastStop: PlanStop | undefined,
  nextStop: PlanStop | undefined,
): LodgingRank<T>[] {
  return candidates
    .map((lodging) => ({
      lodging,
      backMin: lastStop ? lodgingLeg(lodging, lastStop, "back") : undefined,
      outMin: nextStop ? lodgingLeg(lodging, nextStop, "out") : undefined,
    }))
    .sort((a, b) => (a.backMin ?? 0) + (a.outMin ?? 0) - ((b.backMin ?? 0) + (b.outMin ?? 0)));
}
