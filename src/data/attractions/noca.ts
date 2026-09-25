import type { Attraction } from "./types";

// 20 号公路中段（Ross Dam 步道口 MP 134 到 Silver Star 闸口 MP 171）冬季封闭：
// 通常 4 月下旬到 5 月开通、11 月中下旬封路；2026 年因 2025 年 12 月路基冲毁和 3 月塌方，6 月 14 日才开通
const SR20_THROUGH = [5, 6, 7, 8, 9, 10];
// 公路开通后，Washington Pass 观景台支路和 Rainy Lake 铺装步道一般 6 月雪化后才好去
const PASS_SUMMER = [6, 7, 8, 9, 10];
// 高山步道：7 月中旬前常有残雪，10 月下旬开始下雪；Cascade River Road 一般 6 月底到 7 月初才通到步道口
const HIGH_TRAILS = [7, 8, 9, 10];
const RAINY_PASS_TH = { lat: 48.51525, lon: -120.73578, nameZh: "Rainy Pass 停车场（步道口）" };
const USFS_PARKING = "停车要付 $5/天，或挂 Northwest Forest Pass、America the Beautiful 年卡";

export const northCascades: Attraction[] = [
  {
    id: "noca-diablo-lake-overlook",
    park: "noca",
    nameZh: "迪亚布洛湖观景台",
    nameEn: "Diablo Lake Overlook",
    kind: "viewpoint",
    area: "diablo",
    lat: 48.70981,
    lon: -121.09715,
    durationMin: 20,
    bestMonths: [7, 8, 9],
    mustSee: true,
    summary:
      "20 号公路边的观景台，俯瞰迪亚布洛湖：冰川磨碎的岩石细粉悬浮在水里，把湖水染成碧绿色，四周是层层雪峰，是北瀑布最有代表性的画面。",
    tips: [
      "在 20 号公路 MP 131.7，路边停车场有厕所；夏天中午前后车多，车位周转快",
      "晴天、7–9 月冰川融水多时湖色最绿，阴天和冬春颜色暗很多",
      "冬季 20 号公路西段通常开放到 MP 134，这里一般还能开到，以 WSDOT 路况为准（2025–26 冬季因附近塌方，到 5 月底才重新开到这里）",
    ],
    photoFile: "Diablo Lake from Overlook 03.jpg",
  },
  {
    id: "noca-washington-pass-overlook",
    park: "noca",
    nameZh: "华盛顿山口观景台",
    nameEn: "Washington Pass Overlook",
    kind: "viewpoint",
    area: "passes",
    lat: 48.52585,
    lon: -120.64719,
    start: { lat: 48.52638, lon: -120.6502, nameZh: "Washington Pass 观景台停车场" },
    durationMin: 30,
    bestTime: ["morning"],
    openMonths: PASS_SUMMER,
    closedNote:
      "华盛顿山口在 20 号公路冬季封闭段（MP 134 到 MP 171）中间，公路通常 11 月中下旬因雪崩风险封闭、次年 4 月底到 5 月开通（2026 年因 2025 年 12 月路基冲毁和 3 月塌方拖到 6 月 14 日），开通后观景台支路还常要等雪化；封路期间可以去西段通常仍能开到的迪亚布洛湖观景台和 Newhalem 一带。",
    mustSee: true,
    outsidePark: true,
    summary:
      "20 号公路最高处旁的观景台，花岗岩尖峰 Liberty Bell 和 Early Winters Spires 就在眼前，脚下是公路绕山的大发夹弯。",
    tips: [
      "从公路拐进约 400 米的支路到停车场，再走几分钟铺装小路到观景平台；春天公路开通后，支路常要到 5–6 月雪化了才开",
      "上午阳光照在 Liberty Bell 东侧岩壁上，比下午逆光好拍",
      "在国家森林里，不属于国家公园；从 Mazama 过来约 25 分钟，Winthrop 约 40 分钟",
    ],
    photoFile: "United States Washington Pass Highway 20 and Liberty Bell Mountain.jpg",
  },
  {
    id: "noca-maple-pass-loop",
    park: "noca",
    nameZh: "枫树山口环线",
    nameEn: "Heather–Maple Pass Loop",
    kind: "hike",
    area: "passes",
    lat: 48.50489,
    lon: -120.76888,
    start: RAINY_PASS_TH,
    durationMin: 300,
    trail: {
      via: [
        { lat: 48.5087, lon: -120.76365 },
        { lat: 48.50489, lon: -120.76888 },
        { lat: 48.50368, lon: -120.74665 },
      ],
      loop: true,
    },
    hike: { distanceMi: 7.2, gainFt: 2020, difficulty: "hard", loop: true },
    openMonths: HIGH_TRAILS,
    closedNote:
      "步道口在 20 号公路冬季封闭段内的 Rainy Pass，公路通常 11 月中下旬封闭、次年 4 月底到 5 月开通（2026 年 6 月 14 日才通），山脊上的积雪一般 7 月中旬才化，之前路迹难找、雪坡很滑；这段时间可以走低海拔的雪松步道、雷丘步道，路通后也可以先走平缓的 Rainy Lake 铺装步道。",
    bestMonths: [9, 10],
    mustSee: true,
    outsidePark: true,
    summary:
      "20 号公路沿线最受欢迎的一日徒步：经 Heather Pass、Maple Pass 绕山脊一圈，一路俯瞰带小岛的 Lake Ann 和四周的锯齿山峰；9 月底到 10 月中旬山坡上的高山落叶松变成金黄色。",
    tips: [
      `停车场约 40 个车位，周末和落叶松季很早就满，路边停车不安全；${USFS_PARKING}`,
      "逆时针（先往 Lake Ann 方向）上坡较缓、景色越走越开阔；7 月中旬前常有残雪，路迹难找、雪坡很滑",
      "山脊段完全暴露，带防风外套；环线沿途和 Lake Ann、Rainy Lake 周边禁止露营",
    ],
    photoFile: "View from Maple Pass.jpg",
  },
  {
    id: "noca-cascade-pass",
    park: "noca",
    nameZh: "喀斯喀特山口步道",
    nameEn: "Cascade Pass Trail",
    kind: "hike",
    area: "cascade-river",
    lat: 48.46762,
    lon: -121.05908,
    start: { lat: 48.47549, lon: -121.07516, nameZh: "Cascade Pass 步道口（Cascade River Road 尽头）" },
    durationMin: 300,
    trail: {},
    hike: { distanceMi: 7.4, gainFt: 1700, difficulty: "moderate" },
    openMonths: HIGH_TRAILS,
    closedNote:
      "Cascade River Road 冬季不除雪，通常 6 月底到 7 月初才通到步道口（大雪年份拖到 7 月下旬），7 月中旬前山坡上还常有积雪和雪崩风险，10 月下旬开始下雪；这段时间可以改走 Newhalem 一带的雪松步道、梯溪瀑布等低海拔步道。",
    mustSee: true,
    summary:
      "国家公园本体里最热门的一日徒步：先走三十多个之字弯穿过森林，再横切高山草甸到山口，对面是挂满冰川的 Johannesburg 山，运气好能见到旱獭。",
    tips: [
      "从 Marblemount 沿 Cascade River Road 开 23 英里约 1 小时，前 10 英里铺装、后面是坑洼碎石路；超过 22 英尺（约 6.7 米）的车和拖车不能开进园区段",
      "道路一般 6 月底到 7 月初才通到步道口；7 月中旬到 10 月初周末停车场很挤，早上去",
      "体力好可以继续上 Sahale Arm：到 Sahale 冰川往返约 11.8 英里、爬升约 1,200 米；山口和 Doubtful Lake 禁止露营",
    ],
    photoFile: "Cascade Pass Trail at North Cascades in Washington 18.jpg",
  },
  {
    id: "noca-visitor-center",
    park: "noca",
    nameZh: "北瀑布游客中心",
    nameEn: "North Cascades Visitor Center",
    kind: "visitor",
    area: "newhalem",
    lat: 48.66629,
    lon: -121.26672,
    durationMin: 45,
    openMonths: [5, 6, 7, 8, 9],
    closedNote:
      "游客中心只在夏季开放，2026 年为 5 月 18 日到 9 月 27 日（每天 9–17 点），冬季关闭；其他时间旁边的 Sterling Munro 木栈道和 River Loop 步道照样可以走，路况看 NPS 网站或打公园电话 360-854-7200。",
    summary:
      "Newhalem 旁的主游客中心，有展览、影片和护林员咨询；旁边约 100 米的 Sterling Munro 木栈道尽头能远眺 Picket Range 群峰。",
    tips: [
      "通常 5 月中旬到 9 月底开放（2026 年为 5/18–9/27，每天 9–17 点），冬季关闭",
      "在 20 号公路 MP 120 附近拐进，Newhalem 以西；1.8 英里的 River Loop 河边步道也从这里出发",
      "园区不收门票；Marblemount 往东约 70 英里到 Mazama 之间没有加油站，大部分路段手机没信号",
    ],
  },
  {
    id: "noca-trail-of-the-cedars",
    park: "noca",
    nameZh: "雪松步道",
    nameEn: "Trail of the Cedars",
    kind: "hike",
    area: "newhalem",
    lat: 48.67097,
    lon: -121.24807,
    start: { lat: 48.67315, lon: -121.24723, nameZh: "Newhalem 小镇（Skagit 信息中心一带）" },
    durationMin: 30,
    trail: { via: [{ lat: 48.67169, lon: -121.24607 }, { lat: 48.67015, lon: -121.24952 }], loop: true },
    hike: { distanceMi: 0.5, difficulty: "easy", loop: true },
    summary:
      "从 Newhalem 小镇走过 Skagit 河上的吊桥，绕一圈河边的西部红雪松老林，沿途有解说牌，还能看到山火过后森林恢复的样子。",
    tips: [
      "吊桥在小镇 Main Street 尽头，碎石路面，全年开放",
      "小镇里有西雅图城市电力（Seattle City Light）的老火车头和 Skagit 信息中心（夏秋开放），可以顺路看看",
    ],
  },
  {
    id: "noca-ladder-creek-falls",
    park: "noca",
    nameZh: "梯溪瀑布",
    nameEn: "Ladder Creek Falls",
    kind: "waterfall",
    area: "newhalem",
    lat: 48.67617,
    lon: -121.23857,
    durationMin: 40,
    hike: { distanceMi: 0.4, difficulty: "easy", loop: true },
    summary:
      "Gorge 水电站背后的瀑布和岩石花园，1920 年代由西雅图城市电力修建，溪水在岩缝间层层跌落，天黑后有彩色灯光照明。",
    tips: [
      "从 Newhalem 东头的吊桥过河到 Gorge 发电站，花园里的环线约 0.4 英里，台阶多、有扶手",
      "全年每天开放，天黑后亮灯到 23 点；晚上去带手电",
      "发电站参观廊通常 5 月底到 10 月每天 8–16 点开放，可以看发电机大厅",
    ],
  },
  {
    id: "noca-gorge-creek-falls",
    park: "noca",
    nameZh: "峡谷溪瀑布",
    nameEn: "Gorge Creek Falls",
    kind: "waterfall",
    area: "newhalem",
    lat: 48.7008,
    lon: -121.2093,
    durationMin: 20,
    summary:
      "20 号公路跨过 Gorge Creek 的桥上就能看到，溪水分几级落进又深又窄的岩缝；停车场旁还有一条小环线，能俯瞰 Gorge 大坝和碧绿的 Gorge 湖。",
    tips: [
      "在 MP 123.4，从 Newhalem 往东约 5 分钟；停车后沿人行道走上公路桥看瀑布，过马路走人行横道",
      "停车场出发的 Gorge Overlook 环线约 0.5 英里，前半段铺装，有厕所",
      "桥面是钢格板，雨天湿滑；春夏融雪时水量最大",
    ],
  },
  {
    id: "noca-thunder-knob",
    park: "noca",
    nameZh: "雷丘步道",
    nameEn: "Thunder Knob Trail",
    kind: "hike",
    area: "diablo",
    lat: 48.70464,
    lon: -121.10666,
    start: { lat: 48.69173, lon: -121.10151, nameZh: "Colonial Creek 营地入口步道口" },
    durationMin: 150,
    trail: {},
    hike: { distanceMi: 3.8, gainFt: 680, difficulty: "easy" },
    openMonths: [5, 6, 7, 8, 9, 10],
    closedNote:
      "步道开头跨 Colonial Creek 的季节性木桥秋天拆除、春天装回，大约 11 月到次年 4 月没有桥，不好过河（以 NPS 步道状况为准）；这段时间可以去旁边的迪亚布洛湖观景台，或走 Newhalem 一带的雪松步道、梯溪瀑布。",
    summary:
      "迪亚布洛湖边一座林木覆盖的小山，坡度平缓，山顶有长椅俯瞰碧绿的湖水，西边是 Davis Peak，南边是 Colonial 和 Pyramid 峰。",
    tips: [
      "步道口在 20 号公路 MP 130、Colonial Creek 营地入口的公路北侧",
      "开头跨 Colonial Creek 的木桥是季节性的，秋天拆、春天装回，没装时不好过河，以 NPS 步道状况为准",
      "比观景台多花两个多小时，但人少、角度不同，适合想走走又不想太累的人",
    ],
  },
  {
    id: "noca-diablo-lake-trail",
    park: "noca",
    nameZh: "迪亚布洛湖步道",
    nameEn: "Diablo Lake Trail",
    kind: "hike",
    area: "diablo",
    lat: 48.72848,
    lon: -121.07341,
    start: { lat: 48.71959, lon: -121.11995, nameZh: "Diablo Lake 步道口（环境学习中心旁）" },
    durationMin: 270,
    trail: {},
    hike: { distanceMi: 7.6, gainFt: 1300, difficulty: "moderate" },
    summary:
      "沿迪亚布洛湖北岸起伏的森林步道，途中多次从岩石平台俯瞰碧绿的湖面，终点是 Ross 大坝下方横跨湖湾的吊桥。",
    tips: [
      "从 20 号公路转进 Diablo Dam Road，开过大坝顶，在北瀑布环境学习中心旁的步道口停车",
      "可以单程走到终点，再坐西雅图城市电力的迪亚布洛湖渡轮回来（夏秋运营、要付费），班次以当年时刻表为准",
      "夏天人多；冬季也可能积雪，路况以 NPS 公告为准",
    ],
  },
  {
    id: "noca-diablo-lake-cruise",
    park: "noca",
    nameZh: "迪亚布洛湖游船",
    nameEn: "Skagit Tours Diablo Lake Cruise",
    kind: "experience",
    area: "diablo",
    lat: 48.7194,
    lon: -121.11656,
    durationMin: 150,
    openMonths: [7, 8, 9],
    closedNote:
      "Skagit Tours 游船只在夏秋运营，2026 年是 7 月 3 日到 9 月 7 日每周三至周日、9 月 12–27 日每个周末，其余时间停航；可以改去迪亚布洛湖观景台，或走迪亚布洛湖步道、雷丘步道从岸上看湖。",
    permit: "Skagit Tours 游船名额有限，要提前在 North Cascades Institute 官网订票",
    summary:
      "北瀑布学会和西雅图城市电力合办的湖上游船，坐玻璃顶的船在碧绿的湖面上转一圈，讲冰川地质和水电站历史；午餐团还含环境学习中心的午饭。",
    tips: [
      "2026 年 7/3–9/7 每周三至周日开船，9 月 12–27 日只在周末；下午游船约 2 小时，午餐团约 3 小时",
      "在湖边的北瀑布环境学习中心签到，从 20 号公路开过 Diablo 大坝就到",
      "2026 年成人票约 $35（下午游船）、$50（含午餐），每年可能调整",
    ],
  },
  {
    id: "noca-ross-lake-overlook",
    park: "noca",
    nameZh: "罗斯湖观景点",
    nameEn: "Ross Lake Overlook",
    kind: "viewpoint",
    area: "diablo",
    lat: 48.72732,
    lon: -121.0375,
    durationMin: 15,
    openMonths: SR20_THROUGH,
    closedNote:
      "罗斯湖观景点在 20 号公路冬季封闭段内（MP 134 以东），公路通常 11 月中下旬封闭、次年 4 月底到 5 月开通（2026 年 6 月 14 日才通）；封路期间可以去 MP 134 以西的迪亚布洛湖观景台。",
    summary:
      "20 号公路 MP 135–136 一带的路边观景点，俯瞰 Ross 湖南端的 Ruby Arm 湖湾；Ross 湖是 Ross 大坝蓄出的长湖，一直延伸到加拿大边境。",
    tips: [
      "往西一两英里的 Ross Dam 步道口（MP 134）可以下到大坝顶：往返约 2.5 英里，回程是上坡",
      "旁边 MP 134.3 的 Happy Creek 森林木栈道很短，十几分钟就能走完",
      "冬季 20 号公路在 MP 134 以东封闭，这里去不了",
    ],
  },
  {
    id: "noca-blue-lake",
    park: "noca",
    nameZh: "蓝湖步道",
    nameEn: "Blue Lake Trail",
    kind: "hike",
    area: "passes",
    lat: 48.50788,
    lon: -120.67122,
    start: { lat: 48.51899, lon: -120.67435, nameZh: "Blue Lake 步道口" },
    durationMin: 180,
    trail: {},
    hike: { distanceMi: 4.4, gainFt: 1050, difficulty: "moderate" },
    openMonths: HIGH_TRAILS,
    closedNote:
      "步道口在 Washington Pass 附近的 20 号公路冬季封闭段内，公路通常 11 月中下旬封闭、次年 4 月底到 5 月开通（2026 年 6 月 14 日才通），湖边积雪通常 7 月才化完；这段时间可以走西段低海拔的雪松步道、雷丘步道。",
    bestMonths: [9, 10],
    outsidePark: true,
    summary:
      "从 Washington Pass 附近出发，穿过森林和草甸爬到 Early Winters Spires 脚下的高山湖，湖水清澈，四周是花岗岩尖峰，秋天落叶松金黄。",
    tips: [
      "步道口在 Washington Pass 观景台以西不到 1 英里的公路边，有旱厕",
      USFS_PARKING,
      "9 月底到 10 月中旬落叶松最好看，周末停车位很快满",
    ],
  },
  {
    id: "noca-rainy-lake",
    park: "noca",
    nameZh: "雨湖步道",
    nameEn: "Rainy Lake Trail",
    kind: "hike",
    area: "passes",
    lat: 48.50412,
    lon: -120.73589,
    start: RAINY_PASS_TH,
    durationMin: 60,
    trail: {},
    hike: { distanceMi: 2, gainFt: 70, difficulty: "easy" },
    openMonths: PASS_SUMMER,
    closedNote:
      "Rainy Pass 在 20 号公路冬季封闭段内，公路通常 11 月中下旬封闭、次年 4 月底到 5 月开通（2026 年 6 月 14 日才通），刚开通时铺装步道上还常有积雪；这段时间可以改走 Newhalem 的雪松步道这类全年可走的平路。",
    outsidePark: true,
    summary:
      "Rainy Pass 停车场出发的铺装步道，约 1 英里几乎没有坡，走到被陡峭山壁环抱的 Rainy Lake 湖边，老人小孩和轮椅都能去。",
    tips: [
      `和枫树山口环线共用 Rainy Pass 停车场（MP 158 附近）；${USFS_PARKING}`,
      "海拔约 1,460 米，初夏步道上可能还有残雪",
    ],
  },
];
