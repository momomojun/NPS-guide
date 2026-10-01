import type { MonthDay } from "@/data/bookings";
import type { SeasonalRoad } from "@/data/roads";
import { fill } from "@/i18n/format";
import { openChance, recordYears, ROAD_LIKELY, roadDecides, roadFor, roadStatus } from "@/lib/roads";
import type { PlannerText } from "./types";

export interface RoadNote {
  road: SeasonalRoad;
  /** 当前语言的路名 */
  name: string;
  /** 这条路通了就能去：定了日期就按这条路说，不再按开放月份提醒 */
  decides: boolean;
  /** 这天通车的把握（0–1） */
  chance: number;
  /** 要提醒的话（不带路名）；往年这天都通、或者当年已经通车时没有 */
  note?: string;
}

/**
 * 景点在 date 这天要走的季节性道路通不通；不在季节性道路上是 null。
 * byDate：说“到 6 月 1 日”而不是“这天”（攻略说明里说出发这几天为什么去不了）
 */
export function roadNoteFor(stopId: string, date: string, text: PlannerText, byDate = false): RoadNote | null {
  const road = roadFor(stopId);
  const status = road ? roadStatus(road, date) : null;
  if (!road || !status) return null;
  const t = text.plan.roads;
  const day = (md?: MonthDay) => (md ? fill(t.monthDay, { m: Number(md.slice(0, 2)), d: Number(md.slice(3, 5)) }) : "");
  const year = Number(date.slice(0, 4));
  const when = byDate ? fill(t.byDate, { date: day(date.slice(5, 10)) }) : t.thisDay;
  let note: string | undefined;
  if (status.kind === "notYet") note = fill(t.notYet, { year, opened: day(status.opened), when });
  else if (status.kind === "closed") note = fill(t.closed, { year, closed: day(status.closed) });
  else if (status.kind === "odds" && status.open < status.known) {
    const years = recordYears(status.known, t);
    const values = { years, k: status.open, earliest: day(status.earliest), latest: day(status.latest), when };
    const none = status.open === 0;
    note = fill(status.phase === "opening" ? (none ? t.openingNone : t.opening) : none ? t.closingNone : t.closing, values);
  }
  return {
    road,
    name: text.roadNames[road.id] ?? road.nameZh,
    decides: roadDecides(road, stopId),
    chance: openChance(status),
    note,
  };
}

/** 往年这天通车的年份不到一半，用警告的颜色 */
export const roadWarn = (note: RoadNote) => note.chance < ROAD_LIKELY;
