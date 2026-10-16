import type { Attraction } from "./types";

// 2023 年起在园内任何地方停车超过 15 分钟都要买停车证（Parking Tag），国家公园年卡不能代替
const PARKING_TAG = "停车超过 15 分钟要挂停车证（每天 $5、每周 $15、全年 $40），国家公园年卡不能代替；只认纸质证，手机截图不算";
// Kuwohi 路（原 Clingmans Dome Road）2026 年 4 月 1 日到 11 月 29 日开放，冬季关闭
const KUWOHI_ROAD = [4, 5, 6, 7, 8, 9, 10, 11];
const KUWOHI_CLOSED =
  "Kuwohi 路（约 11 公里）每年大约 12 月到 3 月关闭（2026 年开放 4 月 1 日到 11 月 29 日），开放季里遇冰雪也会临时封；冬天只能从 Newfound Gap 旁的路口沿封闭的路面走或滑雪进去，单程约 11 公里。可以改去 Newfound Gap 看山景。";
const KUWOHI_PARKING = { lat: 35.55684, lon: -83.49488, nameZh: "Kuwohi 停车场（路的尽头）" };
// Roaring Fork Motor Nature Trail 2026 年 4 月 17 日到 11 月 29 日开放（NPS 季节性道路表），单行、窄陡，禁止大车和拖车
const ROARING_FORK = [4, 5, 6, 7, 8, 9, 10, 11];
const ROARING_FORK_CLOSED =
  "Roaring Fork Motor Nature Trail 冬季关闭，一般 4 月中下旬到 11 月底开放（2026 年是 4 月 17 日到 11 月 29 日）；这段时间可以去路口前的 Rainbow Falls 步道（Cherokee Orchard 路全年开到步道口），或者走 Noah “Bud” Ogle 农舍的小环线。";
const NEWFOUND_GAP_PARKING = { lat: 35.61063, lon: -83.42576, nameZh: "Newfound Gap 停车场" };
const CADES_COVE_WED =
  "5 月初到 9 月底的每个周三（2026 年是 5 月 6 日到 9 月 30 日）Cades Cove 环路全天禁止机动车，只能走路或骑车进去";

export const greatSmokyMountains: Attraction[] = [
  // ===== Sugarlands · Roaring Fork（Gatlinburg 入口）=====
  {
    id: "grsm-sugarlands-vc",
    park: "grsm",
    nameZh: "Sugarlands 游客中心",
    nameEn: "Sugarlands Visitor Center",
    kind: "visitor",
    area: "sugarlands",
    lat: 35.68565,
    lon: -83.53654,
    durationMin: 30,
    hours: [
      { open: "09:00", close: "17:00", months: [3, 4, 5, 6, 7, 8, 9, 10, 11] },
      { open: "09:00", close: "16:30", months: [12, 1, 2] },
    ],
    summary:
      "从 Gatlinburg 进园第一站，田纳西一侧的公园总部：有大烟山动植物的标本展、介绍影片、书店，可以买停车证、问路况和步道情况；门口就是 Sugarlands 谷地自然步道和去 Cataract Falls 的小路。",
    tips: [
      "每天 9:00–17:00（12–2 月到 16:30），只有圣诞节关门；停车证在这里和门口的自动售卖机都能买",
      "进 Gatlinburg 方向的 441 号公路秋季和夏季周末常堵，早上 9 点前或傍晚进出",
      "园内几乎没有手机信号，在这里下载好离线地图和 NPS App",
    ],
    photoFile: "Sugarlands Visitor Center, May 2018--Andrea Walton (29111144268).jpg",
  },
  {
    id: "grsm-laurel-falls",
    park: "grsm",
    nameZh: "Laurel Falls 瀑布",
    nameEn: "Laurel Falls",
    kind: "waterfall",
    area: "sugarlands",
    lat: 35.6775,
    lon: -83.59313,
    start: { lat: 35.67193, lon: -83.5805, nameZh: "Laurel Falls 步道口（Fighting Creek Gap）" },
    durationMin: 90,
    trail: { via: [{ lat: 35.6775, lon: -83.59313 }] },
    hike: { distanceMi: 2.6, gainFt: 400, difficulty: "easy" },
    openMonths: [],
    closedNote:
      "2025 年 1 月 6 日起关闭整修（加宽重铺步道、在瀑布前修观景平台、扩建停车场），原计划 18 个月，施工中碰到意外的地质情况改了设计，NPS 现在说要到 2027 年才重开、没给具体日期。想看瀑布可以改走 Rainbow Falls、Grotto Falls，或者 Little River 路边的 The Sinks。",
    bestMonths: [4, 5, 6],
    summary:
      "公园里最热门的瀑布步道，以前每年 30 多万人走：一条约 2 公里的铺装小路通到两层、共约 24 米高的瀑布，步道从瀑布中间穿过。",
    tips: ["整修完以后停车位会多一些（约 50 个），但仍是最难停车的步道口之一，早到", PARKING_TAG],
    photoFile: "Laurel Falls Kaldari.jpg",
  },
  {
    id: "grsm-rainbow-falls",
    park: "grsm",
    nameZh: "Rainbow Falls 瀑布步道",
    nameEn: "Rainbow Falls Trail",
    kind: "hike",
    area: "sugarlands",
    lat: 35.66234,
    lon: -83.46344,
    start: { lat: 35.67576, lon: -83.48544, nameZh: "Rainbow Falls 步道口停车场（Cherokee Orchard 路）" },
    durationMin: 240,
    trail: {
      via: [
        { lat: 35.66965, lon: -83.4811 },
        { lat: 35.66284, lon: -83.47133 },
        { lat: 35.66234, lon: -83.46344 },
      ],
    },
    hike: { distanceMi: 5.6, gainFt: 1500, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [4, 5, 6, 10],
    summary:
      "沿 LeConte 溪一路上坡穿过老林，终点是约 24 米高的 Rainbow Falls，下午阳光照进水雾常能看到彩虹，是公园里落差最大的单级瀑布之一。往返约 9 公里、爬升约 450 米，比 Laurel Falls 累得多，但人也少一些。",
    tips: [
      "步道口在 Gatlinburg 镇边的 Cherokee Orchard 路上，全年都能开到；停车位不多，周末早上 9 点前到",
      "2026 年 10 月因为黑熊活动频繁，Cherokee Orchard 路从公园边界到 Ogle 农舍一段不许步行，开车经过时不要下车",
      "瀑布附近石头长青苔很滑，冬天会结冰，不要爬到瀑布上",
    ],
    photoFile: "Rainbow Falls View.jpg",
  },
  {
    id: "grsm-roaring-fork",
    park: "grsm",
    nameZh: "Roaring Fork 自然观光路",
    nameEn: "Roaring Fork Motor Nature Trail",
    kind: "drive",
    area: "sugarlands",
    lat: 35.71098,
    lon: -83.48336,
    start: { lat: 35.68347, lon: -83.49051, nameZh: "Noah “Bud” Ogle 农舍停车场（Cherokee Orchard 路）" },
    durationMin: 75,
    openMonths: ROARING_FORK,
    closedNote: ROARING_FORK_CLOSED,
    bestMonths: [4, 5, 10],
    mustSee: true,
    summary:
      "紧贴 Gatlinburg 的一条约 9 公里单行山路，在老林、溪流和巨石之间盘旋，沿路有保存下来的山民木屋、磨坊和 Alfred Reagan 的老宅；快到出口的“千滴瀑”（Place of a Thousand Drips）雨后从岩壁上同时淌下上百道细流。",
    tips: [
      "单行道，只能从 Cherokee Orchard 路进、最后回到 Gatlinburg 东边出来；禁止大巴、房车和拖车",
      "路窄弯多，开得慢，算上停车看木屋留 1–1.5 小时；Grotto Falls 的步道口也在这条路上",
      "傍晚常看到黑熊在路边找吃的，留在车里拍，不要下车靠近",
    ],
    photoFile: "Roaring Fork Motor Nature Trail - March 2024 - Sarah Stierch 03.jpg",
  },
  {
    id: "grsm-grotto-falls",
    park: "grsm",
    nameZh: "Grotto Falls 瀑布",
    nameEn: "Grotto Falls (Trillium Gap Trail)",
    kind: "waterfall",
    area: "sugarlands",
    lat: 35.67387,
    lon: -83.44956,
    start: { lat: 35.68026, lon: -83.46267, nameZh: "Trillium Gap 步道口（Roaring Fork 路上）" },
    durationMin: 120,
    hike: { distanceMi: 2.6, gainFt: 600, difficulty: "moderate" },
    openMonths: ROARING_FORK,
    closedNote: ROARING_FORK_CLOSED,
    bestMonths: [5, 6, 7, 10],
    summary:
      "公园里唯一能从瀑布后面穿过去的瀑布：沿 Trillium Gap 步道在铁杉和杜鹃林里走约 2 公里，约 8 米高的水帘从岩檐上落下，步道正好从水帘后面绕过。",
    tips: [
      "步道口在单行的 Roaring Fork 路上，停车位少、常停满；周末早上来，或者坐授权的徒步接驳车",
      "途中要踩石头过几条小溪，雨后很滑；这条路也是去 LeConte Lodge 的补给路线，可能碰到驮东西的羊驼队",
      "NPS 2026 年 10 月对这条步道发了黑熊出没提醒，结伴走、不带吃的气味外露",
    ],
    photoFile: "Grotto-falls-gsmnp1.jpg",
  },

  // ===== Newfound Gap 公路 · 主脊 =====
  {
    id: "grsm-newfound-gap",
    park: "grsm",
    nameZh: "Newfound Gap 山口",
    nameEn: "Newfound Gap",
    kind: "viewpoint",
    area: "newfound-gap",
    lat: 35.61109,
    lon: -83.4246,
    start: NEWFOUND_GAP_PARKING,
    durationMin: 20,
    bestTime: ["morning", "sunset"],
    bestMonths: [5, 6, 9, 10],
    mustSee: true,
    summary:
      "横穿公园的 441 号公路（Newfound Gap Road）的最高点，海拔约 1,540 米，正好是田纳西和北卡的州界，也是阿巴拉契亚步道穿过公路的地方。观景台上能看到北卡一侧层层叠叠的山脊，1940 年罗斯福总统在这里的洛克菲勒纪念台宣布公园成立。",
    tips: [
      "山口比 Gatlinburg 凉 8–10°C，山下下雨这里可能在下雪，夏天也带件外套",
      "从 Gatlinburg 开过来约 40 分钟、从 Cherokee 约 35 分钟；冬天遇冰雪整条公路会临时封闭，出发前看 NPS 的路况推特或电话 865-436-1200",
      "去 Kuwohi 的路口在山口往北卡方向约 200 米",
    ],
    photoFile: "Newfound Gap - October 2023 - Sarah Stierch 02.jpg",
  },
  {
    id: "grsm-kuwohi",
    park: "grsm",
    nameZh: "Kuwohi 观景塔（原 Clingmans Dome）",
    nameEn: "Kuwohi Observation Tower (formerly Clingmans Dome)",
    kind: "viewpoint",
    area: "newfound-gap",
    lat: 35.56292,
    lon: -83.49839,
    start: KUWOHI_PARKING,
    durationMin: 60,
    trail: { via: [{ lat: 35.56292, lon: -83.49839 }] },
    hike: { distanceMi: 1.0, gainFt: 330, difficulty: "moderate" },
    bestTime: ["sunset", "sunrise"],
    openMonths: KUWOHI_ROAD,
    closedNote: KUWOHI_CLOSED,
    bestMonths: [5, 6, 9, 10],
    mustSee: true,
    summary:
      "公园最高点（海拔 2,025 米），也是田纳西州最高点。从停车场沿陡峭的铺装路走约 800 米上山，顶上一座 1959 年建的飞碟形观景塔，绕着螺旋坡道上去，天气好时 360 度能看出 100 多公里。2024 年 9 月按切罗基人的叫法正式改名 Kuwohi（“桑葚之地”）。",
    tips: [
      "坡很陡，慢慢走；山顶常年起雾、比山下冷 5–10°C，带外套",
      "看日落最热门，秋天周末停车场早早就满；看日出也行，但要摸黑开 11 公里山路",
      "路尽头的小游客中心 4 月到 11 月开（9:00–17:00，7–8 月到 18:00），冬天关闭",
    ],
    photoFile: "Clingmans Dome observation tower TN2.jpg",
  },
  {
    id: "grsm-andrews-bald",
    park: "grsm",
    nameZh: "Andrews Bald 高山草甸",
    nameEn: "Andrews Bald (Forney Ridge Trail)",
    kind: "hike",
    area: "newfound-gap",
    lat: 35.53907,
    lon: -83.49433,
    start: KUWOHI_PARKING,
    durationMin: 150,
    trail: {
      via: [
        { lat: 35.55082, lon: -83.49141 },
        { lat: 35.54164, lon: -83.49435 },
        { lat: 35.53907, lon: -83.49433 },
      ],
    },
    hike: { distanceMi: 3.6, gainFt: 1100, difficulty: "moderate" },
    openMonths: KUWOHI_ROAD,
    closedNote: KUWOHI_CLOSED,
    bestMonths: [6, 7, 9, 10],
    summary:
      "从 Kuwohi 停车场沿 Forney Ridge 步道往下走约 3 公里，到公园里最高的一片“秃顶”草甸：山顶没有树，一大片草坡朝南敞开，远处是 Fontana 湖。6 月中下旬火焰杜鹃和卡托巴杜鹃开花最好看。",
    tips: [
      "先下坡后上坡，回程一路爬坡比去的时候累得多；上半段乱石台阶多",
      "和 Kuwohi 共用停车场，夏秋周末一早就紧张",
      "步道不许带宠物；草甸上风大，带防风外套",
    ],
    photoFile: "Andrews Bald, Forney Ridge Trail--Andrea Walton, July 2020 (50133790816).jpg",
  },
  {
    id: "grsm-alum-cave",
    park: "grsm",
    nameZh: "Alum Cave 步道",
    nameEn: "Alum Cave Trail (to Alum Cave Bluffs)",
    kind: "hike",
    area: "newfound-gap",
    lat: 35.63877,
    lon: -83.44593,
    start: { lat: 35.62954, lon: -83.4516, nameZh: "Alum Cave 步道口停车场（441 号公路边）" },
    durationMin: 180,
    trail: {
      via: [
        { lat: 35.63225, lon: -83.44206 },
        { lat: 35.63644, lon: -83.43812 },
        { lat: 35.63877, lon: -83.44593 },
      ],
    },
    hike: { distanceMi: 4.6, gainFt: 1100, difficulty: "moderate" },
    bestTime: ["morning"],
    bestMonths: [4, 5, 6, 9, 10],
    mustSee: true,
    summary:
      "大烟山最受欢迎的中等难度步道：先沿溪流在老林里走，穿过天然石拱 Arch Rock 的石阶，再爬到 Inspiration Point 看对面山脊，终点是约 23 米高的大岩檐 Alum Cave Bluffs，下雨天底下也是干的。体力好的可以继续上到 LeConte 山顶（往返约 18 公里）。",
    tips: [
      "停车场是公园里最早停满的之一，夏秋周末早上 8 点前到，或者坐授权的徒步接驳车",
      "冬天岩檐上挂冰柱、会往下掉，步道结冰时要带冰爪",
      "Arch Rock 一段是凿在岩石里的陡台阶，有钢缆扶手，下雨很滑",
    ],
    photoFile: "Alum-cave-bluffs-tn1.jpg",
  },
  {
    id: "grsm-chimney-tops",
    park: "grsm",
    nameZh: "Chimney Tops 步道",
    nameEn: "Chimney Tops Trail",
    kind: "hike",
    area: "newfound-gap",
    lat: 35.627,
    lon: -83.4787,
    start: { lat: 35.63551, lon: -83.46971, nameZh: "Chimney Tops 步道口停车场（441 号公路边）" },
    durationMin: 180,
    trail: {
      via: [
        { lat: 35.62967, lon: -83.46943 },
        { lat: 35.62521, lon: -83.47029 },
        { lat: 35.62346, lon: -83.47858 },
        { lat: 35.627, lon: -83.4787 },
      ],
    },
    hike: { distanceMi: 3.5, gainFt: 1400, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [4, 5, 9, 10],
    summary:
      "短而陡的经典步道：头 1 公里沿溪流过几座木桥，之后几乎一路石阶往上，约 2.8 公里爬升约 430 米，到观景点正对两座尖尖的岩石“烟囱”。2016 年山火烧过山顶，之后步道重修，最后一段攀到岩顶的路至今关闭，只能到观景点。",
    tips: [
      "不要翻过观景点的栏杆爬“烟囱”，2016 年山火就是从这里开始的，岩顶松散危险",
      "停车场不大，周末早到；441 号公路上去 Newfound Gap 的车多，路边不许乱停",
      "台阶多、下坡伤膝盖，带登山杖",
    ],
    photoFile: "Chimney Tops viewed from Chimney Tops overlook, May 2017.jpg",
  },
  {
    id: "grsm-charlies-bunion",
    park: "grsm",
    nameZh: "Charlies Bunion（阿巴拉契亚步道）",
    nameEn: "Charlies Bunion via the Appalachian Trail",
    kind: "hike",
    area: "newfound-gap",
    lat: 35.63835,
    lon: -83.37174,
    start: NEWFOUND_GAP_PARKING,
    durationMin: 300,
    trail: {
      via: [
        { lat: 35.6157, lon: -83.415 },
        { lat: 35.62624, lon: -83.39204 },
        { lat: 35.63835, lon: -83.37174 },
      ],
    },
    hike: { distanceMi: 8.0, gainFt: 1640, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [5, 6, 9, 10],
    summary:
      "从 Newfound Gap 沿阿巴拉契亚步道（AT）在主脊上往东走约 6.4 公里，终点是一块突出在悬崖边的光秃岩石，脚下是几百米深的山谷，对面是 LeConte 山和层层山脊。一路在 1,600–1,800 米的冷杉林里，可以顺便体验一段 AT。",
    tips: [
      "往返约 13 公里，至少留 5 小时；中途 Icewater Spring 避难屋附近有厕所和水源（要过滤）",
      "岩石边缘没有栏杆、风大，雾天和结冰时不要靠近崖边",
      "Newfound Gap 停车场夏秋周末中午前就很满，早上出发",
    ],
    photoFile: "Charlies-bunion-protrusion.jpg",
  },

  // ===== Little River 路 · Elkmont =====
  {
    id: "grsm-elkmont",
    park: "grsm",
    nameZh: "Elkmont 历史区（Daisy Town）",
    nameEn: "Elkmont Historic District (Daisy Town)",
    kind: "landmark",
    area: "elkmont",
    lat: 35.65403,
    lon: -83.58173,
    durationMin: 45,
    bestMonths: [5, 6, 10],
    summary:
      "20 世纪初的伐木小镇，后来成了诺克斯维尔富人的避暑地。公园修复了 Appalachian Clubhouse 和 Daisy Town 一排十几栋度假小木屋，可以进屋看；旁边是园内最大的 Elkmont 营地，5 月底到 6 月初这里有闻名的同步萤火虫（要抽签）。",
    tips: [
      "从 Little River 路拐进 Elkmont 路约 2.5 公里；小木屋白天开放，自己逛",
      "Jakes Creek 和 Little River 步道从这里出发，沿河平缓好走，适合带孩子",
      "萤火虫观赏期间（2026 年是 5 月 20–27 日）傍晚 Elkmont 路只放中签的车和营地客人进",
    ],
    photoFile: "Appalachian-club-elkmont-tn1.jpg",
  },
  {
    id: "grsm-the-sinks",
    park: "grsm",
    nameZh: "The Sinks 急流",
    nameEn: "The Sinks",
    kind: "waterfall",
    area: "elkmont",
    lat: 35.66922,
    lon: -83.6624,
    start: { lat: 35.66953, lon: -83.66219, nameZh: "The Sinks 停车场（Little River 路边）" },
    durationMin: 15,
    bestMonths: [4, 5, 6, 10],
    summary:
      "Little River 路边下车就能看的一段急流和小瀑布：当年伐木工用炸药炸开卡住的原木，把河道炸出一个急弯，河水从石缝里翻滚落进深潭。从 Gatlinburg 往 Cades Cove 走正好经过。",
    tips: [
      "这里淹死过不少人，水下暗流和石头很危险，只在观景台看，不要跳水",
      "没有路牌，在 Metcalf Bottoms 野餐区往西约 1.6 公里的左手边，停车场很小",
      "雨后水量最大最好看；旁边有一小段步道通到上游的 Meigs Creek",
    ],
    photoFile: "The Sinks, Great Smoky Mountains National Park.jpg",
  },

  // ===== Cades Cove =====
  {
    id: "grsm-cades-cove",
    park: "grsm",
    nameZh: "Cades Cove 环路",
    nameEn: "Cades Cove Loop Road",
    kind: "drive",
    area: "cades-cove",
    lat: 35.5974,
    lon: -83.80962,
    start: { lat: 35.60652, lon: -83.77647, nameZh: "Cades Cove 环路入口（营地商店旁）" },
    durationMin: 180,
    bestTime: ["morning", "sunset"],
    bestMonths: [5, 6, 9, 10],
    mustSee: true,
    summary:
      "群山环抱的一片开阔山谷，一条约 18 公里的单行环路绕谷一圈：草地上常见白尾鹿、野火鸡，傍晚还有黑熊；路边保存着 19 世纪移民留下的三座教堂、木屋和谷仓，中途的 Cable Mill 一带有至今还在转的水车磨坊和游客中心。",
    tips: [
      `环路每天日出到日落开放；${CADES_COVE_WED}`,
      "夏秋和周末车多，一看到熊就整条路堵住，绕一圈常要 2–4 小时；最好日出时进去，傍晚也不错",
      "中途 Cable Mill 游客中心 9:00–17:00（12–2 月到 16:30）；磨坊 3 月中到 11 月底开放；环路中段有两条近道可以提前出去",
    ],
    photoFile: "Cades Cove - October 2023 - Sarah Stierch 03.jpg",
  },
  {
    id: "grsm-abrams-falls",
    park: "grsm",
    nameZh: "Abrams Falls 瀑布步道",
    nameEn: "Abrams Falls Trail",
    kind: "hike",
    area: "cades-cove",
    lat: 35.60896,
    lon: -83.87981,
    start: { lat: 35.59117, lon: -83.85242, nameZh: "Abrams Falls 步道口（Cades Cove 环路西端的砂石支路）" },
    durationMin: 180,
    trail: {
      via: [
        { lat: 35.59708, lon: -83.85961 },
        { lat: 35.60362, lon: -83.86621 },
        { lat: 35.60896, lon: -83.87981 },
      ],
    },
    hike: { distanceMi: 5.0, gainFt: 650, difficulty: "moderate" },
    bestTime: ["morning"],
    bestMonths: [4, 5, 6, 10],
    summary:
      "从 Cades Cove 环路最西头出发，沿 Abrams 溪在松林和杜鹃丛里上上下下约 4 公里，到一道只有约 8 米高、但水量极大的宽瀑布，下面是一个很深的水潭。瀑布不高，但水量是公园里数一数二的。",
    tips: [
      "要先开进 Cades Cove 环路才能到步道口，环路车多时光开过去就要 1 小时；周三机动车禁行的日子开不进去",
      "水潭有暗流，淹死过人，NPS 强烈不建议下水",
      "停车场常满，早上来；2026 年 8–9 月沿途换过老旧的木桥（当时周一到周四封步道），现在全周开放",
    ],
    photoFile: "Abrams Falls, February 2018--Darlene Leach (28340860089).jpg",
  },

  // ===== Oconaluftee（北卡 Cherokee 入口）=====
  {
    id: "grsm-oconaluftee",
    park: "grsm",
    nameZh: "Oconaluftee 游客中心 · 山地农庄博物馆",
    nameEn: "Oconaluftee Visitor Center & Mountain Farm Museum",
    kind: "visitor",
    area: "oconaluftee",
    lat: 35.51308,
    lon: -83.3061,
    durationMin: 60,
    hours: [
      { open: "09:00", close: "17:00", months: [3, 4, 5, 6, 7, 8, 9, 10, 11] },
      { open: "09:00", close: "16:30", months: [12, 1, 2] },
    ],
    bestTime: ["morning", "sunset"],
    bestMonths: [5, 9, 10],
    mustSee: true,
    summary:
      "北卡一侧的主游客中心，后面是露天的山地农庄博物馆：一座 1900 年前后的原木农舍和谷仓、熏肉房、苹果屋、铁匠铺，展示阿巴拉契亚山民怎么过日子。旁边的河边草地是看麋鹿最方便的地方，清早和傍晚常有一群在吃草。",
    tips: [
      "游客中心每天 9:00–17:00（12–2 月到 16:30），农庄博物馆白天开放、免费",
      "麋鹿体型很大，园规是至少离 25 码（约 23 米）、不能惊扰它们；9–10 月发情期公鹿有攻击性，离得再远些、留在车边",
      "沿 Oconaluftee 河步道往南走约 2.4 公里到 Cherokee 镇，是园里少数许可遛狗、骑车的步道",
    ],
    photoFile: "Smoky Mountains Elk near Oconaluftee (4055710036).jpg",
  },
  {
    id: "grsm-mingus-mill",
    park: "grsm",
    nameZh: "Mingus 磨坊",
    nameEn: "Mingus Mill",
    kind: "landmark",
    area: "oconaluftee",
    lat: 35.52011,
    lon: -83.3098,
    start: { lat: 35.52097, lon: -83.30902, nameZh: "Mingus Mill 停车场" },
    durationMin: 20,
    summary:
      "1886 年建的磨坊，用水轮机（不是大水车）带动磨盘，长长的木水槽把溪水引到磨坊，是园里保存最好的老磨坊之一。在 Oconaluftee 游客中心往北约 800 米。",
    tips: [
      "2026 年磨坊内部因保护修缮暂时关闭，没有公布重开日期；外面的木水槽和建筑照样能看",
      "平时 3 月中到 11 月有人现场演示磨玉米面，重开后再来看",
      "停车场到磨坊走几分钟，过一座小桥",
    ],
    photoFile: "Mingus Mill, Cherokee, NC.jpg",
  },

  // ===== Deep Creek（Bryson City）=====
  {
    id: "grsm-deep-creek",
    park: "grsm",
    nameZh: "Deep Creek 三瀑布环线",
    nameEn: "Deep Creek Waterfalls (Juney Whank, Tom Branch, Indian Creek)",
    kind: "hike",
    area: "deep-creek",
    lat: 35.47273,
    lon: -83.42727,
    start: { lat: 35.46429, lon: -83.43471, nameZh: "Deep Creek 步道口停车场（营地北头）" },
    durationMin: 120,
    trail: {
      via: [
        { lat: 35.4666, lon: -83.42986 },
        { lat: 35.47273, lon: -83.42727 },
        { lat: 35.46632, lon: -83.43489 },
      ],
      loop: true,
    },
    hike: { distanceMi: 2.4, gainFt: 450, difficulty: "easy" },
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    summary:
      "Bryson City 旁边一条轻松的环线，一次看三道瀑布：从对岸看约 18 米高、分级落进 Deep Creek 的 Tom Branch Falls，沿宽阔的老路到约 8 米高、落进大水潭的 Indian Creek Falls，回程绕上山坡，从木桥上近看 Juney Whank Falls。",
    tips: [
      "夏天 Deep Creek 是坐轮胎漂流（tubing）的热门地方，镇上入口外有很多租轮胎的店；水冷、春天水急，小孩要穿救生衣",
      "停车场在营地北头，夏季周末下午很满",
      "Juney Whank 那段是窄陡的山坡小路，雨后泥滑",
    ],
  },

  // ===== Cataloochee 谷 =====
  {
    id: "grsm-cataloochee",
    park: "grsm",
    nameZh: "Cataloochee 谷看麋鹿",
    nameEn: "Cataloochee Valley (Elk Viewing)",
    kind: "experience",
    area: "cataloochee",
    lat: 35.62877,
    lon: -83.10751,
    durationMin: 120,
    bestTime: ["morning", "sunset"],
    bestMonths: [5, 9, 10],
    summary:
      "公园东北角一片偏僻的高山谷地，2001 年麋鹿重新引进的地方，清早和傍晚草地上常有几十头麋鹿；谷里保存着 20 世纪初的学校、教堂和农舍，Palmer 礼拜堂前的草地就是看鹿的地方。比 Cades Cove 安静得多。",
    tips: [
      "2024 年飓风 Helene 冲毁了谷里上段的路，2025 年 4 月起只开放到 Beech Grove 学校，再往里（Caldwell 农舍一带）只能步行，到 2026 年秋天还没修好",
      "从 I-40 第 20 号出口进来，最后约 5 公里是窄而弯的砂石山路，会车要停让，不适合房车；Maggie Valley 过来约 45 分钟",
      "9–10 月发情期能听到公鹿嘶鸣，也最危险；园规是至少离 25 码（约 23 米），留在车边；5–6 月产仔期母鹿护崽，不要走进草地",
    ],
    photoFile: "Elk Herd in Cataloochee - panoramio.jpg",
  },

  // ===== 园外：Gatlinburg · Pigeon Forge =====
  {
    id: "grsm-gatlinburg-skybridge",
    park: "grsm",
    nameZh: "Gatlinburg 空中吊桥（SkyBridge）",
    nameEn: "Gatlinburg SkyBridge (SkyPark)",
    kind: "experience",
    area: "gatlinburg",
    lat: 35.71532,
    lon: -83.52112,
    start: { lat: 35.71184, lon: -83.51836, nameZh: "SkyLift 缆车站（Gatlinburg 主街 765 Parkway）" },
    durationMin: 90,
    outsidePark: true,
    bestTime: ["afternoon", "sunset"],
    bestMonths: [5, 6, 9, 10],
    summary:
      "从 Gatlinburg 主街坐老式双人缆椅上 Crockett 山，山顶有一座约 210 米长的人行吊桥，号称北美最长的人行悬索桥，中间几段是玻璃桥面，脚下是山谷；站在山顶能看到整个 Gatlinburg 和背后的大烟山。",
    tips: [
      "私营景点，门票含缆车、吊桥和观景台，成人 30 多到 40 多美元（各渠道不同，以官网为准），5 岁以下免费",
      "傍晚上去能看日落和镇上的灯光；秋季周末排队较久，网上提前买票",
      "镇上停车要收费，住在镇上的走路过去最方便",
    ],
    photoFile: "SkyBridge at Gatlingburg SkyPark - 3.jpg",
  },

  // ===== 园外：蓝岭公路（北卡段）=====
  {
    id: "grsm-waterrock-knob",
    park: "grsm",
    nameZh: "Waterrock Knob 观景点（蓝岭公路）",
    nameEn: "Waterrock Knob (Blue Ridge Parkway MP 451)",
    kind: "viewpoint",
    area: "parkway",
    lat: 35.46412,
    lon: -83.13766,
    start: { lat: 35.46033, lon: -83.14078, nameZh: "Waterrock Knob 游客中心停车场（里程碑 451.2）" },
    durationMin: 45,
    trail: { via: [{ lat: 35.46215, lon: -83.14029 }, { lat: 35.46412, lon: -83.13766 }] },
    outsidePark: true,
    bestTime: ["sunset", "sunrise"],
    openMonths: [4, 5, 6, 7, 8, 9, 10, 11],
    closedNote:
      "蓝岭公路 Balsam Gap 到 Cherokee 这段海拔高，冬天常因冰雪封路（不是固定日期，有时一封几周）；封路期间可以在 Oconaluftee 一带看山景。",
    bestMonths: [5, 6, 9, 10],
    summary:
      "蓝岭公路上离大烟山最近的高处观景点，停车场海拔约 1,740 米，往西能看到大烟山主脊一层层排开，看日落很出名。想走远一点，从停车场爬约 900 米到 Waterrock Knob 山顶（海拔约 1,920 米）。",
    tips: [
      "从 Cherokee 沿蓝岭公路开约 40 分钟；蓝岭公路是 NPS 另一个单位，不收费，也不用大烟山的停车证",
      "停车场有个小游客中心（季节性开放）和厕所",
      "上山顶那段是陡的石头路，单程约 20–30 分钟",
    ],
    photoFile: "Waterrock Knob viewed from the Plott Balsams overlook, May 2017 3.jpg",
  },
  {
    id: "grsm-craggy-gardens",
    park: "grsm",
    nameZh: "Craggy Gardens（蓝岭公路）",
    nameEn: "Craggy Gardens & Craggy Pinnacle (Blue Ridge Parkway MP 364)",
    kind: "viewpoint",
    area: "parkway",
    lat: 35.70325,
    lon: -82.3774,
    start: { lat: 35.70425, lon: -82.37364, nameZh: "Craggy Dome 观景点停车场（Craggy Pinnacle 步道口）" },
    durationMin: 60,
    trail: { via: [{ lat: 35.70325, lon: -82.3774 }] },
    outsidePark: true,
    bestTime: ["sunset", "morning"],
    openMonths: [4, 5, 6, 7, 8, 9, 10, 11],
    closedNote:
      "阿什维尔以北这段蓝岭公路海拔高，冬天常因冰雪封路（一般 12 月到 3 月，不是固定日期）；Helene 之后 Craggy Gardens 到阿什维尔一段已经修好重开，再往北（里程碑 344–355）到 2026 年 10 月还关着。",
    bestMonths: [6, 10],
    summary:
      "阿什维尔东北约 40 分钟的高山杜鹃园，6 月中下旬整片山坡的卡托巴杜鹃开成粉紫色。从 Craggy Dome 观景点走约 1.1 公里（往返）上 Craggy Pinnacle 小山顶，360 度看蓝岭的群山，日落很漂亮。",
    tips: [
      "这里离大烟山约 2 小时车程，适合坐 AVL 进出、在阿什维尔住一晚时顺路去",
      "山顶风大、比阿什维尔冷 10°C 左右，带外套",
      "旁边的 Craggy Gardens 游客中心有厕所，季节性开放",
    ],
    photoFile: "Craggy Pinnacle, October 2016.jpg",
  },
];
