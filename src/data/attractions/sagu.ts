import type { Attraction } from "./types";

// 巨人柱：东西两个园区被图森市区隔开，园内不通车，景点按 area（west / east）分开，start 都写在各自那一侧。
// 坐标：游客中心、步道口按 NPS places 接口和 OpenStreetMap（highway=trailhead）核对；Signal Hill 岩画按 OSM 的
// archaeological_site，Valley View 观景点按 OSM 步道尽头的 viewpoint，Wasson Peak 按 OSM 的山顶。
//
// 2026 年 10 月的现况（NPS 公告 2026-09-30）：9 月的季风暴雨冲坏了西区的砂石路，Bajada 环线（Hohokam Road 全段、
// Golden Gate Road 全段）封闭，Valley View、Signal Hill、Sendero Esperanza 这几个只能从环线开进去的步道口暂时开不到，
// 修好才重开，NPS 没给日期；红山游客中心后面的 Javelina Wash 小路也被冲坏关闭。Kinney Road 沿线（红山游客中心、
// Desert Discovery 步道、King Canyon 步道口、沙漠博物馆）不受影响。东区全部开放。
// 这是临时封闭，写在 src/data/closures.ts（按日期，自动生成攻略不排），开放月份不改。
const KING_CANYON_TH = { lat: 32.24719, lon: -111.16709, nameZh: "King Canyon 步道口（Kinney Road，沙漠博物馆对面）" };
/** 东区 Cactus Forest 环线 5:00–20:30 开放（NPS operating hours），20:30 锁大门；步道 24 小时开放，可以走进来 */
const LOOP_DRIVE_HOURS = [{ open: "05:00", close: "20:30" }];
const RMVC_PARKING = { lat: 32.1802, lon: -110.73626, nameZh: "林孔山游客中心停车场" };

export const saguaro: Attraction[] = [
  // ===== 西区 · 图森山 =====
  {
    id: "sagu-red-hills-vc",
    park: "sagu",
    nameZh: "红山游客中心（西区）",
    nameEn: "Red Hills Visitor Center",
    kind: "visitor",
    area: "west",
    lat: 32.25448,
    lon: -111.19732,
    durationMin: 30,
    hours: [
      { open: "09:00", close: "17:00", months: [10, 11, 12, 1, 2, 3, 4, 5] },
      { open: "08:00", close: "16:00", months: [6, 7, 8, 9] },
    ],
    summary:
      "西区的游客中心，大窗外就是满山的巨人柱；有 15 分钟的介绍片、展览和书店，门口约 90 米的 Cactus Garden 铺装小环线挂着植物名牌，先认识一下几种常见的仙人掌。冬季每天有护林员讲座。",
    tips: [
      "10–5 月 9:00–17:00、6–9 月 8:00–16:00；门票只收信用卡，7 天内东西两区通用",
      "游客中心后面的 Javelina Wash 小环线 2026 年 9 月被山洪冲坏，暂时关闭",
      "西区没有大的步道从游客中心出发；叫网约车进来容易叫不到车回去，最好自己开车",
    ],
    photoFile: "Saguaro National Park NPS photo (23890107319).jpg",
  },
  {
    id: "sagu-desert-discovery",
    park: "sagu",
    nameZh: "沙漠探索步道",
    nameEn: "Desert Discovery Trail",
    kind: "hike",
    area: "west",
    lat: 32.26257,
    lon: -111.21052,
    durationMin: 25,
    trail: { loop: true },
    hike: { distanceMi: 0.5, difficulty: "easy", loop: true },
    bestTime: ["morning", "sunset"],
    mustSee: true,
    summary:
      "红山游客中心往西北约 1.6 公里，Kinney Road 边一条 0.8 公里的铺装小环线，两边是又高又密的巨人柱，路边有讲沙漠生态的解说牌和遮阳亭，西边能望到 Avra 河谷和远处的 Baboquivari 山。轮椅、婴儿车都能走，也可以牵狗。",
    tips: [
      "Bajada 环线封路期间，西区开车能到的巨人柱步道主要就是这条",
      "傍晚逆光拍巨人柱剪影很好看；夏天白天太热，只适合清早或日落前来",
    ],
    photoFile:
      "View of the start of Desert Discovery Nature Trail, showing lush vegetation and a shaded ramada. (3d73c866-ef80-4868-9703-e8e025d5501c).jpg",
  },
  {
    id: "sagu-valley-view-overlook",
    park: "sagu",
    nameZh: "Valley View 观景步道",
    nameEn: "Valley View Overlook Trail",
    kind: "hike",
    area: "west",
    lat: 32.27684,
    lon: -111.2032,
    start: { lat: 32.27706, lon: -111.19778, nameZh: "Valley View 步道口（Bajada 环线 Hohokam Road 边）" },
    durationMin: 45,
    trail: { via: [{ lat: 32.27684, lon: -111.2032 }] },
    hike: { distanceMi: 0.8, difficulty: "easy" },
    bestTime: ["sunset"],
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    mustSee: true,
    summary:
      "1930 年代民间资源保护队修的小路，下到两条干河床再缓缓爬上山脊，往返约 1.3 公里。尽头的长椅上能俯瞰满坡的巨人柱一直铺到 Avra 河谷，北边是锯齿状的 Picacho Peak，是西区看日落最好的地方之一。",
    tips: [
      "步道口在 Hohokam Road（单行砂石路）边，车位只有十来个，停满了就先去环线上别的地方转一圈再回来",
      "看完日落天很快就黑，带头灯；环线只在白天让车开",
    ],
    photoFile: "Saguaro National Park West, Arizona, USA 2024-5 2.jpg",
  },
  {
    id: "sagu-signal-hill",
    park: "sagu",
    nameZh: "Signal Hill 岩画",
    nameEn: "Signal Hill Petroglyphs",
    kind: "landmark",
    area: "west",
    lat: 32.29107,
    lon: -111.20848,
    start: { lat: 32.2897, lon: -111.20842, nameZh: "Signal Hill 野餐区停车场（Golden Gate Road 边）" },
    durationMin: 30,
    trail: {},
    hike: { distanceMi: 0.3, gainFt: 30, difficulty: "easy" },
    bestTime: ["morning", "afternoon"],
    mustSee: true,
    summary:
      "公园里看古代岩画最好的地方：野餐区旁一段约 270 米的石阶小路爬上一座黑色火山岩小山，山顶的石头上刻满了霍霍坎人（Hohokam）约 800 年前留下的螺旋纹、人形和动物，最有名的是一块大螺旋。山顶四周是一望无际的巨人柱。",
    tips: [
      "只能看、不能摸，也不要踩到刻着画的石头上；石阶不平，不能推轮椅",
      "10 月下旬的周五下午有护林员讲岩画（看 NPS 活动日历，封路的话会取消）",
    ],
    photoFile: "Petroglyph on Signal Hill - panoramio.jpg",
  },
  {
    id: "sagu-bajada-loop",
    park: "sagu",
    nameZh: "Bajada 环线景观道",
    nameEn: "Bajada Loop Drive",
    kind: "drive",
    area: "west",
    lat: 32.2785,
    lon: -111.195,
    start: { lat: 32.26912, lon: -111.21636, nameZh: "环线起点（Kinney Road 转进 Hohokam Road）" },
    durationMin: 50,
    bestTime: ["afternoon", "sunset"],
    summary:
      "西区约 10 公里的砂石环线：从 Kinney Road 转进单行的 Hohokam Road，接 Golden Gate Road 绕一圈回来，一路穿过巨人柱最密的山坡，沿途有 Valley View、Signal Hill 和几处野餐区，路况好的时候普通轿车慢慢开就行。",
    tips: [
      "只在白天让车开；Hohokam Road 是单行道，车长超过 40 英尺（约 12 米）的房车不能进",
      "雨后常被冲出坑和沙，低底盘车慢开；Golden Gate Road 往东到 Picture Rocks Road 那段已经永久改成步道",
    ],
    photoFile: "Saguaro National Park West, Arizona, USA 2024-5.jpg",
  },
  {
    id: "sagu-wasson-peak",
    park: "sagu",
    nameZh: "Wasson Peak（图森山最高点）",
    nameEn: "Wasson Peak via King Canyon Trail",
    kind: "hike",
    area: "west",
    lat: 32.27325,
    lon: -111.14711,
    start: KING_CANYON_TH,
    durationMin: 300,
    trail: { via: [{ lat: 32.27325, lon: -111.14711 }] },
    hike: { distanceMi: 7, gainFt: 1800, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [11, 12, 1, 2, 3],
    summary:
      "从 King Canyon 步道口沿老矿路和山脊一路爬到海拔 1,429 米的 Wasson Peak，往返约 11 公里、爬升约 550 米。越往上视野越开阔，山顶四面是图森市区、Avra 河谷和远处几座“天空之岛”山脉，脚下的山坡长满巨人柱。",
    tips: [
      "全程几乎没有树荫，夏天别走；冬天也要每人带 2–3 升水，早上出发",
      "下山可以绕 Hugh Norris 步道或经 Gould Mine 老铜矿回来，走成一个环线",
      "步道口在 Kinney Road 边，不受 Bajada 环线封路影响；这里常有砸车窗偷东西的，贵重物品别留在车里",
    ],
    photoFile: "TucsonMountains WassonPeakView 140422.JPG",
  },
  {
    id: "sagu-desert-museum",
    park: "sagu",
    nameZh: "亚利桑那–索诺拉沙漠博物馆",
    nameEn: "Arizona-Sonora Desert Museum",
    kind: "experience",
    area: "west",
    lat: 32.24371,
    lon: -111.1674,
    durationMin: 180,
    outsidePark: true,
    hours: [
      { open: "08:30", close: "17:00", months: [10, 11, 12, 1, 2, 3, 4, 5] },
      { open: "07:30", close: "16:00", months: [6, 7, 8, 9] },
    ],
    bestTime: ["morning"],
    summary:
      "公园西区南边、Kinney Road 边上的户外博物馆，其实是动物园、植物园和自然博物馆的结合：约 3 公里的小路串起索诺兰沙漠的植物园、洞穴和矿物展馆、蜂鸟鸟舍，能近距离看到美洲狮、郊狼、野猪（javelina）和猛禽；冬季每天有猛禽放飞表演。",
    tips: [
      "成人门票 $29.95、3–12 岁 $24.95（2026 年 10 月官网），国家公园年卡不能用；至少留 2–3 小时，下午三点前进园",
      "大部分是户外，夏天早上 7:30 开门就进去；6–8 月的周六延长到 22:00（Cool Summer Nights）",
      "离红山游客中心约 10 分钟，和西区排在同一天最顺路",
    ],
    photoFile: "Arizona Sonora desert museum View.JPG",
  },
  {
    id: "sagu-gates-pass",
    park: "sagu",
    nameZh: "Gates Pass 观景台",
    nameEn: "Gates Pass Overlook",
    kind: "viewpoint",
    area: "west",
    lat: 32.22327,
    lon: -111.10164,
    start: { lat: 32.22312, lon: -111.10141, nameZh: "Gates Pass 停车场（Tucson Mountain Park）" },
    durationMin: 30,
    outsidePark: true,
    bestTime: ["sunset"],
    summary:
      "从图森市区翻过图森山去西区的 Gates Pass Road 山口，停车场旁的小石屋和岩石坡上能看到西边整片巨人柱山谷和层层远山，是图森本地人最爱的看日落地点。归皮马县的 Tucson Mountain Park 管，不收门票。",
    tips: [
      "停车场 6:00–20:00 开放，20:00 锁门、车出不来；日落前 30–40 分钟到，周末车位很快就满",
      "Gates Pass Road 弯急坡陡，皮马县不建议 25 英尺（约 7.6 米）以上的房车、拖车和大巴走，6 吨以上的车禁行；房车从南边的 Ajo Way 转 Kinney Road 进西区",
    ],
    photoFile: "Gates Pass, Tucson, Arizona, USA 2024-5 2.jpg",
  },

  // ===== 东区 · 林孔山 =====
  {
    id: "sagu-rincon-mountain-vc",
    park: "sagu",
    nameZh: "林孔山游客中心（东区）",
    nameEn: "Rincon Mountain Visitor Center",
    kind: "visitor",
    area: "east",
    lat: 32.17966,
    lon: -110.73603,
    start: RMVC_PARKING,
    durationMin: 30,
    hours: [
      { open: "09:00", close: "17:00", months: [10, 11, 12, 1, 2, 3, 4, 5] },
      { open: "08:00", close: "16:00", months: [6, 7, 8, 9] },
    ],
    summary:
      "东区的游客中心，在 Old Spanish Trail 边、Cactus Forest 环线的起点；有介绍片、展览、书店和一个种着当地原生植物的小园子，门口的露台能装水，环线入口的收费亭也在旁边。",
    tips: [
      "10–5 月 9:00–17:00、6–9 月 8:00–16:00；厕所在室外，24 小时开放",
      "东区游客中心停车场没有房车车位（西区有）",
      "夏秋早上 8:15 常有护林员带着逛门口的植物园（约半小时），以 NPS 活动日历为准",
    ],
  },
  {
    id: "sagu-cactus-forest-drive",
    park: "sagu",
    nameZh: "Cactus Forest 环线景观道",
    nameEn: "Cactus Forest Loop Drive",
    kind: "drive",
    area: "east",
    lat: 32.197,
    lon: -110.715,
    start: { lat: 32.18626, lon: -110.73149, nameZh: "环线入口（游客中心旁的收费亭）" },
    durationMin: 60,
    hours: LOOP_DRIVE_HOURS,
    bestTime: ["morning", "sunset"],
    mustSee: true,
    summary:
      "东区约 13 公里的铺装单行环线，在起伏的山丘间穿过一片很老的巨人柱林，背后是林孔山。沿途有好几处观景停车点和步道口：0.4 公里的沙漠生态步道（Desert Ecology Trail）、Cactus Forest 步道、Javelina Rocks 和 Mica View 野餐区，开一圈加上走走停停约 1 小时。",
    tips: [
      "5:00–20:30 开放，晚上锁大门；早上和傍晚光线好、野生动物多，常见走鹃、野猪和沙漠陆龟",
      "单行道、弯多坡陡，骑车的人很多，超车小心；车长超过 40 英尺（约 12 米）的房车不能进",
      "门票在环线入口的收费亭或自助机买，只收卡；7 天内西区也能用",
    ],
    photoFile: "Cactus Forest Drive (50614551188).jpg",
  },
  {
    id: "sagu-javelina-rocks",
    park: "sagu",
    nameZh: "Javelina Rocks 观景点",
    nameEn: "Javelina Rocks Overlook",
    kind: "viewpoint",
    area: "east",
    lat: 32.17424,
    lon: -110.71744,
    durationMin: 30,
    hours: LOOP_DRIVE_HOURS,
    bestTime: ["sunset"],
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    summary:
      "Cactus Forest 环线约 10 公里处，路右边一堆被风化得圆滚滚的片麻岩大石堆，可以爬上去，四周巨人柱和远处的图森盆地一览无余，是东区看日落最受欢迎的地方。",
    tips: [
      "爬石头自己当心，石缝里常有蛇；日落后天很快黑，记得环线 20:30 关门",
      "往前一点的 Rincon Mountains Overlook 路边小停车点只能停两辆车，也是看日落的地方",
    ],
    photoFile: "Saguaro National Park East, Arizona, USA 2024 6.jpg",
  },
  {
    id: "sagu-freeman-homestead",
    park: "sagu",
    nameZh: "Freeman 家园步道",
    nameEn: "Freeman Homestead Trail",
    kind: "hike",
    area: "east",
    lat: 32.16522,
    lon: -110.72605,
    durationMin: 45,
    trail: { loop: true },
    hike: { distanceMi: 1, gainFt: 100, difficulty: "easy", loop: true },
    bestTime: ["morning"],
    summary:
      "约 1.6 公里的小环线，经过 1930 年代 Freeman 一家住过的土坯房遗址（只剩墙基），再下到一条长着牧豆树和大巨人柱的干河床，树荫比别的步道多，常能看到鸟和野生动物。路边有解说牌讲当年的沙漠拓荒生活。",
    tips: [
      "步道口在环线入口前的双向路段（往 Javelina 野餐区方向），不用开整个环线也能来",
      "河床里有不少踩出来的岔路，跟着石头和金属路标走",
    ],
  },
  {
    id: "sagu-tanque-verde-ridge",
    park: "sagu",
    nameZh: "Tanque Verde 山脊步道（观景点）",
    nameEn: "Tanque Verde Ridge Trail (to the overlook)",
    kind: "hike",
    area: "east",
    lat: 32.16135,
    lon: -110.71423,
    start: { lat: 32.16556, lon: -110.72393, nameZh: "Javelina 野餐区的 Tanque Verde Ridge 步道口" },
    durationMin: 60,
    trail: { via: [{ lat: 32.16135, lon: -110.71423 }] },
    hike: { distanceMi: 1.2, gainFt: 100, difficulty: "easy" },
    bestTime: ["sunset"],
    summary:
      "林孔山主脊的登山步道，全长约 18 公里一直通到山上；一般游客只走开头约 1 公里，爬升约 30 米到一处岩石观景点，回头看整片仙人掌林和图森盆地，日落时很漂亮。想多走可以继续往上，沿途从沙漠灌丛换到草地和杜松林。",
    tips: [
      "Javelina 野餐区在环线入口前的双向路段尽头，有厕所和遮阳亭",
      "往上走得远的话没有水源也没有树荫，夏天别走；到山上 Juniper Basin 营地单程约 11 公里、爬升约 900 米，要背包过夜许可",
    ],
    photoFile: "Hiking high in January (31680891573).jpg",
  },
  {
    id: "sagu-bridal-wreath-falls",
    park: "sagu",
    nameZh: "Bridal Wreath 瀑布",
    nameEn: "Bridal Wreath Falls via Douglas Spring Trail",
    kind: "waterfall",
    area: "east",
    lat: 32.2272,
    lon: -110.65058,
    start: { lat: 32.23513, lon: -110.68684, nameZh: "Douglas Spring 步道口（Speedway Blvd 东头尽头）" },
    durationMin: 210,
    trail: { via: [{ lat: 32.2272, lon: -110.65058 }] },
    hike: { distanceMi: 5.9, gainFt: 1100, difficulty: "moderate" },
    bestTime: ["morning"],
    bestMonths: [1, 2, 3],
    summary:
      "从东区北边的 Douglas Spring 步道口沿山坡一路爬升，穿过巨人柱和草坡，再拐进一条小峡谷，尽头是一道从岩壁上分几层流下的小瀑布，往返约 9.5 公里、爬升约 350 米。冬春雨雪后才有水，旱季常常只剩岩壁上的水痕。",
    tips: [
      "步道口在图森东边 Speedway Blvd 的尽头，不在 Cactus Forest 环线上，从东区游客中心开过去约 25 分钟",
      "1–3 月下过雨雪后去最有可能看到流水；夏天太热、季风季峡谷有山洪危险",
      "沿途几乎没有树荫，带足水；步道口停车位不多，周末早点到",
    ],
    photoFile: "Bridal Wreath Falls in the Rincon Mountains.jpg",
  },

  // ===== 园外 · Sabino Canyon =====
  {
    id: "sagu-sabino-canyon",
    park: "sagu",
    nameZh: "Sabino Canyon（萨比诺峡谷）",
    nameEn: "Sabino Canyon Recreation Area",
    kind: "experience",
    area: "sabino",
    lat: 32.3365,
    lon: -110.7895,
    start: { lat: 32.31006, lon: -110.82229, nameZh: "Sabino Canyon 游客中心和接驳车站" },
    durationMin: 150,
    outsidePark: true,
    bestTime: ["morning"],
    bestMonths: [11, 12, 1, 2, 3, 4],
    summary:
      "图森东北角、圣卡塔利娜山脚下的峡谷，归科罗纳多国家森林管。一条不让私家车开的山谷公路沿着溪水往里伸约 6 公里，两边是长满巨人柱的陡壁；坐有讲解的电动接驳车（Sabino Canyon Crawler）开到峡谷深处，再沿路或步道慢慢走下来，冬春溪里有水、河边有大树，是图森人最爱的郊游地。",
    tips: [
      "停车要买国家森林日票（每车 $8，国家公园年卡可用）；接驳车另外买票（成人 $15、3–12 岁 $8），在 sabinocanyoncrawler.com 提前订，旺季周末常售罄",
      "接驳车 9:00–16:00 每小时一班，提前 15 分钟到上车点，旺季停车再多留半小时；下过雨水大时只开到第 2 站和 Sabino Dam 一带",
      "不想坐车可以走 Phoneline 步道或沿公路走进去；夏天峡谷里很热，早上来",
    ],
    photoFile: "Sabino Canyon, 2002.jpg",
  },
];
