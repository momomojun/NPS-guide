// 班车季私家车开不进去、只能坐免费班车的路（锡安峡谷景观道、大峡谷 Hermit Road……）。
// 排行程时，这些景点的车程按“开到换乘点 + 停车走到站台 + 等车 + 坐车”算，而不是直接开过去。
// 季节、首末班车和每站的乘车时间来自官方页面，查的日期写在 checked 里。

export interface ShuttleStop {
  id: string;
  nameZh: string;
  nameEn: string;
  /** 从换乘点坐过来的分钟数（单程） */
  minutesFromHub: number;
  /** 在这一站上下车的景点 */
  attractions: string[];
  /** 在这一站附近的住处（比如峡谷里的 Zion Lodge，住客从这里直接上车） */
  lodging?: string[];
}

export interface ShuttleSeason {
  /** "MM-DD"，按每年差不多算；可以跨年（比如 12-26 到 01-02） */
  from: string;
  to: string;
  /** 首班车（当地时间 "HH:MM"） */
  firstBus?: string;
  /** 从换乘点开进去的最后一班；lastInAtSunset 是日落时开出最后一班 */
  lastBusFromHub?: string;
  lastInAtSunset?: boolean;
  /**
   * 回程的末班车：从 lastBusFrom 那一站（stops 里的 id，"hub" 是换乘点）开出的时间；
   * 跟着日落走的写 lastBusAfterSunsetMin（日落后多少分钟）
   */
  lastBus?: string;
  lastBusAfterSunsetMin?: number;
  lastBusFrom?: string;
  /** 大概几分钟一班 */
  headwayMin: number;
  /** 只有这些日子私家车不能开进去（比如只在周末和联邦假日）；不写就是每天 */
  days?: ("sat" | "sun" | "holiday")[];
}

export interface ShuttleSystem {
  id: string;
  park: string;
  nameZh: string;
  seasons: ShuttleSeason[];
  /** 换乘点：车停在这里上班车。node 是车程表里在换乘点的节点（景点 id），lat/lon 是停车场 */
  hub: { nameZh: string; node: string; lat: number; lon: number; parkingZh?: string };
  stops: ShuttleStop[];
  /** 停车、走到站台的时间 */
  boardingMin: number;
  /**
   * 只能在两站之间换乘，不能开车到换乘点上车（梦莲湖和露易丝湖之间的接驳车：
   * 露易丝湖边的停车场一早就满，接驳车也只接持班车票的人）
   */
  transferOnly?: boolean;
  /**
   * 住在线上的也不能开车进出（Kennecott：车都停在河对岸的步行桥边），去线外的景点也要先坐车回换乘点；
   * 不填表示线上的住处可以开车进出（锡安峡谷里的 Zion Lodge）
   */
  carFree?: boolean;
  /** 不开班车的季节怎么办（显示在提示里） */
  offSeasonZh?: string;
  /** 票价、预约、注意事项 */
  noteZh?: string;
  /** 时刻表是哪一年的（之后的年份按同样的日期估算） */
  scheduleYear?: number;
  source: string;
  checked: string;
}

export const shuttleSystems: ShuttleSystem[] = [
  {
    id: "yose-mariposa-grove",
    park: "yose",
    nameZh: "马里波萨巨杉林班车（Mariposa Grove Shuttle）",
    seasons: [
      {
        from: "05-03",
        to: "09-23",
        firstBus: "08:00",
        lastBusFromHub: "19:00",
        lastBus: "20:00",
        lastBusFrom: "arrival-area",
        headwayMin: 15,
      },
      {
        from: "09-24",
        to: "10-31",
        firstBus: "08:00",
        lastBusFromHub: "17:00",
        lastBus: "17:30",
        lastBusFrom: "arrival-area",
        headwayMin: 15,
      },
      {
        from: "11-01",
        to: "11-30",
        firstBus: "08:00",
        lastBusFromHub: "15:30",
        lastBus: "17:00",
        lastBusFrom: "arrival-area",
        headwayMin: 15,
      },
    ],
    hub: {
      nameZh: "Mariposa Grove Welcome Plaza 停车场",
      node: "yose-mariposa-grove",
      lat: 37.5066,
      lon: -119.62915,
      parkingZh:
        "在南门附近，约 300 个车位，旺季上午晚些时候就可能停满，最好上午早点到。往巨杉林的路只让挂残障停车证的车辆在班车运行时段开上去。",
    },
    stops: [
      {
        id: "arrival-area",
        nameZh: "Mariposa Grove Arrival Area & Trailhead",
        nameEn: "Mariposa Grove Arrival Area & Trailhead",
        minutesFromHub: 8,
        attractions: ["yose-mariposa-grove"],
      },
    ],
    boardingMin: 10,
    offSeasonZh:
      "12 月 1 日到至少 4 月 15 日没有班车，Mariposa Grove Road 冬天也不通车，只能从 Welcome Plaza 沿 Washburn Trail 或公路走 2 英里（单程，爬升约 500 英尺）进林子，冬天路上可能有雪和冰。",
    noteZh:
      "免费，约 15 分钟一班，单程约 2 英里（车程分钟数是估算）。每年最早 4 月 15 日开、最晚 11 月 30 日停，2026 年从 5 月 3 日开始；末班回程从巨杉林发车，别错过，不然要走 2 英里下山。",
    scheduleYear: 2026,
    source: "https://www.nps.gov/yose/planyourvisit/mg.htm",
    checked: "2026-09-28",
  },
  {
    id: "seki-moro-rock-crescent-meadow",
    park: "seki",
    nameZh: "红杉公园 2 号线班车（Moro Rock / Crescent Meadow Road）",
    seasons: [{ from: "05-22", to: "09-07", headwayMin: 15, days: ["sat", "sun", "holiday"] }],
    hub: {
      nameZh: "巨杉林博物馆（Giant Forest Museum）",
      node: "seki-giant-forest-museum",
      lat: 36.56414,
      lon: -118.77323,
      parkingZh:
        "博物馆停车场周末和节假日上午就会停满；官方建议把车停在 Lodgepole 营地或 Wolverton 的大停车场，坐 1 号线到博物馆再换 2 号线。",
    },
    stops: [
      {
        id: "moro-rock",
        nameZh: "Moro Rock",
        nameEn: "Moro Rock",
        minutesFromHub: 7,
        attractions: ["seki-moro-rock", "seki-tunnel-log"],
      },
      {
        id: "crescent-meadow",
        nameZh: "Crescent Meadow",
        nameEn: "Crescent Meadow",
        minutesFromHub: 13,
        attractions: ["seki-crescent-meadow"],
      },
    ],
    boardingMin: 10,
    offSeasonZh:
      "班车季以外（以及班车季的工作日），Moro Rock / Crescent Meadow Road 对私家车开放，但沿途停车位很少；冬天下雪后整条路封闭，变成滑雪道，Moro Rock 的石阶也关闭。",
    noteZh:
      "免费，不用预约。夏季班车运行期间（2026 年是 5 月 22 日到 9 月 7 日），这条路在周末和节假日的白天（大约上午到傍晚）不让私家车进，只能坐 2 号线；工作日可以自驾。挂残障停车证的车辆和持荒野许可的背包客不受限制。官网没公布发车间隔和首末班时间，各站分钟数按里程估算；Tunnel Log 就在 Moro Rock 站前面不远，可以走过去。",
    scheduleYear: 2026,
    source: "https://nps.gov/seki/planyourvisit/road-information.htm",
    checked: "2026-09-28",
  },
  {
    id: "zion-canyon",
    park: "zion",
    nameZh: "锡安峡谷景观道班车（Zion Canyon Line）",
    seasons: [
      {
        from: "03-07",
        to: "05-16",
        firstBus: "07:00",
        lastBusFromHub: "18:00",
        lastBus: "19:15",
        lastBusFrom: "temple",
        headwayMin: 10,
      },
      {
        from: "05-17",
        to: "09-12",
        firstBus: "07:00",
        lastBusFromHub: "19:00",
        lastBus: "20:15",
        lastBusFrom: "temple",
        headwayMin: 10,
      },
      {
        from: "09-13",
        to: "10-24",
        firstBus: "07:00",
        lastBusFromHub: "18:00",
        lastBus: "19:15",
        lastBusFrom: "temple",
        headwayMin: 10,
      },
      {
        from: "10-25",
        to: "11-28",
        firstBus: "07:00",
        lastBusFromHub: "17:00",
        lastBus: "18:15",
        lastBusFrom: "temple",
        headwayMin: 10,
      },
      {
        from: "12-26",
        to: "01-02",
        firstBus: "08:00",
        lastBusFromHub: "16:30",
        lastBus: "17:45",
        lastBusFrom: "temple",
        headwayMin: 10,
      },
    ],
    hub: {
      nameZh: "锡安峡谷游客中心",
      node: "zion-visitor-center",
      lat: 37.20014,
      lon: -112.98699,
      parkingZh:
        "游客中心停车场常常一早就停满；满了就停 Springdale 镇上的收费停车场，坐免费的 Springdale 小镇班车到公园的步行入口。住 Zion Lodge 的客人可以开车到酒店停车场。",
    },
    stops: [
      {
        id: "museum",
        nameZh: "Zion Human History Museum",
        nameEn: "Zion Human History Museum",
        minutesFromHub: 6,
        attractions: [],
      },
      {
        id: "canyon-junction",
        nameZh: "Canyon Junction",
        nameEn: "Canyon Junction",
        minutesFromHub: 10,
        attractions: [],
      },
      {
        id: "patriarchs",
        nameZh: "Court of the Patriarchs",
        nameEn: "Court of the Patriarchs",
        minutesFromHub: 19,
        attractions: ["zion-patriarchs"],
      },
      {
        id: "lodge",
        nameZh: "Zion Lodge",
        nameEn: "Zion Lodge",
        minutesFromHub: 25,
        attractions: ["zion-emerald-pools"],
        lodging: ["zion-stay-lodge"],
      },
      {
        id: "grotto",
        nameZh: "The Grotto",
        nameEn: "The Grotto",
        minutesFromHub: 29,
        attractions: ["zion-angels-landing", "zion-scout-lookout"],
      },
      { id: "weeping-rock", nameZh: "Weeping Rock", nameEn: "Weeping Rock", minutesFromHub: 37, attractions: [] },
      { id: "big-bend", nameZh: "Big Bend", nameEn: "Big Bend", minutesFromHub: 39, attractions: [] },
      {
        id: "temple",
        nameZh: "Temple of Sinawava",
        nameEn: "Temple of Sinawava",
        minutesFromHub: 45,
        attractions: ["zion-riverside-walk", "zion-narrows"],
      },
    ],
    boardingMin: 10,
    offSeasonZh:
      "11 月 29 日到 12 月 25 日、1 月 3 日到来年春天（通常 3 月）班车停运，这时可以自己开车进 Zion Canyon Scenic Drive，沿途停车位很少。班车季里整天都不能开私家车进去（首班前、末班后也不行），只能坐班车、骑车或走路。",
    noteZh:
      "免费，不用预约（进园要买门票）；约 5–10 分钟一班，游客中心到终点 Temple of Sinawava 约 45 分钟，往返约 1.5 小时。往北（上行）不停博物馆、Canyon Junction 和 Big Bend，这三站只在下行回程时停；各站分钟数按官方里程和全程时间估算。别等末班车：末班满了或错过，可能要走 8 英里以上回游客中心。",
    scheduleYear: 2026,
    source: "https://www.nps.gov/zion/planyourvisit/zion-canyon-shuttle-system.htm",
    checked: "2026-09-28",
  },
  {
    id: "grca-hermit-road",
    park: "grca",
    nameZh: "Hermit Road 红线班车（Hermits Rest Route）",
    seasons: [
      {
        from: "03-01",
        to: "11-30",
        lastInAtSunset: true,
        lastBusAfterSunsetMin: 60,
        lastBusFrom: "hermits",
        headwayMin: 12,
      },
    ],
    hub: {
      nameZh: "Hermit Road 换乘站（Village Route Transfer）",
      node: "grca-village-historic",
      lat: 36.05719,
      lon: -112.14465,
      parkingZh:
        "换乘站附近几乎没有停车位：一般把车停在游客中心停车场（1–4 号，约上午 11 点停满）或 Backcountry Information Center 的 D 停车场（约下午 2 点停满），坐蓝线（Village Route）到换乘站。",
    },
    stops: [
      {
        id: "trailview",
        nameZh: "Trailview Overlook",
        nameEn: "Trailview Overlook",
        minutesFromHub: 2,
        attractions: [],
      },
      { id: "maricopa", nameZh: "Maricopa Point", nameEn: "Maricopa Point", minutesFromHub: 7, attractions: [] },
      { id: "powell", nameZh: "Powell Point", nameEn: "Powell Point", minutesFromHub: 8, attractions: [] },
      { id: "hopi", nameZh: "Hopi Point", nameEn: "Hopi Point", minutesFromHub: 10, attractions: ["grca-hopi-point"] },
      {
        id: "mohave",
        nameZh: "Mohave Point",
        nameEn: "Mohave Point",
        minutesFromHub: 14,
        attractions: ["grca-mohave-point"],
      },
      { id: "abyss", nameZh: "The Abyss", nameEn: "The Abyss", minutesFromHub: 20, attractions: [] },
      {
        id: "monument",
        nameZh: "Monument Creek Vista",
        nameEn: "Monument Creek Vista",
        minutesFromHub: 26,
        attractions: [],
      },
      { id: "pima", nameZh: "Pima Point", nameEn: "Pima Point", minutesFromHub: 34, attractions: ["grca-pima-point"] },
      {
        id: "hermits",
        nameZh: "Hermits Rest",
        nameEn: "Hermits Rest",
        minutesFromHub: 40,
        attractions: ["grca-hermits-rest"],
      },
    ],
    boardingMin: 15,
    offSeasonZh:
      "12 月到 2 月 Hermit Road 对私家车开放（车长 22 英尺 / 6.7 米以下），可以自己开到各观景点；3 月 1 日到 11 月 30 日只能坐红线班车、跟商业团，或者骑车、走路。",
    noteZh:
      "免费，不用预约（进园要买门票）。去程 9 个观景点都停，回程只停 Hermits Rest、Pima、Mohave、Powell 四站；末班去程在日落时从换乘站发出，最后一班回程在日落后约 1 小时沿途收人。全程往返约 80 分钟，各站分钟数是按站点间距离和往返时间估算的；旺季换乘站排队可能要等两三班。",
    scheduleYear: 2026,
    source: "https://www.nps.gov/grca/planyourvisit/hermit-red-route.htm",
    checked: "2026-09-28",
  },
  {
    id: "grca-kaibab-rim",
    park: "grca",
    nameZh: "Kaibab Rim 橙线班车（去 South Kaibab 步道口和 Yaki Point）",
    seasons: [{ from: "01-01", to: "12-31", lastBusAfterSunsetMin: 60, lastBusFrom: "hub", headwayMin: 15 }],
    hub: {
      nameZh: "大峡谷游客中心班车总站",
      node: "grca-mather-point",
      lat: 36.05809,
      lon: -112.1084,
      parkingZh: "停游客中心的 1–4 号停车场，旺季大约上午 11 点停满。",
    },
    stops: [
      {
        id: "south-kaibab",
        nameZh: "South Kaibab Trailhead",
        nameEn: "South Kaibab Trailhead",
        minutesFromHub: 9,
        attractions: ["grca-south-kaibab"],
      },
      { id: "yaki-point", nameZh: "Yaki Point", nameEn: "Yaki Point", minutesFromHub: 12, attractions: [] },
      { id: "pipe-creek", nameZh: "Pipe Creek Vista", nameEn: "Pipe Creek Vista", minutesFromHub: 18, attractions: [] },
    ],
    boardingMin: 10,
    offSeasonZh:
      "全年都开；去 South Kaibab 步道口和 Yaki Point 的路常年不让私家车进。班车没开的清晨和夜里只能走路、骑车，或打 Xanterra 出租车（928-638-2631）。",
    noteZh:
      "免费。往东的车从游客中心直达 South Kaibab 步道口（官方说 9 分钟），再到 Yaki Point、Pipe Creek Vista 后回游客中心；往西的车去 Mather Point 和 Yavapai 地质博物馆（这两处也能自驾）。秋季 6–9 点每 20 分钟、之后每 15 分钟一班，末班在日落后约 1 小时；夏季首班提前到 5 点。除步道口外的分钟数是估算。",
    scheduleYear: 2026,
    source: "https://www.nps.gov/grca/planyourvisit/kaibab-orange-route.htm",
    checked: "2026-09-28",
  },
  {
    id: "wrst-kennecott",
    park: "wrst",
    nameZh: "Kennecott 私营接驳车（McCarthy Road 尽头步行桥出发）",
    seasons: [{ from: "05-25", to: "09-15", headwayMin: 45 }],
    hub: {
      nameZh: "McCarthy Road 尽头的 Kennicott River 步行桥",
      node: "wrst-mccarthy",
      lat: 61.43386,
      lon: -142.94361,
      parkingZh:
        "所有车辆都要停在河西岸路尽头（停车场多为私人收费），走过步行桥，在东岸坐接驳车；到 McCarthy 小镇约 0.5 英里，到 Kennecott 约 5 英里。",
    },
    stops: [
      {
        id: "kennecott",
        nameZh: "Kennecott 矿镇",
        nameEn: "Kennecott Mines National Historic Landmark",
        minutesFromHub: 20,
        attractions: [
          "wrst-kennecott",
          "wrst-mill-tour",
          "wrst-root-glacier",
          "wrst-glacier-hike",
          "wrst-bonanza-mine",
        ],
        lodging: ["wrst-stay-kennicott-glacier-lodge"],
      },
    ],
    boardingMin: 10,
    carFree: true,
    offSeasonZh:
      "接驳车只在夏季运行；冬天只能从 McCarthy Road 尽头徒步或滑雪 5 英里到 Kennecott（这条路冬天不定期养护）。",
    noteZh:
      "不是 NPS 运营：桥东岸有私营接驳车（例如 Copper Town Shuttle），各家时刻和票价随季节变，大约每 30 分钟到 1 小时一班，夏季时刻贴在桥边的避雨亭里。私家车不能开到 Kennecott，也可以步行或骑车（McCarthy 到 Kennecott 约 4.5 英里）；分钟数是按距离估算的。运营季节是按 Kennecott 导览季估算的（大约 5 月底到 9 月中）。",
    source: "https://www.nps.gov/places/000/kennicott-river-bridge.htm",
    checked: "2026-09-28",
  },
  {
    id: "banf-lake-connector",
    park: "banf",
    nameZh: "露易丝湖—梦莲湖接驳车（Lake Connector）",
    seasons: [
      { from: "06-01", to: "10-12", firstBus: "07:00", lastBus: "18:00", lastBusFrom: "moraine-lake", headwayMin: 30 },
    ],
    hub: {
      nameZh: "露易丝湖湖边（Lake Louise Lakeshore）",
      node: "banf-lake-louise",
      lat: 51.41646,
      lon: -116.21655,
      parkingZh: "只接 Parks Canada 班车和 Roam 通票的乘客；湖边停车场 5–10 月收费，夏天日出前就停满。",
    },
    stops: [
      {
        id: "moraine-lake",
        nameZh: "Moraine Lake",
        nameEn: "Moraine Lake",
        minutesFromHub: 25,
        attractions: ["banf-moraine-lake"],
      },
    ],
    boardingMin: 5,
    transferOnly: true,
    offSeasonZh: "不开的季节没有别的公共交通往返两湖；Moraine Lake Road 全年不让私家车进。",
    noteZh:
      "包含在 Parks Canada 班车票里（持 Roam Reservable Super Pass 也能坐），在两湖停车场旁标着 Connector Shuttle 的帐篷处上车；最后一班 18:00 从梦莲湖回露易丝湖。车程分钟数按道路距离估算。",
    scheduleYear: 2026,
    source: "https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise",
    checked: "2026-09-28",
  },
  {
    id: "banf-moraine-lake",
    park: "banf",
    nameZh: "梦莲湖班车（Parks Canada 班车，Park and Ride 出发）",
    seasons: [
      {
        from: "06-01",
        to: "10-12",
        firstBus: "06:30",
        lastBusFromHub: "17:00",
        lastBus: "19:30",
        lastBusFrom: "moraine-lake",
        headwayMin: 30,
      },
    ],
    hub: {
      nameZh: "Lake Louise Park and Ride（Lake Louise 滑雪场停车场）",
      node: "banf-lake-louise-gondola",
      lat: 51.44137,
      lon: -116.16217,
      parkingZh:
        "有班车预约的人免费停车，要在预约的 1 小时时段内到停车场的 Parks Canada 服务亭签到换登车票；5–10 月停车场入口晚 8 点到早 6 点关闸，错过末班车当晚取不了车。",
    },
    stops: [
      {
        id: "moraine-lake",
        nameZh: "Moraine Lake",
        nameEn: "Moraine Lake",
        minutesFromHub: 30,
        attractions: ["banf-moraine-lake"],
      },
    ],
    boardingMin: 15,
    offSeasonZh:
      "Moraine Lake Road 全年不让私家车进；Parks Canada 班车和持照的商业车只在 6 月到 10 月中旬（看天气）开，其余时间基本去不了梦莲湖。住 Moraine Lake Lodge 的客人可以开车上去。",
    noteZh:
      "必须提前预约（2026 年成人 C$12.75，另收订票费），一张票含去梦莲湖、Lake Louise、两湖之间的 Lake Connector 和回 Park and Ride。每 30 分钟一班，旺季排队可能要等 30 分钟到 1 小时；车程分钟数按道路距离估算。另有 4:00、5:00 从 Lake Louise 湖边出发的 Alpine Start 早班车（要单独预约，湖边停车另付费）。",
    scheduleYear: 2026,
    source: "https://parks.canada.ca/pn-np/ab/banff/visit/parkbus/louise",
    checked: "2026-09-28",
  },
];
