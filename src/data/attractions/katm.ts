import type { Attraction } from "./types";

// 公园不通公路，看熊都要坐小飞机：Homer 的 Beluga 湖、安克雷奇、King Salmon、Kodiak 都有一日游。
// Brooks Camp 的护林员和特许经营商服务大约 6 月 1 日到 9 月 17 日（2026 年 Brooks Lodge、Katmai Air 到 9 月 18 日）
const BROOKS_SEASON = [6, 7, 8, 9];
const BROOKS_CLOSED =
  "Brooks Camp 只在 6 月 1 日到 9 月 17 日左右有护林员、Brooks Lodge 和定期的水上飞机（9 月下旬只剩很少的服务），其余时间没有服务，熊也很少，一般不去。";
// Homer 的水上飞机公司都在 Beluga 湖南岸（Bald Mountain Air、Beryl Air、Emerald Air 等），离市区约 5 分钟
const HOMER_FLOATS = { lat: 59.64063, lon: -151.50855, nameZh: "Homer Beluga 湖水上飞机基地（湖南岸的航空公司柜台）" };
// King Salmon 只和 Naknek 通公路、和阿拉斯加的公路网不通：只有坐飞机经 King Salmon 进出的人能用这个出发点。
// Katmai Air 的水上飞机从 Naknek 河边起飞，约 20 分钟到 Brooks Camp
const KING_SALMON_FLOATS = { lat: 58.67657, lon: -156.65132, nameZh: "King Salmon 的 Katmai Air 水上飞机码头（Naknek 河边）" };

export const katmai: Attraction[] = [
  {
    id: "katm-brooks-falls",
    park: "katm",
    nameZh: "Brooks 瀑布看熊（Brooks Camp）",
    nameEn: "Brooks Falls Bear Viewing (Brooks Camp)",
    kind: "experience",
    area: "brooks",
    lat: 58.55476,
    lon: -155.79193,
    start: HOMER_FLOATS,
    durationMin: 450,
    openMonths: BROOKS_SEASON,
    closedNote: BROOKS_CLOSED,
    bestMonths: [7, 9],
    permit:
      "要提前订看熊一日游：Homer 出发 2026 年约 $1,349–1,595/人（Bald Mountain Air、Alaska Bear Adventures、Beryl Air、Emerald Air 等），7 月最抢手",
    mustSee: true,
    summary:
      "全世界最有名的看熊点：每年 7 月红鲑逆流跳过 Brooks 瀑布，棕熊就站在瀑布顶上张嘴等鱼，最大最强势的熊占着最好的位置。下飞机先在游客中心听简短的“熊学校”安全讲座，再走约 2 公里、过河口的高架桥和木栈道到瀑布观景台，7 月中旬熊最多，常能同时看到二十多头。9 月熊又回到河里，在下游吃产完卵的鲑鱼，一个个又肥又换了新毛。",
    tips: [
      "瀑布观景台只能站 40 人，7 月中午常要排队登记、限时轮换，可以先去下游的 Riffles 和河口观景台，不限时",
      "除了室内和指定的野餐区，Brooks Camp 里不能带着吃的走；离熊至少 46 米（50 码），熊走过来就让路",
      "从安克雷奇也有一日游（Katmai Air 经 King Salmon 转水上飞机，2026 年 $1,489；Rust's 从 Lake Hood 起飞，$1,395，6 月下旬到 8 月初），King Salmon 出发只要约 20 分钟（Katmai Air 往返 $500）",
    ],
    photoFile: "Grizzly Bears.jpg",
  },
  {
    id: "katm-coastal-bears",
    park: "katm",
    nameZh: "卡特迈海岸看熊（Hallo 湾等）",
    nameEn: "Katmai Coast Bear Viewing (Hallo Bay & nearby bays)",
    kind: "experience",
    area: "coast",
    lat: 58.4575,
    lon: -154.02333,
    start: HOMER_FLOATS,
    durationMin: 360,
    openMonths: [5, 6, 7, 8, 9],
    closedNote: "Homer 的看熊航班大约 5 月中到 9 月中飞，冬季没有；海岸看熊最好的是 6–8 月。",
    bestMonths: [6, 7, 8],
    permit:
      "向 Homer 的航空公司订一日游（2026 年 Alaska Bear Adventures $795 起、Smokey Bay Air $895、Beryl Air 的 Hallo 湾团 $1,195），都带向导",
    mustSee: true,
    summary:
      "卡特迈的太平洋海岸是全世界棕熊密度最高的地方之一。小飞机从 Homer 飞约 1 小时、越过 Cook 湾，降落在 Hallo 湾、Swikshak、Kukak 湾一带的沙滩或海湾里，向导带着步行到熊附近：6 月熊在海边草甸吃莎草、退潮时挖蛤蜊，也是交配和母熊带小熊出来的季节；7–8 月熊转到溪口抓鲑鱼。这里没有观景台，人很少，熊常常就在几十米外。",
    tips: [
      "公司会发高筒防水靴，常要蹚水、走泥滩，里面穿保暖、防雨的衣服",
      "降落点看当天的天气和潮水决定，坏天气会改期，行程里留一两天机动",
      "Kodiak 也有飞卡特迈海岸（Geographic 湾一带）的一日游，但 Kodiak 在岛上，和 Homer 之间不通公路",
    ],
    photoFile:
      "Brown bear on beach near south Hallo Bay meadows (2), GYRE Trip, Hallo Bay, June 2013 (NPS M. Fitz) (16521575055).jpg",
  },
  {
    id: "katm-vtts",
    park: "katm",
    nameZh: "万烟谷巴士导览（Valley of Ten Thousand Smokes）",
    nameEn: "Valley of Ten Thousand Smokes Bus Tour",
    kind: "experience",
    area: "vtts",
    lat: 58.37147,
    lon: -155.36869,
    start: KING_SALMON_FLOATS,
    durationMin: 480,
    openMonths: [6, 7, 8, 9],
    closedNote: "万烟谷的巴士导览 2026 年只在 6 月 5 日到 9 月 17 日开，其余时间没有车进去，Brooks Camp 也没有服务。",
    bestMonths: [7, 8],
    permit:
      "巴士每天 9:00 从 Brooks Camp 开，Homer、安克雷奇来的一日游赶不上：要在 Brooks Lodge（抽签）或 Brooks Camp 营地住一晚，或者住 King Salmon、一早坐 Katmai Air 的水上飞机过去（往返 $500）；车票向 Brooks Lodge（Katmailand）订，2026 年含午餐 $115、不含午餐 $100、单程 $65",
    lottery: true,
    mustSee: true,
    summary:
      "1912 年 Novarupta 火山大爆发是 20 世纪最大的一次火山喷发，滚烫的火山灰流把一整条绿色山谷埋到最深约 200 米；四年后 Griggs 带探险队来时，谷底成千上万个喷气孔还在冒烟，于是叫它“万烟谷”。如今烟早已散尽，留下一片寸草不生的灰色、橙色荒原和被河水切开的深峡。巴士从 Brooks Camp 出发，沿 37 公里的砂石路开约 1.5 小时到谷边的观景小屋，护林员一路讲解，午饭后可以跟着下到谷底看 Ukak 瀑布。",
    tips: [
      "巴士每天 9:00 从 Brooks Camp 出发、16:00 回来；要先坐 Katmai Air 飞过来、听完熊安全讲座才能上车，从 King Salmon 来的一早就要出发，住 Brooks Lodge 或营地的最方便",
      "下到谷底往返约 5.5 公里、落差约 300 米，回程一路上坡；谷里风大、天气变化快，带防风防雨的外套",
      "只想从空中看，Brooks Lodge 也有约 50 分钟的水上飞机观光（2026 年 $400/人，2 人起）",
    ],
    photoFile: "Valley of Ten Thousand Smokes from Overlook Cabin.jpg",
  },
  {
    id: "katm-dumpling-mountain",
    park: "katm",
    nameZh: "Dumpling 山步道（Brooks Camp）",
    nameEn: "Dumpling Mountain Trail",
    kind: "hike",
    area: "brooks",
    lat: 58.56924,
    lon: -155.79573,
    start: KING_SALMON_FLOATS,
    durationMin: 240,
    hike: { distanceMi: 3, gainFt: 800, difficulty: "moderate" },
    openMonths: BROOKS_SEASON,
    closedNote: BROOKS_CLOSED,
    bestMonths: [7, 8, 9],
    permit:
      "步道本身不用许可，但 Homer、安克雷奇来的一日游看完熊一般没时间爬：要在 Brooks Lodge（抽签）或 Brooks Camp 营地住一晚，或者住 King Salmon、坐 Katmai Air 的水上飞机过去（往返 $500）",
    lottery: true,
    summary:
      "Brooks Camp 唯一往上爬的步道：从营地旁出发，穿过北方针叶林和灌丛，约 2.4 公里、爬升约 240 米到观景点，脚下是 Naknek 湖、Brooks 河口和 Lake Brooks，天晴时远处是一排雪山。体力好的可以再往上走约 4 公里，到海拔约 740 米的山顶苔原。",
    tips: [
      "适合在 Brooks Lodge、营地过夜，或从 King Salmon 来、时间宽裕的人；从 Homer、安克雷奇来的一日游看完熊一般就没时间了",
      "熊也走这条路，结伴、出声，出发前在游客中心问最近熊的出没情况",
      "观景点往上没有遮挡，风大、天气变化快",
    ],
    photoFile: "KATM Dumpling Mountain View NPS Photo RTaylor (42387203342).jpg",
  },
];
