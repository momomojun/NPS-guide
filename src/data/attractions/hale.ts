import type { Attraction } from "./types";

// 哈莱阿卡拉国家公园（hale）。坐标按 OpenStreetMap 和 NPS API places 核对，步道途经点取 OSM 步道（2026-10-04）。
// 2026 年 10 月的现况（来源见 notes.md）：
// - 山顶区 24 小时开放，凌晨 3:00–7:00 进山顶区要日出预约（Recreation.gov，每车 $1，提前 60 天和 2 天早上 7 点放票）。
// - 哈莱阿卡拉游客中心 2026 年 2–5 月翻修，5 月 21 日重开；2026 年起游客中心停车场因供水工程少了一部分车位，持续数月。
// - Hosmer Grove 营地 2026 年 9 月起停水；Kīpahulu 区的厕所和饮水站紧急维修关闭（只有营地旱厕）。
// - ʻOheʻo 水潭不开放下水，只能从 Kūloa Point 步道上看。
// 海拔：Puʻuʻulaʻula 3,055 米、游客中心 2,969 米、Kalahaku 2,842 米、Leleiwi 2,694 米（NPS 日出 FAQ），收费站约 2,130 米。

/** 哈莱阿卡拉游客中心（海拔 2,969 米）停车场：日出、日落、星空和 Sliding Sands 步道都从这里 */
const SUMMIT_VC = { lat: 20.71422, lon: -156.25095, nameZh: "哈莱阿卡拉游客中心停车场" };
/** Kīpahulu 游客中心旁的停车场：Pīpīwai、Kūloa Point 两条步道都从这里出发 */
const KIPAHULU_PARKING = { lat: 20.66196, lon: -156.04517, nameZh: "Kīpahulu 游客中心停车场" };
/** 日出预约：凌晨 3–7 点进山顶区要有（停在山顶四个停车场也要） */
const SUNRISE_PERMIT =
  "凌晨 3:00–7:00 进山顶区要提前在 Recreation.gov 订日出预约（每车 $1，去的那天前 60 天和前 2 天早上 7 点放票，常在 15 分钟内订光），门票另付；当天和前一天都订不到，现场也不卖";

export const haleakala: Attraction[] = [
  {
    id: "hale-hq-visitor-center",
    park: "hale",
    nameZh: "公园总部游客中心",
    nameEn: "Park Headquarters Visitor Center",
    kind: "visitor",
    area: "summit",
    lat: 20.75944,
    lon: -156.24673,
    durationMin: 20,
    hours: [{ open: "07:45", close: "15:45" }],
    summary:
      "进山顶区收费站后约 1.6 公里、海拔约 2,100 米的游客中心，能问路况、天气和步道，有展览、书店、厕所和饮用水；门前草坪上常有夏威夷雁（nēnē）。上山前在这里停一下，也让身体慢慢适应海拔。",
    tips: [
      "园内没有吃的、没有加油站，也没有充电桩，Pukalani 是上山前最后能加油的地方；NPS 提醒电车上山特别耗电，出发前充满",
      "Hosmer Grove 营地停水期间，这里 24 小时都能接饮用水",
    ],
    photoFile: "Nēnē at Headquarters Visitor Center lawn (b5ba0823-edb2-3c34-9283-8a668b98a860).jpg",
  },
  {
    id: "hale-hosmer-grove",
    park: "hale",
    nameZh: "Hosmer Grove 森林步道",
    nameEn: "Hosmer Grove Loop Trail",
    kind: "hike",
    area: "summit",
    lat: 20.7685,
    lon: -156.23747,
    durationMin: 30,
    trail: {
      via: [
        { lat: 20.76776, lon: -156.2362 },
        { lat: 20.76669, lon: -156.23653 },
        { lat: 20.76769, lon: -156.23692 },
      ],
      loop: true,
    },
    hike: { distanceMi: 0.6, gainFt: 50, difficulty: "easy", loop: true },
    bestTime: ["morning"],
    summary:
      "一百多年前林务官 Ralph Hosmer 为了试种造林栽下的松、杉、桉树林，和旁边的夏威夷本土灌木林只隔一条小路。约 1 公里的环线是观鸟的好地方，清晨常能看到通红的 ʻiʻiwi、ʻapapane 等只有夏威夷才有的蜜雀。",
    tips: [
      "在收费站后不远的岔路进去，离公园总部约 1.6 公里，旁边就是 Hosmer Grove 营地",
      "海拔约 2,100 米、在云带里，常起雾下雨，带外套",
    ],
    photoFile: "'I'iwi at Hosmer Grove, Haleakala, Maui, Hawaii 3.jpg",
  },
  {
    id: "hale-halemauu-trail",
    park: "hale",
    nameZh: "Halemauʻu 步道（到火山口边）",
    nameEn: "Halemauʻu Trail (to the crater rim)",
    kind: "hike",
    area: "summit",
    lat: 20.75607,
    lon: -156.21544,
    start: { lat: 20.75223, lon: -156.22834, nameZh: "Halemauʻu 步道口停车场" },
    durationMin: 90,
    trail: {
      via: [
        { lat: 20.75456, lon: -156.22449 },
        { lat: 20.75616, lon: -156.22038 },
        { lat: 20.75644, lon: -156.21788 },
        { lat: 20.75607, lon: -156.21544 },
      ],
    },
    hike: { distanceMi: 2.2, gainFt: 400, difficulty: "moderate" },
    bestTime: ["morning"],
    summary:
      "从海拔约 2,435 米的步道口出发，穿过本土灌木的高山灌丛，约 1.8 公里走到火山口边缘：脚下是几百米深的崖壁和之字形的下山路，往北能看到 Koʻolau 缺口一直通到海边；再往前约 400 米是一段两边都是悬崖的天然石脊，俗称“彩虹桥”。",
    tips: [
      "回程是上坡，又在高海拔，按下去时间的两倍算",
      "想走完整的火山口横穿（约 17.8 公里），把车停在这里，搭便车或两辆车到山顶的 Sliding Sands 步道口往下走，最后走回这里（公园没有接驳车）",
    ],
    photoFile:
      "Starr-161010-5483-Sophora chrysophylla-view Switchbacks-Halemauu Trail Haleakala National Park-Maui (31098713462).jpg",
  },
  {
    id: "hale-leleiwi",
    park: "hale",
    nameZh: "Leleiwi 观景台",
    nameEn: "Leleiwi Overlook",
    kind: "viewpoint",
    area: "summit",
    lat: 20.74433,
    lon: -156.22838,
    start: { lat: 20.74391, lon: -156.23025, nameZh: "Leleiwi 观景台停车场" },
    durationMin: 20,
    trail: {},
    bestTime: ["sunrise"],
    summary:
      "海拔约 2,695 米，从路边停车场过马路走一小段石阶（往返约 0.5 公里）到火山口西壁上的观景亭，能同时看到火山口、Kaupō 缺口和 Koʻolau 缺口外的北岸海岸。四个日出观景点里它海拔最低、人最少。",
    tips: [
      "日出时段（3–7 点）在这里停车也要有日出预约",
      "过马路要小心，路上没有路灯；石阶爬升约 30 米",
    ],
    photoFile: "Starr-230106-0613-Dubautia menziesii-view overlook and Koolau Gap-Leleiwi Haleakala National Park-Maui (52666033198).jpg",
  },
  {
    id: "hale-kalahaku",
    park: "hale",
    nameZh: "Kalahaku 观景台（银剑草）",
    nameEn: "Kalahaku Overlook (Silversword Area)",
    kind: "viewpoint",
    area: "summit",
    lat: 20.7369,
    lon: -156.23393,
    durationMin: 20,
    summary:
      "海拔约 2,842 米、火山口边缘的一座观景亭，正对火山口里的十几座渣锥，这个角度和山顶游客中心看到的不一样；停车场旁有围起来的银剑草（ʻāhinahina），一生只开一次花，开完就死。",
    tips: [
      "入口在一个急弯中间，上山方向看不见来车，只能下山时进",
      "日出时段（3–7 点）在这里停车也要有日出预约；别靠近、别碰银剑草，脚步会踩坏它很浅的根",
    ],
    photoFile: "Craters from Kalahaku Overlook Haleakala National Park east Maui Hawaii (15791976445).jpg",
  },
  {
    id: "hale-visitor-center",
    park: "hale",
    nameZh: "哈莱阿卡拉游客中心和 Pā Kaʻoao",
    nameEn: "Haleakalā Visitor Center & Pā Kaʻoao (White Hill)",
    kind: "viewpoint",
    area: "summit",
    lat: 20.71511,
    lon: -156.24981,
    start: SUMMIT_VC,
    durationMin: 40,
    summary:
      "火山口边缘海拔 2,969 米的小游客中心，后面的平台是看火山口全景和日出的热门位置。旁边的 Pā Kaʻoao（白山）小路往返约 0.6 公里、爬升约 30 米，山坡上有几百年前夏威夷人用石头垒的避风圈，顶上能换个角度看火山口。",
    tips: [
      "游客中心大约 5:30–15:00 开（2026 年 5 月 21 日翻修后重开），有展览、书店、厕所和饮水",
      "2026 年起停车场因供水工程少了一部分车位，日出、日落时最难停；Sliding Sands 步道口就在停车场边",
    ],
    photoFile: "Haleakala Visitor Center Hawaii 2021.jpg",
  },
  {
    id: "hale-puu-ulaula",
    park: "hale",
    nameZh: "Puʻuʻulaʻula 山顶",
    nameEn: "Puʻuʻulaʻula Summit (Red Hill)",
    kind: "viewpoint",
    area: "summit",
    lat: 20.70988,
    lon: -156.25255,
    start: { lat: 20.71007, lon: -156.25295, nameZh: "山顶停车场" },
    durationMin: 20,
    mustSee: true,
    summary:
      "茂宜岛的最高点，海拔 3,055 米（10,023 英尺）。山顶的玻璃观景屋能挡风，晴天 360 度能看到火山口、西茂宜山、旁边的天文台群，远处大岛的冒纳凯阿、冒纳罗亚和邻近的岛屿都浮在云上；停车场边也有银剑草。",
    tips: [
      "高原反应要留意：慢慢走、多喝水，孕妇和心肺不好的人先问医生",
      "日出、日落时这里车位最少，满了就去游客中心或下面的观景台",
    ],
    photoFile: "Haleakala Summit Scenic Overlook Hawaii 2021.jpg",
  },
  {
    id: "hale-sliding-sands",
    park: "hale",
    nameZh: "Sliding Sands 步道（Keoneheʻeheʻe）",
    nameEn: "Keoneheʻeheʻe (Sliding Sands) Trail to Ka Lua o ka ʻŌʻō",
    kind: "hike",
    area: "summit",
    lat: 20.71696,
    lon: -156.23292,
    start: SUMMIT_VC,
    durationMin: 240,
    trail: {
      via: [
        { lat: 20.7092, lon: -156.2461 },
        { lat: 20.71014, lon: -156.23881 },
        { lat: 20.7112, lon: -156.23314 },
      ],
    },
    hike: { distanceMi: 5.5, gainFt: 1400, difficulty: "hard" },
    bestTime: ["morning"],
    mustSee: true,
    summary:
      "从游客中心旁踩着松软的火山砂一路下到火山口里，四周是红、黑、橙色的渣锥和几乎寸草不生的“月球表面”，路边偶尔有银剑草。多数人走到约 3–4 公里外、岔上一小段路到 Ka Lua o ka ʻŌʻō 渣锥边就折返；一直下到火山口底要下降约 760 米，再往前能横穿到 Halemauʻu 步道口（全程约 17.8 公里）。",
    tips: [
      "下去轻松、回来全是上坡，在 3,000 米的高度很累，回程按下去时间的两倍留；带足水和防风保暖衣物，太阳也很毒",
      "只想看看就走到 0.4 公里处的观景点；全程必须走在步道上，火山口里的植物极其脆弱",
    ],
    photoFile: "Vulcanic Cones on Haleakala, Maui, Hawaii.jpg",
  },
  {
    id: "hale-sunrise",
    park: "hale",
    nameZh: "山顶日出",
    nameEn: "Haleakalā Sunrise",
    kind: "experience",
    area: "summit",
    lat: 20.71511,
    lon: -156.24981,
    start: SUMMIT_VC,
    durationMin: 90,
    bestTime: ["sunrise"],
    permit: SUNRISE_PERMIT,
    mustSee: true,
    summary:
      "在海拔 3,000 米的火山口边等太阳从云海上升起，是茂宜岛最有名的体验：天色一点点变成橙红，火山口里的渣锥慢慢显出颜色，晴天还能看到大岛的冒纳凯阿、冒纳罗亚浮在云上。山顶、游客中心、Kalahaku、Leleiwi 四处都能看，每天只放约 150 辆车，停车场满了就封。",
    tips: [
      "日出前山顶常在 0°C 上下、风大，带羽绒服、帽子、手套和毯子；从卡胡卢伊上来约 1.5–2 小时，收费站到山顶还要约 30 分钟，路上没有路灯和护栏",
      "预约只认当天、不退不改，云太厚可能什么都看不到；预约人要带身份证件到场，打印的预约放在仪表盘上",
      "订不到可以跟有许可的商业日出团（团里含预约），或者改看日落、星空",
    ],
    photoFile: "Sunrise on Haleakala (In Explorer May 2021) - Flickr - G Yancy.jpg",
  },
  {
    id: "hale-sunset",
    park: "hale",
    nameZh: "山顶日落",
    nameEn: "Haleakalā Sunset",
    kind: "experience",
    area: "summit",
    lat: 20.71511,
    lon: -156.24981,
    start: SUMMIT_VC,
    durationMin: 60,
    bestTime: ["sunset"],
    summary:
      "日落不用预约：太阳沉进西边的云海，天色从金黄变成粉紫，火山口的阴影越拉越长。这几年越来越热门，旺季日落前山顶的停车场就满了，收费站会暂时不放车。",
    tips: [
      "冬季旺季 NPS 建议至少提前 3 小时到（平时 2–3 小时），排队进园可能要 30–60 分钟；网上买了门票也不保证日落时能进",
      "日落后气温很快降到冰点附近，带保暖衣物；可以接着看星星，等下山的车流散了再走",
    ],
    photoFile: "Sunset above cloud layer Haleakala Maui.jpg",
  },
  {
    id: "hale-stargazing",
    park: "hale",
    nameZh: "山顶看星空",
    nameEn: "Stargazing at the Summit",
    kind: "experience",
    area: "summit",
    lat: 20.71511,
    lon: -156.24981,
    start: SUMMIT_VC,
    durationMin: 60,
    bestTime: ["night"],
    summary:
      "山顶海拔高、空气干净、光污染少，晴夜的银河清楚得惊人，旁边就是世界级的天文台。不用预约，带张毯子坐在铺装地面或步道上，关掉手机和白光手电，等眼睛适应黑暗，星星会越来越多。",
    tips: [
      "夜里常在冰点附近、风大，穿得像过冬；只能待在铺装地面和步道上",
      "晚上路上常有夏威夷海燕（ʻuaʻu）和夏威夷雁，慢慢开；月亮小的晚上星星最多",
    ],
    photoFile: "Milky way haleakala crater maui.JPG",
  },
  {
    id: "hale-kipahulu-visitor-center",
    park: "hale",
    nameZh: "Kīpahulu 游客中心",
    nameEn: "Kīpahulu Visitor Center",
    kind: "visitor",
    area: "kipahulu",
    lat: 20.66163,
    lon: -156.04446,
    start: KIPAHULU_PARKING,
    durationMin: 20,
    hours: [{ open: "09:00", close: "17:00" }],
    summary:
      "Kīpahulu 区的游客中心，有展览、书店和护林员，Pīpīwai 和 Kūloa Point 两条步道都从这里出发。旁边的传统草屋 Hale Hālāwai 有时有夏威夷文化示范，比如编织、做芋泥（poi）和草裙舞。",
    tips: [
      "2026 年 10 月 Kīpahulu 区的厕所和饮水站因紧急维修关闭，只有营地的旱厕能用，带够一整天的水",
      "收费站只能刷卡；离哈纳约 19 公里，紧急医疗至少 1 小时外",
    ],
  },
  {
    id: "hale-pipiwai-trail",
    park: "hale",
    nameZh: "Pīpīwai 步道（竹林和 Waimoku 瀑布）",
    nameEn: "Pīpīwai Trail to Waimoku Falls",
    kind: "hike",
    area: "kipahulu",
    lat: 20.67933,
    lon: -156.05687,
    start: KIPAHULU_PARKING,
    durationMin: 180,
    trail: {
      via: [
        { lat: 20.66502, lon: -156.04968 },
        { lat: 20.67, lon: -156.05355 },
        { lat: 20.67474, lon: -156.05665 },
        { lat: 20.67802, lon: -156.05656 },
      ],
    },
    hike: { distanceMi: 4, gainFt: 800, difficulty: "moderate" },
    bestTime: ["morning"],
    mustSee: true,
    summary:
      "沿着 Pīpīwai 溪往山里走：约 0.8 公里到 Makahiku 瀑布观景点，经过一棵巨大的榕树和几座小桥，约 1.6 公里进入茂密的竹林，风一吹竹竿互相敲得咚咚响，走木栈道穿过去，终点是从约 120 米高的崖壁上飘下来的 Waimoku 瀑布。往返约 6.4 公里，爬升约 240 米。",
    tips: [
      "早点到好停车；路滑多泥，穿抓地的鞋，带驱蚊水和雨衣",
      "不要下到溪里或走到瀑布底下：上游一下雨就可能暴发山洪，崖壁也常落石",
    ],
    photoFile: "Waimoku Falls in Haleakala National Park, Maui, Hawaii1.jpg",
  },
  {
    id: "hale-kuloa-point",
    park: "hale",
    nameZh: "Kūloa Point 步道（ʻOheʻo 水潭）",
    nameEn: "Kūloa Point Trail & Pools of ʻOheʻo",
    kind: "hike",
    area: "kipahulu",
    lat: 20.66213,
    lon: -156.04109,
    start: KIPAHULU_PARKING,
    durationMin: 40,
    trail: {
      via: [
        { lat: 20.66201, lon: -156.04321 },
        { lat: 20.66231, lon: -156.04173 },
        { lat: 20.6636, lon: -156.04355 },
      ],
      loop: true,
    },
    hike: { distanceMi: 0.5, gainFt: 80, difficulty: "easy", loop: true },
    mustSee: true,
    summary:
      "从游客中心出发的小环线，经过 Hale Hālāwai 草屋和一片露兜树林，走到 ʻOheʻo 溪入海的 Kūloa Point：一级级瀑布和水潭（以前被叫作“七圣池”）顺着黑色熔岩流进大海，晴天能看到约 48 公里外的大岛。",
    tips: [
      "ʻOheʻo 的水潭目前不开放下水（山洪、落石都很危险），只能在步道上看",
      "沿途有古代夏威夷人的石墙和遗址，别爬、别搬石头，也别叠石头",
    ],
    photoFile: "Pools of `Ohe`o at Haleakalā National Park, Maui, Hawaii.jpg",
  },
  {
    id: "hale-road-to-hana",
    park: "hale",
    nameZh: "哈纳公路（Road to Hāna）",
    nameEn: "Road to Hāna (Hāna Highway)",
    kind: "drive",
    area: "hana-highway",
    lat: 20.85358,
    lon: -156.14232,
    durationMin: 120,
    outsidePark: true,
    summary:
      "从卡胡卢伊到哈纳约 104 公里，沿茂宜岛东北的雨林海岸有约 620 个弯、59 座桥（大多只有一条车道），一路是瀑布、竹林、彩虹桉和海边的黑色熔岩岬角。去 Kīpahulu 必走这条路（哈纳再往南约 19 公里），不停车单程也要 2.5–3 小时，加上沿途停车就是一整天。",
    tips: [
      "只在指定停车处停，别停在路肩、桥上或私人土地上，很多路边瀑布在私人地里；单车道桥让先到的车先过",
      "Paia 是去哈纳路上最后一个加油站；路窄车多，早上 7 点前出发最顺",
      "从 Kīpahulu 继续往南绕回的 Piʻilani 公路有长段狭窄的土石路，多数租车合同不允许开，原路返回最稳",
    ],
    photoFile: "Bridge on Hana Highway.jpg",
  },
  {
    id: "hale-waianapanapa",
    park: "hale",
    nameZh: "Waiʻānapanapa 黑沙滩（州立公园）",
    nameEn: "Waiʻānapanapa State Park",
    kind: "landmark",
    area: "hana-highway",
    lat: 20.78875,
    lon: -156.00361,
    start: { lat: 20.78777, lon: -156.00455, nameZh: "Waiʻānapanapa 州立公园停车场" },
    durationMin: 75,
    permit:
      "非夏威夷居民要提前在 gostateparks.hawaii.gov/waianapanapa 订入园和停车（提前 30 天、每天午夜放新的一天，不卖当天），按时段进出",
    outsidePark: true,
    summary:
      "哈纳镇北边约 5 公里的州立公园：熔岩海岸围出一小片黑沙滩，旁边有海蚀洞、淡水熔岩洞和喷水孔，沿海岸步道能看到浪花拍打黑色的熔岩岬角。",
    tips: [
      "要在预约时段开始后 30 分钟内到，时段结束就得离开；入园每人 $5、停车每车 $10（夏威夷居民免费）",
      "浪和暗流很强，一般不适合下水；黑沙晒得很烫，穿鞋",
    ],
    photoFile: "Waianapanapa black sand beach Maui Hawaii (31869652128).jpg",
  },
];
