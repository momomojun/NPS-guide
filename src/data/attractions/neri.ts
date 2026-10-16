import type { Attraction } from "./types";

// 新河峡谷不收门票，园区全年开放、多数地方 24 小时都能进；只有游客中心按季节开关（Canyon Rim、Sandstone 全年，Thurmond、Grandview 只在夏秋）。
// 公园是沿河的一长条，景点分散在几条互不相通的小路尽头：大桥一带（US-19）、北岸 Lansing-Edmond Road、南岸 Fayetteville 的 Gatewood Road、
// 中段 WV-25 下到 Thurmond、南边 Beckley 旁的 Grandview、再往南 Hinton 的 River Road。去峡谷底的路（Fayette Station Road、Keeneys Creek Road、
// WV-25、River Road）都很窄很弯，不适合房车和拖车。
// 坐标：游客中心按 NPS API；步道口、观景点、停车场按 OSM（2026-10-15 查）；镇、州立公园按 Nominatim。
// 2026 年 10 月的现况（NPS Road and Trail Closures 页面 2026-09-24 更新、NPS alerts 2026-10-15）：
//  - Kaymoor Miners Trail 上半段 6 月 15 日到 11 月 19 日每周一到周四关闭整修，周五到周日开；
//  - Rend Trail（Thurmond 往北的铁路步道）和 Church Loop 关到约 2027 年 12 月；Keeneys Creek Rail Trail 上段因桥梁损坏关闭；
//  - Cunard Road 修路到 2027 年，11 月到次年 3 月 Brooklyn Mine 停车场以下封路；
//  - I-64 东行 139 号出口（Sandstone）匝道因修桥封到 2026 年 10 月底，要开到 143 号出口再折回；
//  - 桥日（2026 年 10 月 17 日）US-19 大桥 7:00–17:00 封闭，Fayette Station Road 前一天 18:00 到当天 18:00 封闭。
const CANYON_RIM = { lat: 38.07005, lon: -81.07594 };
const CANYON_RIM_PARKING = { lat: 38.071, lon: -81.07582, nameZh: "Canyon Rim 游客中心停车场" };
const FERN_CREEK = { lat: 38.0631, lon: -81.05689, nameZh: "Endless Wall 步道 Fern Creek 步道口停车场" };
const GATEWOOD_LONG_POINT = { lat: 38.04156, lon: -81.07799, nameZh: "Long Point / Timber Ridge 步道口停车场（Newton Road）" };
const KAYMOOR_TOP = { lat: 38.04519, lon: -81.06763, nameZh: "Kaymoor Top 步道口（Kaymoor No. 1 Road 尽头）" };
// Bridge Walk 的报到处在大桥北端 Fayette Mine Road 上（57 Fayette Mine Road, Lansing），坐标取这条路的中点（Nominatim）
const BRIDGE_WALK_HQ = { lat: 38.07039, lon: -81.07399, nameZh: "Bridge Walk 报到处（Fayette Mine Road）" };
// 漂流公司的基地：大桥北边 Lansing 的 Adventures on the Gorge（219 Chestnutburg Road）。OSM 上没有这个点，坐标按 Lansing 村（Nominatim）
const OUTFITTER_BASE = { lat: 38.07344, lon: -81.06566, nameZh: "漂流公司基地（Lansing / Fayetteville 一带）" };

export const newRiverGorge: Attraction[] = [
  {
    id: "neri-canyon-rim",
    park: "neri",
    nameZh: "Canyon Rim 游客中心和大桥观景台",
    nameEn: "Canyon Rim Visitor Center & Overlooks",
    kind: "visitor",
    area: "bridge",
    lat: CANYON_RIM.lat,
    lon: CANYON_RIM.lon,
    start: CANYON_RIM_PARKING,
    durationMin: 45,
    // NPS API：全年 9:00–17:00，感恩节、圣诞节、元旦关闭
    hours: [{ open: "09:00", close: "17:00" }],
    mustSee: true,
    summary:
      "大桥北端的主游客中心，有峡谷和煤矿历史的展览、介绍片和书店。屋后的木栈道通往两层观景台：上层有无障碍坡道，下层要走 178 级台阶，正面看新河峡谷大桥的钢拱横跨峡谷，是公园最经典的一张照片。",
    tips: [
      "下层观景台的台阶回程是一路上坡，膝盖不好的在上层看就够",
      "Fayette Station Road 的起点就在游客中心旁边，看完桥可以接着开下峡谷",
      "桥日（10 月第三个周六）前一天傍晚起游客中心停车场关闭，当天上午才重开",
    ],
    photoFile: "New River Gorge Bridge.jpg",
  },
  {
    id: "neri-long-point",
    park: "neri",
    nameZh: "Long Point 步道",
    nameEn: "Long Point Trail",
    kind: "hike",
    area: "fayetteville",
    lat: 38.05973,
    lon: -81.07742,
    start: GATEWOOD_LONG_POINT,
    durationMin: 120,
    hike: { distanceMi: 3.2, gainFt: 400, difficulty: "moderate" },
    bestTime: ["afternoon", "sunset"],
    bestMonths: [5, 6, 9, 10],
    mustSee: true,
    summary:
      "从 Fayetteville 南郊的林间小路走约 2.6 公里，到一块伸进峡谷的岩石尖角上，正对着新河峡谷大桥的侧面，桥、河和两岸崖壁一眼都在；傍晚夕阳照在钢拱上最好看，秋天满山红叶。",
    tips: [
      "去程大多是缓下坡，最后一小段到岩尖比较陡；崖边没有护栏，看好孩子",
      "看完日落回程约 2.6 公里在林子里，带头灯",
      "前段可以骑山地车，最后约 300 米禁止自行车（有车架）；步道口停车场不大，红叶季周末早点来",
    ],
    photoFile:
      "The overlook at the end of the Long Point Trail provides one of the best views of the New River Gorge Bridge. (757ca940-cc97-4b58-95f7-18daabae3831).JPG",
    trail: { via: [{ lat: 38.05973, lon: -81.07742 }] },
  },
  {
    id: "neri-endless-wall",
    park: "neri",
    nameZh: "Endless Wall 步道和 Diamond Point",
    nameEn: "Endless Wall Trail & Diamond Point",
    kind: "hike",
    area: "lansing",
    lat: 38.05323,
    lon: -81.05937,
    start: FERN_CREEK,
    durationMin: 90,
    hike: { distanceMi: 2.0, gainFt: 200, difficulty: "moderate" },
    bestTime: ["morning", "sunset"],
    bestMonths: [5, 6, 9, 10],
    mustSee: true,
    summary:
      "沿着一道连绵好几公里的砂岩崖壁顶上走，穿过杜鹃花丛和铁杉林，几处观景点都悬在峡谷边上。走到 Diamond Point 来回约 3 公里：脚下近 300 米深处是新河的激流，常能看到漂流的橡皮艇，远处还能望见大桥；崖壁是美东最有名的攀岩地之一。",
    tips: [
      "Fern Creek 步道口车位少、常停满，满了往前约 800 米到 Nuttall 步道口，再往前还有一个新的大停车场；不要停在 Lansing-Edmond Road 路边，会被拖车",
      "想走完全程（约 3.9 公里单程）可以从 Nuttall 步道口出来，再沿公路走约 800 米回 Fern Creek",
      "崖边没有护栏，雨后砂岩很滑",
    ],
    photoFile:
      "The view from Diamond Point on the Endless Wall Trail is one of the most spectacular viewpoints in the park. (d2ed428b-da0b-4036-bed6-ea83f8979cf3).JPG",
    trail: { via: [{ lat: 38.05323, lon: -81.05937 }] },
  },
  {
    id: "neri-fayette-station-road",
    park: "neri",
    nameZh: "Fayette Station Road 峡谷观景路",
    nameEn: "Fayette Station Road",
    kind: "drive",
    area: "bridge",
    lat: 38.06483,
    lon: -81.07705,
    start: { lat: 38.07038, lon: -81.0792, nameZh: "Fayette Station Road 起点（Canyon Rim 游客中心旁）" },
    durationMin: 60,
    bestMonths: [5, 6, 9, 10],
    mustSee: true,
    summary:
      "大桥建成前，过峡谷要从这条路盘下谷底再爬上对岸，以前要开 40 分钟。现在约 13 公里的单行道从 Canyon Rim 游客中心一路急弯下到河边，从桥下穿过、开过低矮的 Tunney Hunsaker 老桥，再爬上 Fayetteville 一侧回到 US-19；从谷底仰望大桥和看从上面俯瞰是两种感觉。",
    tips: [
      "单行、急弯多，不适合房车和拖车；全程开车约 45 分钟，加上停车看景留 1 小时",
      "过了老桥约 150 米有停车场，走几步就到 Fayette Station 激流，下午常能看到漂流船冲下来",
      "全年开放，但冬天结冰下雪时路很危险；桥日前一天 18:00 到当天 18:00 封路",
    ],
    photoFile: "Fayette Station Bridge.jpg",
  },
  {
    id: "neri-bridge-walk",
    park: "neri",
    nameZh: "Bridge Walk 大桥检修走道团",
    nameEn: "Bridge Walk (catwalk tour under the New River Gorge Bridge)",
    kind: "experience",
    area: "bridge",
    lat: 38.06923,
    lon: -81.08263,
    start: BRIDGE_WALK_HQ,
    durationMin: 150,
    permit: "私营公司 Bridge Walk 的团，要在官网提前订（每人 $79 起，桥日当天 $125），常卖光；8 岁以上、身高 122 厘米以上",
    summary:
      "系着安全绳，在桥面下方约 60 厘米宽的检修走道上走完整座大桥的 920 米：头顶是钢梁，脚下约 260 米深处是新河。导游一路讲大桥怎么建成；全年都开，风雨无阻。",
    tips: [
      "从报到、穿安全带、坐车到桥头到回来共 2 个多小时，多数人当天订在上午或中午",
      "手机、相机要用挂绳或绑带固定在身上才能带（现场卖挂绳），掉下去公司不负责",
      "穿包头的运动鞋（凉鞋要有后跟带）；大风等危险天气才取消，可以改期或退款",
    ],
  },
  {
    id: "neri-whitewater-rafting",
    park: "neri",
    nameZh: "下游峡谷激流漂流",
    nameEn: "Lower New River whitewater rafting",
    kind: "experience",
    area: "river",
    lat: 38.06483,
    lon: -81.07705,
    start: OUTFITTER_BASE,
    durationMin: 420,
    openMonths: [4, 5, 6, 7, 8, 9, 10],
    closedNote:
      "商业漂流的旺季是 4 月到 10 月，11 月到次年 3 月水冷、多数公司不开团。冬天可以改走 Long Point、Endless Wall 看峡谷，或坐 Fayette Station Road 下到河边看激流。",
    bestMonths: [6, 7, 8, 9],
    permit: "要向西弗州政府许可的漂流公司预订（ACE Adventure Resort、Adventures on the Gorge、River Expeditions 等），全天团每人约 $140 起；下游峡谷一般 12 岁以上",
    summary:
      "新河下游峡谷（Thurmond / Cunard 到大桥下的 Fayette Station）是美东最有名的激流河段之一：20 多个激流、大多是 III–IV 级，水量大、浪头高，最后从大桥下面漂过。全天团含河边午餐，水上 4–6 小时。带小孩的可以选上游河段（Upper New，I–III 级，年龄要求低得多）。",
    tips: [
      "早上 8–9 点在漂流公司基地报到、换装、坐车到下水点，傍晚回来；留出一整天",
      "穿速干衣物和绑带凉鞋，别穿棉的；春秋水冷，公司会租湿衣",
      "9 月到 10 月中的 Gauley 河放水季另有更难的 V 级漂流（在旁边的 Gauley River 国家休闲区），只适合有经验、年龄够的人",
    ],
  },
  {
    id: "neri-kaymoor",
    park: "neri",
    nameZh: "Kaymoor 煤矿遗址（Kaymoor Miners 步道）",
    nameEn: "Kaymoor Mine Site (Kaymoor Miners Trail)",
    kind: "hike",
    area: "fayetteville",
    // 位置取 821 级台阶的底端（OSM steps 60994125），中途经过半山的矿口（OSM 节点 Kaymoor Mine Site）
    lat: 38.0486,
    lon: -81.06342,
    start: KAYMOOR_TOP,
    durationMin: 150,
    trail: {
      via: [
        { lat: 38.04723, lon: -81.06609 },
        { lat: 38.0486, lon: -81.06342 },
      ],
    },
    hike: { distanceMi: 2.0, gainFt: 900, difficulty: "hard" },
    bestMonths: [4, 5, 9, 10],
    summary:
      "Kaymoor 煤矿 1900 年开采到 1962 年。从崖顶走约 800 米石阶和之字路下到半山的矿口，还能看到矿车和旧设备；再往下 821 级木台阶直下谷底，是选煤厂、炼焦炉和工人小镇的遗迹。来回约 3.2 公里、落差约 270 米，上坡全靠爬台阶。",
    tips: [
      "2026 年 6 月 15 日到 11 月 19 日，上半段（Kaymoor Top 到台阶顶）每周一到周四关闭整修，只有周五到周日能走；平日可以从 Fayette Station Road 旁的 Kaymoor Trail 走过来",
      "821 级台阶回程非常累，带够水；下雨后木台阶湿滑",
      "Kaymoor Top 的停车场很小，从 Gatewood Road 拐进 Kaymoor No. 1 Road 后到 T 字路口左转",
    ],
    photoFile:
      "An old mine car sits at the entrance to the Kaymoor Mine. (7c9e652b-579c-4442-ba44-ee8b4b04e3dd).JPG",
  },
  {
    id: "neri-nuttallburg",
    park: "neri",
    nameZh: "Nuttallburg 煤矿小镇遗址",
    nameEn: "Nuttallburg",
    kind: "landmark",
    area: "lansing",
    lat: 38.05019,
    lon: -81.03976,
    durationMin: 75,
    bestMonths: [4, 5, 6, 9, 10],
    summary:
      "峡谷底保存最完整的煤矿小镇之一：1870 年代开矿，1920 年代福特汽车的亨利·福特租下这里的矿给自家钢厂供煤，1958 年停产。现在还立着高高的红色选煤塔（tipple）和从山上斜下来的运煤传送带，几条短步道串起矿口、炼焦炉和房屋地基。",
    tips: [
      "Keeneys Creek Road 又窄又陡，大部分是单车道、部分是砂石路，会车要找地方让；不适合房车和拖车，从 US-60 过来单程约 10 公里",
      "Keeneys Creek 铁路步道上段因桥梁损坏关闭，只能从下端接 Conveyor 步道",
      "谷底没有手机信号，出发前下载离线地图",
    ],
    photoFile: "Nuttallburg Coal Tipple.jpg",
  },
  {
    id: "neri-thurmond",
    park: "neri",
    nameZh: "Thurmond 铁路小镇",
    nameEn: "Thurmond Historic District",
    kind: "landmark",
    area: "thurmond",
    lat: 37.95729,
    lon: -81.07879,
    durationMin: 60,
    bestMonths: [5, 6, 7, 8, 9, 10],
    summary:
      "20 世纪初的煤矿铁路重镇：一排砖楼紧贴着铁轨，银行、旅馆、商店都背靠河谷，1910 年前后火车站一年接待近 10 万旅客。大萧条、两场大火和蒸汽机车退役后小镇没落，现在只剩几个居民；修复好的火车站是游客中心，CSX 的运煤火车还会从镇中心轰隆隆开过。",
    tips: [
      "从 US-19 的 Glen Jean 出口沿 WV-25 下山约 11 公里，路窄弯多、不适合房车",
      "火车站游客中心只在阵亡将士纪念日到劳动节每天 10:00–17:00 开，9–10 月只开周末，冬季关闭；镇上的街道全年都能走",
      "铁轨还在用，不要在轨道上走或拍照；美铁 Cardinal 号每周三班在这里停靠",
    ],
    photoFile: "Thurmond Commercial District.jpg",
  },
  {
    id: "neri-grandview",
    park: "neri",
    nameZh: "Grandview 观景台",
    nameEn: "Grandview Main Overlook",
    kind: "viewpoint",
    area: "grandview",
    lat: 37.83086,
    lon: -81.06129,
    start: { lat: 37.83046, lon: -81.06298, nameZh: "Grandview 主观景台停车场" },
    durationMin: 60,
    bestTime: ["morning"],
    bestMonths: [5, 7, 10],
    mustSee: true,
    summary:
      "峡谷南段最高的观景台，离河面约 430 米：新河在脚下绕出一个大马蹄弯，能看到约 11 公里的河谷、河边的铁路和 Quinnimont 小镇——1873 年峡谷里第一车煤就从那里运出。5 月中紫色杜鹃、7 月白色杜鹃沿崖边开满；秋天清晨常有云海。",
    tips: [
      "主观景台离停车场只有几步路；想多走可以沿 Grandview Rim 步道往北到 Turkey Spur 观景台（来回约 5 公里），或走 Castle Rock 步道绕过崖下的巨石",
      "夏天（6–8 月）Theatre West Virginia 在这里的崖边露天剧场演出，晚上停车场会很满",
      "游客中心只在阵亡将士纪念日到 10 月下旬开（2026 年到 10 月 25 日，每天 12:00–17:00）；有野餐亭、儿童游乐场和厕所",
    ],
    photoFile: "Grandview Overlook, New River.jpg",
  },
  {
    id: "neri-sandstone-falls",
    park: "neri",
    nameZh: "Sandstone 瀑布",
    nameEn: "Sandstone Falls",
    kind: "waterfall",
    area: "sandstone",
    lat: 37.75803,
    lon: -80.90536,
    start: { lat: 37.75936, lon: -80.90504, nameZh: "Sandstone 瀑布木栈道停车场（River Road）" },
    durationMin: 60,
    bestMonths: [4, 5, 6, 9, 10],
    mustSee: true,
    summary:
      "新河上最大的瀑布：落差只有 3–8 米，却横跨约 450 米宽的河面。一条无障碍木栈道跨过两座小桥上到瀑布下的小岛，尽头的观景台正对主瀑布；岛上是少见的阿巴拉契亚河岸平岩植物群落。",
    tips: [
      "从 Hinton 过桥后沿 River Road 往下游开约 13 公里，最后一段窄、没有中线，不适合 7.6 米以上的车；从 Sandstone 游客中心过来约 45 分钟",
      "河水又急又冷，别下水；涨水时岛上的步道可能被淹",
      "顺路可以在 WV-20 上的 Sandstone Falls 观景台从约 180 米高处俯瞰，在 I-64 旁的 Sandstone 游客中心看展览（2026 年 10 月底前 I-64 东行 139 号出口匝道封闭，要开到 143 号出口再折回）",
    ],
    photoFile: "Sandstone Falls - New River Gorge National Park - West Virginia (52085603969).jpg",
  },
  {
    id: "neri-babcock-grist-mill",
    park: "neri",
    nameZh: "Glade Creek 磨坊（Babcock 州立公园）",
    nameEn: "Glade Creek Grist Mill, Babcock State Park",
    kind: "landmark",
    area: "babcock",
    lat: 37.97946,
    lon: -80.94681,
    durationMin: 45,
    bestMonths: [5, 6, 10],
    outsidePark: true,
    summary:
      "西弗吉尼亚最上镜的地方之一：一座木头水磨坊立在溪边的岩石上，前面是小瀑布，春天杜鹃、秋天红叶都很出片。磨坊是 1976 年用三座老磨坊的零件拼起来复建的，还能真的磨玉米面。",
    tips: [
      "在大桥东南约 32 公里，从 US-60 拐进 WV-41 不远；州立公园不收门票",
      "磨坊前人多时要排队拍照，清晨人少、光线柔",
      "公园里有州立公园的小木屋和营地，可以在州立公园官网预订",
    ],
    photoFile: "Glade Creek Grist Mill.jpg",
  },
];
