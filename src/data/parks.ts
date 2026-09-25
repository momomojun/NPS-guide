export type RegionId = "seattle" | "norcal" | "sierra" | "socal" | "rockies" | "vegas" | "alaska";

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
  /** 常顺路一起玩的公园，自动生成攻略时可以一起排 */
  nearby?: string[];
  /** 2026 年起对非居民每人加收 $100 的 11 个公园之一 */
  nonresidentSurcharge: boolean;
  /** 住宿建议，自动生成攻略时显示 */
  lodgingTip: string;
}

export const regionOrder: RegionId[] = ["seattle", "norcal", "sierra", "socal", "rockies", "vegas", "alaska"];

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
    nearby: ["grte"],
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
    nearby: ["brca", "grca"],
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
    nearby: ["zion", "grca"],
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
    nearby: ["zion", "brca"],
    nonresidentSurcharge: true,
    lodgingTip:
      "南缘村里有 El Tovar、Bright Angel、Maswik 等几家园内酒店，加上 Yavapai Lodge，要提早订；园外最近的是南门外的 Tusayan（约 10 分钟），再远是 Williams 和 Flagstaff（约 1–1.5 小时）。去东边沙漠观景塔方向，可以住 Cameron。2026 年 8 月底山洪后南缘缺水，园内酒店暂停过夜接待，NPS 预计感恩节前后恢复供水，之后分阶段重开。",
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
    lodgingTip:
      "园内几乎没有普通酒店，住宿集中在入口外的 Nenana Canyon（酒店、餐厅、漂流公司都在这一带）和北边约 15 分钟的 Healy；夏季旺季房价高、要早订。南边的 Cantwell、Talkeetna 适合顺路过夜。",
  },
];

export function getPark(code: string): Park | undefined {
  return parks.find((park) => park.code === code);
}
