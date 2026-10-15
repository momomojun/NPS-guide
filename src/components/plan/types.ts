import type { AttractionWithPhoto } from "@/data/attractions";
import type { HeaderPhoto } from "@/components/site/page-header";
import type { Dictionary } from "@/i18n/dictionaries";
import type { DayTimeline, LodgingPoint, SunWindow } from "@/lib/planner";
import type { TripItem } from "@/lib/trip-store";

export type PlannerText = Pick<
  Dictionary,
  "plan" | "kinds" | "units" | "map" | "trip" | "attraction" | "difficulty" | "timeOfDay"
> & {
  /** 班车线 id → 当前语言的名字 */
  shuttleNames: Record<string, string>;
  /** 临时关闭的原因（按景点 id，已经转成当前语言） */
  closureReasons: Record<string, string>;
  /** 班车线 id → 换乘点怎么停车（当前语言） */
  shuttleParking: Record<string, string>;
  /** 季节性道路 id → 当前语言的名字 */
  roadNames: Record<string, string>;
};

export interface PlannerPark {
  code: string;
  nameZh: string;
  nameEn: string;
  lat: number;
  lon: number;
  timeZone: string;
  /** 常用机场代码，自动生成攻略时做出发地快捷选项 */
  airports: string[];
  /** 常顺路一起玩的公园 */
  nearby: string[];
  lodgingTip: string;
  nonresidentSurcharge: boolean;
  /** 园外名胜（不是国家公园） */
  site: boolean;
  country: "US" | "CA";
  /** 每个月平均每天多少人次（NPS 近 3 年，下标 0 是 1 月）；加拿大的公园、园外名胜没有 */
  daily?: number[];
  /** 国际暗夜公园（或者加拿大的暗夜保护区）哪年认证的 */
  darkSky?: { year: number; rasc: boolean };
  /** 公园首图，行程页的页头用（行程里第一座公园） */
  photo?: HeaderPhoto;
}

/** 攻略说明里的“看星空”：暗夜公园这几晚月亮碍不碍事，园里有哪些看星空的景点 */
export interface StargazingInfo {
  park: PlannerPark;
  /** 在这个公园的晚上（定了日期才有）：第几天、月亮亮了几成、日落后一两个小时在不在天上 */
  nights: { day: number; fraction: number; up: boolean }[];
  /** 这几天日落晚（夏天），看完星空回住处要很晚 */
  lateDark: boolean;
  stops: { id: string; nameZh: string }[];
}

/** 解析后的住处：推荐住宿补上名字和说明，自定义住处带着查好的车程 */
export interface ResolvedLodging extends LodgingPoint {
  name: string;
  custom: boolean;
  inPark?: boolean;
  note?: string;
  /** 民宿区（Airbnb / VRBO） */
  rental?: boolean;
  /** Airbnb 搜索地名 */
  airbnb?: string;
  /** 自动生成攻略的出发地 / 回程地（机场、城市），不是住处 */
  endpoint?: "origin" | "destination";
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
  /** 这天所在公园的时区（算月亮几点升落） */
  timeZone?: string;
}

export interface DragSpot {
  day: number;
  index: number;
}
