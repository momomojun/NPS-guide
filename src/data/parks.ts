export type RegionId =
  | "seattle"
  | "norcal"
  | "sierra"
  | "socal"
  | "rockies"
  | "colorado"
  | "vegas"
  | "utah"
  | "southwest"
  | "plains"
  | "appalachia"
  | "newengland"
  | "florida"
  | "alaska"
  | "hawaii"
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
  /**
   * 首页地图上的圆点画在哪：不填就是 gateway。只能飞进去的公园，gateway 是开车能到的出发城镇（卡特迈的 Homer），
   * 圆点要画在公园本身的位置
   */
  mapAt?: { lat: number; lon: number };
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
  "southwest",
  "plains",
  "appalachia",
  "newengland",
  "florida",
  "alaska",
  "hawaii",
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
    code: "pinn",
    nameZh: "尖峰石阵",
    nameEn: "Pinnacles",
    region: "sierra",
    tagline: "火山岩尖峰与加州神鹫",
    stateEn: "California",
    hero: "pinn-high-peaks",
    intro:
      "2,300 万年前一座火山在今天洛杉矶北边的羚羊谷一带喷发，随后被圣安德烈亚斯断层劈成两半，西边这一半跟着太平洋板块往西北挪了约 310 公里，剩下的火山角砾岩被风雨削成一片红褐色的尖峰和石墙。巨石塌进窄峡谷，堆出能钻进去的“崖缝洞穴”（talus cave），洞里住着汤森大耳蝠；高处的岩壁是重新放归野外的加州神鹫的家，常能看到翼展近 3 米的神鹫在 High Peaks 上空盘旋。公园离旧金山湾区约 2 小时车程，东西两侧各有入口，但园内不通车，只能靠步道相连。",
    bestMonths: [3, 4, 5, 10, 11],
    seasonNote:
      "2–5 月最好：山坡转绿、野花开，小溪有水，但周末和节假日人最多，早上 8 点前就可能停满。6–9 月常超过 38°C，岩石上更热，只适合清早或傍晚走短线；Bear Gulch 洞穴 5 月中到 7 月中为保护蝙蝠育幼全部关闭。10–11 月凉快人少，冬天偶有暴雨，洞里会积水临时关闭。",
    areas: {
      east: "东侧（Bear Gulch · 营地 · 游客中心）",
      west: "西侧（Chaparral · West Pinnacles）",
    },
    gateway: { nameZh: "尖峰石阵游客中心（东侧，营地内）", lat: 36.49354, lon: -121.14665 },
    timeZone: "America/Los_Angeles",
    airports: ["SJC", "SFO", "OAK", "MRY"],
    nearby: ["seki", "yose"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，唯一的过夜地方是东侧的 Pinnacles Campground（帐篷位、房车位和全年开放的帆布帐篷小屋，提前 6 个月在 Recreation.gov 订，春天周末很早订满），西侧不能过夜。住园外的话，去东侧住 Hollister（到东门约 45 分钟）或更远的 Gilroy，去西侧住 Soledad（约 25 分钟）或 Salinas、Monterey（约 1 小时–1 小时 15 分）；King City 在两侧之间，到东门约 50 分钟、西门约 45 分钟。两边都想走的，一天走一侧最省事。",
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
    nearby: ["arch", "cany", "grsa"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内没有酒店，只有 Moraine Park、Glacier Basin、Aspenglen、Timber Creek 等露营地（在 recreation.gov 订，营地预约自带入住当天下午起的进园时段，常常一开放就订满）。大多数人住东门外的 Estes Park：酒店、木屋和餐厅最多，到 Beaver Meadows 入口约 10 分钟，6–9 月和麋鹿季的周末要提前几个月订；想横穿 Trail Ridge Road 就在西边的 Grand Lake 住一晚，再便宜些住 Granby。丹佛机场进出的第一晚、最后一晚可以住 Boulder 或丹佛。",
  },
  {
    code: "meve",
    nameZh: "梅萨维德",
    nameEn: "Mesa Verde",
    region: "colorado",
    tagline: "悬崖上的古村落",
    stateEn: "Colorado",
    hero: "meve-cliff-palace",
    intro:
      "科罗拉多西南角的一块大台地。古普韦布洛人（Ancestral Pueblo）在这里生活了七百多年，先住台地顶的半地穴屋和村落，最后约一百年把村子建进峡谷崖壁的岩洞里，留下悬崖宫殿等约 600 处崖居，是世界文化遗产。几处大崖居只能跟护林员导览进去（约 5–10 月，提前 14 天在 Recreation.gov 抢票），其余时间可以在台地顶环路的观景台隔着峡谷看；从入口到崖居集中的 Chapin Mesa 要开约 45 分钟山路，西侧的 Wetherill Mesa 只在夏秋开放。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "5 月初到 10 月下旬有崖居导览（2026 年 5 月 4 日–10 月 21 日），5–6 月和 9–10 月最舒服；7–8 月白天热、午后多雷雨；11 月到次年 4 月导览、Wetherill Mesa 和园内住宿都关闭，只能看台地顶环路、博物馆和云杉树屋观景台。",
    areas: {
      entrance: "入口 · Morefield 营地",
      "far-view": "Far View · Park Point",
      chapin: "Chapin Mesa 博物馆区",
      "mesa-top-loop": "台地顶环路（Mesa Top Loop）",
      "cliff-palace-loop": "悬崖宫殿环路（Cliff Palace Loop）",
      wetherill: "Wetherill Mesa（西侧台地）",
    },
    gateway: { nameZh: "梅萨维德游客与研究中心（入口）", lat: 37.3359, lon: -108.40817 },
    timeZone: "America/Denver",
    airports: ["DRO", "ABQ", "PHX", "DEN", "SLC"],
    nearby: ["mova", "arch", "cany", "pefo", "blca", "grsa"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内唯一的酒店是 Far View Lodge（2026 年 4 月 17 日–10 月 18 日营业），离崖居最近、夏天要早订；入口进来约 6.5 公里的 Morefield 营地有 267 个营位（约 4 月下旬到 10 月中旬）。多数人住西边约 15 分钟车程的 Cortez（连锁酒店、超市多）或东边的 Mancos 小镇，想住河边小木屋可以看北边的 Dolores；从杜兰戈机场进出就住 Durango（到入口约 45 分钟）。冬天园内没有住宿，只能住园外。",
  },
  {
    code: "grsa",
    nameZh: "大沙丘",
    nameEn: "Great Sand Dunes",
    region: "colorado",
    tagline: "北美最高的沙丘",
    stateEn: "Colorado",
    hero: "grsa-star-dune",
    intro:
      "科罗拉多南部圣路易斯谷的东缘，风把谷地里的沙子一路吹到桑格雷-德克里斯托山（Sangre de Cristo）脚下，堆成约 78 平方公里的沙丘区：最高的星形沙丘（Star Dune）和 Hidden Dune 从底到顶约 225 米，是北美最高的沙丘，背后就是 4,000 米级的雪山。沙丘里没有步道，可以随便爬、随便滑沙；春末融雪时，沙丘脚下的梅达诺溪（Medano Creek）漫成一片浅浅的“沙滩”，还会冲起一波波小浪。公园海拔约 2,500 米，24 小时开放、不用预约，也是国际暗夜公园，沙丘后面的国家保护区一直延伸到高山湖泊和苔原。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "5 月下旬到 6 月初梅达诺溪水最大、人也最多；7–8 月午后沙面能到 65°C 以上、常有雷暴，只能清早或傍晚上沙丘；9 月到 10 月上旬天气最稳、山杨变黄；3–5 月午后风大扬沙，冬天夜里常冷到零下十几度，沙丘上不时积一层薄雪。",
    areas: {
      "visitor-center": "游客中心 · 莫斯卡山口步道",
      dunes: "沙丘区 · 梅达诺溪（Dunes Parking Area）",
      "medano-road": "梅达诺山口四驱路 · 东侧沙丘",
      zapata: "园外南侧 · 萨帕塔瀑布（BLM）",
    },
    gateway: { nameZh: "大沙丘游客中心", lat: 37.73321, lon: -105.51213 },
    timeZone: "America/Denver",
    airports: ["ALS", "COS", "DEN", "ABQ"],
    nearby: ["romo", "meve", "blca"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 Piñon Flats 营地（4–10 月，Recreation.gov 提前 3 个月放出，5–6 月几乎天天订满）。离沙丘最近的是入口外约 6 公里的 Great Sand Dunes Lodge（约 3 月中到 10 月）和 Oasis 的木屋、营地（4–10 月，只能打电话订），旺季要早订；酒店、超市最多的是约 45 分钟车程的 Alamosa。想住整栋民宿可以看公园南边 Zapata Falls 一带的木屋（Airbnb 上多写 Mosca），从东边过来也可以住 Fort Garland。",
  },
  {
    code: "blca",
    nameZh: "甘尼森黑峡谷",
    nameEn: "Black Canyon of the Gunnison",
    region: "colorado",
    tagline: "又深又窄的黑色峡谷",
    stateEn: "Colorado",
    hero: "blca-painted-wall-view",
    intro:
      "甘尼森河用两百多万年，在约 17 亿年前形成的坚硬片麻岩里切出这道峡谷：最深处约 830 米，最窄处谷底只有约 12 米宽，有的地段一天只照到半小时左右的太阳，崖壁总显得发黑，因此得名。南缘有约 11 公里的铺装观景路和十几个观景台，能看到科罗拉多州最高的悬崖彩绘崖壁；北缘是砂石路，更偏、更安静。两缘之间没有桥，开车绕园外要 2 小时以上。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "5–6 月和 9–10 月最舒服；7–8 月白天热、午后常有雷暴；冬天南缘公路只铲雪到游客中心（其余改成滑雪、雪鞋道），北缘和谷底 East Portal 的路封闭，4 月中旬到 5 月初陆续开通。",
    areas: {
      "visitor-center": "南缘 · 游客中心一带",
      "south-rim-drive": "南缘观景路（游客中心以西）",
      "east-portal": "East Portal（谷底河边）",
      "north-rim": "北缘",
    },
    gateway: { nameZh: "南缘游客中心", lat: 38.55507, lon: -107.68663 },
    timeZone: "America/Denver",
    airports: ["MTJ", "GJT", "GUC", "DEN"],
    nearby: ["meve", "arch", "cany", "romo", "grsa"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有三个小营地：南缘营地只能在 Recreation.gov 预约（2025 年山火后 2026 年只开 25 个营位），北缘和谷底 East Portal 的营地先到先得。多数人住西边约 25 分钟车程的 Montrose，连锁酒店、超市最多，一般提前几周订就够；想住山城可以选南边约 1 小时 10 分的 Ouray，或半路上整栋民宿多的 Ridgway，从东边过来可以住约 1 小时 15 分的 Gunnison。去北缘就住 Crawford 一带，旅馆很少，要早订。",
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
    code: "grba",
    nameZh: "大盆地",
    nameEn: "Great Basin",
    region: "vegas",
    tagline: "古狐尾松、大理石溶洞与满天银河",
    stateEn: "Nevada",
    hero: "grba-alpine-lakes",
    intro:
      "大盆地是北美最大的内流区，荒漠谷地和一道道南北走向的山脉相间，公园守着其中的 Snake 山脉：从海拔约 1,600 米的鼠尾草荒漠，一路升到 3,982 米的惠勒峰（Wheeler Peak）。山脚的 Lehman Caves 是内华达最长的洞穴，大理石里长满钟乳石、石笋和少见的洞穴盾；山顶附近的狐尾松林里有活了几千年的大盆地狐尾松，是地球上最长寿的树之一。这里地处偏远、空气干燥，是美国本土星空最暗的地方之一。",
    bestMonths: [6, 7, 8, 9],
    seasonNote:
      "6–9 月最好：惠勒峰景观道全线通车（通常阵亡将士纪念日前后通到顶、11 月初第一场大雪后关上段），高山湖、狐尾松步道雪化了，夏天每周有护林员观星活动；7–8 月午后常有雷暴。9 月中下旬山杨变黄，9 月新月前后有天文节。冬天只有山下一段景观道、Lehman Caves 和最低的营地开放，适合穿雪鞋。",
    areas: {
      lehman: "Lehman Caves 游客中心一带",
      "scenic-drive": "惠勒峰景观道（高山湖 · 狐尾松 · 惠勒峰）",
      "baker-creek": "Baker Creek",
      south: "南部（Lexington Arch）",
      baker: "Baker 小镇",
    },
    gateway: { nameZh: "Lehman Caves 游客中心", lat: 39.00561, lon: -114.21987 },
    timeZone: "America/Los_Angeles",
    airports: ["SLC", "LAS", "SGU"],
    nearby: ["zion", "brca", "care"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有五个营地（都要在 Recreation.gov 预订，营地里没有饮用水），夏天要早订。最近的住处在园外 8 公里的小镇 Baker：Stargazer Inn、Whispering Elms 汽车旅馆都只有几间房，州界上的 Border Inn（约 15 分钟）全年营业；房间少，夏天和天文节前后很早订满。再找不到就住约 1 小时 15 分外的 Ely（内华达这一带最大的镇，酒店、超市都有），或者犹他一侧约 1 小时 40 分的 Delta。附近只有 Baker 和 Border Inn 两个加油站，路上很长一段没有补给，在 Ely 或 Delta 加满再来。",
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
      "纳瓦霍保留地上的砂岩狭缝峡谷，千万年的山洪和风沙把岩壁冲刷成流动的波纹，晴天正午阳光从窄缝射下，在谷底形成光束。陆路只能跟纳瓦霍授权的导览团进：上羚羊峡谷谷底平坦、光束最有名，下羚羊峡谷要上下几段钢梯、更窄更弯；订不到还可以去人少的羚羊峡谷 X 和水洞峡谷。峡谷注入鲍威尔湖的那一段也能从水上进：从 Antelope Point 划皮划艇进去，或坐码头的游船，归格伦峡谷国家休闲区管，不用订纳瓦霍的导览团。各家导览都按亚利桑那时间（不实行夏令时）发团。",
    bestMonths: [4, 5, 6, 7, 8, 9],
    seasonNote:
      "全年都能跟团进（感恩节、圣诞节、元旦等纳瓦霍节日关闭）；上羚羊的光束约 3 月底到 10 月初出现、6–7 月最明显，7–9 月雨季有山洪风险时会临时取消导览。",
    areas: { upper: "上羚羊峡谷", lower: "下羚羊峡谷", "more-slots": "其他狭缝峡谷", lake: "鲍威尔湖 · 水上部分" },
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
    areas: { "horseshoe-bend": "马蹄湾", dam: "格伦峡谷大坝", "lake-powell": "鲍威尔湖 Wahweap", river: "科罗拉多河 · Lees Ferry" },
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
    nearby: ["cany", "care", "mova", "romo", "blca"],
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
    nearby: ["arch", "care", "mova", "romo", "blca"],
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
    code: "whsa",
    nameZh: "白沙",
    nameEn: "White Sands",
    region: "southwest",
    tagline: "世界最大的石膏沙丘",
    stateEn: "New Mexico",
    hero: "whsa-dunes-drive",
    intro:
      "世界上最大的石膏沙丘区（约 710 平方公里）在新墨西哥州南部的图拉罗萨盆地，白沙公园保护了其中的一大部分：雪一样白的沙丘一直铺到圣安德烈斯山脚，2019 年由国家纪念地升格为国家公园。园里只有一条约 13 公里的沙丘大道，开到尽头就是纯白的沙丘中心，可以徒步、滑沙、看日落。公园被白沙导弹靶场包围，导弹试验时沙丘大道和 70 号公路会临时封闭几个小时。",
    bestMonths: [2, 3, 10, 11],
    seasonNote:
      "10–11 月和 2–3 月最舒服；6–8 月白天常到 35–38°C，只适合清早和傍晚活动，7–8 月午后多雷暴；3–5 月风大、常有沙尘暴；冬天白天十几度，夜里会到冰点以下。",
    areas: {
      "visitor-center": "游客中心 · 入口",
      "dunes-drive": "沙丘大道沿线",
      "heart-of-sands": "沙丘中心（Heart of the Sands）",
      "lake-lucero": "卢塞罗湖（导弹靶场内）",
    },
    gateway: { nameZh: "白沙游客中心", lat: 32.77967, lon: -106.17242 },
    timeZone: "America/Denver",
    airports: ["ELP", "ABQ"],
    nearby: ["cave"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有住宿和营地（野营区 2026 年仍关闭）。最近的是约 20 分钟车程的 Alamogordo，连锁酒店集中在 White Sands Blvd 南段，一般提前几天到几周订就行，9 月热气球节那个周末要早订；Las Cruces 酒店最多，从埃尔帕索机场过来顺路，到公园约 55 分钟。夏天想住凉快些，可以住萨克拉门托山上海拔约 2,600 米的 Cloudcroft，木屋多，到公园约 45 分钟。",
  },
  {
    code: "cave",
    nameZh: "卡尔斯巴德洞窟",
    nameEn: "Carlsbad Caverns",
    region: "southwest",
    tagline: "地下洞厅与蝙蝠群",
    stateEn: "New Mexico",
    hero: "cave-big-room",
    intro:
      "地面上是约 2.6 亿年前海底礁石抬升成的瓜达卢佩山脊，地下藏着 119 个以上的洞穴，是含硫酸的地下水溶蚀石灰岩形成的。主角卡尔斯巴德洞窟可以从天然入口一路走下约 230 米，也可以坐电梯直达 Big Room——北美按体积最大的单个洞厅；4–10 月每天傍晚还能在洞口看几十万只蝙蝠飞出觅食。1995 年列入世界遗产。",
    bestMonths: [4, 5, 8, 9, 10],
    seasonNote:
      "洞里常年约 13°C，一年四季都能去；想看蝙蝠出洞要 4–10 月，8–9 月最多；夏天地面常到 32–40°C，8–9 月多午后雷雨，冬天偶尔下雪结冰。",
    areas: {
      "visitor-center": "游客中心 · 蝙蝠剧场",
      cavern: "卡尔斯巴德洞窟（地下）",
      "walnut-canyon": "Walnut Canyon · 进园公路",
      rattlesnake: "Rattlesnake Springs",
      slaughter: "Slaughter Canyon（西南角）",
    },
    gateway: { nameZh: "卡尔斯巴德洞窟游客中心", lat: 32.17543, lon: -104.4442 },
    timeZone: "America/Denver",
    airports: ["ELP", "CNM", "MAF"],
    nearby: ["whsa"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有住宿和露营地，只能凭免费许可证在背包野营区过夜。最近的是公园大门外的 White's City，只有一家老旅馆和 RV 营地，上山到游客中心约 15 分钟；多数人住约 35 分钟车程的 Carlsbad，连锁酒店多，但常被油田工人订走，平日也不便宜，最好提前几周订。从埃尔帕索飞进飞出的，第一晚或最后一晚可以住埃尔帕索机场附近（到洞窟约 2.5 小时），路上正好经过瓜达卢佩山国家公园。",
  },
  {
    code: "pefo",
    nameZh: "石化林",
    nameEn: "Petrified Forest",
    region: "southwest",
    tagline: "彩绘沙漠与化石木",
    stateEn: "Arizona",
    hero: "pefo-blue-mesa",
    intro:
      "这里保存着世界上最集中、颜色最艳的化石木之一：2 亿多年前三叠纪的大树被河水冲倒、掩埋，二氧化硅慢慢取代木质，变成五颜六色的石头。北段是红、粉、紫色条纹的彩绘沙漠和一段 66 号公路旧址，中段有古普韦布洛人的村落和岩画，南段是成片的化石木。一条约 45 公里的公园路从 I-40 的 311 号出口通到 180 号公路，多数人从一头进、另一头出，半天到一天就能看完；公园 8:00–17:00 开放，带走任何一块化石木都违法。",
    bestMonths: [4, 5, 9, 10],
    seasonNote:
      "春秋最舒服；6 月中旬到 9 月是季风雨季，7 月起午后常有雷暴和山洪，但雨后荒地颜色最鲜艳；冬天冷、偶尔下雪，路面结冰时会推迟开园。",
    areas: {
      "painted-desert": "彩绘沙漠（北段）",
      "route-66-puerco": "66 号公路 · 普埃科河",
      "blue-mesa": "蓝台地 · 圆锥丘",
      "crystal-forest": "玛瑙桥 · 水晶森林",
      "rainbow-forest": "彩虹森林（南入口）",
    },
    gateway: { nameZh: "彩绘沙漠游客中心（北入口，I-40 311 号出口）", lat: 35.06551, lon: -109.78257 },
    timeZone: "America/Phoenix",
    airports: ["PHX", "FLG", "ABQ", "LAS"],
    nearby: ["grca", "mova", "ante", "hsbd", "meve"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店和营地（只能背包进荒野区过夜，当天在游客中心领免费许可证）。最近的是西边约 30 分钟车程的 Holbrook，66 号公路沿线的老汽车旅馆多，招牌是能住进水泥“帐篷”的 Wigwam Motel；再往西约 1 小时的 Winslow 有修复的老铁路酒店 La Posada；从新墨西哥过来可以住 Gallup（到北入口约 1 小时 15 分，夏天比亚利桑那快 1 小时）。凤凰城或弗拉格斯塔夫机场进出、或者接着去大峡谷，就住 Flagstaff（约 2 小时）。一般不难订，提前几周就够。",
  },
  {
    code: "sagu",
    nameZh: "巨人柱",
    nameEn: "Saguaro",
    region: "southwest",
    tagline: "索诺兰沙漠的巨人柱仙人掌森林",
    stateEn: "Arizona",
    hero: "sagu-valley-view-overlook",
    intro:
      "巨人柱仙人掌（saguaro）只长在索诺兰沙漠，能活一两百年、高 12 米以上，五六十岁以后才长出第一根“手臂”，是美国西部最有代表性的剪影。公园分成图森市两边的两个园区：西区（Tucson Mountain District）海拔低，巨人柱最密，夕阳下的仙人掌森林和 Signal Hill 的古代岩画最有名；东区（Rincon Mountain District）有一条 13 公里的铺装环线穿过老仙人掌林，背后的林孔山从沙漠一直升到 2,600 多米的松林“天空之岛”。",
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    seasonNote:
      "10 月到次年 4 月白天 18–30°C，最舒服，也是护林员活动最多的时候；巨人柱 5 月底到 7 月开花，但白天常到 38–43°C，只能清早或傍晚活动；6 月中到 9 月是季风雨季，午后雷暴常引发山洪、冲坏西区的砂石路。",
    areas: {
      west: "西区 · 图森山（Tucson Mountain District）",
      east: "东区 · 林孔山（Rincon Mountain District）",
      sabino: "Sabino Canyon（图森东北，园外）",
    },
    gateway: { nameZh: "图森市中心（东西两区之间）", lat: 32.2217, lon: -110.9747 },
    timeZone: "America/Phoenix",
    airports: ["TUS", "PHX"],
    nearby: ["grca", "pefo", "whsa"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店和车能开进去的营地（只有要走进山里的背包营地），大家都住图森：只去一边的话，西区住图森山脚的度假村或 Gilbert Ray 县营地，东区住城东 Tanque Verde / Broadway 一带；两边都去、想吃得方便，住市中心或大学一带最省事，到两个园区都约 25–35 分钟。10 月到次年 4 月是旺季，2 月初的宝石矿物展期间全城酒店最贵、最难订。",
  },
  {
    code: "gumo",
    nameZh: "瓜达卢佩山",
    nameEn: "Guadalupe Mountains",
    region: "southwest",
    tagline: "得州最高峰与远古海底礁石",
    stateEn: "Texas",
    hero: "gumo-el-capitan-viewpoint",
    intro:
      "瓜达卢佩山是约 2.6 亿年前二叠纪海底的一段巨大礁石（Capitan 礁），被抬升后成了从奇瓦瓦沙漠里拔地而起的石灰岩山脉，南端的 El Capitan 绝壁是西得州公路上最醒目的地标。旁边的瓜达卢佩峰海拔 2,667 米，是得州最高点；山里的 McKittrick 峡谷有溪水和枫树，10 月底到 11 月初满谷红叶。公园几乎没有穿过山里的公路，大部分要靠走：东边的 Pine Springs、McKittrick 峡谷，西边的白色石膏沙丘，北边的 Dog Canyon 各从不同的路进去。",
    bestMonths: [3, 4, 10, 11],
    seasonNote:
      "春秋最适合爬山，10 月底到 11 月初是 McKittrick 峡谷的红叶季，也是一年里人最多的时候，周末停车场和营地常满；夏天白天常到 32–38°C，午后多雷暴，山顶易遭雷击；一年四季都常刮大风（阵风可达 100 公里/时左右），冬春最猛；冬天偶尔下小雪，一般一天就化。",
    areas: {
      "pine-springs": "Pine Springs · 瓜达卢佩峰",
      frijole: "Frijole Ranch",
      mckittrick: "McKittrick 峡谷",
      highway: "62/180 号公路观景点",
      "salt-basin": "Salt Basin 沙丘（西侧）",
      "dog-canyon": "Dog Canyon（北侧）",
    },
    gateway: { nameZh: "Pine Springs 游客中心", lat: 31.89362, lon: -104.82206 },
    timeZone: "America/Denver",
    airports: ["ELP", "CNM", "MAF"],
    nearby: ["cave", "whsa"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 Pine Springs 和 Dog Canyon 两个只有厕所和饮用水的简易营地（全部要在 Recreation.gov 预约，春秋周末很快订满）。不露营的话，最近的是东北约 35 英里（约 45 分钟）的 White's City，只有一家老旅馆；多数人住约 1 小时车程的 Carlsbad，正好和卡尔斯巴德洞窟一起玩；从南边来可以住约 1 小时的 Van Horn（I-10 边的小镇），从埃尔帕索来单程约 2 小时。园内和附近都没有加油站和餐馆，进山前加满油、带好吃的。",
  },
  {
    code: "bibe",
    nameZh: "大弯",
    nameEn: "Big Bend",
    region: "southwest",
    tagline: "格兰德河大拐弯、沙漠与天空岛",
    stateEn: "Texas",
    hero: "bibe-santa-elena-canyon",
    intro:
      "格兰德河在得州西南角拐了一个大弯，公园沿着这段美墨界河延伸约 190 公里，面积约 3,240 平方公里。园里三种地貌叠在一起：占公园大部分的奇瓦瓦沙漠、中间拔地而起的奇索斯山（美国唯一一座整个在国家公园里的山脉，山上是松树、橡树林），和河上切出的圣埃伦娜、Boquillas 等石灰岩大峡谷。这里离大城市很远，也是美国本土光污染最少的国家公园之一（国际暗夜公园）；周五到周一还能从园里的口岸坐小船过河，去墨西哥小村 Boquillas 吃顿午饭。",
    bestMonths: [2, 3, 10, 11],
    seasonNote:
      "10 月到次年 4 月是旺季，3 月春假和感恩节、圣诞节前后最挤，营地和山上的小屋天天满；2–4 月沙漠开花。5–9 月极热，河边下午常到 40°C 以上（5–6 月最热），只适合清早活动或上奇索斯山（盆地海拔约 1,650 米，凉快约 10°C）；7–9 月是雨季，午后雷暴常引发山洪、冲断土路。冬天偶有寒潮，山上会结冰、下雪。",
    areas: {
      chisos: "奇索斯山 · 盆地（Chisos Basin）",
      west: "Ross Maxwell 观景道 · 圣埃伦娜峡谷（西南部）",
      east: "格兰德河村 · Boquillas（东部）",
      north: "Panther Junction · 北部",
      terlingua: "园外：Terlingua · 河路 FM 170",
    },
    gateway: { nameZh: "Panther Junction 游客中心（公园总部）", lat: 29.32784, lon: -103.20593 },
    timeZone: "America/Chicago",
    airports: ["MAF", "ELP", "SAT", "AUS"],
    nearby: ["gumo", "cave"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有奇索斯山小屋（Chisos Mountains Lodge）一家，在海拔约 1,650 米的盆地里，72 间房，11–4 月要提前半年以上订（石头小木屋要提前一两年）；2026 年小屋的餐厅关着，只有餐车和小超市。园外住得最多的是西门外的 Terlingua / Study Butte：汽车旅馆、土坯小屋、帐篷和房车营地都有，到 Panther Junction 约 40 分钟、到圣埃伦娜峡谷约 1 小时；北边的 Marathon 小镇（老牌 Gage 酒店）到 Panther Junction 约 1 小时 10 分钟；Alpine 连锁酒店多、便宜些，但单程要开约 1 小时 45 分钟。园里只有 Panther Junction 和格兰德河村两处加油站，园外最近的在 Study Butte 和 Marathon，进园前加满。",
  },
  {
    code: "badl",
    nameZh: "恶地",
    nameEn: "Badlands",
    region: "plains",
    tagline: "大草原上被雨水切开的彩色岩壁",
    stateEn: "South Dakota",
    hero: "badl-pinnacles-overlook",
    intro:
      "大平原中间突然裂开一道几十公里长的“恶地之墙”（Badlands Wall）：几千万年沉积下来的泥岩、火山灰被雨水切成尖塔、沟壑和一层层红黄白相间的条纹，每年还在以大约 2.5 厘米的速度往后退。岩层里埋着大量古哺乳动物化石；墙下和墙北是美国面积最大的混合草原保护区之一，野牛、大角羊、草原犬鼠和叉角羚都常见。2026 年 7 月公园宣布获得国际暗夜公园认证，夏夜能看到清晰的银河。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "5–6 月和 9 月到 10 月上旬最舒服；7–8 月白天常到 35°C 以上、午后多雷暴，徒步要赶早；冬季寒冷多风雪，Loop Road 偶尔因冰雪临时封路，园内酒店和餐厅 10 月中到次年 4 月中关门。",
    areas: {
      "cedar-pass": "Cedar Pass（游客中心 · Door / Notch 步道）",
      "loop-road": "Badlands Loop Road 观景点",
      "sage-creek": "Sage Creek 荒野区（看野牛）",
      "south-unit": "南园区（Stronghold · White River）",
      gateway: "园外：Wall 镇 · I-90 沿线",
    },
    gateway: { nameZh: "Ben Reifel 游客中心", lat: 43.74908, lon: -101.94166 },
    timeZone: "America/Denver",
    airports: ["RAP", "DEN"],
    nearby: ["wica", "thro"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有 Cedar Pass Lodge（4 月中到 10 月中营业，小木屋数量少，旺季要早订）和旁边的 Cedar Pass 营地，住这里看日出日落、参加晚上的星空讲解最方便。其次是北边 I-90 出口的 Wall 镇，汽车旅馆多、价格适中，到 Pinnacles 入口约 15 分钟；东南角的 Interior 小村只有几家旅馆。从拉皮德城当天往返单程约 1 小时 15 分，适合和黑山、拉什莫尔山一起玩的人把拉皮德城当大本营。",
  },
  {
    code: "wica",
    nameZh: "风洞",
    nameEn: "Wind Cave",
    region: "plains",
    tagline: "地下的方解石“蜂窝”，地上的野牛草原",
    stateEn: "South Dakota",
    hero: "wica-bison-flats",
    intro:
      "1903 年设立，是美国最早的国家公园之一，也是世界上第一座为保护洞穴设立的国家公园。地底已测绘出 160 多英里（约 260 公里）的通道，是世界上最长的洞穴之一，洞壁上满是薄片交错、像蜂窝一样的方解石“箱格”（boxwork），全世界已知的箱格大部分都在这里；进洞只能跟护林员导览。地面上是黑山南缘的混合草原和黄松林，野牛、马鹿、叉角羚和成片的草原犬鼠城就在公路边。",
    bestMonths: [5, 6, 7, 8, 9],
    seasonNote:
      "5–9 月洞穴导览班次最多，天然入口导览只在 5 月到 9 月开，烛光导览和野洞探险只在夏天；9–10 月马鹿发情求偶、黄昏能听到鸣叫；冬天洞里照样 12°C 左右，导览每天只有两三场，地面偶尔因暴风雪临时封路。北边卡斯特州立公园的 Needles 公路冬季不通车。",
    areas: {
      "visitor-center": "游客中心 · 洞穴导览",
      "bison-flats": "南部草原（US-385 · Bison Flats）",
      north: "北部（Rankin Ridge · NPS 5/6 砂石路）",
      "custer-state-park": "园外：卡斯特州立公园",
      rushmore: "园外：拉什莫尔山 · 疯马",
    },
    gateway: { nameZh: "风洞游客中心", lat: 43.55656, lon: -103.47831 },
    timeZone: "America/Denver",
    airports: ["RAP", "DEN"],
    nearby: ["badl", "thro"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有 Elk Mountain 营地，没有酒店。住南边约 15 分钟的 Hot Springs 离洞最近；想顺路玩卡斯特州立公园、拉什莫尔山和疯马，住北边约 30 分钟的 Custer 镇或州立公园里的几家度假木屋（State Game Lodge、Sylvan Lake Lodge 等，一般 5–10 月营业）更方便，Keystone、Hill City 离拉什莫尔山近；拉皮德城到游客中心约 1 小时，旅馆、超市最多。每年 8 月上中旬 Sturgis 摩托车集会（2026 年 8 月 7–16 日，2027 年 8 月 6–15 日）期间整个黑山的房价暴涨，要很早订。",
  },
  {
    code: "thro",
    nameZh: "西奥多·罗斯福",
    nameEn: "Theodore Roosevelt",
    region: "plains",
    tagline: "北达科他恶地里的野马和野牛",
    stateEn: "North Dakota",
    hero: "thro-wind-canyon",
    intro:
      "小密苏里河切开北达科他西部的草原，留下一片层层叠叠的恶地：灰色的膨润土、黑色的褐煤层和烧红的“熔渣岩”一层压一层。1880 年代年轻的西奥多·罗斯福在这里打猎、经营牧场，后来当上总统、成了美国保护自然的推手。公园分成三块：Medora 镇边的 South Unit 有 58 公里的景观环路，野牛、野马和草原犬鼠沿路就能看到；往北约 110 公里的 North Unit 更陡峭、更安静，有大角羊；两者之间的 Elkhorn Ranch 是罗斯福的牧场旧址。",
    bestMonths: [5, 6, 9],
    seasonNote:
      "全年开放、24 小时都能进。6 月草最绿、野花多、小野马刚出生；7–8 月白天常到 30°C 以上、午后多雷暴，也是 Medora 音乐剧的季节；9 月凉爽、人少，下旬河边的三叶杨变黄，麋鹿开始发情鸣叫。冬天常在 -20°C 以下，下雪结冰时景观路会部分封闭。注意 North Unit 用中部时间，比 South Unit 和 Medora 早一小时。",
    areas: {
      "south-unit": "South Unit · 景观环路（Medora）",
      "painted-canyon": "彩绘峡谷（I-94 旁）",
      "petrified-forest": "石化林（South Unit 西侧，砂石路进）",
      elkhorn: "Elkhorn Ranch 园区（罗斯福牧场旧址）",
      "north-unit": "North Unit（Watford City 以南）",
      medora: "Medora 小镇（园外）",
    },
    gateway: { nameZh: "South Unit 游客中心（Medora）", lat: 46.9165, lon: -103.52621 },
    timeZone: "America/Denver",
    airports: ["BIS", "DIK", "XWA", "BIL"],
    nearby: ["badl", "wica"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 Cottonwood（South Unit）和 Juniper（North Unit）两个营地，2026 年 5 月起都要在 Recreation.gov 预订。多数人住 South Unit 门口的 Medora：镇上的酒店、汽车旅馆大多由西奥多·罗斯福 Medora 基金会经营，6 月初到 9 月中音乐剧季最难订；冬天只有 Rough Riders Hotel 和 Hotel 1883 两家开；订不到就住东边约 25 分钟的 Belfield 或 45 分钟的 Dickinson（连锁酒店最多）。去 North Unit 住 Watford City，到入口约 20 分钟；从 Medora 当天来回 North Unit 单程约 1 小时 15 分。Elkhorn Ranch 附近没有住处。",
  },
  {
    code: "grsm",
    nameZh: "大烟山",
    nameEn: "Great Smoky Mountains",
    region: "appalachia",
    tagline: "云雾缭绕的阿巴拉契亚老山与山谷农庄",
    stateEn: "Tennessee · North Carolina",
    hero: "grsm-kuwohi",
    intro:
      "横跨田纳西和北卡两州、约 2,100 平方公里的阿巴拉契亚山地，是美国游客最多的国家公园（2025 年约 1,150 万人次）。山上终年湿润，植物蒸腾出的水汽让一层层山脊总罩着蓝色的雾，“大烟山”因此得名；这里是全世界蝾螈种类最多的地方之一，林子里有约 1,900 头黑熊。除了瀑布和老林步道，Cades Cove、Cataloochee 等山谷里还保留着 19 世纪移民留下的木屋、教堂和磨坊。公园不收门票，但 2023 年起停车超过 15 分钟要买停车证（Parking Tag）。",
    bestMonths: [4, 5, 6, 9, 10],
    seasonNote:
      "4–5 月野花遍地、瀑布水量大；6 月高处杜鹃开花，夏天低处闷热潮湿、午后常有雷阵雨，山顶凉快；10 月中旬到 11 月初红叶从高处往低处走，是一年最挤的时候，周末进出 Gatlinburg 要排长队。12–3 月人少，但 Kuwohi 路、Roaring Fork 等支路关闭，Newfound Gap 公路遇冰雪会临时封。",
    areas: {
      sugarlands: "Sugarlands · Roaring Fork（Gatlinburg 入口）",
      "newfound-gap": "Newfound Gap 公路 · 主脊（Kuwohi）",
      elkmont: "Little River 路 · Elkmont",
      "cades-cove": "Cades Cove（Townsend 一侧）",
      oconaluftee: "Oconaluftee（北卡 Cherokee 入口）",
      "deep-creek": "Deep Creek（Bryson City）",
      cataloochee: "Cataloochee 谷（东北角）",
      gatlinburg: "园外：Gatlinburg · Pigeon Forge",
      parkway: "园外：蓝岭公路（北卡段）",
    },
    gateway: { nameZh: "Sugarlands 游客中心（Gatlinburg 入口）", lat: 35.68563, lon: -83.5366 },
    timeZone: "America/New_York",
    airports: ["TYS", "AVL", "ATL", "CLT"],
    nearby: ["shen", "neri"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有走路上山才能到的 LeConte Lodge（要提前一年抢），其余都住园外。田纳西一侧的 Gatlinburg 紧挨 Sugarlands 入口，酒店、餐馆最多，但秋季和夏季周末镇上堵车厉害；Pigeon Forge 便宜一些、离公园再远 20–30 分钟；想去 Cades Cove 住 Townsend 最近，安静。Wears Valley 和 Gatlinburg 周围山坡上有大量带热水浴缸的整栋小木屋，适合一家人。北卡一侧住 Cherokee（Oconaluftee 入口外）或 Bryson City（Deep Creek 旁），看 Cataloochee 的麋鹿住 Maggie Valley。两侧之间走 Newfound Gap 公路翻山约 1 小时 15 分钟，排行程时尽量一侧连着玩。",
  },
  {
    code: "shen",
    nameZh: "仙纳度",
    nameEn: "Shenandoah",
    region: "appalachia",
    tagline: "蓝岭山脊上的天际线公路",
    stateEn: "Virginia",
    hero: "shen-old-rag",
    intro:
      "公园沿着弗吉尼亚北部的蓝岭（Blue Ridge）山脊延伸约 170 公里，离华盛顿特区只有 1.5–2 小时车程。整条山脊只有一条路：天际线公路（Skyline Drive），限速 35 英里/时，路边 70 多个观景台，西边俯瞰仙纳度河谷、东边是弗吉尼亚丘陵；阿巴拉契亚步道（Appalachian Trail）有约 160 公里和它并行。园里大多是短步道：上 Stony Man、Hawksbill 看日落，下到峡谷里看瀑布，在 Big Meadows 草甸上看鹿；最有名的是园界东侧要攀爬花岗岩巨石的 Old Rag。10 月中下旬满山红叶，是一年里最挤的时候。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "4–6 月瀑布水量大、山花开（5 月野杜鹃、6 月山月桂）；7–8 月山上比河谷凉快约 5°C，但常有雾和午后雷雨；10 月中下旬是红叶高峰，周末天际线公路和热门步道口都很挤。园里的酒店、餐厅、营地大多 3–4 月开、11 月关，冬天只有公路和步道；天际线公路没有固定的冬季封路，但下雪结冰时会临时分段封闭，雪后可能好几天才重开。",
    areas: {
      north: "北区（Front Royal 入口–Thornton Gap，0–31.5 英里）",
      central: "中区（Thornton Gap–Swift Run Gap，31.5–65.5 英里）",
      south: "南区（Swift Run Gap–Rockfish Gap，65.5–105 英里）",
      "old-rag": "园界东侧 · Old Rag（不通天际线公路）",
      luray: "园外：Luray 小镇（西侧河谷）",
    },
    gateway: { nameZh: "Luray 小镇（Thornton Gap 入口西侧）", lat: 38.66541, lon: -78.45963 },
    timeZone: "America/New_York",
    airports: ["IAD", "DCA", "CHO"],
    nearby: ["neri", "grsm"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内住宿都在天际线公路中段，由 Delaware North 经营：Skyland（41.7 英里，公路最高处，看日落最好）、Big Meadows Lodge（51 英里，旁边就是游客中心、草甸和加油站）和 Lewis Mountain 小木屋（57.5 英里），大约 3–5 月开到 11 月，10 月红叶季的周末很早订满。园外最方便的是西边河谷里的 Luray（到 Thornton Gap 入口约 15 分钟），周边 Page 县有大量带热水浴缸的山间小木屋；从华盛顿来、先玩北段的可以住 Front Royal；南段住 Charlottesville 或 Waynesboro，Harrisonburg 连锁酒店多、便宜。园里只有 Big Meadows 一处加油站，充电桩只在 Skyland，进山前加满、充满。",
  },
  {
    code: "neri",
    nameZh: "新河峡谷",
    nameEn: "New River Gorge",
    region: "appalachia",
    tagline: "钢拱大桥、砂岩崖壁和美东最野的激流",
    stateEn: "West Virginia",
    hero: "neri-canyon-rim",
    intro:
      "2020 年底升格为国家公园（全称 New River Gorge National Park and Preserve），是美国最新的国家公园之一。公园沿新河延伸约 85 公里，河水在阿巴拉契亚高原上切出平均深约 300 米的峡谷；峡谷北端横跨着 1977 年建成的新河峡谷大桥，桥面离河面约 267 米，曾是世界上跨度最大的单跨钢拱桥。崖顶的砂岩峭壁是美东最有名的攀岩地，谷底的下游河段是 III–V 级的激流漂流；林子里还散落着 Thurmond、Kaymoor、Nuttallburg 这些百年前的煤矿小镇遗址。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "5 月中下旬紫色杜鹃花开、6–8 月漂流季最热闹，10 月中旬红叶最盛，10 月第三个周六的桥日（Bridge Day）能走上大桥；但秋叶季周末步道口很难停车。冬天公园照常开放，游客中心大多关闭，偶尔冰雪会让峡谷里的小路难开。",
    areas: {
      bridge: "大桥一带（Canyon Rim · Fayette Station）",
      lansing: "北岸：Endless Wall · Nuttallburg",
      fayetteville: "南岸：Fayetteville · Long Point · Kaymoor",
      river: "峡谷下游河段（漂流）",
      thurmond: "中段：Thurmond 小镇",
      grandview: "Grandview（Beckley 附近）",
      sandstone: "南段：Sandstone 瀑布 · Hinton",
      babcock: "园外：Babcock 州立公园",
    },
    gateway: { nameZh: "Canyon Rim 游客中心（大桥北端）", lat: 38.07005, lon: -81.07594 },
    timeZone: "America/New_York",
    airports: ["CRW", "ROA", "CLT", "IAD"],
    nearby: ["shen", "grsm"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有 8 处免费、先到先得、没有自来水的小营地（多在河边）。大多数人住大桥南边的 Fayetteville（走路就有餐馆，到 Canyon Rim、Long Point、Kaymoor 都在 10 分钟内）或旁边的 Oak Hill；大桥北边的 Adventures on the Gorge、Minden 的 ACE Adventure Resort 是漂流公司的度假村，有小木屋和营地，订漂流时一起订最方便。去 Grandview、Sandstone 瀑布住南边约 30 分钟的 Beckley（连锁酒店最多）或 Hinton 更顺路。桥日（10 月第三个周六）和红叶季的周末，Fayetteville 一带要提前几个月订。",
  },
  {
    code: "acad",
    nameZh: "阿卡迪亚",
    nameEn: "Acadia",
    region: "newengland",
    tagline: "缅因海岸的粉色花岗岩与日出",
    stateEn: "Maine",
    hero: "acad-bass-harbor-light",
    intro:
      "冰川把缅因海岸的粉色花岗岩磨成圆顶山和峡湾，海浪又在山脚凿出崖壁、海蚀洞和卵石滩。公园大部分在荒漠山岛（Mount Desert Island）上：东侧的 Park Loop Road 沿海岸串起沙滩、雷鸣洞和水獭崖，再绕到乔丹池和卡迪拉克山顶，秋冬早上这里常是美国最早看到日出的地方之一；岛上还有洛克菲勒家族修的 70 多公里马车道和石桥，不许开车，只能走路、骑车、骑马。西侧人少，有 Bass Harbor 灯塔和潮池；隔海的 Schoodic 半岛更安静。",
    bestMonths: [6, 7, 8, 9, 10],
    seasonNote:
      "6–10 月最好：7–8 月最暖、人最多，停车场一早就满；9 月到 10 月中天气清爽，10 月上中旬是红叶季，周末又挤起来。Park Loop Road 和卡迪拉克山顶路 4 月 15 日到 12 月 1 日开，冬天只有一小段和 Schoodic 环线通车；Island Explorer 免费班车大约 5 月下旬到 10 月中旬。5 月下旬到 10 月下旬开车上卡迪拉克山顶要提前在 Recreation.gov 订分时段车证。",
    areas: {
      east: "荒漠山岛东侧（Park Loop Road · 卡迪拉克山 · 乔丹池 · 巴尔港）",
      west: "荒漠山岛西侧（Bass Harbor · Echo Lake · Southwest Harbor）",
      schoodic: "Schoodic 半岛（隔海，开车约 1 小时）",
    },
    gateway: { nameZh: "Hulls Cove 游客中心（巴尔港北边）", lat: 44.40848, lon: -68.246 },
    timeZone: "America/New_York",
    airports: ["BGR", "BHB", "PWM", "BOS"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内只有营地（Blackwoods、Seawall、Schoodic Woods，提前在 Recreation.gov 订），没有酒店。大多数人住巴尔港（Bar Harbor）：酒店、民宿、餐馆最多，到 Hulls Cove 游客中心约 5 分钟、到 Sand Beach 约 15 分钟，Island Explorer 班车也从镇中心发车；7–8 月和 10 月红叶季很早订满、价格高。想安静一点住西侧的 Southwest Harbor 或 Northeast Harbor（到 Bass Harbor 灯塔 10–15 分钟）；想便宜住岛外的 Trenton（约 20 分钟）或 Ellsworth（约 35 分钟）。去 Schoodic 半岛的那天可以住 Winter Harbor 一带。",
  },
  {
    code: "ever",
    nameZh: "大沼泽地",
    nameEn: "Everglades",
    region: "florida",
    tagline: "草河、鳄鱼与红树林",
    stateEn: "Florida",
    hero: "ever-anhinga-trail",
    intro:
      "大沼泽地其实是一条极宽极浅的“草河”：雨季的水从奥基乔比湖一带漫过锯齿草原，每天只往南流几百米，最后经红树林流进佛罗里达湾和墨西哥湾。公园约 6,100 平方公里，是美国本土最大的亚热带荒野，也是世界遗产和国际重要湿地；短吻鳄、美洲鳄、海牛、成群的涉禽和濒危的佛罗里达豹都住在这里，南佛罗里达是世界上唯一短吻鳄和美洲鳄同处一地的地方。公园三个入口互不相通：迈阿密西边 Tamiami Trail 上的 Shark Valley，Homestead 一侧一路开到海边 Flamingo 的主园路，和西北角 Everglades City 的万岛群。",
    bestMonths: [12, 1, 2, 3],
    seasonNote:
      "12 月到次年 4 月是旱季：凉快、少雨、蚊子少，水退到少数水塘边，鳄鱼和涉禽最集中，也是游客最多的时候，Shark Valley 停车场旺季上午 10 点前就满。5–11 月是雨季：湿热，几乎天天午后雷阵雨，蚊子极多（Flamingo 一带夏天尤其厉害），护林员活动也少；6–11 月是飓风季，8–10 月最要留意天气预报。",
    areas: {
      "royal-palm": "Homestead 主入口 · Royal Palm",
      "main-road": "主园路（Pa-hay-okee 到 West Lake）",
      flamingo: "Flamingo · 佛罗里达湾",
      "shark-valley": "Shark Valley（Tamiami Trail）",
      "gulf-coast": "Gulf Coast · Everglades City（万岛群）",
      tamiami: "园外：Tamiami Trail · Big Cypress",
      homestead: "园外：Homestead · Florida City",
    },
    gateway: { nameZh: "Ernest F. Coe 游客中心（Homestead 主入口）", lat: 25.39526, lon: -80.5831 },
    // 首页地图：主入口和比斯坎的游客中心只隔 25 公里，圆点画在公园中部（Pa-hay-okee 和 West Lake 之间），免得叠在一起
    mapAt: { lat: 25.32, lon: -80.93 },
    timeZone: "America/New_York",
    airports: ["MIA", "FLL", "RSW"],
    nearby: ["bisc", "drto"],
    nonresidentSurcharge: true,
    lodgingTip:
      "园内能住的只有海边的 Flamingo：2023 年新建的 Flamingo Lodge（24 间集装箱改造的套房和单间）、环保帐篷、船屋和营地，离 Homestead 主入口还要开约 1 小时，冬季早订，夏天蚊子极多。去 Royal Palm、Flamingo 一侧多数人住 Florida City / Homestead：连锁汽车旅馆集中在收费公路出口，到 Ernest F. Coe 游客中心约 15 分钟，也顺路去比斯坎和佛罗里达群岛（到 Key Largo 约 30 分钟）。Shark Valley 一侧没有住宿，从迈阿密西郊开过去约 40 分钟；去 Gulf Coast 住 Everglades City 的小旅馆，或者西北约 45 分钟的那不勒斯（Naples）。三个入口之间都要绕到园外：Homestead 到 Shark Valley 约 1 小时，Shark Valley 到 Everglades City 约 1 小时。园内没有给汽车加油的地方，进去前在 Florida City 加满。",
  },
  {
    code: "bisc",
    nameZh: "比斯坎",
    nameEn: "Biscayne",
    region: "florida",
    tagline: "迈阿密门口的海上公园：礁岛、珊瑚礁与高脚屋",
    stateEn: "Florida",
    hero: "bisc-boca-chita",
    intro:
      "公园就在迈阿密市中心南边，约 95% 是水面：浅浅的比斯坎湾、佛罗里达礁岛群最北端的一串礁岛，和外侧的珊瑚礁。陆上只有 Homestead 东边 Convoy Point 的游客中心和一段海堤步道，真正的看点都要坐船：Boca Chita 岛上 1938 年建的装饰灯塔、Elliott Key 的热带硬木林、湾里的 Stiltsville 高脚屋，还有礁盘上的沉船和珊瑚。不开自己的船的话，就跟公园合作的 Biscayne National Park Institute 出海浮潜、划船或上岛。",
    bestMonths: [12, 1, 2, 3, 4, 5],
    seasonNote:
      "12–4 月是旱季，凉爽、蚊子少，最舒服，但冷锋过境时风大，船团可能取消；5–9 月风小水清，浮潜最好，只是湿热、午后常有雷雨；6–11 月是飓风季。岛上夏秋蚊子很凶（尤其 Elliott Key）。",
    areas: {
      "convoy-point": "Convoy Point（陆上 · 游客中心）",
      keys: "外侧礁岛与珊瑚礁（坐船，Convoy Point 出发）",
      "north-bay": "北湾 · Boca Chita · Stiltsville（坐船，Coconut Grove 出发）",
      homestead: "Homestead 一带（园外）",
    },
    gateway: { nameZh: "Dante Fascell 游客中心（Convoy Point）", lat: 25.46447, lon: -80.33476 },
    timeZone: "America/New_York",
    airports: ["MIA", "FLL"],
    nearby: ["ever", "drto"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有开车能到的住处：Boca Chita 和 Elliott Key 两个岛上的营地只能自己开船去，先到先得。坐 Convoy Point 出发的船团住 Homestead / Florida City 最方便（约 15–20 分钟），这里也是去大沼泽地主入口的门户，汽车旅馆多、比迈阿密便宜；坐 Coconut Grove（Dinner Key）出发的 Boca Chita、Stiltsville 船团就住 Coconut Grove 或迈阿密市区，走路或几分钟车程就到码头。接着往礁岛群走的可以住 Key Largo，到 Convoy Point 约 50 分钟。",
  },
  {
    code: "drto",
    nameZh: "干龟",
    nameEn: "Dry Tortugas",
    region: "florida",
    tagline: "海中央的六角形砖砌要塞",
    stateEn: "Florida",
    hero: "drto-ferry",
    intro:
      "Key West 以西约 110 公里，七个小沙岛和四周的珊瑚礁，公园 99% 是海。主角是 Garden Key 上的杰斐逊堡（Fort Jefferson）：1846 年开建、用了 1,600 多万块砖，是美洲最大的砖砌建筑，修了快 30 年也没完工；南北战争后当过军事监狱，因林肯遇刺案被判刑的 Samuel Mudd 医生就关在这里。要塞外的护城河墙边就能浮潜，1 月底到 7 月初成群的乌燕鸥在旁边的 Bush Key 筑巢。只能从 Key West 坐渡轮或水上飞机来，绝大多数人当天来回。",
    bestMonths: [4, 5, 6],
    seasonNote:
      "4–6 月海面相对平静、水清，春季（3–5 月）候鸟迁徙是观鸟高峰；12–3 月冷锋多，风大浪高，渡轮更颠、偶尔停航；6–11 月是飓风季，夏天湿热，有热带风暴时停航。渡轮全年每天开，冬春旺季和节假日常提前几周订满。",
    areas: {
      tortugas: "干龟群岛（坐渡轮 · 水上飞机）",
      "key-west": "Key West",
      keys: "海外公路（迈阿密开往 Key West 的路上）",
    },
    gateway: { nameZh: "Key West Bight 渡轮码头（Yankee Freedom 出发处）", lat: 24.56251, lon: -81.79894 },
    mapAt: { lat: 24.6286, lon: -82.87322 },
    timeZone: "America/New_York",
    airports: ["EYW", "MIA", "FLL"],
    nearby: ["ever", "bisc"],
    nonresidentSurcharge: false,
    lodgingTip:
      "公园里唯一能过夜的是 Garden Key 上的原始营地（8 个营位加一片空地，要坐渡轮带上全部的水和装备，渡轮的露营票提前 6 个月放、很快卖完），其余的人都住 Key West 当天来回。渡轮 7:00 就要报到，住 Key West 老城最方便，走路 10–15 分钟到码头，但房价是全佛州最贵的一档，冬季和周末更贵；新城、Stock Island 的连锁酒店便宜些，开车到码头 10–15 分钟，市政停车楼 $40/天。往回 40 分钟的 Big Pine Key 一带有带厨房的整套房子；从迈阿密开车过来约 3.5–4 小时，可以在 Key Largo 或 Marathon 住一晚分两段开。",
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
    nearby: ["kefj", "wrst", "gaar", "lacl"],
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
    nearby: ["dena", "wrst", "katm", "lacl"],
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
    code: "glba",
    nameZh: "冰川湾",
    nameEn: "Glacier Bay",
    region: "alaska",
    tagline: "潮水冰川与座头鲸的海湾",
    stateEn: "Alaska",
    hero: "glba-day-boat",
    intro:
      "250 多年前整个海湾还被一条大冰川填满，一直伸到湾口的 Icy Strait；之后冰川退了约 100 公里，留下一条长长的峡湾，湾底的 Margerie、Grand Pacific 等潮水冰川还在往海里崩落，夏天湾里有座头鲸、海獭、海豹，岸上有熊和山羊。这里是 Huna 特林吉特人（Xunaa Lingít）世代的家园。多数人是坐邮轮在湾里看一天；自己来要先飞到 Gustavus（从朱诺没有公路），住在湾口的 Bartlett Cove 或 Gustavus 小镇，再坐每天一班的游船进湾。",
    bestMonths: [6, 7, 8],
    seasonNote:
      "5 月下旬到 9 月上旬 Glacier Bay Lodge、游客中心和进湾的游船都开（2026 年是 5 月 22 日到 9 月 7 日），7 月人最多；座头鲸 6 月中以后多起来，7–8 月最多。4–6 月雨相对少，9–10 月雨最多；冬季几乎所有服务都关，只有小飞机进出。",
    areas: {
      "bartlett-cove": "Bartlett Cove（公园总部）",
      bay: "冰川湾里（坐船 · 坐飞机）",
      gustavus: "Gustavus 小镇 · Icy Strait",
    },
    gateway: { nameZh: "冰川湾游客中心（Bartlett Cove 的 Glacier Bay Lodge 二楼）", lat: 58.45464, lon: -135.8825 },
    timeZone: "America/Juneau",
    airports: ["GST"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内只有 Bartlett Cove 的 Glacier Bay Lodge（2026 年 5 月 21 日到 9 月 8 日营业），游客中心在酒店二楼，进湾的游船就在门口码头上船；其余住处都在约 16 公里外的 Gustavus 小镇，有民宿、小木屋和几家包三餐的度假屋，夏季要早订。从朱诺没有公路：Alaska Airlines 夏季每天一班喷气机（2026 年 6 月 6 日到 8 月 30 日，约 30 分钟），Alaska Seaplanes 的小飞机全年每天都飞，州营渡轮夏季大约每周两班。Gustavus 只有一家小租车行，多数人靠酒店接驳车、出租车和自行车。不少人是坐邮轮在湾里看一天，不上岸过夜；Bartlett Cove 还有一个免费、不能预约的步行进入式帐篷营地。",
  },
  {
    code: "gaar",
    nameZh: "北极之门",
    nameEn: "Gates of the Arctic",
    region: "alaska",
    tagline: "没有路也没有步道的北极荒野",
    stateEn: "Alaska",
    hero: "gaar-arrigetch-flight",
    intro:
      "美国最北、面积第二大的国家公园，整个在北极圈以北：布鲁克斯山脉中部 3.4 万平方公里的荒野里没有一条公路、一条步道，也没有任何设施，一年只有一万多人次来。名字是 1930 年代 Bob Marshall 起的，他把 Koyukuk 河北叉两岸对峙的 Frigid Crags 和 Boreal Mountain 叫作“北极之门”。普通游客有两种去法：从费尔班克斯沿砂石为主的 Dalton 公路开约 6 小时到 Coldfoot、Wiseman，公园东界就在公路以西几公里到十来公里，但没有路，要自己越野走进去；或者从 Coldfoot、Bettles、费尔班克斯坐小飞机飞进山里，在湖上降落看一看。",
    bestMonths: [6, 7, 8],
    seasonNote:
      "6–8 月是主要季节：午夜太阳、苔原开花，Coldfoot 的观光飞行 6 月到 9 月中营业，但 6 月中到 8 月蚊子极多；8 月下旬到 9 月初秋色最好、开始能看到极光，也可能下雪。Dalton 公路全年通车，但 10 月下旬到次年 4 月上旬冰雪、极寒，BLM 不建议自驾，冬天去 Coldfoot 看极光一般跟团。",
    areas: {
      "dalton-south": "Dalton 公路南段（育空河 · 北极圈）",
      "coldfoot-wiseman": "Coldfoot · Wiseman",
      "dalton-north": "Dalton 公路北段（Sukakpak 山 · Atigun 山口）",
      "fly-in": "坐小飞机进园",
    },
    gateway: { nameZh: "北极跨部门游客中心（Coldfoot，Dalton 公路 175 英里处）", lat: 67.25274, lon: -150.18711 },
    timeZone: "America/Anchorage",
    airports: ["FAI"],
    nearby: ["dena"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有任何住宿和营地设施。开车去的话住 Dalton 公路 175 英里处的 Coldfoot Camp：全年营业，旅馆由输油管工地的工人宿舍改建，每间两张单人床、带卫浴，2026 年 $269/晚，夏季旅行团多、要早订；也可以住往北约 20 分钟的 Wiseman 村里两家家庭经营的小木屋民宿（房间很少），自带帐篷的可以住 Coldfoot Camp 的免费营地或北边 5 英里的 BLM Marion Creek 营地。往返路上的第一晚、最后一晚住费尔班克斯，想把 6 小时的路拆开可以住 56 英里处育空河边的 Yukon River Camp。另一个门户村 Bettles 只能坐飞机去（从费尔班克斯约 1 小时），村里的 Bettles Lodge 全年营业，常和观光飞行、极光打包卖；园内和园边还有 Iniakuk Lake 这类只能飞进去的荒野小屋，都要提前订。",
  },
  {
    code: "kova",
    nameZh: "科伯克谷",
    nameEn: "Kobuk Valley",
    region: "alaska",
    tagline: "北极圈里的沙丘与驯鹿渡口",
    stateEn: "Alaska",
    hero: "kova-sand-dunes",
    intro:
      "布鲁克斯山脉南麓的一片宽谷，在北极圈以北约 50 公里，最出名的是冰期留下的沙丘：三片沙丘共约 78 平方公里，最大的科伯克大沙丘高约 30 米，夏天沙面能晒到 38°C，是北极最大的活动沙丘。Kobuk（Iñupiaq 语“大河”）河从谷中穿过，西部北极驯鹿群每年春秋渡河，Onion Portage 一带的渡口已有 8,000 多年的狩猎历史。公园没有路、步道和任何设施，要从海边小城 Kotzebue 坐小飞机进去，降落在沙丘上或河面上。",
    bestMonths: [7, 8],
    seasonNote:
      "6–9 月才有观光飞行和背包客：7 月最暖，6、7 月蚊子最多，8、9 月虫子少、秋色好，晚上开始能看到极光；驯鹿秋季南迁渡河 2000 年以前多在 8 月中下旬开始，近年常拖到 9 月以后甚至 10–11 月。9 月中下旬河面开始结冰，10 月到次年 5 月冰雪覆盖，只有天气好时的包机。",
    areas: {
      kotzebue: "Kotzebue（科策布）",
      "kobuk-valley": "科伯克河谷（坐小飞机）",
    },
    gateway: { nameZh: "西北极遗产中心（Kotzebue 的公园游客中心）", lat: 66.89257, lon: -162.6052 },
    mapAt: { lat: 67.05465, lon: -158.9057 },
    timeZone: "America/Nome",
    airports: ["OTZ"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有住宿和营地设施，进园前后都住 Kotzebue：Nullagvik 酒店最大（79 间房，原住民公司 NANA 开的），离机场、游客中心和小飞机机库都走得到；另有几家家庭民宿，有的挂在 Airbnb 上。镇上房间不多，夏季和秋季打猎季常被工作的人订满，订好机票就订房。Kotzebue 没有户外装备出租，要在园里露营就自带装备，防熊食物桶可以在遗产中心借；漂流 Kobuk 河的人从上游的 Ambler 村下水、到下游的 Kiana 村上岸，两个村子都只有很少的补给，吃的用的在 Kotzebue 买齐。",
  },
  {
    code: "katm",
    nameZh: "卡特迈",
    nameEn: "Katmai",
    region: "alaska",
    tagline: "Brooks 瀑布的棕熊与万烟谷",
    stateEn: "Alaska",
    hero: "katm-brooks-falls",
    intro:
      "全园估计有约 2,200 头棕熊，是世界上看熊最好的地方之一：7 月红鲑逆流跳过 Brooks 瀑布，棕熊就站在瀑布顶上张嘴接鱼；太平洋海岸的草甸和泥滩上，熊在吃莎草、挖蛤蜊。1912 年 Novarupta 火山爆发是 20 世纪最大的一次喷发，火山灰把一整条山谷填成了“万烟谷”。公园不通公路，要从 Homer、安克雷奇或 King Salmon 坐小飞机进去，多数人当天来回。",
    bestMonths: [7, 9],
    seasonNote:
      "Brooks Camp 的护林员、Brooks Lodge 和定期航班大约只在 6 月 1 日到 9 月 17 日（2026 年 Brooks Lodge、Katmai Air 到 9 月 18 日）；Brooks 瀑布熊最多的是 7 月（抓跳跃的红鲑）和 9 月（在下游吃产完卵的鱼），6 月和 8 月有时一整天看不到熊。海岸看熊 6–8 月最好，Homer 的看熊航班大约 5 月中到 9 月中飞；冬季没有服务。",
    areas: {
      brooks: "Brooks Camp（坐水上飞机）",
      coast: "卡特迈海岸（坐小飞机）",
      vtts: "万烟谷",
    },
    gateway: { nameZh: "Homer（Beluga 湖水上飞机基地，看熊一日游出发地）", lat: 59.64063, lon: -151.50855 },
    mapAt: { lat: 58.55429, lon: -155.77749 },
    timeZone: "America/Anchorage",
    airports: ["ANC", "HOM"],
    nearby: ["lacl", "kefj"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内的住处都只能坐飞机进去：Brooks Camp 的 Brooks Lodge 只有 16 间房，旺季要提前一年半抽签（2028 年的在 2026 年 12 月 1–30 日报名），旁边的 Brooks Camp 营地在 Recreation.gov 预约，另外还有几家飞进去的钓鱼、看熊度假屋。所以多数人住在开车能到的出发地、当天来回：Homer 的 Beluga 湖边、市区和 Homer Spit 都有酒店民宿，去 Brooks 和海岸看熊都从这里飞，离安克雷奇约 4.5 小时车程；不想去 Homer 的可以住安克雷奇，坐 Katmai Air、Rust's 的一日游。经 King Salmon 进出的住镇上的小旅馆，那里和公路网不通。",
  },
  {
    code: "lacl",
    nameZh: "克拉克湖",
    nameEn: "Lake Clark",
    region: "alaska",
    tagline: "火山、冰川湖与海岸棕熊",
    stateEn: "Alaska",
    hero: "lacl-crescent-lake",
    intro:
      "在安克雷奇西南约 200 公里，阿拉斯加山脉和阿留申山脉在这里相接：Redoubt、Iliamna 两座活火山终年积雪，山谷里挂着冰川，Lake Clark、Twin Lakes、Crescent 湖这些冰川湖是青绿色的。Cook 湾海岸的盐沼和泥滩上常能一次看到一二十头棕熊；Twin Lakes 湖边是 Dick Proenneke 1960 年代末亲手盖、独自住了约 30 年的小木屋。公园不通公路，从安克雷奇坐小飞机约 1 小时，多数人当天来回。",
    bestMonths: [6, 7, 8, 9],
    seasonNote:
      "6–9 月看熊团、航班最多，Port Alsworth 的游客中心只在 6–8 月开；海岸看熊 6 月到 8 月最好（初夏在盐沼吃莎草，夏末到溪口抓鲑鱼），Crescent 湖看熊在 8–9 月鲑鱼季；Proenneke 小屋大约 5 月底湖面化冰后到 9 月底开放。冬季基本只能包机。",
    areas: {
      coast: "Cook 湾海岸（坐小飞机）",
      crescent: "Crescent 湖（坐水上飞机）",
      "twin-lakes": "Twin Lakes（坐水上飞机）",
      "port-alsworth": "Port Alsworth · Lake Clark 湖",
    },
    gateway: { nameZh: "安克雷奇 Lake Hood 水上飞机基地（一日游出发地）", lat: 61.17933, lon: -149.97099 },
    mapAt: { lat: 60.2021, lon: -154.3131 },
    timeZone: "America/Anchorage",
    airports: ["ANC", "HOM"],
    nearby: ["katm", "kefj", "dena"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内的住处都只能飞进去：Port Alsworth 有八九家小旅馆和一个私营营地，海岸的 Silver Salmon Creek、Chinitna 湾和 Crescent 湖边有几家看熊、钓鱼的度假屋，Lake Clark 湖边还有两座在 Recreation.gov 预订的公共小木屋，Twin Lakes 有不用预约的简易营地。多数人住在安克雷奇当天来回：Lake Hood 旁的机场酒店区离水上飞机最近，市中心选择最多。去海岸看熊也可以住 Homer 或 Soldotna，从那里飞更近、更便宜。",
  },
  {
    code: "havo",
    nameZh: "夏威夷火山",
    nameEn: "Hawaiʻi Volcanoes",
    region: "hawaii",
    tagline: "活火山口边的熔岩红光",
    stateEn: "Hawaii",
    hero: "havo-kilauea-overlook",
    intro:
      "公园里有地球上最活跃的火山之一基拉韦厄（Kīlauea），和体积最大的活火山冒纳罗亚（Mauna Loa）。基拉韦厄山顶的破火山口边上有一圈观景台和步道，能看到 2018 年塌陷后的 Halemaʻumaʻu 火山口、冒着蒸汽的喷气孔、熔岩管和 1959 年的熔岩湖；火山口链公路（Chain of Craters Road）从山顶一路下到海边，沿途是几十年间新流出的熔岩原。2024 年 12 月起，山顶的 Halemaʻumaʻu 火山口里间歇喷发：每次熔岩喷泉持续几个小时，间隔几天到几周，喷发时在火山口边的观景台就能看到。",
    bestMonths: [4, 5, 9, 10],
    seasonNote:
      "全年开放、24 小时都能进。山顶海拔约 1,200 米，常年凉爽多雨，夜里常在 10°C 上下；12–1 月和 6–7 月游客最多、停车最难，4–5 月和 9–10 月人少一些。火山喷发不分季节，出发前看 USGS 夏威夷火山观测站的每日公告；6–11 月是飓风季，2026 年 8 月（飓风 Lala）和 9 月（Nolo）公园都因风暴临时关过。",
    areas: {
      summit: "Kīlauea 山顶 · 火山口边缘",
      "chain-of-craters": "火山口链公路（Chain of Craters Road）",
      "mauna-loa": "冒纳罗亚路（Mauna Loa Road）",
      kahuku: "Kahuku 园区（Kaʻū 南部，周四到周日开）",
      nearby: "园外顺路（希洛、Punaluʻu 黑沙滩）",
    },
    gateway: { nameZh: "夏威夷火山国家公园入口（Volcano 村旁）", lat: 19.42865, lon: -155.25453 },
    timeZone: "Pacific/Honolulu",
    airports: ["ITO", "KOA"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内开车能到的住处只有火山口边上的 Volcano House 酒店（33 间房）和往西约 5 公里 Nāmakanipaio 营地的 10 间小木屋，都由 Volcano House 经营，常常很早订满。多数人住入口外约 2 公里的 Volcano 村：雨林里的民宿、小木屋很多，有两家小超市和加油站，开到山顶观景台约 10 分钟，夜里看完火山红光回去最方便。希洛（Hilo）酒店、餐馆多，到公园约 45 分钟；科纳（Kona）的度假酒店单程约 2.5 小时，只适合当天来回或者顺路过来。园内的 Kilauea Military Camp 只接待军人等有资格的客人，一般游客不能住。",
  },
  {
    code: "hale",
    nameZh: "哈莱阿卡拉",
    nameEn: "Haleakalā",
    region: "hawaii",
    tagline: "云海之上的火山口日出",
    stateEn: "Hawaii",
    hero: "hale-sunrise",
    intro:
      "茂宜岛东半边就是一座巨大的盾状火山，最高点 Puʻuʻulaʻula 海拔 3,055 米。山顶的“火山口”其实是雨水侵蚀出来的大山谷，长约 12 公里、宽约 4 公里，谷底散落着红、黑、橙色的渣锥；在云海之上看日出、日落和星空是这里的招牌，还能看到只长在这座山上的银剑草和夏威夷雁。公园的另一半在东南海岸的 Kīpahulu，和山顶不通路，要走哈纳公路过去：雨林、竹林步道和一串流进大海的瀑布水潭。",
    bestMonths: [5, 6, 9, 10],
    seasonNote:
      "全年开放、24 小时都能进，但凌晨 3–7 点进山顶区要提前订日出预约。山顶比海边冷十几到二十几度，日出前常在 0°C 上下，冬天偶尔下雪结冰；12–3 月游客最多，日落前山顶停车场常满。5–10 月是夏威夷的旱季，银剑草多在夏天开花；Kīpahulu 一年到头湿热多雨，冬天雨更多、溪水容易暴涨。",
    areas: {
      summit: "山顶区（Summit District）",
      kipahulu: "Kīpahulu 区（哈纳以南的海岸）",
      "hana-highway": "哈纳公路（去 Kīpahulu 的路上）",
    },
    gateway: { nameZh: "哈莱阿卡拉公园总部游客中心（山顶区）", lat: 20.75944, lon: -156.24673 },
    timeZone: "Pacific/Honolulu",
    airports: ["OGG"],
    nonresidentSurcharge: false,
    lodgingTip:
      "园内没有酒店，只有山顶区的 Hosmer Grove 和海边的 Kīpahulu 两个小营地（都要在 Recreation.gov 提前 30 天内订），以及要徒步下到火山口里的三间荒野小屋。看日出的人多住山腰的 Kula 或 Pukalani、Makawao 一带，开到山顶约 1–1.5 小时；住机场旁的卡胡卢伊或北岸小镇 Paia 约 1.5–2 小时，Paia 也是哈纳公路的起点。去 Kīpahulu 最好在哈纳（Hāna）住一晚，开到瀑布步道约 30 分钟。南岸的 Kīhei、Wailea 度假区去山顶要 2–2.5 小时，凌晨出发看日出很辛苦。",
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
