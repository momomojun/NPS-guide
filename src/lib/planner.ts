import type { AttractionKind, TimeOfDay } from "../data/attractions/types";
import { gatewayNode, travelMinutes } from "./travel";

export interface PlanStop {
  id: string;
  park: string;
  kind: AttractionKind;
  durationMin: number;
  bestTime?: TimeOfDay[];
}

/** 当天第几分钟（当地时间） */
export interface SunWindow {
  sunrise: number;
  sunset: number;
}

/** 没设出发日期时用的大致日出日落 */
export const NOMINAL_SUN: SunWindow = { sunrise: 6 * 60 + 30, sunset: 18 * 60 + 30 };

/** 每段车程额外算上停车、走到步道口的时间 */
const TRANSITION_MIN = 10;
/** 没有日出安排时，一天从几点开始 */
const DAY_START = 8 * 60 + 30;
/** 活动 + 开车超过这个时长，算安排太满 */
const DAY_LIMIT_MIN = 11 * 60;
/** 单段车程超过这个时长，建议飞过去或者拆成两段旅行 */
export const FAR_TRANSFER_MIN = 10 * 60;
/** 超过这个数量就不逐一比较当天的顺序了（8! = 40320 种） */
const MAX_PERMUTE = 8;

export function legMinutes(from: string, to: string): number {
  return travelMinutes(from, to) + TRANSITION_MIN;
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

/**
 * 把排好顺序的景点切成 dayCount 天，让最忙的一天尽量轻松（线性划分，动态规划）。
 * 一天的工作量 = 景点停留时间 + 当天的车程（含跨公园的来程）。
 */
export function splitIntoDays(sequence: PlanStop[], dayCount: number): PlanStop[][] {
  const n = sequence.length;
  const duration = [0];
  const legs = [0];
  for (let k = 0; k < n; k++) {
    duration.push(duration[k] + sequence[k].durationMin);
    legs.push(legs[k] + (k > 0 ? legMinutes(sequence[k - 1].id, sequence[k].id) : 0));
  }
  // 第 i..j-1 个景点放在同一天的工作量
  const load = (i: number, j: number) =>
    j <= i
      ? 0
      : duration[j] - duration[i] + (legs[j] - legs[i + 1]) + inboundMinutes(sequence[i - 1], sequence[i]);

  // best[d][j]：前 j 个景点分成 d 天时，最忙那天的最小工作量；cut 记录最后一天从哪开始
  const best = Array.from({ length: dayCount + 1 }, () => new Array<number>(n + 1).fill(Infinity));
  const cut = Array.from({ length: dayCount + 1 }, () => new Array<number>(n + 1).fill(0));
  best[0][0] = 0;
  for (let d = 1; d <= dayCount; d++) {
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= j; i++) {
        const value = Math.max(best[d - 1][i], load(i, j));
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

/** 只有当天第一个景点能卡日出（当天要长途转场时不卡），最后一个能卡日落或夜晚 */
function slotsFor(stops: PlanStop[], hasInbound: boolean): Slot[] {
  const slots: Slot[] = stops.map(() => "any");
  if (stops.length === 0) return slots;
  const prefers = (i: number, time: TimeOfDay) => stops[i].bestTime?.includes(time) ?? false;
  const last = stops.length - 1;
  const onlyStopPrefersSunrise = stops.length === 1 && stops[0].bestTime?.[0] === "sunrise" && !hasInbound;
  if (prefers(last, "night")) slots[last] = "night";
  else if (prefers(last, "sunset") && !onlyStopPrefersSunrise) slots[last] = "sunset";
  if (!hasInbound && slots[0] === "any" && prefers(0, "sunrise")) slots[0] = "sunrise";
  return slots;
}

export type StopWarning = "missSunset" | "dark" | "farTransfer";

export interface TimelineEntry {
  id: string;
  /** 开过来的分钟数；当天第一个只在跨公园时才有 */
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
  driveMin: number;
  activeMin: number;
  overloaded: boolean;
}

/** drives[k] = 开到第 k 个景点的分钟数（第 0 个是跨公园来程，没有则为 0） */
function simulate(stops: PlanStop[], drives: number[], sun: SunWindow): DayTimeline {
  const slots = slotsFor(stops, drives[0] > 0);
  let clock = slots[0] === "sunrise" ? sun.sunrise - 20 : DAY_START;
  let driveTotal = 0;
  let activeTotal = 0;

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

  return { entries, driveMin: driveTotal, activeMin: activeTotal, overloaded: activeTotal > DAY_LIMIT_MIN };
}

/** 按当天顺序推算每个景点几点到、几点走；previous 是前一天最后去的景点 */
export function buildTimeline(stops: PlanStop[], sun: SunWindow, previous?: PlanStop): DayTimeline {
  const drives = stops.map((stop, index) =>
    index === 0 ? inboundMinutes(previous, stop) : legMinutes(stops[index - 1].id, stop.id),
  );
  return simulate(stops, drives, sun);
}

/** 一种当天顺序的代价：车程为主，天黑还在徒步、赶不上日落要扣分，卡上日出日落加分 */
function orderCost(timeline: DayTimeline, stops: PlanStop[]): number {
  let cost = timeline.driveMin;
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
export function arrangeDay(stops: PlanStop[], sun: SunWindow, previous?: PlanStop): PlanStop[] {
  const n = stops.length;
  if (n <= 1 || n > MAX_PERMUTE) return stops;

  // 先把当天景点两两之间的车程算好，比较顺序时只查数组
  const legs = stops.map((a) => stops.map((b) => (a === b ? 0 : legMinutes(a.id, b.id))));
  const inbound = stops.map((stop) => inboundMinutes(previous, stop));
  const order = stops.map((_, i) => i);
  const evaluate = () => {
    const ordered = order.map((i) => stops[i]);
    const drives = order.map((i, k) => (k === 0 ? inbound[i] : legs[order[k - 1]][i]));
    return orderCost(simulate(ordered, drives, sun), ordered);
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
