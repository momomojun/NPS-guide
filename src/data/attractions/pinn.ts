import type { Attraction } from "./types";

// 尖峰石阵国家公园（pinn）。坐标按 OpenStreetMap、NPS API places 和 NPS 公布的 GPS 坐标核对，步道途经点取 OSM 步道（2026-10-05）。
// 步道距离、爬升、时长按 NPS Trails of Pinnacles 页面（https://www.nps.gov/pinn/planyourvisit/trails.htm）。
// 2026 年 10 月的现况（来源见 notes.md）：
// - Bear Gulch 洞穴上、下两段和 Balconies 洞穴都开着（NPS 洞穴状态页 2026-10-01）；上洞一年只开几个星期，10 月下旬常整洞开放一阵。
// - 猛禽保护的攀岩、离开步道限制 2026 年 7 月 6 日已全部解除，明年 1 月起又会陆续划出敏感区（不影响正式步道）。
// - 火险“很高”：禁止烧柴和木炭，步道上禁烟，不许路边停车。
// - 东侧春季周末的接驳车（营地 ↔ Bear Gulch）本季已结束。

// 东西两侧不通车：东侧从 25 号公路进 146 号公路，西侧从 Soledad 走 146 号公路（后段是单车道窄路）
/** 东侧 Bear Gulch 一带：Moses Spring 停车场（Bear Gulch 洞穴、水库、Chalone 峰的步道口） */
const MOSES_SPRING_PARKING = { lat: 36.47852, lon: -121.18385, nameZh: "Moses Spring 停车场（Bear Gulch）" };
/** 东侧 Bear Gulch 日间区：自然中心和 Condor Gulch 步道口 */
const BEAR_GULCH_DAY_USE = { lat: 36.48145, lon: -121.18114, nameZh: "Bear Gulch 日间区停车场（自然中心旁）" };
/** 西侧 Chaparral 停车场：Balconies、Juniper Canyon 步道口，西侧路的尽头 */
const CHAPARRAL_PARKING = { lat: 36.49183, lon: -121.20967, nameZh: "Chaparral 停车场（西侧）" };
/** 西侧大门 7:30–20:00 开，只能白天进、不能过夜 */
const WEST_GATE = [{ open: "07:30", close: "20:00" }];

export const pinnacles: Attraction[] = [
  {
    id: "pinn-visitor-center",
    park: "pinn",
    nameZh: "尖峰石阵游客中心（东侧）",
    nameEn: "Pinnacles Visitor Center (East)",
    kind: "visitor",
    area: "east",
    lat: 36.49373,
    lon: -121.14639,
    durationMin: 20,
    hours: [{ open: "09:00", close: "16:00" }],
    summary:
      "东门收费站进来约 2 公里、在营地入口处，是东侧的游客中心兼公园商店（12–13 点午休），能拿地图、问洞穴和停车情况；旁边的营地商店卖简单的吃喝和冰块，还有冲水厕所和饮用水。",
    tips: [
      "园内没有餐厅和加油站，最近的加油站在 Hollister、King City 或 Soledad，进园前加满、带足吃的",
      "园内大部分地方没有手机信号，先下载 NPS App 里的公园离线地图",
      "门票每车 $30、7 天内东西两侧通用，只收卡；入口收费站没人时可以出园时补交",
    ],
  },
  {
    id: "pinn-bear-gulch-cave",
    park: "pinn",
    nameZh: "Bear Gulch 洞穴与水库（Moses Spring–Rim 环线）",
    nameEn: "Bear Gulch Cave & Reservoir (Moses Spring–Rim Trail Loop)",
    kind: "hike",
    area: "east",
    lat: 36.47225,
    lon: -121.18932,
    start: MOSES_SPRING_PARKING,
    durationMin: 90,
    trail: {
      via: [
        { lat: 36.47663, lon: -121.1853 },
        { lat: 36.47444, lon: -121.18634 },
        { lat: 36.473, lon: -121.18685 },
        { lat: 36.47225, lon: -121.18932 },
        { lat: 36.47505, lon: -121.18739 },
      ],
      loop: true,
    },
    hike: { distanceMi: 2.2, gainFt: 500, difficulty: "moderate", loop: true },
    bestTime: ["morning"],
    bestMonths: [3, 4, 10, 11],
    mustSee: true,
    summary:
      "公园最经典的短线：沿 Moses Spring 步道钻进巨石塌落堆成的 Bear Gulch 洞穴，在黑暗里弯腰、侧身、踩着凿出的石阶往上爬，出洞就是被红褐色岩壁围着的 Bear Gulch 水库，再从 Rim 步道沿峡谷边绕回来。全程约 3.5 公里，适合一家人。",
    tips: [
      "洞里很黑，每人带一支手电或头灯；有几处要弯腰、手脚并用，地面湿滑，穿防滑鞋",
      "5 月中到 7 月中蝙蝠育幼，整个洞关闭，其余时间一般只开下洞、上洞一年只开几个星期（多在 3 月、10 月）；洞关着也能走 Rim 步道到水库，出发前看 NPS 的洞穴状态页",
      "春季周末这一带的停车场 8 点前就可能停满，晚了只能停到下面的 Peaks View 或营地，再走 Bench / Sycamore 步道上来（营地单程约 3.7 公里）",
    ],
    photoFile: "Bear Gulch Reservoir, Pinnacles National Park, California (13414023934).jpg",
  },
  {
    id: "pinn-high-peaks",
    park: "pinn",
    nameZh: "High Peaks 尖峰环线（Condor Gulch 上、High Peaks 下）",
    nameEn: "Condor Gulch to High Peaks Loop",
    kind: "hike",
    area: "east",
    lat: 36.48577,
    lon: -121.19834,
    start: BEAR_GULCH_DAY_USE,
    durationMin: 240,
    trail: {
      via: [
        { lat: 36.48567, lon: -121.1871 },
        { lat: 36.48521, lon: -121.1925 },
        { lat: 36.48831, lon: -121.19519 },
        { lat: 36.48587, lon: -121.1982 },
        { lat: 36.48253, lon: -121.19855 },
        { lat: 36.47893, lon: -121.19145 },
        { lat: 36.47847, lon: -121.18362 },
      ],
      loop: true,
    },
    hike: { distanceMi: 5.3, gainFt: 1300, difficulty: "hard", loop: true },
    bestTime: ["morning"],
    bestMonths: [3, 4, 5, 10, 11],
    mustSee: true,
    summary:
      "爬进公园名字由来的那片火山岩尖峰。Condor Gulch 一路上坡，回头就是越来越近的 High Peaks；到了顶上走“Steep and Narrow”一段：石阶凿在岩壁上，窄处只容一人、旁边有铁扶手，脚下是几十米深的石缝。这一带是看加州神鹫最好的地方，常见它们贴着岩峰盘旋。",
    tips: [
      "约 8.5 公里、爬升约 400 米，几乎没有树荫，夏天别在 10–16 点走；NPS 建议每人每小时喝 1 升水，步道上没有水",
      "看到神鹫别靠近、别喂食；带望远镜，翅膀下的白色三角和编号牌是认它的标志",
      "Steep and Narrow 一段有陡石阶和扶手，怕高的可以从 Condor Gulch 观景台原路返回（往返约 3.2 公里）",
    ],
    photoFile: "High Peaks of Pinnacles.JPG",
  },
  {
    id: "pinn-condor-gulch-overlook",
    park: "pinn",
    nameZh: "Condor Gulch 观景台",
    nameEn: "Condor Gulch Overlook",
    kind: "hike",
    area: "east",
    lat: 36.48521,
    lon: -121.1925,
    start: BEAR_GULCH_DAY_USE,
    durationMin: 75,
    trail: { via: [{ lat: 36.48567, lon: -121.1871 }, { lat: 36.48521, lon: -121.1925 }] },
    hike: { distanceMi: 2, gainFt: 600, difficulty: "moderate" },
    bestTime: ["morning", "afternoon"],
    summary:
      "不想走整条 High Peaks 环线的短版本：从 Bear Gulch 日间区上坡约 1.6 公里，到一处凸出的平台，High Peaks 的尖峰就立在头顶，开阔的山谷里常有神鹫和红头美洲鹫乘着上升气流盘旋。",
    tips: ["全程暴晒、一路上坡，夏天清早来", "原路返回；体力好的可以接着往上走成 High Peaks 环线"],
    photoFile: "View of Pinnacles in High Peaks Area, Pinnacles National Park (13412906643).jpg",
  },
  {
    id: "pinn-chalone-peak",
    park: "pinn",
    nameZh: "北 Chalone 峰（公园最高点）",
    nameEn: "North Chalone Peak Trail",
    kind: "hike",
    area: "east",
    lat: 36.44761,
    lon: -121.19565,
    start: MOSES_SPRING_PARKING,
    durationMin: 270,
    trail: {
      via: [
        { lat: 36.47225, lon: -121.18932 },
        { lat: 36.46409, lon: -121.19197 },
        { lat: 36.45188, lon: -121.19755 },
        { lat: 36.44761, lon: -121.19565 },
      ],
    },
    hike: { distanceMi: 9, gainFt: 2040, difficulty: "hard" },
    bestTime: ["morning"],
    bestMonths: [3, 4, 11],
    summary:
      "从 Bear Gulch 水库往南一路缓缓爬到海拔约 1,000 米的北 Chalone 峰，是公园的最高点：往西能望到萨利纳斯谷和远处的圣卢西亚山脉，往东是 High Peaks 的整片尖峰，人比洞穴一带少得多。",
    tips: [
      "往返约 14.5 公里、爬升约 620 米，最后约 1.6 公里是土路；全程几乎无遮挡，夏天不建议",
      "想走更远的可以再沿不维护的小路往南约 2.6 公里到南 Chalone 峰",
    ],
    photoFile: "South and North Chalone Peaks from Pinnacles National Monument Chalone Peak Trail.jpg",
  },
  {
    id: "pinn-old-pinnacles-balconies",
    park: "pinn",
    nameZh: "Old Pinnacles 步道到 Balconies 洞穴（东侧进）",
    nameEn: "Old Pinnacles Trail to Balconies Cave",
    kind: "hike",
    area: "east",
    lat: 36.49997,
    lon: -121.20116,
    start: { lat: 36.49492, lon: -121.17295, nameZh: "Old Pinnacles 停车场（东侧）" },
    durationMin: 210,
    trail: {
      via: [
        { lat: 36.49979, lon: -121.17829 },
        { lat: 36.50283, lon: -121.18921 },
        { lat: 36.49997, lon: -121.20116 },
      ],
    },
    hike: { distanceMi: 5.3, gainFt: 100, difficulty: "moderate" },
    bestTime: ["morning"],
    bestMonths: [3, 4, 5, 10, 11],
    summary:
      "从东侧走到西边的 Balconies 洞穴：沿 Chalone 溪的平缓步道走约 4 公里，几次踩石头过溪，Machete Ridge 等巨大的岩墙一路越来越近，最后钻进 Balconies 洞穴。住东侧营地、又想看 Balconies 的走这条，不用绕到西门。",
    tips: [
      "往返约 8.5 公里、几乎不爬升，但没有树荫；春天溪水大时过溪会湿鞋",
      "洞里有一段要摸黑攀爬巨石，带手电；回程可以走洞顶上方的 Balconies Cliffs 步道看岩壁",
    ],
    photoFile: "Machete Ridge in Pinnacles National Park, California, US.jpg",
  },
  {
    id: "pinn-west-visitor-station",
    park: "pinn",
    nameZh: "West Pinnacles 游客服务站（西侧）",
    nameEn: "West Pinnacles Visitor Contact Station",
    kind: "visitor",
    area: "west",
    lat: 36.4775,
    lon: -121.22587,
    durationMin: 15,
    hours: [{ open: "09:00", close: "15:00" }],
    summary: "西门收费站旁的小游客服务站，有地图、步道和洞穴的最新情况、厕所和饮用水；Prewett Point 步道就从这里出发，再往里约 3 公里是 Chaparral 停车场。",
    tips: [
      "西侧大门 7:30–20:00 开，只能白天来，不能过夜，晚到了进不去",
      "从 Soledad 过来的 146 号公路后段只有一车多宽、弯多，房车和拖车慢慢开，别跟着导航搜“Pinnacles National Park”，用 NPS 给的西门坐标",
    ],
    photoFile: "Pinnacles West (Chaparral Station) - panoramio.jpg",
  },
  {
    id: "pinn-prewett-point",
    park: "pinn",
    nameZh: "Prewett Point 观景步道（看日落）",
    nameEn: "Prewett Point Trail",
    kind: "viewpoint",
    area: "west",
    lat: 36.4813,
    lon: -121.22138,
    start: { lat: 36.47834, lon: -121.22627, nameZh: "West Pinnacles 游客服务站停车场" },
    durationMin: 40,
    trail: {
      via: [
        { lat: 36.47983, lon: -121.22356 },
        { lat: 36.48129, lon: -121.2229 },
        { lat: 36.4813, lon: -121.22138 },
      ],
    },
    hike: { distanceMi: 0.9, gainFt: 70, difficulty: "easy" },
    hours: WEST_GATE,
    bestTime: ["sunset"],
    bestMonths: [10, 11, 12, 1, 2, 3],
    summary:
      "西侧坡度平缓的短步道，往返约 1.4 公里，沿着山脊走到一处最大的观景台，正对整片 High Peaks 和 Hain 荒野。西侧是“日落的一侧”，傍晚斜阳把尖峰照成橙红色，是全园看日落最好的地方。",
    tips: [
      "西门 20:00 关，5–8 月日落接近或晚于 20:00，看完日落就出不了园，这几个月改成傍晚早一点来看斜阳",
      "几乎没有树荫，上午和中午很晒；沿途有几处带长椅的观景平台",
    ],
  },
  {
    id: "pinn-balconies-cave",
    park: "pinn",
    nameZh: "Balconies 洞穴与崖壁环线（西侧）",
    nameEn: "Balconies Cliffs–Cave Loop",
    kind: "hike",
    area: "west",
    lat: 36.49909,
    lon: -121.2024,
    start: CHAPARRAL_PARKING,
    durationMin: 90,
    trail: {
      via: [
        { lat: 36.49461, lon: -121.20627 },
        { lat: 36.49694, lon: -121.2032 },
        { lat: 36.49909, lon: -121.2024 },
        { lat: 36.49997, lon: -121.20116 },
        { lat: 36.50052, lon: -121.2021 },
        { lat: 36.49777, lon: -121.20316 },
      ],
      loop: true,
    },
    hike: { distanceMi: 2.4, gainFt: 100, difficulty: "moderate", loop: true },
    hours: WEST_GATE,
    bestTime: ["morning", "afternoon"],
    bestMonths: [3, 4, 5, 10, 11],
    mustSee: true,
    summary:
      "从 Chaparral 停车场沿溪谷走进两侧都是高耸岩墙的峡谷，钻过巨石卡在半空堆成的 Balconies 洞穴，再爬上洞顶的 Balconies Cliffs 步道，从高处看 Machete Ridge 等岩壁绕回来。约 3.9 公里，短而好玩，全年都开（暴雨后可能积水关闭）。",
    tips: [
      "洞里有一段完全没光，要手脚并用爬巨石、钻低矮的石缝，每人带一支手电或头灯",
      "下雨后洞里会积水，可能要蹚水或临时关闭；出发前看 NPS 洞穴状态页",
      "春季周末 Chaparral 停车场 8 点前就可能停满，满了要停在约 0.5 公里外的 Jawbone 停车场走过来",
    ],
    photoFile: "Inside Balconies Cave at Pinnacles National Park.jpg",
  },
  {
    id: "pinn-juniper-canyon",
    park: "pinn",
    nameZh: "Juniper Canyon–Tunnel 环线（西侧上 High Peaks）",
    nameEn: "Juniper Canyon Loop (via Tunnel Trail)",
    kind: "hike",
    area: "west",
    lat: 36.48587,
    lon: -121.1982,
    start: CHAPARRAL_PARKING,
    durationMin: 165,
    trail: {
      via: [
        { lat: 36.49122, lon: -121.20847 },
        { lat: 36.48635, lon: -121.20386 },
        { lat: 36.48568, lon: -121.20083 },
        { lat: 36.48587, lon: -121.1982 },
        { lat: 36.48743, lon: -121.1996 },
        { lat: 36.48598, lon: -121.20049 },
      ],
      loop: true,
    },
    hike: { distanceMi: 4.3, gainFt: 1215, difficulty: "hard", loop: true },
    hours: WEST_GATE,
    bestTime: ["morning"],
    bestMonths: [3, 4, 5, 10, 11],
    summary:
      "从西侧上 High Peaks 最近的一条路：沿 Juniper Canyon 的之字形山路一口气爬上去，在顶上走一段凿在岩壁上的 Steep and Narrow，再从穿过岩石隧道的 Tunnel 步道下来。比东侧的环线短，但更陡。",
    tips: [
      "约 6.9 公里、爬升约 370 米，大部分是暴晒的陡坡，夏天只在清早走",
      "Steep and Narrow 一段要扶着铁栏杆上下陡石阶，雨后岩石湿滑",
    ],
    photoFile: "High Peaks Trail in Pinnacles National Park, California, US.jpg",
  },
];
