import { arrangeDay, sequenceStops, splitIntoDays, type PlanStop, type SunWindow } from "./planner";
import type { Trip, TripItem } from "./trip-store";

/** 第 day 天在 park 的日出日落 */
export type SunLookup = (day: number, park: string) => SunWindow;

/**
 * 重新安排第 fromDay 天及之后的行程：之前没完成的、之后所有未完成的和待安排的景点一起重新分配。
 * 已完成、已跳过的保持原位。fromDay = 0 就是整个行程重排。
 */
export function planTrip(
  trip: Trip,
  stops: Map<string, PlanStop>,
  sunFor: SunLookup,
  fromDay = 0,
): TripItem[][] {
  const from = Math.min(Math.max(fromDay, 0), trip.days.length - 1);
  const before = trip.days.slice(0, from);
  const after = trip.days.slice(from);

  const unfinished = trip.days
    .flat()
    .filter((item) => item.status === "planned")
    .map((item) => item.id);
  const toPlan = [...unfinished, ...trip.pool]
    .map((id) => stops.get(id))
    .filter((stop): stop is PlanStop => stop !== undefined);
  const split = splitIntoDays(sequenceStops(toPlan), after.length);

  const keep = (day: TripItem[]) => day.filter((item) => item.status !== "planned");
  // 从前一天最后去的地方接着排（跨公园时要算来程）
  const lastBefore = before.flat().at(-1);
  let previous = lastBefore ? stops.get(lastBefore.id) : undefined;
  const planned = after.map((day, d) => {
    const dayStops = split[d];
    const arranged =
      dayStops.length > 0 ? arrangeDay(dayStops, sunFor(from + d, dayStops[0].park), previous) : [];
    previous = arranged.at(-1) ?? previous;
    return [...keep(day), ...arranged.map((stop): TripItem => ({ id: stop.id, status: "planned" }))];
  });
  return [...before.map(keep), ...planned];
}
