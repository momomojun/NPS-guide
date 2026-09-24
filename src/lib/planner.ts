import type { AttractionKind, TimeOfDay } from "../data/attractions/types";
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

function routeCost(start: string, route: PlanStop[]): number {
  let cost = 0;
  let previous = start;
  for (const stop of route) {
    cost += travelMinutes(previous, stop.id);
    previous = stop.id;
  }
  return cost;
}

/** 同一公园内：从公园定位点出发，最近邻排出初始路线，再用 2-opt 消掉绕路 */
function orderWithinPark(stops: PlanStop[], start: string): PlanStop[] {
  const remaining = [...stops];
  const route: PlanStop[] = [];
  let current = start;
  while (remaining.length > 0) {
    let best = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (travelMinutes(current, remaining[i].id) < travelMinutes(current, remaining[best].id)) best = i;
    }
    const [next] = remaining.splice(best, 1);
    route.push(next);
    current = next.id;
  }

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const candidate = [...route.slice(0, i), ...route.slice(i, j + 1).reverse(), ...route.slice(j + 1)];
        if (routeCost(start, candidate) < routeCost(start, route)) {
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

/** 把景点排成一条游览顺序：公园之间按距离串起来，公园内按路线就近 */
export function sequenceStops(stops: PlanStop[]): PlanStop[] {
  if (stops.length === 0) return [];
  const parks = [...new Set(stops.map((stop) => stop.park))];
  return orderParks(parks).flatMap((park) =>
    orderWithinPark(
      stops.filter((stop) => stop.park === park),
      gatewayNode(park),
    ),
  );
}

/** 当天第一个景点的来程：只有从别的公园过来才算（同一公园默认住在附近） */
function inboundMinutes(previous: PlanStop | undefined, first: PlanStop | undefined): number {
  if (!previous || !first || previous.park === first.park) return 0;
  return legMinutes(previous.id, first.id);
}

function morningMinutes(context: Omit<DayContext, "sun">, first: PlanStop | undefined): number {
  if (!first) return 0;
  return context.from ? lodgingLeg(context.from, first, "out") : inboundMinutes(context.previous, first);
}

function eveningMinutes(context: Omit<DayContext, "sun">, last: PlanStop | undefined): number {
  return last && context.to ? lodgingLeg(context.to, last, "back") : 0;
}

export type LodgingLookup = (day: number) => { from?: LodgingPoint; to?: LodgingPoint };

/**
 * 把排好顺序的景点切成 dayCount 天，让最忙的一天尽量轻松（线性划分，动态规划）。
 * 一天的工作量 = 景点停留时间 + 当天的车程（含从住处出发、回住处，或跨公园的来程）。
 */
export function splitIntoDays(sequence: PlanStop[], dayCount: number, lodgingFor?: LodgingLookup): PlanStop[][] {
  const n = sequence.length;
  const duration = [0];
  const legs = [0];
  for (let k = 0; k < n; k++) {
    duration.push(duration[k] + sequence[k].durationMin);
    legs.push(legs[k] + (k > 0 ? legMinutes(sequence[k - 1].id, sequence[k].id) : 0));
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

export type StopWarning = "missSunset" | "dark" | "farTransfer";

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
}

export interface DayTimeline {
  entries: TimelineEntry[];
  /** 从前一晚住处出发的时间；不知道住哪时没有 */
  departAt?: number;
  returnDriveMin: number;
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
): DayTimeline {
  const morning = drives[0] ?? 0;
  const slots = slotsFor(stops, fromLodging ? morning <= SUNRISE_MAX_DRIVE : morning === 0);
  const sunriseStart = sun.sunrise - 20;
  const departAt = fromLodging
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

/** 按当天顺序推算几点出发、几点到每个景点、几点回到住处 */
export function buildTimeline(stops: PlanStop[], context: DayContext): DayTimeline {
  const drives = stops.map((stop, index) =>
    index === 0 ? morningMinutes(context, stop) : legMinutes(stops[index - 1].id, stop.id),
  );
  return simulate(stops, drives, eveningMinutes(context, stops.at(-1)), context.sun, context.from !== undefined);
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

  // 先把当天用到的车程都算好，比较顺序时只查数组
  const legs = stops.map((a) => stops.map((b) => (a === b ? 0 : legMinutes(a.id, b.id))));
  const morning = stops.map((stop) => morningMinutes(context, stop));
  const evening = stops.map((stop) => eveningMinutes(context, stop));
  const order = stops.map((_, i) => i);
  const evaluate = () => {
    const ordered = order.map((i) => stops[i]);
    const drives = order.map((i, k) => (k === 0 ? morning[i] : legs[order[k - 1]][i]));
    const timeline = simulate(ordered, drives, evening[order[n - 1]], context.sun, context.from !== undefined);
    return orderCost(timeline, ordered);
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
