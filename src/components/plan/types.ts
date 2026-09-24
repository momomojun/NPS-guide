import type { AttractionWithPhoto } from "@/data/attractions";
import type { Dictionary } from "@/i18n/dictionaries";
import type { DayTimeline, LodgingPoint, SunWindow } from "@/lib/planner";
import type { TripItem } from "@/lib/trip-store";

export type PlannerText = Pick<Dictionary, "plan" | "kinds" | "units" | "map" | "trip">;

export interface PlannerPark {
  code: string;
  nameZh: string;
  nameEn: string;
  lat: number;
  lon: number;
  timeZone: string;
}

/** 解析后的住处：推荐住宿补上名字和说明，自定义住处带着查好的车程 */
export interface ResolvedLodging extends LodgingPoint {
  name: string;
  custom: boolean;
  inPark?: boolean;
  note?: string;
}

export type SunInfo =
  | { kind: "normal"; window: SunWindow }
  | { kind: "polar-day" | "polar-night" | "unknown" };

export interface DayRow {
  item: TripItem;
  /** 在 trip.days[day] 里的下标 */
  index: number;
  stop: AttractionWithPhoto;
}

export interface DayView {
  day: number;
  date: string | null;
  rows: DayRow[];
  sun: SunInfo;
  timeline: DayTimeline;
  /** 前一晚住处（当天出发点） */
  from?: ResolvedLodging;
  /** 当晚住处 */
  to?: ResolvedLodging;
}

export interface DragSpot {
  day: number;
  index: number;
}
