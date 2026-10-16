import type { Attraction } from "./types";

// 干龟：不通公路。去公园的两种方式按“开到出发点（Key West 渡轮码头 / 机场）+ 往返 + 在岛上的时间”各算成一个景点，
// durationMin 是开船、起飞到回来（不含提前报到）。杰斐逊堡、浮潜、海滩都在 Garden Key 上，包含在这两个景点里，没有单独拆开
// （单独拆开的话排行程时会去算一段开不过去的车程）。
// 园外收了 Key West 两处和海外公路上两处：从迈阿密开车去 Key West 的人一路会经过。
// 坐标：渡轮码头、Mallory 广场、Fort Zachary Taylor、Bahia Honda、旧七英里桥和 Pigeon Key 按 OpenStreetMap；
// 水上飞机在 Key West 机场通用航空区报到（OSM 上 Signature Aviation 的楼旁）。
const FERRY_TERMINAL = { lat: 24.56251, lon: -81.79894, nameZh: "Key West Bight 渡轮码头（Yankee Freedom，100 Grinnell St）" };
const SEAPLANE_HANGAR = { lat: 24.55391, lon: -81.75701, nameZh: "Key West 国际机场通用航空区（Key West Seaplane Adventures 机库）" };

export const dryTortugas: Attraction[] = [
  {
    id: "drto-ferry",
    park: "drto",
    nameZh: "Yankee Freedom 渡轮一日游（杰斐逊堡 · 浮潜 · 海滩）",
    nameEn: "Yankee Freedom Ferry Day Trip to Fort Jefferson",
    kind: "experience",
    area: "tortugas",
    lat: 24.6286,
    lon: -82.87322,
    start: FERRY_TERMINAL,
    durationMin: 570,
    bestMonths: [4, 5, 6],
    permit:
      "向 Yankee Freedom 订票（2026 年成人约 $235–260 起、4–16 岁约 $180 起，随日期浮动；含早餐、午餐、浮潜装备、要塞导览和 $15 门票），常提前几周订满",
    mustSee: true,
    summary:
      "多数人去干龟的方式。双体船 8:00 从 Key West 开，单程约 2 小时 15 分到 Garden Key，在岛上约 4.5 小时：11:00 跟船员导览杰斐逊堡（约 45 分钟），自己爬上要塞二层的炮台看护城河和四周的海，在护城河墙边浮潜看珊瑚和鱼群，到南北两片白沙滩游泳；15:00 开回，约 17:15–17:30 到 Key West。船上有空调船舱、淋浴和小卖部。",
    tips: [
      "7:00 报到（露营的 6:00），7:45 截止；成人登船要出示带照片的证件",
      "有国家公园年卡的订票时选“w/ National Park Pass”的票价、报到时出示，可以省掉门票",
      "冬季风浪大，容易晕船的提前吃药；停车用 Grinnell St 的市政停车楼（$40/天）",
      "护城河墙有几段因 2024 年飓风损坏在修（预计 2026 年冬天修完），跟着指示牌走，不要翻过路障",
    ],
    photoFile: "The Dy Tortugas and Fort Jefferson.jpg",
  },
  {
    id: "drto-seaplane",
    park: "drto",
    alternativeTo: "drto-ferry",
    nameZh: "水上飞机半日游（Key West 出发）",
    nameEn: "Dry Tortugas Seaplane (Half Day)",
    kind: "experience",
    area: "tortugas",
    lat: 24.627,
    lon: -82.87341,
    start: SEAPLANE_HANGAR,
    durationMin: 230,
    bestMonths: [4, 5, 6],
    permit:
      "向 Key West Seaplane Adventures 订票（2026 年半日游成人 $527、12 岁以下 $421.60；全日游 $910 / $728；门票 $15/人另付），平时约提前 2 周订满，节假日提前 3 个月",
    summary:
      "公园唯一获准的水上飞机，10 座的涡轮水獭式，单程约 40 分钟低空飞行：先过只有 1–1.5 米深的浅滩（常见鲨鱼、黄貂鱼），再过环礁般的 Marquesas 群岛和水下的二战沉船，最后低空绕杰斐逊堡一圈落在海面上。半日游在岛上至少 2.5 小时，全日游至少 6.5 小时，比渡轮省下来回 3 个多小时。",
    tips: [
      "上午、下午都有半日游，全日游只有上午；提前 30 分钟到机场通用航空区报到，迟到可能取消不退款",
      "48 小时内取消不退款，提前取消每人收 $50；天气不好飞不了的改期或全退",
      "岛上不卖吃的，全日游自带午餐和水；不能带露营装备，也不卖单程",
    ],
    photoFile: "Seaplane, Fort Jefferson, Dry Tortugas National Park, Florida (51137337119).jpg",
  },
  {
    id: "drto-mallory-square",
    park: "drto",
    nameZh: "Mallory 广场日落庆典",
    nameEn: "Mallory Square Sunset Celebration",
    kind: "experience",
    area: "key-west",
    lat: 24.55919,
    lon: -81.80675,
    durationMin: 90,
    bestTime: ["sunset"],
    outsidePark: true,
    summary:
      "Key West 老城西头的海边广场，每天日落前一两个小时，街头艺人、杂耍、手工摊和小吃车陆续摆开，几百人一起看太阳落进海里，是 Key West 最有名的傍晚活动，免费。",
    tips: [
      "老城停车难、收费高，住老城的走过去；提前 30 分钟到码头边占位置",
      "想在海上看日落可以订帆船或双体船的日落航行，Key West Bight 码头一带出发",
    ],
    photoFile: "Key West Sunset - Flickr - Joe Parks.jpg",
  },
  {
    id: "drto-fort-zachary-taylor",
    park: "drto",
    nameZh: "Fort Zachary Taylor 州立公园",
    nameEn: "Fort Zachary Taylor Historic State Park",
    kind: "landmark",
    area: "key-west",
    lat: 24.54775,
    lon: -81.81041,
    durationMin: 120,
    bestTime: ["afternoon", "sunset"],
    hours: [{ open: "08:00" }],
    outsidePark: true,
    summary:
      "Key West 岛西南角和杰斐逊堡同一时期修的砖砌要塞（1845 年开建），南北战争时一直在北军手里，可以进去看炮台和收藏的大炮。要塞外是 Key West 最好的海滩，水清、能浮潜，傍晚在这里看日落比 Mallory 广场清静。",
    tips: [
      "8:00 开门、日落关门，按车收费（州立公园的价格以官网为准）",
      "海滩是碎珊瑚石，穿溯溪鞋或沙滩鞋；有遮阳伞、躺椅出租和小吃店",
      "去干龟前一天来，先看看同一时代的要塞长什么样",
    ],
    photoFile: "Aerial view of Fort Zachary Taylor State Park.jpg",
  },
  {
    id: "drto-seven-mile-bridge",
    park: "drto",
    nameZh: "旧七英里桥 · Pigeon Key",
    nameEn: "Old Seven Mile Bridge & Pigeon Key",
    kind: "hike",
    area: "keys",
    lat: 24.70389,
    lon: -81.15522,
    start: { lat: 24.70717, lon: -81.12357, nameZh: "旧七英里桥 Marathon 一端停车场（Knight's Key）" },
    durationMin: 120,
    trail: { via: [{ lat: 24.70702, lon: -81.12525 }, { lat: 24.70389, lon: -81.15522 }] },
    hike: { distanceMi: 4.4, gainFt: 0, difficulty: "easy" },
    bestTime: ["morning", "sunset"],
    outsidePark: true,
    summary:
      "Flagler 海外铁路 1912 年通车时的旧桥，1935 年大飓风后改成公路，1982 年旁边的新七英里桥通车后废弃。2022 年修好的一段约 3.5 公里只给走路、骑车，从 Marathon 一路走到桥中间的 Pigeon Key 小岛（当年修铁路的工人营地），两边都是望不到头的浅海。开车走新桥本身就是海外公路最壮观的一段。",
    tips: [
      "桥上完全没有遮阴，正午很晒，早上或傍晚走，带足水",
      "上 Pigeon Key 岛要买岛上的导览票（Pigeon Key Foundation，Marathon 一端的游客中心），岛上 9:00–16:00 开放",
      "桥上不能钓鱼，岛上不能带宠物",
    ],
    photoFile: "Seven Mile Bridge, Florida Keys aerial (2003).jpg",
  },
  {
    id: "drto-bahia-honda",
    park: "drto",
    nameZh: "Bahia Honda 州立公园",
    nameEn: "Bahia Honda State Park",
    kind: "viewpoint",
    area: "keys",
    lat: 24.65544,
    lon: -81.27918,
    durationMin: 90,
    hours: [{ open: "08:00" }],
    outsidePark: true,
    summary:
      "礁岛群里少有的天然白沙滩，约 4 公里长的沙滩 1992 年被“海滩博士”评为全美第一，东头的 Sandspur 海滩最漂亮；西头有条短步道走上旧 Bahia Honda 铁路桥残留的一段，从桥上俯瞰海峡里深浅不一的蓝绿色，是海外公路上最经典的照片机位。",
    tips: [
      "8:00 开门、日落关门，按车收费（约 $8，以州立公园官网为准）",
      "夏秋常有大片马尾藻冲上岸，海滩状况看当天",
      "园内有浮潜团去 Looe Key 礁，也有营地和小木屋（佛州州立公园网站提前 11 个月订）",
    ],
    photoFile: "Bahia Honda Rail Bridge FL1.jpg",
  },
];
