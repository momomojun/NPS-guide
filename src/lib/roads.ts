import type { MonthDay } from "../data/bookings";
import { seasonalRoads, type RoadYear, type SeasonalRoad } from "../data/roads";
import { travelMinutes } from "./travel";

// 季节性道路按日期估算：往年这一天通不通。只看出发那年之前最近 ROAD_YEARS 个正常年份（修路、疫情这类年份不算）。

export const ROAD_YEARS = 20;
/** 往年通车的年份至少一半，才算这天大概能通（自动生成攻略只排这样的；不到一半的在行程里用警告的颜色） */
export const ROAD_LIKELY = 0.5;
/** 有记录的年份不到这么多就不按往年估（雷尼尔山的两条路，关闭日大多只公布过计划日期） */
export const ROAD_MIN_KNOWN = 8;
/** 这一天之前按开通算（往年这一天开通了没有），之后按关闭算（往年这一天还开着没有） */
const LATE_SUMMER: MonthDay = "08-15";

const byAttraction = new Map<string, SeasonalRoad>();
for (const road of seasonalRoads) for (const id of [...road.attractions, ...(road.afterRoad ?? [])]) byAttraction.set(id, road);

/** 这个景点要走哪条季节性道路 */
export function roadFor(attractionId: string): SeasonalRoad | undefined {
  return byAttraction.get(attractionId);
}

/** 这条路通了就能去（开放月份只是按这条路粗算的）；路通了还要等步道化雪的不算 */
export function roadDecides(road: SeasonalRoad, attractionId: string): boolean {
  return road.attractions.includes(attractionId);
}

/** 某个公园的季节性道路 */
export function roadsOf(park: string): SeasonalRoad[] {
  return seasonalRoads.filter((road) => road.park === park);
}

/** 能算进统计的年份，新的在前；before 给了就只要这一年之前的 */
export function recentYears(road: SeasonalRoad, before?: number): RoadYear[] {
  return road.years.filter(([year, , , skip]) => !skip && (before === undefined || year < before)).slice(0, ROAD_YEARS);
}

/** 文案里说几年：往年的记录满 ROAD_YEARS 年说“近 20 年”，不满的说“有记录的 14 年” */
export function recordYears(n: number, text: { recentYears: string; knownYears: string }): string {
  return (n >= ROAD_YEARS ? text.recentYears : text.knownYears).replace("{n}", String(n));
}

/** 这一年的 md 这天通不通：通 true、没通 false、不知道 null（没记录哪天关闭，又已经到秋天了） */
function openOn([, open, close]: RoadYear, md: MonthDay): boolean | null {
  if (open === null) return close === null ? false : null;
  if (md < open) return false;
  if (close === null) return md < LATE_SUMMER ? true : null;
  // 关闭日在开通日之前：关到了第二年年初，这一季都算开着
  return close < open || md <= close;
}

export interface RoadOdds {
  /** 按开通算（春夏）还是按关闭算（秋天） */
  phase: "opening" | "closing";
  /** 往年这一天通车的年数 / 有记录的年数 */
  open: number;
  known: number;
  /** 这些年里最早、最晚的开通日（按关闭算时是关闭日） */
  earliest?: MonthDay;
  latest?: MonthDay;
}

/** 按往年记录，date（"2027-06-05"）这一天通车的比例 */
export function roadOdds(road: SeasonalRoad, date: string): RoadOdds | null {
  const md = date.slice(5, 10);
  const phase = md < LATE_SUMMER ? "opening" : "closing";
  let open = 0;
  let known = 0;
  const marks: MonthDay[] = [];
  for (const row of recentYears(road, Number(date.slice(0, 4)))) {
    const status = openOn(row, md);
    if (status === null) continue;
    known++;
    if (status) open++;
    const mark = phase === "opening" ? row[1] : row[2] && row[1] && row[2] < row[1] ? "12-31" : row[2];
    if (mark) marks.push(mark);
  }
  if (known < ROAD_MIN_KNOWN) return null;
  marks.sort();
  return { phase, open, known, earliest: marks[0], latest: marks.at(-1) };
}

export type RoadStatus =
  /** 出发那年已经通车（官方已经公布或者已经发生） */
  | { kind: "open"; opened: MonthDay }
  /** 出发那年要到 opened 才通车，这一天还没通 */
  | { kind: "notYet"; opened: MonthDay }
  /** 出发那年 closed 已经关了 */
  | { kind: "closed"; closed: MonthDay }
  /** 那年的情况还不知道，按往年估 */
  | ({ kind: "odds" } & RoadOdds);

/**
 * date 这一天这条路的情况：知道当年的就说当年的（不算统计的年份也是，比如 2026 年 Sunrise Road 因山火提前封路），
 * 不知道就按往年估；往年的记录太少是 null
 */
export function roadStatus(road: SeasonalRoad, date: string): RoadStatus | null {
  const md = date.slice(5, 10);
  const row = road.years.find(([year]) => year === Number(date.slice(0, 4)));
  if (row && row[1]) {
    const [, opened, closed] = row;
    if (md < opened) return { kind: "notYet", opened };
    if (closed && closed > opened && md > closed) return { kind: "closed", closed };
    if (closed || md < LATE_SUMMER) return { kind: "open", opened };
  }
  const odds = roadOdds(road, date);
  return odds ? { kind: "odds", ...odds } : null;
}

/** 这一天通车的把握：当年已知的是 1 或 0，按往年估的是通车年份的比例 */
export function openChance(status: RoadStatus): number {
  if (status.kind === "open") return 1;
  if (status.kind === "odds") return status.open / status.known;
  return 0;
}

/** 这几天里通车把握最大的一天；一样大时春天取靠后的一天、秋天取靠前的一天（说“到哪天都还没通”更准）；没有数据是 null */
export function bestRoadDay(road: SeasonalRoad, dates: string[]): { date: string; chance: number } | null {
  let best: { date: string; chance: number } | null = null;
  for (const date of dates) {
    const status = roadStatus(road, date);
    const chance = status ? openChance(status) : null;
    if (chance === null) continue;
    const spring = date.slice(5, 10) < LATE_SUMMER;
    if (!best || chance > best.chance || (chance === best.chance && spring)) best = { date, chance };
  }
  return best;
}

const aroundRoads = seasonalRoads.filter((road) => road.around);
const closedCache = new Map<string, boolean>();
/** 这一天按“路封着”算：当年知道没通或已经关了，或者往年这天通车的年份不到一半 */
function closedOn(road: SeasonalRoad, date: string): boolean {
  const key = `${road.id}|${date}`;
  let closed = closedCache.get(key);
  if (closed === undefined) {
    const status = roadStatus(road, date);
    closed = status !== null && openChance(status) < ROAD_LIKELY;
    closedCache.set(key, closed);
  }
  return closed;
}

/** 这几天里季节性道路一直封着、景点在路的另一侧（要绕到园外才能去）：是哪条路 */
export function acrossClosedRoad(id: string, dates: string[]): SeasonalRoad | undefined {
  return aroundRoads.find((road) => road.around!.side.includes(id) && dates.every((date) => closedOn(road, date)));
}

/**
 * 这一天季节性道路封着、from 和 to 在路的两侧时（比如 5 月 Trail Ridge Road 没通，从 Estes Park 去西边的 Grand Lake），
 * 绕到园外要开多久（分钟）：各自开到自己这侧的出入口，加上两个出入口之间绕一圈。不用绕是 null
 */
export function aroundMinutes(from: string, to: string, date: string): number | null {
  for (const road of aroundRoads) {
    const around = road.around!;
    const prefix = `${road.park}-`;
    if (!from.startsWith(prefix) || !to.startsWith(prefix)) continue;
    const fromSide = around.side.includes(from);
    if (fromSide === around.side.includes(to) || around.neutral?.includes(from) || around.neutral?.includes(to)) continue;
    // 路上的景点本身就去不了
    const onRoad = (id: string) => road.attractions.includes(id) || (road.afterRoad ?? []).includes(id);
    if (onRoad(from) || onRoad(to) || !closedOn(road, date)) continue;
    const [gateFrom, gateTo] = fromSide ? [around.sideGate, around.otherGate] : [around.otherGate, around.sideGate];
    return travelMinutes(from, gateFrom) + around.minutes + travelMinutes(gateTo, to);
  }
  return null;
}

/** 中位数（统计用）：开通日或关闭日 */
export function medianOf(days: MonthDay[]): MonthDay | undefined {
  if (days.length === 0) return undefined;
  const sorted = [...days].sort();
  return sorted[Math.floor((sorted.length - 1) / 2)];
}
