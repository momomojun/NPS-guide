export type AttractionKind =
  | "viewpoint"
  | "hike"
  | "waterfall"
  | "grove"
  | "landmark"
  | "drive"
  | "experience"
  | "visitor";

export type TimeOfDay = "sunrise" | "morning" | "afternoon" | "sunset" | "night";

export interface Hike {
  /** 往返距离（英里）；环线就是一圈的长度 */
  distanceMi?: number;
  /** 累计爬升（英尺） */
  gainFt?: number;
  difficulty: "easy" | "moderate" | "hard";
  loop?: boolean;
}

export interface Attraction {
  id: string;
  /** NPS parkCode */
  park: string;
  /** 简体中文名，繁体由 OpenCC 转换 */
  nameZh: string;
  nameEn: string;
  kind: AttractionKind;
  /** 园内片区，对应 parks.ts 里的 areas */
  area: string;
  /** 景点本身的位置，用于地图显示 */
  lat: number;
  lon: number;
  /** 停车 / 出发点，和景点位置不同时才填；导航和车程按这里算 */
  start?: { lat: number; lon: number; nameZh: string };
  /** 建议停留时间（分钟），不含开车过去的时间 */
  durationMin: number;
  hike?: Hike;
  bestTime?: TimeOfDay[];
  /** 通常能去的月份，不填表示全年；每年随天气变化 */
  openMonths?: number[];
  /** 最佳月份 */
  bestMonths?: number[];
  /** 需要的许可证 / 预约 */
  permit?: string;
  mustSee?: boolean;
  /** 不在国家公园范围内，但常和公园一起玩 */
  outsidePark?: boolean;
  /** 一两句话：为什么值得去 */
  summary: string;
  tips?: string[];
  /** Wikimedia Commons 文件名，作者和授权由 scripts/build-photos.mjs 生成 */
  photoFile?: string;
}

export interface Photo {
  url: string;
  width: number;
  height: number;
  /** Commons 文件页，用于署名链接 */
  page: string;
  author: string;
  license: string;
}
