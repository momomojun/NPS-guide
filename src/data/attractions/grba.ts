import type { Attraction } from "./types";

// 大盆地国家公园（grba）。坐标按 NPS API places、Recreation.gov 和 OpenStreetMap / Nominatim 核对（2026-10-05）。
// 步道距离、爬升按 NPS thingstodo 各步道页面（总距离，往返或环线）。
// 2026 年 10 月的现况（来源见 notes.md）：
// - Lehman Caves 换灯工程（2025 年冬到 2026 年夏）完成，7 月 10 日起恢复全部导览；10 月 23 日是公园 40 周年庆典，当天 Grand Palace 导览免费、现场发票。
// - 惠勒峰景观道、Baker Creek、Strawberry Creek、Snake Creek 几条路都开着（NPS 路况 2026-09-21）；景观道一般 11 月 1 日前第一场大雪后关上段。
// - 全园营地都没有饮用水（NPS 公告 2026-06-02），水在 Lehman Caves 游客中心（全年）、Great Basin 游客中心和倾倒站（夏秋）接。
// - Lexington Arch 的土路严重冲毁，要在原停车场前约 1.6 公里就停车。

// 惠勒峰景观道（Wheeler Peak Scenic Drive）上段冬天不扫雪：一般阵亡将士纪念日（5 月底）前后通到顶，11 月 1 日前第一场大雪后关闭，
// 冬天只开到约 5 公里处的 Upper Lehman Creek 营地。车长超过约 7.3 米（24 英尺）的车不能开过 Upper Lehman Creek 营地。
const DRIVE_MONTHS = [6, 7, 8, 9, 10];
const DRIVE_CLOSED =
  "惠勒峰景观道上段冬天不扫雪，一般 11 月初第一场大雪后关闭，到次年阵亡将士纪念日（5 月底）前后才通到顶，冬天只能开到约 5 公里处的 Upper Lehman Creek 营地；这时可以穿雪鞋、越野滑雪上去，或者改去 Lehman Caves 和山下的步道。";
/** 景观道尽头的 Bristlecone 步道口（海拔约 3,015 米）：狐尾松、冰川、高山湖步道都从这里出发，夏天周末常停满 */
const BRISTLECONE_TRAILHEAD = { lat: 39.01036, lon: -114.30718, nameZh: "Bristlecone 步道口停车场（景观道尽头）" };
const LEHMAN_VC = { lat: 39.00561, lon: -114.21987, nameZh: "Lehman Caves 游客中心" };

export const greatBasin: Attraction[] = [
  {
    id: "grba-lehman-caves-vc",
    park: "grba",
    nameZh: "Lehman Caves 游客中心",
    nameEn: "Lehman Caves Visitor Center",
    kind: "visitor",
    area: "lehman",
    lat: 39.00561,
    lon: -114.21987,
    durationMin: 30,
    summary:
      "园内唯一的游客中心，全年开放（感恩节、圣诞节、元旦除外），所有洞穴导览都在这里报到出发；有洞穴和星空的展览、公园影片、书店，旁边的 Great Basin Café 夏天营业。营地没有水，这里的水龙头全年 24 小时能接水。",
    tips: [
      "当天的现场导览票从开门（早上 8 点）起在服务台卖，常在一小时内卖完",
      "园内大部分地方没有手机信号；问路况、领荒野露营许可、看当天的护林员活动都在这里",
      "公园不收门票，洞穴导览和营地另收费，都只收卡",
    ],
    photoFile: "2015-01-14 12 03 05 The Lehman Caves Visitor Center in Great Basin National Park, Nevada.JPG",
  },
  {
    id: "grba-lehman-caves",
    park: "grba",
    nameZh: "Lehman Caves 洞穴导览（Grand Palace）",
    nameEn: "Lehman Caves – Grand Palace Tour",
    kind: "experience",
    area: "lehman",
    lat: 39.00572,
    lon: -114.22018,
    start: LEHMAN_VC,
    durationMin: 90,
    bestTime: ["morning", "afternoon"],
    permit:
      "只能跟护林员导览进洞：Recreation.gov 提前 30 天早上 7 点（太平洋时间）放票，每团 20 人，夏天和周末常订光；Grand Palace 成人 $15、5–15 岁 $8；部分场次只在当天开门后现场卖",
    mustSee: true,
    summary:
      "1885 年起就有人进来参观的大理石溶洞，是内华达最长的洞穴。90 分钟的 Grand Palace 导览走完整条约 1 公里的游览线：Gothic Palace、Music Room、Lodge Room 一路都是钟乳石、石笋、“洞穴培根”和石花，最后到 Grand Palace 看有名的 Parachute Shield——这里的洞穴盾（从岩壁裂缝里长出的圆盘状沉积）多得少见。2026 年夏天换了新的照明。",
    tips: [
      "开团前 15 分钟到游客中心报到，开团前 5 分钟还没报到票就作废；洞里约 11°C、潮湿，带件外套",
      "包、食物、水、口香糖都不能带进洞；去过别的洞穴的衣服鞋子要先洗过（防蝙蝠白鼻综合征），报到时会问",
      "不想走 90 分钟的：60 分钟的 Lodge Room 导览（成人 $12）、30 分钟的无障碍 Gothic Palace 导览（$8）；秋冬周末另有 3 小时的入门野洞探险（$40，16 岁以上）",
    ],
    photoFile: "2015-01-14 13 58 36 Rock formations within Lehman Caves in Great Basin National Park, Nevada.JPG",
  },
  {
    id: "grba-mountain-view-trail",
    park: "grba",
    nameZh: "Mountain View 自然步道",
    nameEn: "Mountain View Nature Trail",
    kind: "hike",
    area: "lehman",
    lat: 39.00635,
    lon: -114.21987,
    start: LEHMAN_VC,
    durationMin: 25,
    trail: { loop: true },
    hike: { distanceMi: 0.3, difficulty: "easy", loop: true },
    bestTime: ["morning", "afternoon"],
    summary:
      "游客中心旁的小环线，经过 Lehman Caves 早年的天然洞口和老的 Rhodes 小木屋，沿途是矮松、杜松林和大理石露头，有自导解说（游客中心的小册子或 NPS App），等洞穴导览时走一圈正好。",
    tips: ["全年都能走，冬天可能有积雪", "园内步道一律不许带宠物，这条也一样"],
    photoFile: "Rhodes Cabin Great Basin NV NPS.jpg",
  },
  {
    id: "grba-scenic-drive",
    park: "grba",
    nameZh: "惠勒峰景观道",
    nameEn: "Wheeler Peak Scenic Drive",
    kind: "drive",
    area: "scenic-drive",
    lat: 39.0263,
    lon: -114.28621,
    durationMin: 45,
    openMonths: DRIVE_MONTHS,
    closedNote: DRIVE_CLOSED,
    bestTime: ["morning", "afternoon"],
    bestMonths: [6, 7, 8, 9],
    mustSee: true,
    summary:
      "从山脚的荒漠开上海拔 3,000 多米的铺装山路：约 19 公里爬升 1,200 多米，一路从鼠尾草、矮松杜松林、山桃花心木到冷杉和山杨林，NPS 说相当于从内华达一口气开到育空。Mather 观景台、惠勒峰观景台正对惠勒峰和冰斗，路尽头就是高山湖和狐尾松的步道口。",
    tips: [
      "限速 35 英里（约 56 公里/时）、全程禁止超车，不停车单程约 30 分钟；下山用低挡，别一路踩刹车",
      "车长超过约 7.3 米（24 英尺）的房车、拖车不能开过约 5 公里处的 Upper Lehman Creek 营地",
      "9 月中下旬山杨变黄时最好看；Mather 观景台也是自己看星星的好地方",
    ],
    photoFile: "2013-07-14 09 37 43 Wheeler Peak viewed from Wheeler Peak Scenic Drive in Great Basin National Park.jpg",
  },
  {
    id: "grba-alpine-lakes",
    park: "grba",
    nameZh: "高山湖环线（Stella 湖 · Teresa 湖）",
    nameEn: "Alpine Lakes Loop Trail",
    kind: "hike",
    area: "scenic-drive",
    lat: 39.00588,
    lon: -114.31868,
    start: BRISTLECONE_TRAILHEAD,
    durationMin: 120,
    trail: {
      via: [
        { lat: 39.00588, lon: -114.31868 },
        { lat: 39.00379, lon: -114.31099 },
      ],
      loop: true,
    },
    hike: { distanceMi: 2.7, gainFt: 440, difficulty: "easy", loop: true },
    openMonths: DRIVE_MONTHS,
    closedNote: DRIVE_CLOSED,
    bestTime: ["morning"],
    bestMonths: [7, 8, 9],
    mustSee: true,
    summary:
      "从海拔约 3,000 米的步道口出发，穿过恩氏云杉林和高山草甸，经过两个冰川留下的小湖：Stella 湖水面倒映着惠勒峰，Teresa 湖更小更静。约 4.3 公里，坡度不大，夏天草甸里开满野花。",
    tips: [
      "起点就在 3,000 米上下，走慢一点，头疼恶心就往下走；午后常有雷暴，上午走",
      "可以和狐尾松步道连起来走（合计约 6.6 公里）；步道口另有一条无障碍的 Sky Island 森林小步道",
      "6 月甚至 7 月初步道上常还有积雪，带防滑的鞋",
    ],
    photoFile: "Stella Lake with Mount Wheeler in background - Flickr - pellaea.jpg",
  },
  {
    id: "grba-bristlecone-grove",
    park: "grba",
    nameZh: "狐尾松林步道（可接冰川步道）",
    nameEn: "Bristlecone Pine Trail (Wheeler Peak Grove)",
    kind: "grove",
    area: "scenic-drive",
    lat: 38.99962,
    lon: -114.30387,
    start: BRISTLECONE_TRAILHEAD,
    durationMin: 120,
    trail: {
      via: [
        { lat: 39.00379, lon: -114.31099 },
        { lat: 38.99962, lon: -114.30387 },
      ],
    },
    hike: { distanceMi: 2.8, gainFt: 600, difficulty: "moderate" },
    openMonths: DRIVE_MONTHS,
    closedNote: DRIVE_CLOSED,
    bestTime: ["morning"],
    bestMonths: [7, 8, 9],
    mustSee: true,
    summary:
      "公园最热门的步道，走到惠勒峰下冰斗边的狐尾松林：这些大盆地狐尾松长在冰碛石堆上，枝干被风沙磨得扭曲发亮，有的已经活了几千年。末端有一段带解说牌的小环线；1964 年在这片林子里被砍倒的 Prometheus 树数出了约 4,860 圈年轮，是当时已知最老的树。",
    tips: [
      "往返约 4.5 公里、爬升约 180 米；只能看、别摸，也别捡地上的枯枝（狐尾松林附近禁止拾柴）",
      "体力好的继续往上走冰川步道（总共往返约 7.7 公里），看内华达仅存的冰川——现在是夹着冰的岩石冰川",
      "夏天常有护林员在林子里讲解，时间在游客中心问",
    ],
    photoFile: "2014-09-15 14 01 24 Bristlecone Pines along the Bristlecone Trail in Great Basin National Park, Nevada.JPG",
  },
  {
    id: "grba-wheeler-peak",
    park: "grba",
    nameZh: "惠勒峰登顶",
    nameEn: "Wheeler Peak Summit Trail",
    kind: "hike",
    area: "scenic-drive",
    lat: 38.98572,
    lon: -114.31401,
    start: { lat: 39.01683, lon: -114.30383, nameZh: "Summit 步道口（景观道尽头前约 1 公里）" },
    durationMin: 420,
    trail: {
      via: [
        { lat: 39.00588, lon: -114.31868 },
        { lat: 38.98572, lon: -114.31401 },
      ],
    },
    hike: { distanceMi: 8.6, gainFt: 3100, difficulty: "hard" },
    openMonths: DRIVE_MONTHS,
    closedNote: DRIVE_CLOSED,
    bestTime: ["sunrise", "morning"],
    bestMonths: [7, 8, 9],
    summary:
      "登上 3,982 米的惠勒峰，内华达第二高、完全在州内的最高峰：先穿过云杉林、经过 Stella 湖，到惠勒峰和 Bald 山之间的山口就出了树线，最后一段是全园最陡的碎石坡。晴天在山顶能望出 160 公里以上，一边是 Snake 谷，一边是望不到头的大盆地山脉。",
    tips: [
      "往返约 14 公里、爬升约 945 米，要 4–10 小时；天亮前后出发，中午前下山，过了山口没有任何遮挡，雷暴来了马上往下撤",
      "山顶比游客中心冷 11–17°C、风很大，盛夏也要带保暖外套和防风层；高原反应头疼就别硬撑",
      "Summit 步道口车位不多，不许路边停车，满了就停 Bristlecone 步道口，从那边走过来",
    ],
    photoFile: "2013-07-14 14 03 22 The summit of Wheeler Peak in Great Basin National Park.jpg",
  },
  {
    id: "grba-night-sky",
    park: "grba",
    nameZh: "暗夜星空（护林员观星）",
    nameEn: "Night Sky & Astronomy Programs",
    kind: "experience",
    area: "lehman",
    lat: 39.00863,
    lon: -114.21834,
    durationMin: 120,
    bestTime: ["night"],
    bestMonths: [6, 7, 8, 9],
    mustSee: true,
    summary:
      "2016 年获评金级国际暗夜公园：海拔高、空气干、方圆上百公里几乎没有灯光，无月的晴夜肉眼就能看到横跨天空的银河和仙女座星系。夏天每周四到周日晚上，护林员在游客中心旁的天文剧场先讲 30 分钟，再用望远镜带大家看 1.5 小时星云、星团和行星。",
    tips: [
      "护林员观星大约阵亡将士纪念日到劳动节，9 月天文节以后场次变少、10 月结束；免费不用预约，游客中心停车场停满就不再放人，开始时间随日落变，看公园日历",
      "剧场里不许用白光手电和手机屏幕，带红光手电；夏夜也会降到 10°C 以下",
      "不赶场次的话 Mather 观景台、Baker 考古遗址一带都适合自己看，挑没有月亮的晚上",
    ],
    photoFile: "Milky Way over Great Basin (26939087396).jpg",
  },
  {
    id: "grba-baker-creek",
    park: "grba",
    nameZh: "Baker Creek 环线",
    nameEn: "Baker Creek Loop Trail",
    kind: "hike",
    area: "baker-creek",
    lat: 38.97655,
    lon: -114.24531,
    start: { lat: 38.97655, lon: -114.24531, nameZh: "Baker Creek 步道口（Baker Creek 路尽头）" },
    durationMin: 120,
    trail: { loop: true },
    hike: { distanceMi: 3.3, gainFt: 850, difficulty: "moderate", loop: true },
    openMonths: [5, 6, 7, 8, 9, 10],
    closedNote: "Baker Creek 路是约 5.6 公里的砂石路，冬天积雪就关，一般 5 月到 10 月能开进去；冬天可以从路口穿雪鞋走进去。",
    bestTime: ["morning", "afternoon"],
    bestMonths: [9, 10],
    summary:
      "人少的半日步道：沿 Baker 溪往上穿过高大的山杨林和草地，再从对岸绕回来。秋天山杨一片金黄，树干上还能看到早年牧羊人刻下的字（现在不许再刻）。",
    tips: [
      "约 5.3 公里、爬升约 260 米，起点海拔约 2,450 米",
      "体力好的可以接着往上走到 Baker 湖（往返约 16.7 公里、爬升约 800 米），在湖边过夜要到游客中心领免费的荒野许可",
    ],
  },
  {
    id: "grba-lexington-arch",
    park: "grba",
    nameZh: "Lexington 石拱",
    nameEn: "Lexington Arch",
    kind: "hike",
    area: "south",
    lat: 38.84396,
    lon: -114.20821,
    start: { lat: 38.85774, lon: -114.16117, nameZh: "Lexington Arch 步道口（Lexington Creek 土路尽头）" },
    durationMin: 240,
    trail: {},
    hike: { distanceMi: 5.6, gainFt: 1220, difficulty: "moderate" },
    bestTime: ["morning"],
    bestMonths: [5, 6, 9, 10],
    summary:
      "公园最南端的巨大石拱，少见地由石灰岩而不是砂岩构成，拱脚有流石，可能原本是一条古洞穴的通道。约 9 公里往返的步道穿过 2010 年代山火烧过的山坡，一路几乎无遮挡，最后走到石拱正下方；人很少，也是园内唯一能带狗的步道。",
    tips: [
      "从 Baker 往南经犹他 21 号公路约 17 公里，过 Pruess 湖后右转进土路再开 11 公里以上；BLM 管的土路被冲得很烂，NPS 建议开高底盘四驱；NPS 路况说车要停在原步道口前约 1.6 公里",
      "来回开车加走路要大半天，路上没有厕所、水和信号；春秋常有冲沟积水，下雨别去",
    ],
  },
  {
    id: "grba-great-basin-vc",
    park: "grba",
    nameZh: "Great Basin 游客中心（Baker 镇）",
    nameEn: "Great Basin Visitor Center",
    kind: "visitor",
    area: "baker",
    lat: 39.01488,
    lon: -114.12655,
    durationMin: 25,
    openMonths: [5, 6, 7, 8, 9, 10],
    closedNote: "Great Basin 游客中心一般只在夏季开放，10 月中旬关门；其他时间去园内的 Lehman Caves 游客中心（全年开）。",
    summary:
      "公园外 Baker 镇北口的游客中心，展览讲大盆地的生物带、狐尾松和这一带的人类历史，还有 Prometheus 狐尾松的一截树干和“被遗忘的温彻斯特步枪”（2014 年在园里岩缝中发现的 1882 年老枪）。",
    tips: ["从犹他一侧（6/50 号公路、21 号公路）过来先经过这里", "旁边的 Baker 镇有加油站、小餐馆和小商店"],
    photoFile: "Backlit flag Great Basin VC - Baker Nevada.jpg",
  },
];
