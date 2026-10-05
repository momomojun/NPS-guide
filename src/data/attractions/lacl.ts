import type { Attraction } from "./types";

// 公园不通公路，都要坐小飞机：海岸看熊、Crescent 湖、Proenneke 小屋的一日游从安克雷奇 Lake Hood 起飞（Rust's、Regal Air、Trail Ridge Air 等），
// 一路穿过 Lake Clark Pass 或飞越 Cook 湾西岸的火山；海岸看熊从 Homer、Soldotna 飞更近
const LAKE_HOOD = { lat: 61.17933, lon: -149.97099, nameZh: "安克雷奇 Lake Hood 水上飞机基地（南岸的 Rust's 等航空公司）" };
// 去 Port Alsworth 的 Lake Clark Air 从 Merrill Field 起飞，约 1 小时，穿过 Lake Clark Pass
const MERRILL_FIELD = { lat: 61.21463, lon: -149.83363, nameZh: "安克雷奇 Merrill Field 机场（Lake Clark Air 航站）" };
const PORT_SEASON = [6, 7, 8, 9];
const PORT_CLOSED =
  "Port Alsworth 的游客中心只在 6–8 月开，10 月以后天短、开始下雪，多数旅馆和向导也歇业；冬季可以包机去，但不适合一日游。";

export const lakeClark: Attraction[] = [
  {
    id: "lacl-coastal-bears",
    park: "lacl",
    nameZh: "海岸看熊（Chinitna 湾 / Silver Salmon Creek）",
    nameEn: "Coastal Bear Viewing (Chinitna Bay & Silver Salmon Creek)",
    kind: "experience",
    area: "coast",
    lat: 59.85774,
    lon: -153.15511,
    start: LAKE_HOOD,
    durationMin: 360,
    openMonths: [5, 6, 7, 8, 9],
    closedNote: "海岸看熊的航班大约 5 月中到 9 月中飞（各家日期不同），冬季没有。",
    bestTime: ["morning"],
    bestMonths: [6, 7, 8],
    permit:
      "要订带向导的看熊一日游：安克雷奇出发 2026 年 Rust's 的 Chinitna 湾团 $1,145（约 6 小时，5 月 15 日到 8 月 31 日）、Regal Air $1,125；Homer 出发 Smokey Bay Air $895、Alaska Bear Adventures $795 起",
    mustSee: true,
    summary:
      "比 Brooks 瀑布人少得多的海岸看熊：小飞机从安克雷奇飞约 1 小时 10 分，越过 Cook 湾、经过 Redoubt 和 Iliamna 两座活火山，在 Chinitna 湾或 Silver Salmon Creek 的海滩降落，跟着向导在盐沼和泥滩之间走。初夏熊在盐沼吃高蛋白的莎草，退潮时下到泥滩挖竹蛏；夏末鲑鱼进溪，熊转到河口，Silver Salmon Creek 8 月以后还有银鲑洄游。NPS 说在 Chinitna 湾一个地方就可能看到二十头熊。",
    tips: [
      "从 Homer 或 Soldotna 飞更近、更便宜（Homer 出发 3–5 小时、$795–895），住在基奈半岛的可以从那里走",
      "Chinitna 湾有指定的看熊点，部分盐沼不让进，跟着向导走指定路线、离熊保持距离",
      "公司一般发高筒防水靴；降落点看潮水和天气，坏天气会改期，行程里留一点弹性",
    ],
    photoFile: "Brown Bear, Silver Salmon Creek.jpg",
  },
  {
    id: "lacl-crescent-lake",
    park: "lacl",
    nameZh: "Crescent 湖看熊（Redoubt 火山下）",
    nameEn: "Crescent Lake Bear Viewing (Redoubt Mountain Lodge)",
    kind: "experience",
    area: "crescent",
    lat: 60.36061,
    lon: -152.86411,
    start: LAKE_HOOD,
    durationMin: 660,
    openMonths: [8, 9],
    closedNote:
      "Crescent 湖的看熊一日游只在 8 月 1 日到 9 月 25 日左右开（红鲑产卵季）；其余月份可以改坐去 Chinitna 湾的海岸看熊团。",
    bestMonths: [8, 9],
    permit: "向 Rust's 订（2026 年 $1,445/人，另加 3% 运输税和 $15 国家公园费），名额少、要提前订",
    mustSee: true,
    summary:
      "Chigmit 山脉里一个青绿色的冰川湖，背后就是 3,100 多米、2009 年还喷发过的 Redoubt 火山。夏末红鲑沿湖岸和入湖的溪流产卵，棕熊就在岸边、溪口捉鱼。一日游的水上飞机直接降落在湖边的 Redoubt Mountain Lodge，坐带顶棚的浮筒船沿岸慢慢找熊，中午在木屋吃饭；9 月湖边的白杨、桦树一片金黄。",
    tips: [
      "全程约 11 小时，8 月 8 点、9 月 9 点从 Lake Hood 起飞，单程飞约 70 分钟",
      "主要坐在船上看熊，带望远镜、防雨外套和保暖层",
      "想多待几天可以住湖边的 Redoubt Mountain Lodge（只能飞进去）",
    ],
    photoFile: "Brown bear on the shore of Crescent Lake (54382236228).jpg",
  },
  {
    id: "lacl-proenneke-cabin",
    park: "lacl",
    nameZh: "飞越 Lake Clark Pass 到 Proenneke 小屋",
    nameEn: "Lake Clark Pass Flight & Proenneke's Cabin (Upper Twin Lake)",
    kind: "experience",
    area: "twin-lakes",
    lat: 60.645,
    lon: -153.82096,
    start: LAKE_HOOD,
    durationMin: 300,
    openMonths: [6, 7, 8, 9],
    closedNote:
      "Upper Twin Lake 大约 5 月底才化冰，只有水上飞机能降落；小屋 2026 年开放到 9 月底（每天 10:00–16:00），冬季湖面结冰、小屋关闭，只能包装雪橇的飞机。",
    bestMonths: [7, 8, 9],
    permit:
      "向 Lake Hood 的航空公司订：2026 年 Trail Ridge Air 4–5 小时 $1,100/人、Rust's 5 小时 $1,295/人（2 人起，另加 3% 运输税和 $15 国家公园费）",
    mustSee: true,
    summary:
      "水上飞机从安克雷奇起飞，穿过两边挂满冰川的 Lake Clark Pass，降落在青绿色的 Upper Twin Lake。湖边就是 Dick Proenneke 1967–1968 年夏天用自己做的手工工具盖起的小木屋：约 3.7 × 4.9 米，有湖滩石垒的壁炉和木头合页的手工门，他在这里不用电、不用自来水、没有电话住了约 30 年，还把生活拍成了影片（后来剪成纪录片《Alone in the Wilderness》）。夏天有 NPS 志愿者在小屋讲解。",
    tips: [
      "小屋 2026 年开放季每天 10:00–16:00，有人值守时才开门，里面不保证能进",
      "Lake Clark Pass 天气多变，云低就飞不过去，改期很常见，行程里留一点弹性",
      "去之前读一读《One Man's Wilderness》或看看纪录片，更有感觉；也可以先飞到 Port Alsworth，再转约 30 分钟的水上飞机",
    ],
    photoFile: "Proenneke's Cabin.jpg",
  },
  {
    id: "lacl-port-alsworth",
    park: "lacl",
    nameZh: "Port Alsworth 与 Tanalian 瀑布",
    nameEn: "Port Alsworth & Tanalian Falls Trail",
    kind: "experience",
    area: "port-alsworth",
    lat: 60.18373,
    lon: -154.26838,
    start: MERRILL_FIELD,
    durationMin: 390,
    hike: { distanceMi: 4, difficulty: "moderate" },
    openMonths: PORT_SEASON,
    closedNote: PORT_CLOSED,
    bestMonths: [7, 8, 9],
    permit: "Lake Clark Air 从 Merrill Field 按座位卖票（往返一般 $500 以上，以报价为准），夏季提前订；步道不用许可",
    mustSee: true,
    summary:
      "坐小飞机穿过 Lake Clark Pass，约 1 小时降落在 Lake Clark 湖边的 Port Alsworth：一个不通公路、靠两条砂石跑道和外面联系的小村，公园的野外总部和游客中心就在跑道边。从村里出发的 Tanalian 步道穿过白桦林和云杉坡，约 3.2 公里到 Tanalian 瀑布，冰川融水从约 9 米高的古熔岩崖上冲下来，路上能俯瞰青绿色的 Lake Clark；体力好的可以再往里走到 Kontrashibuna 湖。",
    tips: [
      "村里没有超市，自带午饭和水；跑道一直有飞机起降，过跑道前左右看、还要抬头看",
      "游客中心夏季开放，可以拿步道地图、借防熊食物罐，出发前问一下熊的情况",
      "想爬 Tanalian 山或多走几条步道，可以在村里的小旅馆住一两晚",
    ],
    photoFile: "Tanalian Falls - panoramio.jpg",
  },
  {
    id: "lacl-tanalian-mountain",
    park: "lacl",
    nameZh: "Tanalian 山步道",
    nameEn: "Tanalian Mountain Trail",
    kind: "hike",
    area: "port-alsworth",
    lat: 60.20251,
    lon: -154.18629,
    start: MERRILL_FIELD,
    durationMin: 600,
    hike: { distanceMi: 8.6, gainFt: 3500, difficulty: "hard" },
    openMonths: PORT_SEASON,
    closedNote: PORT_CLOSED,
    bestMonths: [7, 8],
    permit: "要坐 Lake Clark Air 飞到 Port Alsworth；步道不用许可",
    summary:
      "Port Alsworth 最难的一条步道：从 Tanalian 瀑布步道分出去，一路陡上，往返约 13.8 公里、爬升约 1,070 米，出了林线是高山苔原，山顶 360 度能看到 Lake Clark、Kontrashibuna 湖和四周的 Chigmit 山脉，天晴时能看到火山。NPS 建议至少留 8 小时。",
    tips: [
      "从安克雷奇当天来回很赶（飞行加爬山 10 小时以上），最好在 Port Alsworth 住一晚，第二天一早出发",
      "林线以上没有遮挡，风大、天气变化快，带足水和保暖防雨的衣服",
      "沿途有熊，结伴、出声，带熊喷雾（坐小飞机能不能带，先问航空公司）",
    ],
    photoFile: "Tanalian Mountain.jpg",
  },
];
