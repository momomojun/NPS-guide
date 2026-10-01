// 季节性道路：行程里按出发日期估算“往年这一天通不通”，公园页画出近年的通车时段。
// 历年的开通、关闭日期在 roads.generated.ts（scripts/build-roads.mjs 从 NPS、WSDOT 的历年表生成，最近几年按官方公告补）；
// 这里写路名、说明和要走这条路的景点。
import type { MonthDay } from "./bookings";
import { roadsChecked, roadYears } from "./roads.generated";

/**
 * [年份, 开通日, 关闭日, 不算统计的原因]：日期是 "MM-DD"，关闭日在开通日之前表示跨到了第二年年初；
 * 没开是 null，还不知道（今年还没关）也是 null；第 4 项有值的年份（疫情封园、修路、风暴毁路）不算进往年统计。
 */
export type RoadYear = [year: number, open: MonthDay | null, close: MonthDay | null, skip?: string];

export interface SeasonalRoad {
  id: string;
  park: string;
  nameZh: string;
  nameEn: string;
  /** 这条路没通就去不了、通了就能去的景点（它们的开放月份只是按这条路粗算的，定了日期就按这条路算） */
  attractions: string[];
  /** 也要走这条路，但路通了还要等步道、支路化雪的景点：路况和它们自己的开放月份都要看 */
  afterRoad?: string[];
  /** 这条路是什么、冬天怎么办、今年的特殊情况 */
  noteZh: string;
  years: RoadYear[];
  /** 官方说明页 */
  source: string;
  /** 整理数据的日期 */
  checked: string;
}

const roads: Omit<SeasonalRoad, "years" | "checked">[] = [
  {
    id: "yose-tioga-road",
    park: "yose",
    nameZh: "Tioga Road（120 号公路）",
    nameEn: "Tioga Road",
    attractions: [
      "yose-tuolumne-meadows",
      "yose-olmsted-point",
      "yose-tenaya-lake",
      "yose-lembert-dome",
      "yose-cathedral-lakes",
      "yose-gaylor-lakes",
      "yose-may-lake",
      "yose-pothole-dome",
    ],
    noteZh:
      "横穿公园北部、翻过 Tioga 山口（约 3,000 米）的高山公路。每年 4 月 15 日前后开始扫雪，一般要一两个月，哪天通车看当年雪量；冬季从优胜美地山谷去不了图奥勒米草甸，也不能从东边的 Lee Vining 进园。",
    source: "https://www.nps.gov/yose/planyourvisit/seasonal.htm",
  },
  {
    id: "yose-glacier-point-road",
    park: "yose",
    nameZh: "冰川点路（Glacier Point Road）",
    nameEn: "Glacier Point Road",
    attractions: ["yose-glacier-point", "yose-taft-point", "yose-sentinel-dome", "yose-washburn-point"],
    noteZh:
      "从 41 号公路通往冰川点的支路。冬季只扫雪到 Badger Pass 滑雪场，再往里要穿雪鞋或越野滑雪；每年 4 月中旬开始扫雪。2026 年 9 月 23 日起因 Dome Fire 临时封闭。",
    source: "https://www.nps.gov/yose/planyourvisit/seasonal.htm",
  },
  {
    id: "glac-logan-pass",
    park: "glac",
    nameZh: "向阳大道高山段（洛根山口）",
    nameEn: "Going-to-the-Sun Road over Logan Pass",
    attractions: ["glac-going-to-the-sun-road", "glac-logan-pass", "glac-hidden-lake-overlook"],
    afterRoad: ["glac-highline-trail"],
    noteZh:
      "向阳大道翻越洛根山口的高山路段，4 月开始扫雪，全线通车一般在 6 月中到 7 月上旬；关闭日期定在 10 月第三个周一（天气不好会更早）。没通的时候西侧只能开到 Avalanche 一带、东侧一般到 Rising Sun。",
    source: "https://www.nps.gov/glac/learn/news/logan-pass-opening-and-closing-dates.htm",
  },
  {
    id: "noca-north-cascades-highway",
    park: "noca",
    nameZh: "20 号公路（North Cascades Highway）山口段",
    nameEn: "North Cascades Highway (SR 20), Diablo–Mazama",
    attractions: ["noca-ross-lake-overlook"],
    afterRoad: ["noca-washington-pass-overlook", "noca-rainy-lake", "noca-maple-pass-loop", "noca-blue-lake"],
    noteZh:
      "Ross 湖附近（MP 134）到 Mazama（MP 171）这段几十条雪崩道横穿公路，冬季封闭，春天扫雪后重开。封闭期间西侧能开到 Diablo 湖一带，东西两侧之间要绕 2 号公路。2026 年春天西段抢修，4 月 30 日只开了东段，6 月 14 日才全线通车。",
    source: "https://wsdot.wa.gov/travel/roads-bridges/mountain-pass-closure-and-opening-dates",
  },
  {
    id: "mora-chinook-pass",
    park: "mora",
    nameZh: "410 号公路 Chinook 山口段",
    nameEn: "Chinook Pass (SR 410)",
    attractions: [],
    afterRoad: ["mora-naches-peak-loop"],
    noteZh: "公园东北角翻过 Chinook 山口、通往 Yakima 的一段，冬季封闭。2026 年 5 月 22 日重开。",
    source: "https://wsdot.wa.gov/travel/roads-bridges/mountain-pass-closure-and-opening-dates",
  },
  {
    id: "mora-cayuse-pass",
    park: "mora",
    nameZh: "123 号公路 Cayuse 山口段",
    nameEn: "Cayuse Pass (SR 123)",
    attractions: [],
    noteZh:
      "公园东侧连接 Sunrise 一带（410 号公路）和 Ohanapecosh、Stevens Canyon 的南北通道，冬季封闭。没通的时候从 Paradise 去 Sunrise 要绕到公园外，多开两三个小时。2026 年 5 月 22 日和 Chinook 山口一起重开。",
    source: "https://wsdot.wa.gov/travel/roads-bridges/mountain-pass-closure-and-opening-dates",
  },
];

export const seasonalRoads: SeasonalRoad[] = roads.map((road) => ({
  ...road,
  years: roadYears[road.id] ?? [],
  checked: roadsChecked,
}));
