import type { Attraction } from "./types";

// The Wave 和 Wire Pass 共用一个步道口：89 号公路往南拐进 House Rock Valley Road（土路）约 13 公里
const WIRE_PASS_TRAILHEAD = { lat: 37.0188, lon: -112.0254, nameZh: "Wire Pass 步道口停车场（House Rock Valley Road）" };

export const theWave: Attraction[] = [
  {
    id: "wave-the-wave",
    park: "wave",
    nameZh: "波浪谷（The Wave）",
    nameEn: "The Wave (Coyote Buttes North)",
    kind: "hike",
    area: "coyote-buttes",
    lat: 36.99596,
    lon: -112.00633,
    start: WIRE_PASS_TRAILHEAD,
    durationMin: 360,
    // 先沿 Wire Pass 干河床走一小段，再往南翻过沙丘和砂岩坡到 Coyote Buttes North
    trail: {
      via: [
        { lat: 37.0202, lon: -112.01991 },
        { lat: 37.01603, lon: -112.01186 },
        { lat: 37.00729, lon: -112.00796 },
        { lat: 36.99596, lon: -112.00633 },
      ],
    },
    hike: { distanceMi: 6.4, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [3, 4, 5, 9, 10, 11],
    permit:
      "每天只发 64 人：48 人走提前 4 个月的网上抽签（Recreation.gov，每月 1 日开奖），16 人走出发前两天的手机抽签（人要在 Kanab 到 Page 一带的地理围栏里）；每份申请 $6，中签每人 $7",
    lottery: true,
    mustSee: true,
    summary: "朱红悬崖国家保护区里一片被风化成层层波纹的纳瓦霍砂岩，红、黄、白的条纹像凝固的海浪，是美国西南最难拿到许可证的徒步。",
    tips: [
      "往返约 10 公里，没有步道和路标，要照着许可证附带的路线图和 GPS 坐标走；5–9 月酷热、几乎没有遮阴，这里出过中暑死亡的事故，每人至少带 3 升水",
      "要先开约 13 公里的 House Rock Valley Road 土路到步道口，雨后可能泥泞到四驱车也过不去，而许可证不能改期",
      "每日抽签中签的人要在徒步前一天早上 8:30 到 Kanab 游客中心或 Page 的 Lake Powell Hub 听现场安全说明",
    ],
    photoFile: "The Wave - Coyote Buttes North (49995874171).jpg",
  },
  {
    id: "wave-wire-pass",
    park: "wave",
    nameZh: "Wire Pass 狭缝峡谷（到 Buckskin Gulch）",
    nameEn: "Wire Pass to Buckskin Gulch",
    kind: "hike",
    area: "house-rock",
    lat: 37.0199,
    lon: -112.00278,
    start: WIRE_PASS_TRAILHEAD,
    durationMin: 180,
    trail: {
      via: [
        { lat: 37.02198, lon: -112.01574 },
        { lat: 37.02112, lon: -112.00895 },
        { lat: 37.0199, lon: -112.00278 },
      ],
    },
    hike: { distanceMi: 3.4, difficulty: "moderate" },
    permit: "一日徒步每人 $6（狗也要付），在步道口扫码自助付费或提前在 Recreation.gov 买，不用抽签",
    summary:
      "和 The Wave 同一个步道口出发，沿干河床走约 2.7 公里，钻过只容一人侧身的 Wire Pass 窄缝，到它汇入 Buckskin Gulch 的地方；Buckskin Gulch 是美国西南最长的狭缝峡谷之一。",
    tips: [
      "途中有一处两三米高的岩石落差要手脚并用爬下去，旁边有绕行的小路",
      "交汇处附近的岩壁上有古代岩画，别用手摸",
      "狭缝里遇上山洪无处可躲，下雨或有山洪预警时不要进；House Rock Valley Road 雨后可能过不去",
    ],
    photoFile: "Buckskin Gulch (35186004265).jpg",
  },
  {
    id: "wave-toadstools",
    park: "wave",
    nameZh: "蘑菇石（Toadstool Hoodoos）",
    nameEn: "Toadstool Hoodoos",
    kind: "hike",
    area: "us-89",
    lat: 37.10821,
    lon: -111.87088,
    start: { lat: 37.10115, lon: -111.8733, nameZh: "Toadstools 步道口停车场（89 号公路旁）" },
    durationMin: 75,
    trail: {
      via: [
        { lat: 37.10463, lon: -111.87096 },
        { lat: 37.10682, lon: -111.87102 },
        { lat: 37.10821, lon: -111.87088 },
      ],
    },
    hike: { distanceMi: 1.5, difficulty: "easy" },
    bestTime: ["morning", "sunset"],
    summary: "89 号公路边的短步道，沿干河床走进一片白色和红色岩层夹成的小谷，一根根红砂岩柱顶着一块更硬的岩石“帽子”，像一朵朵蘑菇。",
    tips: [
      "在 Grand Staircase-Escalante 国家保护区内，89 号公路 19 和 20 英里标之间，不收费、不用许可证",
      "沙地多、没有遮阴，夏天避开中午；岩柱很脆，不要攀爬",
    ],
    photoFile: "Toadstool Hoodoos at Grand Staircase-Escalante in UT 1.jpg",
  },
  {
    id: "wave-white-pocket",
    park: "wave",
    nameZh: "白口袋（White Pocket）",
    nameEn: "White Pocket",
    kind: "experience",
    area: "paria-plateau",
    lat: 36.95724,
    lon: -111.89777,
    start: { lat: 36.95505, lon: -111.89365, nameZh: "White Pocket 停车场（四驱沙路尽头）" },
    durationMin: 150,
    permit: "不用许可证；但要开高底盘四驱车走二十多公里深沙土路，多数人跟 Kanab 或 Page 出发的四驱一日团（全天约 7–8 小时）",
    summary:
      "帕里亚高原上一片白色和红色交错的砂岩，表面像大脑沟回和奶油漩涡，雨后小水潭能倒映岩石；景色和 The Wave 相近、面积更大，不用抽签。",
    tips: [
      "从 House Rock Valley Road 转 BLM 1017、1087、1086 号土路，一路深沙，普通 SUV 和适时四驱很容易陷车，租车合同通常也不允许开",
      "沿路和现场都没有手机信号、水和厕所，自驾要结伴、带够水和脱困工具；雨后和盛夏不要自己开",
    ],
    photoFile: "Vermilion Cliffs National Monument - Paria Canyon - White Pocket with pool and vegetation (35303513332).jpg",
  },
];
