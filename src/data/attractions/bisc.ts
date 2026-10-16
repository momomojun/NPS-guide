import type { Attraction } from "./types";

// 比斯坎：陆上只有 Convoy Point（游客中心、海堤步道），其余都要坐船。
// 船团都是 Biscayne National Park Institute（BNPI，公园的非营利合作伙伴）的，从两个码头出发：
//   Convoy Point：遗产游船、浮潜、Jones 泻湖划桨，在游客中心二楼的商店报到
//   Coconut Grove 的 Dinner Key Marina 9 号码头：Boca Chita 灯塔游船、Stiltsville 游船
// 船团按“开到码头 + 往返 + 在岛上 / 水里的时间”算成一个景点，durationMin 是开船到回来（不含提前 30 分钟报到）。
// 坐标：游客中心、海堤步道、灯塔按 OpenStreetMap；Jones 泻湖按 OSM 的 natural=bay 点；浮潜地点每天由船长按风浪挑，坐标取 Elliott Key 外侧礁区的大致位置。
const CONVOY_PARKING = { lat: 25.46423, lon: -80.33595, nameZh: "Convoy Point 停车场（Dante Fascell 游客中心）" };
const DINNER_KEY = { lat: 25.72664, lon: -80.23253, nameZh: "Dinner Key Marina 9 号码头（Coconut Grove）" };

export const biscayne: Attraction[] = [
  {
    id: "bisc-visitor-center",
    park: "bisc",
    nameZh: "Dante Fascell 游客中心",
    nameEn: "Dante Fascell Visitor Center",
    kind: "visitor",
    area: "convoy-point",
    lat: 25.46447,
    lon: -80.33476,
    start: CONVOY_PARKING,
    durationMin: 40,
    hours: [{ open: "09:00", close: "17:00" }],
    summary:
      "公园唯一开车能到的地方。展厅讲比斯坎湾、红树林、礁岛和珊瑚礁四种环境，还有公园影片和本地画家的画廊；后面的露台正对比斯坎湾。二楼是公园商店，也是 Convoy Point 出发的船团报到处。",
    tips: [
      "公园不收门票；Convoy Point 园区 7:00–17:30 开，游客中心 9:00–17:00",
      "叫网约车来的，要在 17:30 闭园前约好回程的车",
      "冬季周末 Homestead 市有免费的国家公园电车，从市中心开到这里和大沼泽地",
    ],
    photoFile: "Biscayne National Park H-visitor center sunrise.jpg",
  },
  {
    id: "bisc-jetty-trail",
    park: "bisc",
    nameZh: "Convoy Point 海堤步道",
    nameEn: "Convoy Point Jetty Trail",
    kind: "hike",
    area: "convoy-point",
    lat: 25.46335,
    lon: -80.33098,
    start: CONVOY_PARKING,
    durationMin: 40,
    trail: {
      via: [
        { lat: 25.46472, lon: -80.33542 },
        { lat: 25.46446, lon: -80.33389 },
        { lat: 25.46341, lon: -80.33343 },
        { lat: 25.46335, lon: -80.33098 },
      ],
    },
    hike: { distanceMi: 0.7, gainFt: 0, difficulty: "easy" },
    hours: [{ open: "07:00", close: "17:30" }],
    bestTime: ["morning", "afternoon"],
    summary:
      "从游客中心沿红树林边的木栈道走上伸进湾里的海堤，单程约 600 米，一路平坦。海堤尽头是鸟类保护区，冬天常见鸬鹚、燕鸥和滨鸟；早晚有成群的白鹮从头顶飞过，往返于南边岛上的栖息地。",
    tips: [
      "全程几乎没有遮阴，带水、防晒；夏天傍晚蚊子多",
      "海堤尽头的鸟类保护区不要进去，用望远镜看",
      "旁边有皮划艇下水点，可以自带船在湾里划",
    ],
    photoFile: "Biscayne National Park V-jetty trail.jpg",
  },
  {
    id: "bisc-heritage-cruise",
    park: "bisc",
    nameZh: "比斯坎遗产游船（登 Elliott Key 等礁岛）",
    nameEn: "Heritage of Biscayne Cruise",
    kind: "experience",
    area: "keys",
    lat: 25.45362,
    lon: -80.19592,
    start: CONVOY_PARKING,
    durationMin: 210,
    bestMonths: [12, 1, 2, 3, 4],
    permit: "向 Biscayne National Park Institute 订票（2026 年 12 岁以上 $83、5–11 岁 $49），每天 9:30、13:30 两班，建议提前订",
    mustSee: true,
    summary:
      "3.5 小时，从 Convoy Point 横渡比斯坎湾，沿北礁岛群讲这片海一万年来的故事：原住民、沉船、菠萝种植户，到总统常来的度假岛；中途按当天风浪在 Elliott Key、Boca Chita 或 Adams Key 其中一个岛上停约 1 小时。Elliott Key 是公园最大的岛，有海边木栈道和穿过热带硬木林的步道。",
    tips: [
      "上哪个岛看当天风浪；一定要去 Boca Chita 灯塔的，改订 Coconut Grove 出发的 Boca Chita 游船",
      "开船前 30 分钟到游客中心二楼的商店报到，免责声明先在线签好",
      "岛上没有饮用水和商店（船上可以续水）；Elliott Key 夏秋蚊子很多，带驱蚊液",
    ],
    photoFile: "Biscayne National Park H-elliott key pioneer home.jpg",
  },
  {
    id: "bisc-boca-chita",
    park: "bisc",
    nameZh: "Boca Chita 灯塔岛游船",
    nameEn: "Boca Chita Key Heritage Cruise",
    kind: "experience",
    area: "north-bay",
    lat: 25.52472,
    lon: -80.17607,
    start: DINNER_KEY,
    durationMin: 210,
    bestMonths: [12, 1, 2, 3, 4, 5],
    permit: "向 Biscayne National Park Institute 订票（2026 年 13 岁以上 $83、5–12 岁 $49），每天一班，建议提前订",
    mustSee: true,
    summary:
      "Boca Chita 是工业家 Mark Honeywell 1930 年代的私人度假岛，岛上的珊瑚石小港、野餐亭和 1938 年建的装饰灯塔都是那时留下的。灯塔修了两年多，2026 年 6 月重新开放，又能爬上去看四周的浅海和远处迈阿密的天际线。游船从 Coconut Grove 的 Dinner Key 出发，在岛上停约 1 小时，可以上灯塔、绕岛走一圈。",
    tips: [
      "11 月到 5 月 9:15 开，6 月到 10 月改成 13:30；6–8 月多加 1 小时湾里的入门浮潜（约 4.5 小时）",
      "进灯塔要身高 42 英寸（约 107 厘米）以上",
      "Dinner Key 停车收费，建议停 Regatta Harbour 停车楼，路上至少留 1 小时防堵车，开船前 30 分钟到码头",
    ],
    photoFile: "Boca Chita Lighthouse.jpg",
  },
  {
    id: "bisc-snorkel",
    park: "bisc",
    nameZh: "珊瑚礁浮潜团",
    nameEn: "Biscayne Snorkel Experience",
    kind: "experience",
    area: "keys",
    lat: 25.43,
    lon: -80.13,
    start: CONVOY_PARKING,
    durationMin: 210,
    bestTime: ["morning"],
    bestMonths: [5, 6, 7, 8, 9],
    permit: "向 Biscayne National Park Institute 订票（2026 年拼团每人 $115，8 岁以上；包船 6 人以内 $690），每天 9:15、13:30 两班",
    mustSee: true,
    summary:
      "公园的精华在水下。3.5 小时的浮潜团从 Convoy Point 出发，船长按当天风浪挑地方：外海的珊瑚礁盘、湾边的红树林根，或者海洋遗产步道（Maritime Heritage Trail）上的沉船；冬春风浪合适时还会顺路上岛。常见鹦嘴鱼、神仙鱼、海龟和大片的软珊瑚。",
    tips: [
      "要会游泳、能自己爬 4 级梯子；浮潜背心免费，脚蹼必须有（面镜、呼吸管、脚蹼套装租 $16）",
      "冬季冷锋过境时风大浪高，常因天气取消，订的时候看清改期规则",
      "只用对珊瑚安全的防晒霜，不要碰、不要站在珊瑚上；8 岁以下只能订包船",
    ],
    photoFile: "Biscayne National Park H-snorkel on elkhorn.jpg",
  },
  {
    id: "bisc-jones-lagoon",
    park: "bisc",
    nameZh: "Jones 泻湖划桨",
    nameEn: "Jones Lagoon Eco-Paddle",
    kind: "experience",
    area: "keys",
    lat: 25.36928,
    lon: -80.24338,
    start: CONVOY_PARKING,
    durationMin: 210,
    bestMonths: [3, 4, 5, 6],
    permit: "向 Biscayne National Park Institute 订票（2026 年拼团每人 $109，12 岁以上；包船 6 人以内 $654），每天 9:00、13:30 两班，每船最多 6 人",
    summary:
      "坐 30–45 分钟快艇到 Totten Key 和 Old Rhodes Key 之间的浅水泻湖，换站立桨板或充气双人皮划艇，在齐膝深、清得见底的水上慢慢划，常看到小柠檬鲨、黄貂鱼、海龟和涉禽。公园里最安静的一角，只有小船进得来。",
    tips: [
      "拼团要 12 岁以上、会游泳；8–12 岁只能订包船，和大人同坐一条双人艇",
      "每船只有 6 个位子，旺季早订",
      "水浅反光强，戴帽子、穿防晒衣，带防水袋装手机",
    ],
    photoFile: "Biscayne National Park H-kayak on biscayne bay.jpg",
  },
  {
    id: "bisc-stiltsville",
    park: "bisc",
    nameZh: "Stiltsville 高脚屋游船",
    nameEn: "Stiltsville Guided Tour",
    kind: "experience",
    area: "north-bay",
    lat: 25.6535,
    lon: -80.1715,
    start: DINNER_KEY,
    durationMin: 120,
    bestTime: ["afternoon"],
    permit: "向 Biscayne National Park Institute 订票（2026 年 5 岁以上 $70），只在周四到周日开，12:30、15:00 两班",
    summary:
      "比斯坎湾北边浅滩上立在木桩上的一群房子：1930 年代起有人在这里盖钓鱼屋、赌博俱乐部和私人会所，1960 年最多时有 27 栋，经过一次次飓风，现在只剩 6 栋，归公园所有。2 小时的船从 Coconut Grove 出发，绕着高脚屋近看、讲它们的故事，背景是迈阿密的天际线；不上岸、不进屋。",
    tips: [
      "只在周四到周日开；想自己划过去的，同样周四到周日有 3 小时的海草床皮划艇团（$109）",
      "码头放不下登船坡道，坐轮椅上船不方便；现场不收现金",
      "Dinner Key 停车收费，开船前 30 分钟到 9 号码头",
    ],
    photoFile: "Stiltsville 1 Miami.jpg",
  },
  {
    id: "bisc-coral-castle",
    park: "bisc",
    nameZh: "珊瑚城堡（Coral Castle）",
    nameEn: "Coral Castle Museum",
    kind: "landmark",
    area: "homestead",
    lat: 25.50072,
    lon: -80.44418,
    durationMin: 60,
    hours: [{ open: "09:00", lastEntry: "18:00", close: "19:00" }],
    outsidePark: true,
    summary:
      "拉脱维亚移民 Edward Leedskalnin 1923–1951 年一个人用珊瑚石灰岩凿出来的石头园：桌椅、月亮、太阳钟和一扇 9 吨重、一推就转的石门，有的石块重好几吨，他怎么搬动的到现在还众说纷纭。在 Homestead 北边的 US-1 路边，去比斯坎或大沼泽地顺路。",
    tips: [
      "每天开，营业到 19:00 或 20:00（随季节），最后一场导览比关门早 1 小时",
      "门票在官网或现场买；园里几乎没有遮阴，夏天挑早上去",
    ],
    photoFile: "Coral Castle.jpg",
  },
];
