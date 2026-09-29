import { shuttleSystems, type ShuttleStop, type ShuttleSystem } from "../data/shuttles";

// 班车季的车程：私家车开不进去的景点，按“开到换乘点 + 停车走到站台 + 等车 + 坐车”算。
// 同一条班车线上的两个景点之间只算坐车和等车；不开班车的日子照常按开车算。

export interface ShuttleRide {
  system: ShuttleSystem;
  stop: ShuttleStop;
}

const byAttraction = new Map<string, { system: ShuttleSystem; stop: ShuttleStop }[]>();
const byLodging = new Map<string, { system: ShuttleSystem; stop: ShuttleStop }[]>();
for (const system of shuttleSystems) {
  for (const stop of system.stops) {
    for (const id of stop.attractions) byAttraction.set(id, [...(byAttraction.get(id) ?? []), { system, stop }]);
    for (const id of stop.lodging ?? []) byLodging.set(id, [...(byLodging.get(id) ?? []), { system, stop }]);
  }
}

const monthDay = (date: string) => date.slice(5, 10);
const minutesOf = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));

/** 某月第 n 个星期几（weekday 0 = 周日）；n = -1 是最后一个 */
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  }
  const lastDay = new Date(Date.UTC(year, month, 0));
  return lastDay.getUTCDate() - ((lastDay.getUTCDay() - weekday + 7) % 7);
}

/** 美国联邦假日（落在周末的，按周五或周一补休） */
export function isFederalHoliday(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const fixed: [number, number][] = [
    [1, 1],
    [6, 19],
    [7, 4],
    [11, 11],
    [12, 25],
  ];
  const floating: [number, number][] = [
    [1, nthWeekday(year, 1, 1, 3)],
    [2, nthWeekday(year, 2, 1, 3)],
    [5, nthWeekday(year, 5, 1, -1)],
    [9, nthWeekday(year, 9, 1, 1)],
    [10, nthWeekday(year, 10, 1, 2)],
    [11, nthWeekday(year, 11, 4, 4)],
  ];
  const observed = fixed.map(([m, d]): [number, number] => {
    const weekday = new Date(Date.UTC(year, m - 1, d)).getUTCDay();
    const shifted = new Date(Date.UTC(year, m - 1, d + (weekday === 6 ? -1 : weekday === 0 ? 1 : 0)));
    return [shifted.getUTCMonth() + 1, shifted.getUTCDate()];
  });
  return [...fixed, ...observed, ...floating].some(([m, d]) => m === month && d === day);
}

function onDays(days: ("sat" | "sun" | "holiday")[] | undefined, date: string): boolean {
  if (!days) return true;
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (days.includes("sat") && weekday === 6) || (days.includes("sun") && weekday === 0) || (days.includes("holiday") && isFederalHoliday(date));
}

/** 这一天班车在不在运行、私家车能不能开进去（按 MM-DD 比较；季节可以跨年） */
export function seasonOn(system: ShuttleSystem, date: string) {
  const day = monthDay(date);
  return system.seasons.find(
    (season) =>
      (season.from <= season.to ? season.from <= day && day <= season.to : day >= season.from || day <= season.to) &&
      onDays(season.days, date),
  );
}

/** 这一天这个景点（或住处）要不要坐班车；不用就是 null */
export function shuttleFor(id: string, date: string | null | undefined, lodging = false): ShuttleRide | null {
  return shuttleOptions(id, date, lodging)[0] ?? null;
}

/** 这一天能坐到这个景点（或住处）的所有班车线：有的景点在几条线上（梦莲湖可以从 Park and Ride 或露易丝湖坐过去） */
export function shuttleOptions(id: string, date: string | null | undefined, lodging = false): ShuttleRide[] {
  if (!date) return [];
  return ((lodging ? byLodging : byAttraction).get(id) ?? []).filter((option) => seasonOn(option.system, date));
}

/** 平均等车时间：半个发车间隔 */
const waitOf = (system: ShuttleSystem, date: string) => Math.round((seasonOn(system, date)?.headwayMin ?? 10) / 2);

/**
 * 从 from 到 to 的时间里和班车有关的部分；两头都不用坐班车时返回 null（照常按开车算）。
 * drive(a, b) 是两个节点之间的开车分钟数，由调用方给（景点之间查车程表，住处用住处的车程）。
 */
export function shuttleLeg(
  from: ShuttleRide | null,
  to: ShuttleRide | null,
  date: string,
  drive: (fromNode: string | null, toNode: string | null) => number,
): { minutes: number; system: ShuttleSystem; mode: "ride" | "in" | "out" } | null {
  if (!from && !to) return null;
  // 同一条线上：直接坐车过去
  if (from && to && from.system === to.system) {
    return {
      minutes: Math.abs(from.stop.minutesFromHub - to.stop.minutesFromHub) + waitOf(from.system, date),
      system: from.system,
      mode: "ride",
    };
  }
  let minutes = 0;
  // 先坐回换乘点
  if (from) minutes += waitOf(from.system, date) + from.stop.minutesFromHub + from.system.boardingMin;
  // 换乘点之间（或者从普通地点到换乘点）开车
  const driveMin = drive(from ? from.system.hub.node : null, to ? to.system.hub.node : null);
  minutes += driveMin;
  // 再坐班车进去
  if (to) minutes += to.system.boardingMin + waitOf(to.system, date) + to.stop.minutesFromHub;
  // in：开车到换乘点再坐进去；out：坐回换乘点再开车走；本来就在换乘点、不用开车的算 ride
  const mode = driveMin === 0 ? "ride" : to ? "in" : "out";
  return { minutes, system: (to ?? from)!.system, mode };
}

/**
 * 在 stop 这一站最晚什么时候（当天第几分钟）：back 是回程末班车经过这站的时间，
 * inbound 是进去的最后一班到这站的时间。sunset 是当天日落（跟着日落走的末班车要用）。
 * 不知道末班车时是 null。
 */
export function lastBusMinutes(
  system: ShuttleSystem,
  date: string,
  stop: ShuttleStop,
  sunset?: number,
): { back: number; inbound: number | null } | null {
  const season = seasonOn(system, date);
  if (!season) return null;
  const lastBack = season.lastBus
    ? minutesOf(season.lastBus)
    : season.lastBusAfterSunsetMin !== undefined && sunset !== undefined
      ? sunset + season.lastBusAfterSunsetMin
      : null;
  if (lastBack === null) return null;
  // 末班车从最远一站往回开，到这站还要一会儿；从换乘点开出的（环线），到这站要坐这站的分钟数
  const origin = season.lastBusFrom === "hub" ? null : system.stops.find((s) => s.id === season.lastBusFrom);
  const back = origin
    ? lastBack + Math.max(origin.minutesFromHub - stop.minutesFromHub, 0)
    : lastBack + (season.lastBusFrom === "hub" ? stop.minutesFromHub : 0);
  const lastIn = season.lastBusFromHub
    ? minutesOf(season.lastBusFromHub)
    : season.lastInAtSunset && sunset !== undefined
      ? sunset
      : null;
  return { back, inbound: lastIn === null ? null : lastIn + stop.minutesFromHub };
}
