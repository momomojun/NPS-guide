// 季节性道路：行程里按出发日期估算“往年这一天通不通”，公园页画出近年的通车时段。
// 历年的开通、关闭日期在 roads.generated.ts（scripts/build-roads.mjs 从 NPS、WSDOT 的历年表生成，最近几年按官方公告补）；
// 这里写路名、说明和要走这条路的景点。
import type { MonthDay } from "./bookings";
import { roadsChecked, roadYears } from "./roads.generated";

/**
 * [年份, 开通日, 关闭日, 不算统计的原因]：日期是 "MM-DD"，关闭日在开通日之前表示跨到了第二年年初；
 * 没开是 null，还不知道（今年还没关）也是 null；第 4 项有值的年份（疫情封园、修路、风暴毁路、山火）不算进往年统计，
 * 那一年的行程还是按它说。
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
  /**
   * 路封着的时候，side 这一侧的住处、景点和公园里另一侧之间要绕到园外：两侧各取一个出入口（住处 id），
   * minutes 是两个出入口之间绕一圈要开多久（OSRM 按绕路经过的山口算，校正过车速）；
   * neutral 是绕路的路上就经过、两边都不用翻山的（比如冰川 2 号公路边的 Goat Lick），按原来的车程算
   */
  around?: { side: string[]; sideGate: string; otherGate: string; minutes: number; neutral?: string[] };
  /** 这条路是什么、冬天怎么办、今年的特殊情况 */
  noteZh: string;
  years: RoadYear[];
  /** 官方说明页 */
  source: string;
  /** source 是现在的路况页：这条路没有官方历年表，历年日期是按官方新闻稿和路况页存档逐年整理的 */
  statusPage?: boolean;
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
    around: { side: ["yose-stay-lee-vining"], sideGate: "yose-stay-lee-vining", otherGate: "yose-stay-groveland", minutes: 293 },
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
    // 红色老爷车团的 Western Alpine 线开到洛根山口再回来：路通了、又在开团的日子才能去
    afterRoad: ["glac-highline-trail", "glac-red-bus-tour"],
    // 没通的时候东西两侧之间走公园南边的 2 号公路：东侧经 East Glacier、西侧经 West Glacier
    around: {
      side: [
        "glac-jackson-glacier-overlook",
        "glac-st-mary-virginia-falls",
        "glac-sun-point-baring-falls",
        "glac-wild-goose-island",
        "glac-st-mary-visitor-center",
        "glac-swiftcurrent-lake",
        "glac-many-glacier-boat",
        "glac-grinnell-glacier",
        "glac-iceberg-lake",
        "glac-running-eagle-falls",
        "glac-two-medicine-lake",
        "glac-stay-many-glacier-hotel",
        "glac-stay-swiftcurrent",
        "glac-stay-rising-sun",
        "glac-stay-st-mary",
        "glac-stay-east-glacier",
      ],
      sideGate: "glac-stay-east-glacier",
      otherGate: "glac-stay-west-glacier",
      minutes: 59,
      neutral: ["glac-goat-lick"],
    },
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
    around: {
      side: ["noca-stay-mazama", "noca-stay-winthrop", "noca-stay-chelan-rentals"],
      sideGate: "noca-stay-winthrop",
      otherGate: "noca-stay-marblemount",
      minutes: 388,
    },
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
  {
    id: "mora-sunrise-road",
    park: "mora",
    nameZh: "Sunrise Road（日出路）",
    nameEn: "Sunrise Road",
    attractions: ["mora-sunrise-visitor-center", "mora-sunrise-point"],
    afterRoad: ["mora-sourdough-ridge", "mora-fremont-lookout", "mora-burroughs-mountain"],
    noteZh:
      "从 White River 露营地路口爬到 Sunrise（约 1,950 米）的支路，约 18 公里，是园内车能开到的最高处。下面到 White River 的一段 5 月下旬就通，再往上扫雪要几个星期，扫完还要准备设施，一般 6 月底到 7 月初通车；NPS 说一般 9 月底到 10 月初封路，近年实际关闭多在 10 月上中旬，第一场大雪会提前，9 月中下旬起夜里也常在 White River 路口关闭。2026 年 8 月 7 日起因 Grand Park 2 山火对车辆封闭到年底，只能步行、骑车上去。官方没有历年表，日期是按 NPS 新闻稿和路况页存档整理的；2024、2025 年没查到确切的通车日，关闭日大多只公布过计划日期，秋天不按往年估。",
    source: "https://www.nps.gov/mora/planyourvisit/road-status.htm",
    statusPage: true,
  },
  {
    id: "mora-stevens-canyon-road",
    park: "mora",
    nameZh: "Stevens Canyon Road（史蒂文斯峡谷路）",
    nameEn: "Stevens Canyon Road",
    attractions: ["mora-box-canyon"],
    // 倒影湖在西头，从 Paradise 那边常常比全线早几天到几个星期开进去，不按这条路算
    noteZh:
      "Paradise 一侧和东南角 Ohanapecosh 之间的园内公路，约 30 公里，经过倒影湖和 Box Canyon。冬季不扫雪，5 月扫雪，一般阵亡将士纪念日前的周五前后全线通车，两头常常先通（倒影湖那头从 Paradise 开进去）；10 月下旬到 11 月初按计划关闭，下雪结冰会临时或提前封路。没通的时候 Paradise 和 Ohanapecosh、Packwood 之间要绕到园外。2022–2023 年修路不能穿行，不算进统计；官方没有历年表，日期是按 NPS 新闻稿和路况页存档整理的，关闭日只查到两年，秋天不按往年估。",
    source: "https://www.nps.gov/mora/planyourvisit/road-status.htm",
    statusPage: true,
  },
  {
    id: "lavo-park-highway",
    park: "lavo",
    nameZh: "拉森公园公路（89 号公路）",
    nameEn: "Lassen National Park Highway (SR 89)",
    attractions: ["lavo-lake-helen", "lavo-kings-creek-falls"],
    afterRoad: ["lavo-bumpass-hell", "lavo-lassen-peak"],
    around: {
      side: [
        "lavo-manzanita-lake",
        "lavo-summit-lake",
        "lavo-devastated-area",
        "lavo-hot-rock",
        "lavo-chaos-crags",
        "lavo-loomis-museum",
        "lavo-cinder-cone",
        "lavo-burney-falls",
        "lavo-subway-cave",
        "lavo-stay-manzanita-cabins",
        "lavo-stay-old-station",
      ],
      sideGate: "lavo-stay-manzanita-cabins",
      otherGate: "lavo-stay-mineral",
      minutes: 130,
    },
    noteZh:
      "穿过公园的唯一公路，南北两个入口之间约 48 公里，最高处在海伦湖旁（约 2,590 米）。每年 3–4 月开始扫雪，一般要两个月：南段到硫磺厂、北段到 Devastated Area 先通车，最后才是海伦湖一带的高处；全线通车一般在 6 月上旬，雪大的年份到 7 月下旬（2017 年 7 月 26 日）。冬季从南北入口各只能开进约 1.6 公里，园内南北之间不通。",
    source: "https://www.nps.gov/lavo/planyourvisit/winter-road-closures-and-spring-clearing-update.htm",
  },
  {
    id: "crla-west-rim-drive",
    park: "crla",
    nameZh: "西环湖路（West Rim Drive）",
    nameEn: "West Rim Drive",
    attractions: [],
    // Discovery Point 在 Rim Village 往北第一英里，这一段常比整条西环湖路早几个星期通车，不按这条路算
    afterRoad: ["crla-watchman-peak"],
    noteZh:
      "环湖路的西半圈，从 Rim Village 往北到 North Junction（约 10 公里），和北入口路同一天通车。4 月中旬开始扫雪，一般 6 月上中旬通车，雪大的年份到 6 月下旬；第一场大雪或 11 月 1 日（以先到的为准）关闭。Rim Village 全年能开到，从 Rim Village 到 Discovery Point 这一段常常提前几个星期通车。",
    source: "https://www.nps.gov/crla/planyourvisit/hours.htm",
  },
  {
    id: "crla-east-rim-drive",
    park: "crla",
    nameZh: "东环湖路（East Rim Drive）",
    nameEn: "East Rim Drive",
    attractions: [
      "crla-cloudcap-overlook",
      "crla-phantom-ship-overlook",
      "crla-sun-notch",
      "crla-vidae-falls",
      "crla-pinnacles",
      "crla-plaikni-falls",
    ],
    afterRoad: ["crla-mount-scott"],
    noteZh:
      "环湖路的东半圈，从 North Junction 经东侧到公园总部（约 40 公里），西环湖路通车后才扫，全线通车一般在 7 月上中旬；看第一场大雪、最晚 11 月 1 日关闭，常常比西环湖路早关。2023–2026 年东环湖路分段重修，夏天只能开进去再原路出来，2026 年 9 月下旬才恢复全线通车，这几年不算进统计。",
    source: "https://www.nps.gov/crla/planyourvisit/hours.htm",
  },
  {
    id: "crla-north-entrance-road",
    park: "crla",
    nameZh: "北入口路（138 号公路进园段）",
    nameEn: "North Entrance Road",
    attractions: [],
    around: { side: ["crla-stay-diamond-lake"], sideGate: "crla-stay-diamond-lake", otherGate: "crla-stay-union-creek", minutes: 43 },
    noteZh:
      "从北边 138 号公路进园、到 North Junction 的一段（约 14 公里），和西环湖路同一天通车、一起关闭。没通的时候只能从南边、西边的 62 号公路进园，住 Diamond Lake 或者从 Bend 过来要绕到 Union Creek。",
    source: "https://www.nps.gov/crla/planyourvisit/hours.htm",
  },
  {
    id: "romo-trail-ridge-road",
    park: "romo",
    nameZh: "Trail Ridge Road（34 号公路）高山段",
    nameEn: "Trail Ridge Road (US 34)",
    attractions: [
      "romo-rainbow-curve",
      "romo-forest-canyon-overlook",
      "romo-tundra-communities",
      "romo-alpine-visitor-center",
      "romo-gore-range-overlook",
      "romo-milner-pass",
      "romo-farview-curve",
    ],
    around: {
      side: [
        "romo-holzwarth",
        "romo-kawuneeche-valley",
        "romo-kawuneeche-vc",
        "romo-adams-falls",
        "romo-stay-grand-lake",
        "romo-stay-granby",
      ],
      sideGate: "romo-stay-grand-lake",
      otherGate: "romo-stay-estes-park",
      minutes: 236,
    },
    noteZh:
      "美国海拔最高的连续铺装公路（最高约 3,713 米），翻过大陆分水岭连接东边的 Estes Park 和西边的 Grand Lake。Many Parks Curve 以西到西侧 Colorado River 步道口一段冬季封闭，4 月中旬两头同时开始扫雪，一般阵亡将士纪念日前后通车。官方关闭日期多在 10 月下旬，但在那之前一两个星期常常已经因为下雪封路、不再重开，9 月中旬起也常有几小时到几天的临时封路。没通的时候东西两侧之间要绕到园外。",
    source: "https://www.nps.gov/romo/learn/photosmultimedia/opening_closing_trr_ofr.htm",
  },
  {
    id: "romo-old-fall-river-road",
    park: "romo",
    nameZh: "Old Fall River Road（旧瀑布河公路）",
    nameEn: "Old Fall River Road",
    attractions: ["romo-old-fall-river-road"],
    noteZh:
      "从 Endovalley 野餐区开到高山游客中心的单向（只能上山）砂石路，约 15 公里。Trail Ridge Road 通车后才开始清理，目标是 7 月 4 日前后通车（雪大的年份到 7 月中下旬）；2016 年起固定在 10 月第一个周一或周二对车辆关闭，之后到 11 月底还能步行、骑车。2026 年 NPS 公布 10 月 6 日关闭。",
    source: "https://www.nps.gov/romo/learn/photosmultimedia/opening_closing_trr_ofr.htm",
  },
];

export const seasonalRoads: SeasonalRoad[] = roads.map((road) => ({
  ...road,
  years: roadYears[road.id] ?? [],
  checked: roadsChecked,
}));
