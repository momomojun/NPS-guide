export type RegionId =
  | "seattle"
  | "norcal"
  | "sierra"
  | "socal"
  | "rockies"
  | "colorado"
  | "vegas"
  | "utah"
  | "alaska"
  | "canada";

export interface Park {
  /**
   * 四个字母的代码：美国国家公园就是 NPS parkCode（调用 NPS API 时用）；
   * 加拿大公园和园外名胜是我们自己起的（banf、ante……），景点 id 都以它开头
   */
  code: string;
  /**
   * park = 国家公园；site = 园外名胜（纳瓦霍部落公园、BLM 保护区、国家休闲区里的景点等），
   * 和国家公园分开展示（首页、菜单里单独一组，页面在 /places），不算进“多少座国家公园”。不填就是 park
   */
  kind?: "park" | "site";
  /** 所在国家，不填是美国。加拿大的公园没有 NPS 公告和门票接口，门票用加元，美国年卡不能用 */
  country?: "US" | "CA";
  /** 管理方（园外名胜和加拿大公园显示），比如“纳瓦霍部落公园”“美国土地管理局（BLM）”“加拿大国家公园管理局” */
  agency?: string;
  /**
   * 查 NPS 公告用的代码。美国国家公园不用填（就是 code）；园外名胜在 NPS 管的地方里时填
   * （马蹄湾在 Glen Canyon 国家休闲区：glca）；加拿大公园、其他园外名胜设成 null，不查 NPS
   */
  npsCode?: string | null;
  /** 官方网站：不归 NPS 管的公园、名胜没有 NPS 公告，页面上让人去这里看最新消息 */
  officialUrl?: string;
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
  /** 常顺路一起玩的公园，自动生成攻略时可以一起排 */
  nearby?: string[];
  /** 2026 年起对非居民每人加收 $100 的 11 个公园之一 */
  nonresidentSurcharge: boolean;
  /** 住宿建议，自动生成攻略时显示 */
  lodgingTip: string;
}

export const regionOrder: RegionId[] = [
  "seattle",
  "norcal",
  "sierra",
  "socal",
  "rockies",
  "colorado",
  "vegas",
  "utah",
  "alaska",
  "canada",
];

/** 是不是园外名胜（不是国家公园） */
export const isSite = (park: Pick<Park, "kind">) => park.kind === "site";

/** 查 NPS 公告、门票用的代码；不在 NPS 管理范围里的返回 null */
export const npsCodeOf = (park: Pick<Park, "code" | "npsCode">) => (park.npsCode === undefined ? park.code : park.npsCode);

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
      "hetch-hetchy": "Hetch Hetchy（西北角）",
    },
    gateway: { nameZh: "优胜美地山谷", lat: 37.7456, lon: -119.5936 },
    timeZone: "America/Los_Angeles",
    airports: ["FAT", "SFO", "OAK", "SJC"],
    nearby: ["seki"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内的 Yosemite Valley Lodge、Curry Village、The Ahwahnee 离景点最近，通常提前约一年开放预订，旺季很快订满；订不到可以住西边的 El Portal、Mariposa，南边的 Oakhurst（去巨杉林方便），或北边的 Groveland。夏秋走 Tioga Road 往东，也可以住东门外的 Lee Vining。",
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
      foothills: "Foothills（山脚）",
      "giant-forest": "Giant Forest（红杉）",
      lodgepole: "Lodgepole",
      "grant-grove": "Grant Grove（国王峡谷）",
      "cedar-grove": "Cedar Grove（峡谷底）",
    },
    gateway: { nameZh: "Foothills 游客中心", lat: 36.4906, lon: -118.8388 },
    timeZone: "America/Los_Angeles",
    airports: ["FAT", "LAX"],
    nearby: ["yose"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内有 Wuksachi Lodge（红杉这边）和 John Muir Lodge（国王峡谷这边）；园外最方便的是南门外的 Three Rivers，去 Giant Forest 要爬约 1 小时盘山路。Visalia 酒店多、价格低，但离得更远。",
  },
  {
    code: "chis",
    nameZh: "海峡群岛",
    nameEn: "Channel Islands",
    region: "socal",
    tagline: "海蚀洞、岛狐与鲸鱼",
    stateEn: "California",
    hero: "chis-anacapa-island",
    intro:
      "由南加州外海的五座岛和周围海域组成，岛上不能开车、没有商店，上岛基本只能坐船，吃喝都要自带。长期与大陆隔绝，2,000 多种动植物里有 145 种是这里独有的（比如岛狐），常被称为“北美的加拉帕戈斯”。多数人从 Ventura 港坐 Island Packers 的船去 Santa Cruz 岛或 Anacapa 岛一日游，风浪大时会停航。",
    bestMonths: [4, 8, 9, 10],
    seasonNote: "8–10 月风浪最小、海水最清，登岛和划船最稳；春季岛上变绿开花、还有灰鲸，但风大易停航；5–7 月早上常有海雾。",
    areas: {
      mainland: "Ventura 港（大陆）",
      anacapa: "阿纳卡帕岛（Anacapa）",
      "santa-cruz": "圣克鲁斯岛（Santa Cruz）",
      "santa-rosa": "圣罗莎岛（Santa Rosa）",
      "san-miguel": "圣米格尔岛（San Miguel）",
    },
    gateway: { nameZh: "Ventura 港游客中心", lat: 34.2485, lon: -119.26656 },
    timeZone: "America/Los_Angeles",
    airports: ["LAX", "BUR", "SBA"],
    nonresidentSurcharge: false,
    lodgingTip:
      "岛上没有酒店，只有简易露营地（装备要自己带上船、搬到营地，recreation.gov 最早提前 6 个月预订）。坐船当天要提前到码头签到，住 Ventura 港边最方便，Ventura 老城区餐厅多、开车约 10 分钟；部分班次从 Oxnard 的 Channel Islands Harbor 出发，订住处前看清船票。Santa Barbara 城市更有味道但房价高、到码头约 45 分钟，预算有限可以住 Camarillo 的连锁酒店。",
  },
  {
    code: "jotr",
    nameZh: "约书亚树",
    nameEn: "Joshua Tree",
    region: "socal",
    tagline: "约书亚树与巨石堆",
    stateEn: "California",
    hero: "jotr-ryan-mountain",
    intro:
      "两个沙漠在这里交汇：西北部海拔较高的莫哈韦沙漠长满了枝杈古怪的约书亚树，散落着一堆堆圆滚滚的花岗岩巨石；东南部低处是更热更干的科罗拉多沙漠，有泰迪熊仙人掌园和扇棕榈绿洲。园内没有酒店、餐厅和加油站，多数人住北边 62 号公路沿线的小镇，开车一天就能串起隐谷、骷髅岩和 Keys View；这里也是国际暗夜公园和世界知名的攀岩地，从洛杉矶开车约 2.5 小时。",
    bestMonths: [2, 3, 4, 10, 11],
    seasonNote:
      "10–4 月最舒服，雨水多的年份 2–4 月有野花和约书亚树开花；6–9 月白天常超过 38°C，只适合清晨走短步道，49 Palms 步道 6–9 月关闭；冬天夜里常到 0°C 以下，偶尔下雪。",
    areas: {
      west: "西部 · 隐谷 / Keys View",
      central: "中部 · 巨石阵 / 骷髅岩",
      north: "北侧 · Twentynine Palms",
      pinto: "平托盆地 · 仙人掌园",
      south: "南部 · Cottonwood",
    },
    gateway: { nameZh: "约书亚树游客中心（Joshua Tree 镇）", lat: 34.13391, lon: -116.31559 },
    timeZone: "America/Los_Angeles",
    airports: ["PSP", "ONT", "LAX", "SNA", "LAS"],
    nearby: ["deva"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 Jumbo Rocks、Indian Cove、Black Rock、Cottonwood 等露营地（主要营地全年要在 recreation.gov 预约，最早提前 6 个月），大多没有自来水。多数人住北边 62 号公路沿线的小镇：Joshua Tree 镇离西入口最近，酒店少、整套民宿多；Yucca Valley 有连锁酒店和大超市；Twentynine Palms 靠北入口、价格最低。10 月到次年 5 月、尤其周末和春假要提前一两个月订；想住度假酒店可以住约 1 小时车程的 Palm Springs 或 Palm Desert。",
  },
  {
    code: "redw",
    nameZh: "红木",
    nameEn: "Redwood",
    region: "norcal",
    tagline: "地球上最高的树",
    stateEn: "California",
    hero: "redw-stout-grove",
    intro:
      "地球上最高的树——海岸红杉的大本营，由一座国家公园和 Prairie Creek、Del Norte Coast、Jedediah Smith 三座州立公园联合管理，沿 101 公路狭长分布，从南端 Orick 到北端 Crescent City 开车约 1 小时。原始林里随处是上千岁、近百米高的红杉，海边还有蕨类峡谷、金崖海滩和克拉马斯河口，草原上常见成群的罗斯福马鹿。国家公园不收门票，只有部分州立公园区域收日用费。",
    bestMonths: [5, 6, 7, 8, 9],
    seasonNote: "全年开放；5–9 月雨少、Fern Canyon 搭起临时木桥，但海边常有雾，10–4 月是雨季。",
    areas: {
      orick: "Orick / Bald Hills（南端）",
      "prairie-creek": "Prairie Creek（草原溪）",
      klamath: "Klamath（克拉马斯河口）",
      "crescent-city": "Crescent City / Jedediah Smith（北端）",
      south: "园外南侧（巨人大道）",
    },
    gateway: { nameZh: "Prairie Creek 游客中心", lat: 41.364, lon: -124.02323 },
    timeZone: "America/Los_Angeles",
    airports: ["ACV", "CEC", "MFR", "SFO"],
    nearby: ["crla", "lavo"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 Elk Prairie 和 Jedediah Smith 露营地里的几间简易木屋（要自带寝具），通常提前几个月就订满。南段可以住 Orick 的 Elk Meadow Cabins，或更南边的 Trinidad、Arcata、Eureka；北段住 Crescent City 最方便，酒店多、有 Tesla 超充；Klamath 在中间，南北两头都不远。",
  },
  {
    code: "lavo",
    nameZh: "拉森火山",
    nameEn: "Lassen Volcanic",
    region: "norcal",
    tagline: "四种火山与沸腾泥潭",
    stateEn: "California",
    hero: "lavo-manzanita-lake",
    intro:
      "加州北部的火山公园，世界上四种类型的火山（熔岩穹丘、盾状火山、火山渣锥、复合火山）在这里都能看到，拉森峰在 1914–1917 年最后一次喷发。约 48 公里长的公园公路绕过拉森峰东侧，沿途是冒泡的泥浆池、喷气孔和高山湖；东北角的 Butte Lake 还有火山渣锥和彩色的火山灰丘。",
    bestMonths: [7, 8, 9, 10],
    seasonNote: "公园公路通常 6 月全线通车、10 月底到 11 月下雪后封路；Bumpass Hell 和拉森峰步道一般 7 月雪化后才开放。",
    areas: {
      southwest: "西南入口区",
      "lassen-peak": "拉森峰周边",
      northwest: "公路北段 / 曼萨尼塔湖",
      "butte-lake": "Butte Lake（东北角）",
      "north-outside": "园外北侧（Old Station / Burney）",
    },
    gateway: { nameZh: "Kohm Yah-mah-nee 游客中心", lat: 40.43778, lon: -121.53383 },
    timeZone: "America/Los_Angeles",
    airports: ["RDD", "SMF", "RNO", "SFO"],
    nearby: ["crla", "redw"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有两处住宿，都只在夏秋营业：西北角 Manzanita Lake 露营地的简易小木屋（要自带床品），和东南角 Warner Valley 的 Drakesbad 客栈牧场（含三餐，常提前一年订满）。南边住西南入口外的 Mineral 最近，Chester 选择更多；北边可以住 Old Station、Shingletown，或者约 1 小时车程外的雷丁，酒店多、价格低。",
  },
  {
    code: "crla",
    nameZh: "火山口湖",
    nameEn: "Crater Lake",
    region: "norcal",
    tagline: "火山口里的美国最深湖",
    stateEn: "Oregon",
    hero: "crla-rim-village",
    intro:
      "约 7,700 年前马扎马火山（Mount Mazama）大喷发后塌陷，雨雪积成了深 592 米的火山口湖，是美国最深的湖，湖水异常清澈、呈深蓝色。53 公里长的环湖公路 Rim Drive 沿途有 30 多个观景点，通常 7 月中到 10 月下旬全线开通；冬季平均降雪约 13 米，只能开到 Rim Village。唯一下到湖边的 Cleetwood Cove 步道 2026–2028 年重建关闭，这期间没有湖上游船，也上不了巫师岛。",
    bestMonths: [7, 8, 9],
    seasonNote: "7–9 月环湖公路和步道基本全开；6 月、10 月常有路段或步道因雪未开，冬春（约 11–5 月）只能开到 Rim Village。",
    areas: {
      "rim-village": "Rim Village / 公园总部",
      "west-rim": "西环湖路",
      "east-rim-north": "东环湖路北段",
      "east-rim-south": "东环湖路南段",
    },
    gateway: { nameZh: "Rim Village", lat: 42.9115, lon: -122.1466 },
    timeZone: "America/Los_Angeles",
    airports: ["MFR", "RDM", "EUG", "PDX"],
    nearby: ["redw", "lavo"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有两处住宿：湖边的 Crater Lake Lodge（约 5 月中到 10 月中）和南入口附近的 Mazama Village 木屋（约 5 月下旬到 9 月底），都可提前 365 天预订，暑期往往几个月前就订满。园外最近的是南边的 Fort Klamath 和西边的 Union Creek、Prospect（到 Rim Village 约 40–60 分钟），北入口开放时也可以住 Diamond Lake；酒店多、价格低的是 Klamath Falls（约 1 小时 15 分）和机场所在的 Medford（约 1 小时 45 分）。",
  },
  {
    code: "mora",
    nameZh: "雷尼尔山",
    nameEn: "Mount Rainier",
    region: "seattle",
    tagline: "冰川火山与野花草甸",
    stateEn: "Washington",
    hero: "mora-skyline-trail",
    intro:
      "海拔 4,392 米的雷尼尔山是一座活火山，也是美国本土冰川最多的山峰。夏天南坡的 Paradise 和东北坡的 Sunrise 是两大看山区，7 月下旬到 8 月高山草甸野花最盛；Paradise 冬天也开放，可以玩雪、走雪鞋。离西雅图约 2 小时车程。",
    bestMonths: [7, 8, 9],
    seasonNote: "7–9 月道路全开、步道化雪，7 月下旬到 8 月野花最盛；冬季只有 Longmire 到 Paradise 的路白天开放，要带雪链。",
    areas: {
      longmire: "Longmire（西南入口）",
      paradise: "Paradise（天堂区）",
      "stevens-canyon": "Stevens Canyon / Ohanapecosh（东南）",
      "chinook-pass": "Chinook Pass（东侧 410 号公路）",
      sunrise: "Sunrise / White River（东北）",
    },
    gateway: { nameZh: "天堂游客中心（Paradise）", lat: 46.78587, lon: -121.73676 },
    timeZone: "America/Los_Angeles",
    airports: ["SEA", "PDX"],
    nearby: ["olym", "noca"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有两家酒店：Paradise 的 Paradise Inn（约 5 月中到 10 月初营业）和 Longmire 的 National Park Inn（全年营业，只有 25 间房），都要尽早订。园外最方便的是西南入口外的 Ashford，到 Paradise 约 1 小时；东南方向的 Packwood 离 Ohanapecosh 近；去 Sunrise 可以住东北方向的 Crystal Mountain 或 Enumclaw。",
  },
  {
    code: "olym",
    nameZh: "奥林匹克",
    nameEn: "Olympic",
    region: "seattle",
    tagline: "雪山、雨林与荒野海岸",
    stateEn: "Washington",
    hero: "olym-second-beach",
    intro: "一个公园里有三种完全不同的风景：飓风岭上的冰川雪峰、西侧年降水量 3 米多的温带雨林，以及立着海蚀柱、堆满漂流木的荒野海岸。园内没有横穿的公路，景点散落在环绕半岛的 101 号公路两侧，片区之间常要开一两个小时。",
    bestMonths: [6, 7, 8, 9],
    seasonNote: "7–9 月最干爽、高山步道也通了；10–5 月多雨，飓风岭冬季一般只在周五到周日开放。",
    areas: {
      "hurricane-ridge": "飓风岭 / 天使港",
      "lake-crescent": "新月湖 / Sol Duc",
      "north-coast": "北部海岸（La Push / Rialto）",
      hoh: "霍河雨林",
      kalaloch: "Kalaloch / 红宝石海滩",
      quinault: "奎诺尔特湖",
    },
    gateway: { nameZh: "奥林匹克国家公园游客中心（天使港）", lat: 48.09933, lon: -123.42571 },
    timeZone: "America/Los_Angeles",
    airports: ["SEA", "PAE", "PDX"],
    nearby: ["mora", "noca"],
    nonresidentSurcharge: false,
    lodgingTip:
      "公园很大、没有横穿的公路，大多数人沿 101 号公路环线每一两晚换一个住处：北边住天使港或新月湖边的 Lake Crescent Lodge、Log Cabin Resort（Sol Duc 温泉度假村在旁边的山谷里），西边以 Forks 为据点去 La Push 海滩和霍河雨林，海边有 Kalaloch Lodge，南边住奎诺尔特湖旅馆。园内几家除 Kalaloch Lodge 外都是季节性营业，夏季要早订。",
  },
  {
    code: "noca",
    nameZh: "北瀑布",
    nameEn: "North Cascades",
    region: "seattle",
    tagline: "冰川雪峰与碧绿湖水",
    stateEn: "Washington",
    hero: "noca-diablo-lake-overlook",
    intro:
      "华盛顿州北部的冰川山地，有 300 多条冰川，是阿拉斯加以外美国冰川最多的地方，锯齿状雪峰下是被冰川细粉染成碧绿色的迪亚布洛湖。园区几乎没有公路，大多数人沿 20 号公路（North Cascades Highway）自驾，在观景台和步道口停车游览，不收门票。东侧的 Rainy Pass、Washington Pass 属于国家森林，但通常和公园一起玩。",
    bestMonths: [7, 8, 9],
    seasonNote: "7–9 月高山步道无雪最好走，9 月底到 10 月中旬看金色落叶松；20 号公路中段冬季封闭（约 11 月底至次年 4–5 月）。",
    areas: {
      newhalem: "Newhalem（游客中心）",
      diablo: "迪亚布洛湖 · 罗斯湖",
      passes: "东侧山口（Rainy / Washington Pass）",
      "cascade-river": "Cascade River Road",
    },
    gateway: { nameZh: "北瀑布游客中心（Newhalem）", lat: 48.66629, lon: -121.26672 },
    timeZone: "America/Los_Angeles",
    airports: ["SEA", "BLI"],
    nearby: ["mora", "olym"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内能住的只有 Ross Lake Resort 的湖上木屋（6–10 月营业，没有车道，靠老客续订和抽签，很难订到）和环境学习中心特定日期的活动住宿；大多数人住西侧的 Marblemount 或 Concrete，到 Newhalem 约 20–40 分钟。20 号公路开通期间（约 5–11 月），东侧的 Mazama 和西部风情小镇 Winthrop 住宿更多，适合单独留一天玩东侧山口；园区内没有加油站。",
  },
  {
    code: "yell",
    nameZh: "黄石",
    nameEn: "Yellowstone",
    region: "rockies",
    tagline: "间歇泉、温泉与野生动物",
    stateEn: "Wyoming · Montana · Idaho",
    hero: "yell-grand-prismatic-overlook",
    intro:
      "1872 年设立的世界第一座国家公园，坐落在世界上最大的活火山之一上：全世界一半以上的间歇泉都在这里，老忠实间歇泉、大棱镜温泉和猛犸温泉阶地是招牌。黄石大峡谷和下瀑布、北美高海拔最大的黄石湖，以及拉马尔谷、海登谷里的野牛、狼和熊，同样值得专程来看。主环线约 229 公里、呈“8”字形，景点分散，建议至少留 3 天。",
    bestMonths: [6, 7, 8, 9],
    seasonNote: "6–9 月道路和设施全开，9 月人少还能看马鹿发情；11 月到次年 4 月中旬，除北门到东北门一段外道路不通私家车，冬天只能坐雪地车进园。",
    areas: {
      "geyser-basins": "间歇泉盆地（老忠实）",
      norris: "诺里斯 / 麦迪逊",
      mammoth: "猛犸温泉（北门）",
      "tower-lamar": "拉马尔谷 / 东北角",
      canyon: "黄石大峡谷",
      lake: "海登谷 / 黄石湖",
    },
    gateway: { nameZh: "峡谷村（Canyon Village）", lat: 44.73471, lon: -110.49189 },
    timeZone: "America/Denver",
    airports: ["BZN", "SLC", "JAC", "WYS", "IDA", "BIL", "COD"],
    nearby: ["grte", "glac"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内酒店分散在老忠实、峡谷村、湖区、猛犸温泉和 Grant Village，除猛犸温泉酒店和 Snow Lodge 外大多只在 5 月到 10 月初营业，通常提前一年左右开放预订、旺季很快订满；按路线分两三处住，能少走很多回头路。园外最方便的是西门外的 West Yellowstone（离间歇泉盆地近）和北门外的 Gardiner（全年通车）；清晨去拉马尔谷看狼可以住东北门外的 Cooke City / Silver Gate，和大提顿连着玩就住 Grant Village 或南边的 Jackson。",
  },
  {
    code: "grte",
    nameZh: "大提顿",
    nameEn: "Grand Teton",
    region: "rockies",
    tagline: "拔地而起的雪峰与湖泊",
    stateEn: "Wyoming",
    hero: "grte-schwabacher-landing",
    intro:
      "提顿山脉没有山麓缓坡，从 Jackson Hole 谷底直接拔起 2,000 多米，主峰 Grand Teton 海拔 4,199 米，山脚下串着珍妮湖、弦湖、杰克逊湖等冰川湖。公园不大，一个环线就能看到大部分景点：西边的 Teton Park Road 贴着山脚走，东边的 191 号公路沿蛇河经过摩门街谷仓和施瓦巴赫码头。北边经洛克菲勒纪念公园路直通黄石南门，大多数人把两个公园连在一起玩。",
    bestMonths: [6, 7, 8, 9],
    seasonNote: "6–9 月道路、渡船和园内住宿全开，9 月底到 10 月初山杨金黄、马鹿发情；11 月到次年 4 月 Teton Park Road 北段不通车，只能滑雪或穿雪鞋。",
    areas: {
      moose: "Moose / Moose-Wilson 路",
      "jenny-lake": "珍妮湖 / Teton Park Road",
      "jackson-lake": "杰克逊湖 / Colter Bay",
      "hwy-191": "191 号公路 / 蛇河沿岸",
      jackson: "Jackson 镇 / Teton Village（园外）",
    },
    gateway: { nameZh: "克雷格·托马斯游客中心（Moose）", lat: 43.6533, lon: -110.71853 },
    timeZone: "America/Denver",
    airports: ["JAC", "SLC", "IDA", "BZN"],
    nearby: ["yell"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内住宿都只在约 5 月中到 10 月初营业：杰克逊湖边的 Jackson Lake Lodge、Signal Mountain Lodge 和 Colter Bay 木屋（相对便宜），珍妮湖边的 Jenny Lake Lodge 最贵但含早晚餐，都提前约一年开放预订、旺季很快订满。园外最方便的是南边的 Jackson 镇（到珍妮湖约 40 分钟），但房价很高；想省钱或一家人租整套房子，可以翻过 Teton Pass 住爱达荷州的 Victor / Driggs，或往南住 Alpine。和黄石连着玩，可以在北边的 Colter Bay、Headwaters（Flagg Ranch）或 Buffalo Valley 住一晚，第二天一早从南门进黄石。",
  },
  {
    code: "glac",
    nameZh: "冰川",
    nameEn: "Glacier",
    region: "rockies",
    tagline: "冰川湖与向阳大道",
    stateEn: "Montana",
    hero: "glac-wild-goose-island",
    intro:
      "1910 年设立，号称“大陆之冠”（Crown of the Continent）：冰川在落基山北段刨出锯齿状的山峰、U 形谷和一串串碧绿的湖，园内还剩二十多条小冰川，正在快速消退。招牌是约 80 公里长的向阳大道（Going-to-the-Sun Road），贴着崖壁翻过大陆分水岭上的洛根山口；东侧的 Many Glacier 步道最精彩，灰熊、雪山羊和大角羊都很常见。2026 年进园不用预约，但 7 月 1 日到 9 月 7 日洛根山口私家车限停 3 小时，走高线步道这类长线要提前订班车票。",
    bestMonths: [7, 8, 9],
    seasonNote:
      "7 月到 9 月上旬向阳大道全线通车、高处步道的雪基本化完，是最好的季节；9 月中下旬人少，但园内酒店和游船陆续停业；10 月下旬到次年 6 月洛根山口封路，只能在西侧麦克唐纳湖一带和 2 号公路沿线活动。",
    areas: {
      "lake-mcdonald": "西侧 · 麦克唐纳湖",
      "logan-pass": "向阳大道 · 洛根山口",
      "st-mary": "东侧 · 圣玛丽湖",
      "many-glacier": "Many Glacier 山谷",
      "two-medicine": "双药湖 · 2 号公路",
      "north-fork": "北岔 · 鲍曼湖",
    },
    gateway: { nameZh: "Apgar 游客中心（西门）", lat: 48.5231, lon: -113.98841 },
    timeZone: "America/Denver",
    airports: ["FCA", "MSO", "GTF", "BZN", "SEA"],
    nearby: ["banf", "yell"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内酒店都只在夏季营业（2026 年大多 5 月中到 6 月上旬开门、9 月中下旬关门），每月 1 日开放下一年同月的预订，热门日期很快订满：西侧是湖边的 Lake McDonald Lodge 和 Apgar 村，东侧是 Many Glacier Hotel、Swiftcurrent Motor Inn 和 Rising Sun。园外西边的 West Glacier 离西门最近，Columbia Falls、Whitefish、Kalispell 选择多、价格低，到西门 25–50 分钟；东边只有 St. Mary、Babb 和 East Glacier Park 几个小地方，住处少、要早订。东西两侧之间开车要 1.5–2.5 小时，最好两边各住几晚。",
  },
  {
    code: "romo",
    nameZh: "落基山",
    nameEn: "Rocky Mountain",
    region: "colorado",
    tagline: "高山苔原与大陆分水岭",
    stateEn: "Colorado",
    hero: "romo-emerald-lake",
    intro:
      "落基山脉的主脊从公园中间穿过，约三分之一的面积在林线以上。Trail Ridge Road 是美国海拔最高的连续铺装公路（最高约 3,713 米），夏秋翻过大陆分水岭，连起东边的 Estes Park 和西边的 Grand Lake；东侧 Bear Lake 路一带有一串高山湖泊，草甸上常见麋鹿，西侧河谷能看到驼鹿。2026 年 5 月 22 日到 10 月中旬白天进园要提前在 Recreation.gov 预约时段，去 Bear Lake 路还要选含 Bear Lake 路的那一种。",
    bestMonths: [6, 7, 8, 9],
    seasonNote:
      "6 月下旬到 9 月 Trail Ridge Road 全线通车、苔原开花，7–8 月午后常有雷暴；9 月中下旬山杨变黄、麋鹿发情，最热门；Trail Ridge 约 10 月中下旬到次年 5 月底封路，冬天只能在东西两侧的低处活动。",
    areas: {
      east: "东侧 · Beaver Meadows / Horseshoe Park",
      "bear-lake": "Bear Lake 路（熊湖走廊）",
      "trail-ridge": "Trail Ridge Road 高山段",
      west: "西侧 · Grand Lake / Kawuneeche 河谷",
    },
    gateway: { nameZh: "Beaver Meadows 游客中心", lat: 40.3662, lon: -105.5609 },
    timeZone: "America/Denver",
    airports: ["DEN"],
    nearby: ["arch", "cany"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内没有酒店，只有 Moraine Park、Glacier Basin、Aspenglen、Timber Creek 等露营地（在 recreation.gov 订，营地预约自带入住当天下午起的进园时段，常常一开放就订满）。大多数人住东门外的 Estes Park：酒店、木屋和餐厅最多，到 Beaver Meadows 入口约 10 分钟，6–9 月和麋鹿季的周末要提前几个月订；想横穿 Trail Ridge Road 就在西边的 Grand Lake 住一晚，再便宜些住 Granby。丹佛机场进出的第一晚、最后一晚可以住 Boulder 或丹佛。",
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
      west: "西部（Panamint）",
    },
    gateway: { nameZh: "Furnace Creek 游客中心", lat: 36.457, lon: -116.8663 },
    timeZone: "America/Los_Angeles",
    airports: ["LAS"],
    nearby: ["jotr"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内住宿集中在 Furnace Creek（The Inn、The Ranch）和 Stovepipe Wells，西边还有 Panamint Springs；预算有限可以住园外的 Beatty 或 Pahrump（内华达），但每天要多开一两个小时。夏天园内酒店不贵但非常热。",
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
    nearby: ["brca", "grca", "care", "hsbd", "ante", "wave"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内只有 Zion Lodge 一家酒店，很难订；大多数人住南门外的 Springdale，走路或坐镇上的免费班车就能到游客中心。更便宜的在 Hurricane、St. George；要顺路去布莱斯或大峡谷北缘的话，东边的 Kanab 也方便。",
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
    nearby: ["zion", "grca", "care", "hsbd", "ante"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内只有 The Lodge at Bryce Canyon；门口的 Bryce Canyon City（Ruby's Inn 一带）选择最多，离日出点约 10 分钟车程。东边的 Tropic、北边的 Panguitch 价格更低。",
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
      "科罗拉多河切出的约 1.6 公里深的大峡谷，从南缘看出去是近 20 亿年的岩层，日出日落时颜色变化最大。南缘全年开放、设施齐全；北缘只在夏秋开放，2025 年山火烧毁了北缘的 Grand Canyon Lodge，2026 年北缘没有住宿、饮用水和加油。",
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
    nearby: ["zion", "brca", "hsbd", "ante", "mova"],
    nonresidentSurcharge: true,
    lodgingTip:
      "南缘村里有 El Tovar、Bright Angel、Maswik 等几家园内酒店，加上 Yavapai Lodge，要提早订；园外最近的是南门外的 Tusayan（约 10 分钟），再远是 Williams 和 Flagstaff（约 1–1.5 小时）。去东边沙漠观景塔方向，可以住 Cameron。2026 年 8 月底山洪后南缘缺水，园内酒店暂停过夜接待，NPS 预计感恩节前后恢复供水，之后分阶段重开。",
  },
  {
    code: "ante",
    kind: "site",
    agency: "纳瓦霍部落公园（Navajo Nation Parks & Recreation）",
    npsCode: null,
    nameZh: "羚羊峡谷",
    nameEn: "Antelope Canyon",
    region: "vegas",
    tagline: "光束洒落的狭缝峡谷",
    stateEn: "Arizona",
    hero: "ante-upper-antelope-canyon",
    intro:
      "纳瓦霍保留地上的砂岩狭缝峡谷，千万年的山洪和风沙把岩壁冲刷成流动的波纹，晴天正午阳光从窄缝射下，在谷底形成光束。所有区域都只能跟纳瓦霍授权的导览团进：上羚羊峡谷谷底平坦、光束最有名，下羚羊峡谷要上下几段钢梯、更窄更弯；订不到还可以去人少的羚羊峡谷 X 和水洞峡谷。各家导览都按亚利桑那时间（不实行夏令时）发团。",
    bestMonths: [4, 5, 6, 7, 8, 9],
    seasonNote:
      "全年都能跟团进（感恩节、圣诞节、元旦等纳瓦霍节日关闭）；上羚羊的光束约 3 月底到 10 月初出现、6–7 月最明显，7–9 月雨季有山洪风险时会临时取消导览。",
    areas: { upper: "上羚羊峡谷", lower: "下羚羊峡谷", "more-slots": "其他狭缝峡谷" },
    gateway: { nameZh: "羚羊峡谷部落公园入口（98 号公路）", lat: 36.89716, lon: -111.40849 },
    timeZone: "America/Phoenix",
    airports: ["LAS", "PHX", "PGA", "FLG", "SLC"],
    nearby: ["hsbd", "wave", "mova", "grca", "zion", "brca"],
    nonresidentSurcharge: false,
    lodgingTip:
      "羚羊峡谷里没有住宿，几乎所有人都住西边约 5 公里的佩吉（Page）：连锁酒店、汽车旅馆和餐厅都在 Lake Powell Blvd 一带，有几家上羚羊导览公司直接从镇上发团，3–10 月旺季和节假日要提前一两个月订。想住整套房子可以看佩吉西北的 Greenehaven，或犹他州一侧的 Big Water（犹他实行夏令时，夏天比佩吉快 1 小时，赶导览时间要按亚利桑那时间算）。",
    officialUrl: "https://navajonationparks.org/guided-tour-operators/antelope-canyon-tour-operators/",
  },
  {
    code: "hsbd",
    kind: "site",
    agency: "格伦峡谷国家休闲区（NPS）· 停车场由佩吉市管理",
    npsCode: "glca",
    nameZh: "马蹄湾",
    nameEn: "Horseshoe Bend",
    region: "vegas",
    tagline: "科罗拉多河马蹄形河湾",
    stateEn: "Arizona",
    hero: "hsbd-horseshoe-bend",
    intro:
      "科罗拉多河在佩吉以南绕着一座砂岩孤峰转了约 270 度，从约 300 米高的崖边往下看，河水像一只绿色的马蹄。观景台属于格伦峡谷国家休闲区，停车场归佩吉市管、按车收费，从停车场走约 1.2 公里硬化路面就到。附近的格伦峡谷大坝、Carl Hayden 游客中心和鲍威尔湖 Wahweap 观景点，加起来半天就能看完。",
    bestMonths: [3, 4, 5, 9, 10, 11],
    seasonNote: "全年开放；春秋最舒服，夏天崖顶几乎没有遮阴、正午很热，日落时人最多。",
    areas: { "horseshoe-bend": "马蹄湾", dam: "格伦峡谷大坝", "lake-powell": "鲍威尔湖 Wahweap" },
    gateway: { nameZh: "Carl Hayden 游客中心（格伦峡谷大坝）", lat: 36.93575, lon: -111.48559 },
    timeZone: "America/Phoenix",
    airports: ["LAS", "PHX", "PGA", "FLG", "SLC"],
    nearby: ["ante", "wave", "mova", "grca", "zion", "brca"],
    nonresidentSurcharge: false,
    lodgingTip:
      "马蹄湾在佩吉镇以南约 10 分钟车程，住佩吉最方便，酒店、餐厅和超市都多，和羚羊峡谷连着玩也住这里；想住在湖边可以订格伦峡谷国家休闲区里 Wahweap 湾的 Lake Powell Resort。接着往大峡谷北缘或 White Pocket 方向走的话，可以住约 45 分钟外 Marble Canyon 一带的几家老旅馆；旺季佩吉周末常满，最好提前一两个月订。",
    officialUrl: "https://www.nps.gov/glca/planyourvisit/horseshoe-bend.htm",
  },
  {
    code: "mova",
    kind: "site",
    agency: "纳瓦霍部落公园（Navajo Nation Parks & Recreation）",
    npsCode: null,
    nameZh: "纪念碑谷",
    nameEn: "Monument Valley",
    region: "vegas",
    tagline: "西部片里的红色孤峰",
    stateEn: "Arizona · Utah",
    hero: "mova-the-view",
    intro:
      "横跨亚利桑那和犹他两州的纳瓦霍部落公园，平坦的荒漠上立着一两百米到三百米高的红色孤峰和方山，左右手（Mittens）和 Merrick Butte 是无数西部片和广告里的画面。游客中心的观景台就能看到最经典的全景，约 27 公里的土路环线可以自己开车下到谷底；环线以外的区域只能跟纳瓦霍向导去。纳瓦霍保留地实行夏令时，夏天比亚利桑那其他地方（包括佩吉）快 1 小时。",
    bestMonths: [3, 4, 5, 9, 10, 11],
    seasonNote:
      "春秋最舒服；夏天白天热、7–9 月午后常有雷暴，冬天偶尔下雪，红岩配白雪很漂亮；3 月底和 9 月中旬前后几天，日落时西手套岩的影子会投到东手套岩上。",
    areas: {
      "visitor-center": "游客中心 · The View",
      "valley-drive": "谷地自驾环线",
      backcountry: "向导团限定区域",
      "us-163": "163 号公路（园外）",
    },
    gateway: { nameZh: "纪念碑谷游客中心", lat: 36.98241, lon: -110.1118 },
    timeZone: "America/Denver",
    airports: ["PHX", "LAS", "FLG", "SLC", "PGA"],
    nearby: ["ante", "hsbd", "grca", "arch", "cany"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内唯一的酒店是游客中心旁的 The View Hotel，每间房都正对左右手岩，看日出不用出门，房间少、旺季要提前几个月订；西边约 15 分钟的 Goulding's Lodge 有酒店、小木屋、营地、餐厅和加油站。订不到可以住南边亚利桑那的 Kayenta（约 35 分钟）或北边犹他的 Mexican Hat（约 35 分钟）、Bluff（约 1 小时）；也可以住纳瓦霍家庭经营的传统泥屋（hogan）和小木屋。",
    officialUrl: "https://navajonationparks.org/navajo-tribal-parks/monument-valley/",
  },
  {
    code: "wave",
    kind: "site",
    agency: "美国土地管理局（BLM）· 朱红悬崖国家保护区",
    npsCode: null,
    nameZh: "波浪谷",
    nameEn: "The Wave",
    region: "vegas",
    tagline: "抽签才能去的砂岩波浪",
    stateEn: "Arizona · Utah",
    hero: "wave-the-wave",
    intro:
      "亚利桑那和犹他交界、美国土地管理局（BLM）管理的朱红悬崖国家保护区里，一片被风化成层层波纹的砂岩，条纹像凝固的海浪。每天只放 64 个名额，只能靠提前 4 个月的网上抽签或出发前两天的手机现场抽签拿到许可证，往返约 10 公里、没有路标。没抽中也有得玩：同一个步道口出发的 Wire Pass 狭缝峡谷、89 号公路边的蘑菇石不用抽签，开四驱或跟团还能去白口袋（White Pocket）。",
    bestMonths: [3, 4, 5, 9, 10, 11],
    seasonNote:
      "春秋最合适；5–9 月白天酷热、几乎没有遮阴，出过中暑死亡事故，7–9 月雨季山洪多、土路可能被冲断，冬天砂岩可能结冰。",
    areas: {
      "coyote-buttes": "狼丘北区（The Wave）",
      "house-rock": "House Rock Valley Road",
      "us-89": "89 号公路沿线",
      "paria-plateau": "帕里亚高原（White Pocket）",
    },
    gateway: { nameZh: "Paria 游客站（89 号公路）", lat: 37.1046, lon: -111.90025 },
    timeZone: "America/Denver",
    airports: ["LAS", "SGU", "PGA", "PHX", "SLC"],
    nearby: ["ante", "hsbd", "zion", "brca", "grca"],
    nonresidentSurcharge: false,
    lodgingTip:
      "附近没有酒店，最常见的是住西边的 Kanab（到 Wire Pass 步道口约 1 小时 10 分，最后约 13 公里是土路），BLM 游客中心和每日抽签的安全说明也在镇上；东边的佩吉（约 1 小时）和两者之间的 Big Water 也行。去 White Pocket 或南边的 Coyote Buttes South，可以住 89A 号公路边 Marble Canyon 一带的老旅馆。雨后 House Rock Valley Road 可能过不去，行程里留一天机动。",
    officialUrl: "https://www.recreation.gov/permits/274309",
  },
  {
    code: "arch",
    nameZh: "拱门",
    nameEn: "Arches",
    region: "utah",
    tagline: "两千多座天然石拱",
    stateEn: "Utah",
    hero: "arch-delicate-arch",
    intro:
      "园内登记在册的天然砂岩拱门超过 2,000 座，密度世界第一，还有平衡石、公园大道这样的石柱和岩墙。一条约 28 公里长的主路从入口通到北端的魔鬼花园，大部分景点下车走几分钟到一两个小时就能看到；招牌精致拱门要徒步往返约 4.8 公里，日落时最好看。2026 年进园不用预约时段，但 3–10 月白天入口常排队一小时以上。",
    bestMonths: [3, 4, 5, 9, 10],
    seasonNote: "3–5 月和 9–10 月最舒服；6–8 月白天常超过 38°C，徒步要赶清晨或傍晚；冬天人少，偶尔下雪，步道可能结冰。",
    areas: {
      entrance: "入口 · 公园大道",
      windows: "平衡石 · 窗户区",
      delicate: "精致拱门 · 全景点",
      north: "火焰炉 · 魔鬼花园（北段）",
    },
    gateway: { nameZh: "拱门游客中心", lat: 38.61654, lon: -109.61989 },
    timeZone: "America/Denver",
    airports: ["CNY", "GJT", "SLC", "DEN", "LAS"],
    nearby: ["cany", "care", "mova", "romo"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有北端的 Devils Garden 露营地（3–10 月的营位在 recreation.gov 提前 6 个月开放、很快订满，11–2 月先到先得）。绝大多数人住南边约 10 分钟车程的 Moab 镇，酒店、民宿和餐厅都多，但 3–10 月旺季房价高、周末常满，最好提前几个月订；想住整套房子可以看镇南的 Spanish Valley，订不到时往北住 Green River（约 1 小时）。和峡谷地连着玩，在 Moab 住两三晚最省事。",
  },
  {
    code: "cany",
    nameZh: "峡谷地",
    nameEn: "Canyonlands",
    region: "utah",
    tagline: "河流切出的峡谷迷宫",
    stateEn: "Utah",
    hero: "cany-mesa-arch",
    intro:
      "科罗拉多河和格林河在这里交汇，把高原切成一层层台地和深谷，是犹他州最大的国家公园。两条河把公园分成几个互不相通的园区：离 Moab 最近的天空之岛（Island in the Sky）是一块高出四周 300 多米的台地，梅萨拱门日出、大观景点和格林河观景点都在这里；南边的针尖区（The Needles）以红白条纹的石柱群和徒步为主，从 Moab 开车约 1.5 小时；西边的迷宫区只有四驱车能进，马蹄峡谷的大画廊岩画也在西侧。园区之间没有公路相连，一天一般只玩一个区。",
    bestMonths: [4, 5, 9, 10],
    seasonNote:
      "4–5 月和 9–10 月最舒服；夏天台地上常超过 35°C、峡谷里更热；冬天人少，偶尔下雪，针尖区游客中心约 12 月到次年 2 月中旬关闭。",
    areas: { sky: "天空之岛 · 死马点", needles: "针尖区 · 211 号公路", horseshoe: "马蹄峡谷（西侧）" },
    gateway: { nameZh: "天空之岛游客中心", lat: 38.45991, lon: -109.82099 },
    timeZone: "America/Denver",
    airports: ["CNY", "GJT", "SLC", "DEN"],
    nearby: ["arch", "care", "mova", "romo"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店：天空之岛的 Willow Flat 露营地只有 12 个先到先得的营位，针尖区露营地的 B 区可以在 recreation.gov 提前 6 个月订。玩天空之岛一般住 Moab（开车约 40–50 分钟），想住得更近可以订死马点州立公园里的蒙古包（提前 4 个月开放，很抢手）；去针尖区可以住园区门口的 Needles Outpost 帐篷营地（约 3–11 月营业）或东南边的 Monticello（约 1 小时）。去马蹄峡谷住 Green River 最近。",
  },
  {
    code: "care",
    nameZh: "圆顶礁",
    nameEn: "Capitol Reef",
    region: "utah",
    tagline: "地壳褶皱与拓荒果园",
    stateEn: "Utah",
    hero: "care-goosenecks-sunset-point",
    intro:
      "公园沿着一道约 160 公里长的地壳褶皱——水袋褶皱（Waterpocket Fold）展开：白色的纳瓦霍砂岩圆顶像国会大厦的穹顶，连绵的崖壁像挡住去路的暗礁，“Capitol Reef”由此得名。游览中心是 24 号公路边的弗鲁塔（Fruita）：摩门拓荒者留下的果园夏秋可以自己摘果子，吉福德之家卖现烤的水果派，附近有岩画、希克曼天然桥和景观道；北边的大教堂谷、南边的 Burr Trail 都要开很长的土路，人很少。",
    bestMonths: [4, 5, 6, 9, 10],
    seasonNote:
      "4–6 月和 9–10 月最舒服，6–10 月果园陆续有水果可摘；7–9 月午后常有雷暴和山洪，窄峡谷和土路会临时封闭；冬天偶尔下雪，主要道路照常通车。",
    areas: {
      fruita: "弗鲁塔 · 24 号公路",
      "scenic-drive": "景观道 · 峡谷步道",
      west: "24 号公路西段观景点",
      cathedral: "大教堂谷（北区）",
      south: "Burr Trail（南区）",
      east: "园外东侧（妖精谷）",
    },
    gateway: { nameZh: "圆顶礁游客中心", lat: 38.29147, lon: -111.26204 },
    timeZone: "America/Denver",
    airports: ["SLC", "CNY", "LAS", "GJT"],
    nearby: ["arch", "cany", "brca", "zion"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 Fruita 露营地（71 个营位，在 recreation.gov 提前 6 个月订，3 月中到 10 月几乎天天订满）。最方便的是西边约 15 分钟车程的 Torrey 小镇，汽车旅馆、餐厅和加油站都在 24 号公路边，旺季要提前订；想住整套木屋可以看旁边的 Teasdale。从东边来、或者要去妖精谷和马蹄峡谷，可以住 Hanksville（约 50 分钟）；沿 12 号公路从布莱斯过来，也可以在 Boulder 小镇住一晚。",
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
    nearby: ["kefj", "wrst"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内几乎没有普通酒店，住宿集中在入口外的 Nenana Canyon（酒店、餐厅、漂流公司都在这一带）和北边约 15 分钟的 Healy；夏季旺季房价高、要早订。南边的 Cantwell、Talkeetna 适合顺路过夜。",
  },
  {
    code: "kefj",
    nameZh: "基奈峡湾",
    nameEn: "Kenai Fjords",
    region: "alaska",
    tagline: "潮水冰川与峡湾游船",
    stateEn: "Alaska",
    hero: "kefj-exit-glacier",
    intro:
      "哈丁冰原覆盖了公园一半以上的面积，近 40 条冰川从冰原流下，有的一直流进海里，在峡湾尽头崩落。公园大部分只能坐船或小飞机进去，开车能到的只有 Seward 附近的 Exit Glacier；夏天从 Seward 出发的游船能开到潮水冰川前，一路常碰到座头鲸、虎鲸、海獭和海鹦。",
    bestMonths: [6, 7, 8],
    seasonNote:
      "6–8 月游船班次最多、Exit Glacier 的路和步道都通；5 月和 9 月人少但天气多变；10 月底到次年 5 月中 Exit Glacier 路不通汽车，去冰川的游船也停航。",
    areas: {
      "exit-glacier": "Exit Glacier",
      seward: "Seward 小镇",
      fjords: "峡湾 · 复活湾（坐船）",
      highway: "Seward 公路（安克雷奇来的路上）",
    },
    gateway: { nameZh: "基奈峡湾国家公园游客中心（Seward）", lat: 60.11628, lon: -149.43973 },
    timeZone: "America/Anchorage",
    airports: ["ANC"],
    nearby: ["dena", "wrst"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有开车能到的住宿，大家都住 Seward：港口一带酒店、民宿最多，走路就到游船码头，到 Exit Glacier 约 20 分钟；夏季房价高，7 月 4 日前后和周末很早订满。想便宜安静可以住北边约 35 分钟的 Moose Pass 或 1 小时的 Cooper Landing；从安克雷奇当天来回单程要开约 2.5 小时，也可以坐阿拉斯加铁路的火车。",
  },
  {
    code: "wrst",
    nameZh: "兰格尔–圣伊莱亚斯",
    nameEn: "Wrangell–St. Elias",
    region: "alaska",
    tagline: "美国最大的国家公园",
    stateEn: "Alaska",
    hero: "wrst-kennecott",
    intro:
      "美国面积最大的国家公园，约 5.3 万平方公里，比瑞士还大，美国 16 座最高峰里有 9 座在这里。只有两条砂石路通进来：南边的 McCarthy Road 通往 1938 年关闭的 Kennecott 铜矿镇和 Root 冰川，北边的 Nabesna Road 穿过火山和苔原；更深的地方只能坐小飞机。",
    bestMonths: [6, 7, 8],
    seasonNote:
      "6–8 月 McCarthy 一带的接驳车、导览和住宿都开，路况最好；9 月上旬秋色好、人少，但店铺和导览陆续关门；冬季大部分设施关闭，McCarthy Road 只做基本养护。",
    areas: {
      "copper-center": "Copper Center · 游客中心",
      "mccarthy-road": "Chitina · McCarthy Road",
      kennecott: "McCarthy · Kennecott",
      nabesna: "Nabesna Road（北侧）",
      richardson: "Richardson 公路 · Worthington 冰川",
    },
    gateway: { nameZh: "兰格尔–圣伊莱亚斯游客中心（Copper Center）", lat: 62.02005, lon: -145.36344 },
    timeZone: "America/Anchorage",
    airports: ["ANC", "FAI"],
    nearby: ["kefj", "dena"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内住宿集中在 McCarthy 和 Kennecott，只在夏季营业、房间少，要早订；路尽头步行桥的西岸有营地和小木屋。去 McCarthy 前一晚可以住 Copper Center 或 Glennallen（全年有旅馆、加油站和超市），第二天一早出发，到路尽头约 4–4.5 小时；多数租车公司不允许开砂石路，订车前先问清楚。",
  },
  {
    code: "banf",
    kind: "park",
    country: "CA",
    agency: "加拿大国家公园管理局（Parks Canada）",
    npsCode: null,
    nameZh: "班夫",
    nameEn: "Banff",
    region: "canada",
    tagline: "冰川湖与落基山雪峰",
    stateEn: "Alberta",
    hero: "banf-moraine-lake",
    intro:
      "1885 年设立的加拿大第一座国家公园，也是落基山最热门的一座：露易丝湖、梦莲湖、佩托湖这些冰川湖被冰川磨出的岩粉染成青绿色，班夫小镇就在公园里，缆车、温泉和餐厅都在镇上。北边的冰原大道经弓湖、佩托湖一路通到贾斯珀，往西翻过大陆分水岭就是幽鹤。梦莲湖全年不让私家车进，旺季露易丝湖也很难停车，要提前预约 Parks Canada 班车。",
    bestMonths: [6, 7, 8, 9],
    seasonNote:
      "7–9 月湖水颜色最好、高处步道基本化雪，9 月中下旬看金色落叶松；梦莲湖只在 6 月到 10 月中旬通班车，冬天以滑雪和冰湖为主。",
    areas: {
      town: "班夫镇周边",
      minnewanka: "明尼万卡湖环线",
      "bow-valley": "弓河谷景观道 / 约翰斯顿峡谷",
      "lake-louise": "露易丝湖",
      moraine: "梦莲湖",
      icefields: "冰原大道南段（弓湖 / 佩托湖）",
    },
    gateway: { nameZh: "班夫游客中心", lat: 51.17798, lon: -115.57024 },
    timeZone: "America/Edmonton",
    airports: ["YYC", "YEG", "YVR"],
    nearby: ["yoho", "jasp", "glac"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内住宿集中在班夫镇和露易丝湖：露易丝湖城堡酒店、梦莲湖旅馆（夏季营业，住客可以开车上梦莲湖）最贵也最难订，班夫镇酒店多但夏季房价很高，通常要提前几个月订。东门外约 20 分钟的坎莫尔（Canmore）价格低一些、度假公寓多，是很多人的大本营；想早起去两个湖可以住露易丝湖村，走冰原大道可以在 Saskatchewan River Crossing 住一晚。",
    officialUrl: "https://parks.canada.ca/pn-np/ab/banff",
  },
  {
    code: "jasp",
    kind: "park",
    country: "CA",
    agency: "加拿大国家公园管理局（Parks Canada）",
    npsCode: null,
    nameZh: "贾斯珀",
    nameEn: "Jasper",
    region: "canada",
    tagline: "冰原、碧湖与暗夜星空",
    stateEn: "Alberta",
    hero: "jasp-spirit-island",
    intro:
      "加拿大落基山面积最大的国家公园，冰原大道的北半段在这里：哥伦比亚冰原、阿萨巴斯卡冰川和桑瓦普塔、阿萨巴斯卡两座瀑布都在去贾斯珀镇的路上，镇东边的玛琳湖可以坐船去看精灵岛。这里是世界上最大的暗夜保护区之一，人比班夫少，路边常见马鹿、大角羊和熊。2024 年 7 月的山火烧毁了镇上约三分之一的建筑和周边大片森林，2026 年大部分步道已经重开，但玛琳峡谷和伊迪丝·卡维尔山路仍然关闭。",
    bestMonths: [6, 7, 8, 9],
    seasonNote:
      "6–9 月冰川车、玛琳湖游船和各条山路都开，9 月人少、马鹿发情；冬季冰原大道常因风雪和雪崩风险临时封路，11 月到次年 3 月必须装冬季轮胎或带防滑链。",
    areas: {
      town: "贾斯珀镇周边",
      maligne: "玛琳峡谷 / 玛琳湖",
      parkway: "冰原大道北段（瀑布）",
      icefield: "哥伦比亚冰原",
      hwy16: "16 号公路（米耶特温泉 / 罗布森山）",
    },
    gateway: { nameZh: "贾斯珀国家公园信息中心", lat: 52.87734, lon: -118.08083 },
    timeZone: "America/Edmonton",
    airports: ["YEG", "YYC", "YVR"],
    nearby: ["banf", "yoho"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内住宿集中在贾斯珀镇和周边的度假村（费尔蒙贾斯珀公园小屋酒店、金字塔湖度假村等）。2024 年山火烧毁了几家酒店和不少私人民宿，房源比以前少，夏季要提前几个月订；订不到可以住东边约 1 小时车程的 Hinton，或西边 BC 省的 Valemount。走冰原大道可以在哥伦比亚冰原的冰川景观酒店或桑瓦普塔瀑布的木屋住一晚。",
    officialUrl: "https://parks.canada.ca/pn-np/ab/jasper",
  },
  {
    code: "yoho",
    kind: "park",
    country: "CA",
    agency: "加拿大国家公园管理局（Parks Canada）",
    npsCode: null,
    nameZh: "幽鹤",
    nameEn: "Yoho",
    region: "canada",
    tagline: "翡翠湖、瀑布与化石",
    stateEn: "British Columbia",
    hero: "yoho-emerald-lake",
    intro:
      "在大陆分水岭西侧的 BC 省，名字来自克里语里表示惊叹的词。公园不大，离露易丝湖只有二十多分钟，常和班夫连着玩：翡翠湖、天然桥、塔卡考瀑布和螺旋隧道都在路边，欧哈拉湖的高山湖群只能坐抽签巴士或徒步 11 公里上去。伯吉斯页岩里有 5 亿多年前的寒武纪化石，只能跟 Parks Canada 的导览徒步进去。",
    bestMonths: [7, 8, 9],
    seasonNote:
      "塔卡考瀑布所在的幽鹤谷路约 6 月中到 10 月中开放，欧哈拉湖巴士 6 月下旬到 10 月初；7–9 月最好，冬季只有翡翠湖一带和 1 号公路沿线能去。",
    areas: {
      field: "Field 镇 / 1 号公路沿线",
      emerald: "翡翠湖 / 天然桥",
      "yoho-valley": "幽鹤谷（塔卡考瀑布）",
      ohara: "欧哈拉湖",
    },
    gateway: { nameZh: "幽鹤国家公园游客中心（Field）", lat: 51.39798, lon: -116.49185 },
    timeZone: "America/Edmonton",
    airports: ["YYC", "YEG", "YVR"],
    nearby: ["banf", "jasp"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内住宿不多：翡翠湖旅馆在湖边、价格高，幽鹤谷路口的大教堂山木屋酒店只在夏季营业，Field 小村有一家小旅馆和十几家民宅客房；欧哈拉湖旅馆和山屋要很早预订或抽签。更多人住西边约 45 分钟的 Golden（酒店多、价格低），或住东边的露易丝湖、班夫镇，当天往返幽鹤。",
    officialUrl: "https://parks.canada.ca/pn-np/bc/yoho",
  },
];

export function getPark(code: string): Park | undefined {
  return parks.find((park) => park.code === code);
}
