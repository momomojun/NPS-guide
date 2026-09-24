export type RegionId = "sierra" | "vegas" | "alaska";

export interface Park {
  /** NPS parkCode，调用 NPS API 时用 */
  code: string;
  /** 简体中文名，繁体由 OpenCC 转换 */
  nameZh: string;
  nameEn: string;
  region: RegionId;
  /** 一句话的特色，首页和公园页标题下用 */
  tagline: string;
  /** 所在州（英文），小号大写显示 */
  stateEn: string;
  /** 首屏大图用哪个景点的照片 */
  hero: string;
  /** 公园特色，两三句话 */
  intro: string;
  /** 最适合去的月份 */
  bestMonths: number[];
  /** 一句话说明季节 */
  seasonNote: string;
  /** 园内片区名称，景点按片区分组 */
  areas: Record<string, string>;
  /** 查询周边充电桩、补给点，以及排行程时的起点 */
  gateway: { nameZh: string; lat: number; lon: number };
  /** IANA 时区，用于显示日出日落时间 */
  timeZone: string;
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
    tagline: "花岗岩巨壁与瀑布",
    stateEn: "California",
    hero: "yose-tunnel-view",
    intro:
      "花岗岩巨壁和瀑布的天下：酋长岩、半穹顶、优胜美地瀑布都挤在一条约 11 公里长的冰川山谷里。春季（4–6 月）瀑布最壮观；夏秋可以走 Tioga Road 去高山草甸；南边的 Mariposa Grove 有 500 多棵巨杉。",
    bestMonths: [4, 5, 6, 9, 10],
    seasonNote: "4–6 月瀑布最盛；9–10 月人少，Tioga Road 还开着。",
    areas: {
      valley: "优胜美地山谷",
      "glacier-point": "冰川点路",
      tioga: "Tioga Road 高山区",
      wawona: "Wawona / 巨杉林",
    },
    gateway: { nameZh: "优胜美地山谷", lat: 37.7456, lon: -119.5936 },
    timeZone: "America/Los_Angeles",
    airports: ["FAT", "SFO", "OAK", "SJC"],
    nonresidentSurcharge: true,
  },
  {
    code: "seki",
    nameZh: "红杉与国王峡谷",
    nameEn: "Sequoia & Kings Canyon",
    region: "sierra",
    tagline: "地球上体积最大的树",
    stateEn: "California",
    hero: "seki-zumwalt-meadow",
    intro:
      "两个相连的公园，主角是巨杉：谢尔曼将军树按体积是地球上最大的树。红杉公园在南（Giant Forest），国王峡谷在北（Grant Grove、Cedar Grove），两边开车约 1 小时。",
    bestMonths: [5, 6, 7, 8, 9, 10],
    seasonNote: "5–10 月最方便；冬季山路要带雪链，Cedar Grove 封路。",
    areas: {
      "giant-forest": "Giant Forest（红杉）",
      lodgepole: "Lodgepole",
      "grant-grove": "Grant Grove（国王峡谷）",
      "cedar-grove": "Cedar Grove（峡谷底）",
    },
    gateway: { nameZh: "Foothills 游客中心", lat: 36.4906, lon: -118.8388 },
    timeZone: "America/Los_Angeles",
    airports: ["FAT", "LAX"],
    nonresidentSurcharge: true,
  },
  {
    code: "deva",
    nameZh: "死亡谷",
    nameEn: "Death Valley",
    region: "vegas",
    tagline: "北美最低、最热、最干燥",
    stateEn: "California · Nevada",
    hero: "deva-zabriskie",
    intro:
      "北美最低、最热、最干的地方，Badwater 盐滩低于海平面 86 米。最佳季节是 11 月到 3 月；夏天白天常超过 46°C，只适合清晨开车看景。园内加油点少、油价贵，充电只有慢充。",
    bestMonths: [11, 12, 1, 2, 3],
    seasonNote: "11–3 月气温舒适；夏天酷热，只适合清晨开车看景。",
    areas: {
      "furnace-creek": "Furnace Creek",
      badwater: "Badwater Road 沿线",
      stovepipe: "Stovepipe Wells",
      north: "北部（Ubehebe）",
    },
    gateway: { nameZh: "Furnace Creek 游客中心", lat: 36.457, lon: -116.8663 },
    timeZone: "America/Los_Angeles",
    airports: ["LAS"],
    nonresidentSurcharge: false,
  },
  {
    code: "zion",
    nameZh: "锡安",
    nameEn: "Zion",
    region: "vegas",
    tagline: "红色峡谷与天使降临",
    stateEn: "Utah",
    hero: "zion-canyon-overlook",
    intro:
      "在红色砂岩峡谷底部，抬头看 600 多米高的岩壁。招牌是天使降临（需要许可证）和窄缝（在维珍河里逆流徒步）。主峡谷大部分时间只能坐免费班车，停车是最大难题。",
    bestMonths: [4, 5, 9, 10, 11],
    seasonNote: "春秋最舒服；夏天炎热、7–9 月有山洪，窄缝 6–10 月水温合适。",
    areas: {
      canyon: "锡安峡谷（班车区）",
      south: "南入口 / Springdale",
      east: "东侧（隧道以东）",
      kolob: "Kolob 峡谷",
    },
    gateway: { nameZh: "锡安峡谷游客中心", lat: 37.2002, lon: -112.9869 },
    timeZone: "America/Denver",
    airports: ["LAS", "SGU", "SLC"],
    nonresidentSurcharge: true,
  },
  {
    code: "brca",
    nameZh: "布莱斯峡谷",
    nameEn: "Bryce Canyon",
    region: "vegas",
    tagline: "岩柱林立的圆形剧场",
    stateEn: "Utah",
    hero: "brca-bryce-point",
    intro:
      "其实不是峡谷，而是高原边缘被侵蚀出的一连串“圆形剧场”，里面站满了叫 hoodoo 的石柱，密度世界第一。海拔 2,400–2,800 米，夏天凉快、冬天积雪；也是国际暗夜公园，星空极好。",
    bestMonths: [5, 6, 7, 8, 9, 10],
    seasonNote: "高海拔夏天也凉快；冬天常有雪，雪中石林很美。",
    areas: {
      amphitheater: "布莱斯圆形剧场",
      "scenic-drive": "南段景观道",
      "hwy-12": "12 号公路",
    },
    gateway: { nameZh: "布莱斯峡谷游客中心", lat: 37.6403, lon: -112.1696 },
    timeZone: "America/Denver",
    airports: ["LAS", "SLC", "SGU"],
    nonresidentSurcharge: true,
  },
  {
    code: "grca",
    nameZh: "大峡谷",
    nameEn: "Grand Canyon",
    region: "vegas",
    tagline: "二十亿年的地层",
    stateEn: "Arizona",
    hero: "grca-hopi-point",
    intro:
      "科罗拉多河切出的约 1.6 公里深的大峡谷，从南缘看出去是近 20 亿年的岩层，日出日落时颜色变化最大。南缘全年开放、设施齐全；北缘只在夏秋开放，2025 年受山火影响，出发前查官网。",
    bestMonths: [3, 4, 5, 9, 10, 11],
    seasonNote: "春秋最舒服；夏天南缘不算太热，但峡谷里非常热。",
    areas: {
      village: "南缘村（游客中心）",
      hermit: "Hermit Road（西段）",
      "desert-view": "Desert View Drive（东段）",
    },
    gateway: { nameZh: "大峡谷村（南缘）", lat: 36.0544, lon: -112.1401 },
    timeZone: "America/Phoenix",
    airports: ["LAS", "PHX", "FLG"],
    nonresidentSurcharge: true,
  },
  {
    code: "dena",
    nameZh: "德纳里",
    nameEn: "Denali",
    region: "alaska",
    tagline: "北美最高峰与苔原",
    stateEn: "Alaska",
    hero: "dena-mount-healy",
    intro:
      "北美最高峰德纳里（6,190 米）所在地，更是看野生动物的地方：灰熊、驼鹿、驯鹿、大角羊和狼。夏季私家车只能开到 Mile 15，再往里坐巴士；冬季大部分区域关闭，但能看极光、参观雪橇犬。",
    bestMonths: [6, 7, 8, 9],
    seasonNote: "6–8 月巴士运营、野生动物最多；9 月有秋色，冬季看极光。",
    areas: {
      entrance: "入口区",
      "park-road": "公园路（Mile 13–15）",
      south: "园外南侧（3 号公路）",
    },
    gateway: { nameZh: "德纳里游客中心", lat: 63.7373, lon: -148.8963 },
    timeZone: "America/Anchorage",
    airports: ["ANC", "FAI"],
    nonresidentSurcharge: false,
  },
];

export function getPark(code: string): Park | undefined {
  return parks.find((park) => park.code === code);
}
