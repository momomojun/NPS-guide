import type { Attraction } from "./types";

// 公园没有路，开车能到的只有门户小城 Kotzebue；进园都要坐小飞机，观光飞行和包机主要在 6–9 月
const FLY = [6, 7, 8, 9];
const FLY_CLOSED =
  "沙丘和河谷 10 月到次年 5 月被冰雪覆盖，白天很短、极冷，只有天气好时能包装了雪橇的小飞机进去，没有固定的观光飞行；6 月初河上可能还有冰。这时可以在 Kotzebue 的西北极遗产中心看展览、听讲座。";
// Arctic Backcountry Flying Service 和 Golden Eagle Outfitters 共用机场西端 3rd Ave 边的绿色大机库，在遗产中心斜对面，从 Alaska Airlines 航站走过去约 5 分钟
const OTZ_HANGAR = {
  lat: 66.8917,
  lon: -162.6056,
  nameZh: "Kotzebue 机场西端的绿色机库（Arctic Backcountry Flying Service、Golden Eagle Outfitters）",
};

export const kobukValley: Attraction[] = [
  {
    id: "kova-heritage-center",
    park: "kova",
    nameZh: "西北极遗产中心",
    nameEn: "Northwest Arctic Heritage Center",
    kind: "visitor",
    area: "kotzebue",
    lat: 66.89257,
    lon: -162.6052,
    durationMin: 60,
    hours: [
      { open: "09:00", close: "17:00", months: [4, 5, 6, 7, 8, 9] },
      { open: "10:00", close: "16:30", months: [10, 11, 12, 1, 2, 3] },
    ],
    mustSee: true,
    outsidePark: true,
    summary:
      "科伯克谷、克鲁森斯特恩角国家纪念地和诺阿塔克国家保护区三处公园共用的游客中心，就在 Kotzebue 机场边。半圆顶的蓝灰色建筑里有动物标本、北极的声音、可以上手摸的展品和讲 Iñupiat 人生活的展览，可以看纪录片、找护林员问进园路线、盖国家公园护照章，还有书店和小画廊。",
    tips: [
      "只在周一到周五开（4–9 月 9:00–17:00，10–3 月 10:00–16:30），周末和联邦假日不开，周末到的先打电话（907-442-3890）",
      "要在园里露营的，在这里免费借防熊食物桶；全年不定期有讲座、工作坊和儿童活动，时间看 NPS 的活动日历",
    ],
    photoFile: "Fossils of glacial mammals, Northwest Arctic Heritage Center.jpg",
  },
  {
    id: "kova-kotzebue",
    park: "kova",
    nameZh: "Kotzebue 海边小城",
    nameEn: "Kotzebue (Qikiqtaġruk)",
    kind: "landmark",
    area: "kotzebue",
    lat: 66.89937,
    lon: -162.59183,
    durationMin: 60,
    mustSee: true,
    outsidePark: true,
    summary:
      "西北极地区的中心城市，约 3,100 人，大多是 Iñupiat 人，Iñupiaq 语名叫 Qikiqtaġruk。小城建在伸进科策布湾的一条沙嘴上，不通公路，只能坐飞机或船来。沿海边的 Shore Avenue 走一走，看渔船和海湾；6 月初到 7 月上旬太阳整夜不落，8 月下旬以后晴夜能看到极光。",
    tips: [
      "镇子很小，机场、旅馆、游客中心、超市之间都走得到",
      "物价很高，超市（AC、North Star Market）和几家餐馆都在镇中心；给人、民宅、晾晒的鱼拍照前先问主人",
      "进公园的小飞机常因天气推迟，在 Kotzebue 多留一两天机动",
    ],
    photoFile: "Aerial view of Kotzebue 2013.jpg",
  },
  {
    id: "kova-sand-dunes",
    park: "kova",
    nameZh: "科伯克大沙丘（坐小飞机降落）",
    nameEn: "Great Kobuk Sand Dunes",
    kind: "experience",
    area: "kobuk-valley",
    lat: 67.05465,
    lon: -158.9057,
    start: OTZ_HANGAR,
    durationMin: 300,
    openMonths: FLY,
    closedNote: FLY_CLOSED,
    bestMonths: [7, 8],
    permit:
      "要提前向 Kotzebue 的空中出租车包机（Arctic Backcountry Flying Service、Golden Eagle Outfitters），按飞机和飞行时间计价；公园不收门票、进园不用许可",
    mustSee: true,
    summary:
      "冰期冰川磨出的岩粉被风吹进河谷，堆成约 65 平方公里的金色沙丘，高处约 30 米，四周却是云杉林和苔原，是北极最大的活动沙丘。装轮子的小飞机直接降落在沙面上，下了飞机往哪个方向走都行；沙面上常有驼鹿、狼和熊的脚印，春秋满是驯鹿群走过的痕迹，坡上还能找到只长在这几片沙丘上的科伯克棘豆。",
    tips: [
      "单程约 160 公里、飞 1 小时左右，在沙丘上待两三个小时；天气说变就变，行程里留一两天机动",
      "夏天沙面能晒到 38°C，起风又很冷，防晒、雨衣、保暖层和足够的水都要带；6、7 月虫子多，带头网",
      "溪流、泉眼边的湿沙会像流沙一样陷脚，用登山杖探路；沙丘边缘有原住民的私有地，看到营地、木屋就绕开",
    ],
    photoFile: "2012 07 22 Great Kobuk Sand Dunes.jpg",
  },
  {
    id: "kova-onion-portage",
    park: "kova",
    nameZh: "Onion Portage 驯鹿渡口",
    nameEn: "Onion Portage (Paatitaaq)",
    kind: "experience",
    area: "kobuk-valley",
    lat: 67.113,
    lon: -158.29454,
    start: OTZ_HANGAR,
    durationMin: 300,
    openMonths: FLY,
    closedNote: FLY_CLOSED,
    bestMonths: [9],
    permit:
      "包水上飞机降落在 Kobuk 河上（Kotzebue 的空中出租车），或找 Ambler 村的 NPS 许可船运商；不用许可，但这一带有不少原住民私有地，只在公园土地上活动",
    summary:
      "Ambler 村下游的一段 Kobuk 河，Iñupiaq 语叫 Paatitaaq（“野葱”），英文名来自河边的野葱和一条能少绕约 16 公里河湾的陆上捷径。西部北极驯鹿群春秋在这里游过河，8,000 多年来人们一直守在河边的沙丘上猎驯鹿；1960 年代考古学家 Giddings 在这里挖出了前后跨越几千年的一层层遗存，现在是国家历史地标。每年秋天附近村子的人仍来这里打猎。",
    tips: [
      "驯鹿什么时候过河说不准：2000 年以前秋季迁徙多在 8 月中旬开始，近年常拖到 10 月甚至 11 月；驯鹿群也从 2003 年的约 49 万头减到 2025 年的约 12 万头",
      "秋天是村民的猎季，别妨碍打猎、别靠近猎人的营地；Giddings 的老木屋不开放，地上的东西一件也不能拿",
      "这一带有 12 块原住民私有地，没得到许可别上岸进私人营地",
    ],
    photoFile: "KOVA Onion Portage (34900152484).jpg",
  },
  {
    id: "kova-flightseeing",
    park: "kova",
    nameZh: "科伯克河谷观光飞行",
    nameEn: "Kobuk Valley Flightseeing",
    kind: "experience",
    area: "kobuk-valley",
    lat: 67.18,
    lon: -158.75,
    start: OTZ_HANGAR,
    durationMin: 180,
    openMonths: FLY,
    closedNote: FLY_CLOSED,
    bestMonths: [7, 8, 9],
    permit: "向 Kotzebue 的空中出租车预订，按飞机计价，可以几个人合包一架",
    summary:
      "时间或预算不够降落的话，从空中看一圈：沿着蜿蜒的 Kobuk 河往上游飞，北边是 Baird 山、南边是 Waring 山，中间的宽谷里满是河曲和湖泊，再绕着大沙丘飞一圈，秋天运气好能看到成群渡河的驯鹿。Kotzebue 的航空公司也能把北极之门、克鲁森斯特恩角、诺阿塔克几处公园排进一趟里飞。",
    tips: [
      "一般 2–3 小时，按飞机计价，几个人合包最划算；Golden Eagle Outfitters 说北极之门加科伯克谷一趟约 4 小时，想几处公园都看要 8 小时左右",
      "坐的多是 Cessna 206 这类小飞机，每个座位都靠窗；容易晕机的提前吃药",
    ],
    photoFile: "Kobuk River (8029774281).jpg",
  },
];
