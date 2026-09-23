export type RegionId = "sierra" | "vegas" | "alaska";

export interface Park {
  /** NPS parkCode，调用 NPS API 时用 */
  code: string;
  /** 简体中文名，繁体由 OpenCC 转换 */
  nameZh: string;
  nameEn: string;
  region: RegionId;
  /** 查询周边充电桩、补给点时用的定位点 */
  gateway: { nameZh: string; lat: number; lon: number };
  /** 常用机场 IATA 代码，按推荐顺序 */
  airports: string[];
  /** 2026 年起对非居民每人加收 $100 的 11 个公园之一 */
  nonresidentSurcharge: boolean;
}

export const regionOrder: RegionId[] = ["sierra", "vegas", "alaska"];

export const parks: Park[] = [
  {
    code: "yose",
    nameZh: "优胜美地",
    nameEn: "Yosemite",
    region: "sierra",
    gateway: { nameZh: "优胜美地山谷", lat: 37.7456, lon: -119.5936 },
    airports: ["FAT", "SFO", "OAK", "SJC"],
    nonresidentSurcharge: true,
  },
  {
    code: "seki",
    nameZh: "红杉与国王峡谷",
    nameEn: "Sequoia & Kings Canyon",
    region: "sierra",
    gateway: { nameZh: "Foothills 游客中心", lat: 36.4906, lon: -118.8388 },
    airports: ["FAT", "LAX"],
    nonresidentSurcharge: true,
  },
  {
    code: "deva",
    nameZh: "死亡谷",
    nameEn: "Death Valley",
    region: "vegas",
    gateway: { nameZh: "Furnace Creek 游客中心", lat: 36.457, lon: -116.8663 },
    airports: ["LAS"],
    nonresidentSurcharge: false,
  },
  {
    code: "zion",
    nameZh: "锡安",
    nameEn: "Zion",
    region: "vegas",
    gateway: { nameZh: "锡安峡谷游客中心", lat: 37.2002, lon: -112.9869 },
    airports: ["LAS", "SGU", "SLC"],
    nonresidentSurcharge: true,
  },
  {
    code: "brca",
    nameZh: "布莱斯峡谷",
    nameEn: "Bryce Canyon",
    region: "vegas",
    gateway: { nameZh: "布莱斯峡谷游客中心", lat: 37.6403, lon: -112.1696 },
    airports: ["LAS", "SLC", "SGU"],
    nonresidentSurcharge: true,
  },
  {
    code: "grca",
    nameZh: "大峡谷",
    nameEn: "Grand Canyon",
    region: "vegas",
    gateway: { nameZh: "大峡谷村（南缘）", lat: 36.0544, lon: -112.1401 },
    airports: ["LAS", "PHX", "FLG"],
    nonresidentSurcharge: true,
  },
  {
    code: "dena",
    nameZh: "德纳里",
    nameEn: "Denali",
    region: "alaska",
    gateway: { nameZh: "德纳里游客中心", lat: 63.7373, lon: -148.8963 },
    airports: ["ANC", "FAI"],
    nonresidentSurcharge: false,
  },
];

export function getPark(code: string): Park | undefined {
  return parks.find((park) => park.code === code);
}
