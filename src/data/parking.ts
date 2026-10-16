import type { ParkingRule } from "./attractions/types";

// 旺季早上就停满的步道口、观景点停车场：景点 id → 这几个月一般几点前停满、几点以后又有空位、停满了怎么办。
// 排行程时尽量把这些景点排在一早，第一站停车场一早就满的提早出发（最早 6 点），到的时候多半已经满了就提醒；
// 共用一个停车场的几个景点（lot 一样）一天只看第一个；官方没说几点以后有空位的按下午 5 点算（傍晚去的不提醒）。2026-10-03 按各公园官网整理：只收官方写明了大概几点停满的
// （“9 点前到才停得上”“10 点到 18 点最难停”也算），只说“很快就满”没说几点的、只有民间说法的不收
// （锡安的 Canyon Overlook、冰川的 Avalanche Creek、大提顿的 String Lake、Lake Louise 湖边、Johnston Canyon、马蹄湾……）。
// 班车季只能坐班车去的地方不收（停车看换乘点，见 shuttles.ts）；Timed Entry、许可证见 bookings.ts。

/** 几个景点共用一条规则（同一个停车场） */
const lot = (ids: string[], rule: ParkingRule): [string, ParkingRule][] => ids.map((id) => [id, rule]);

const SUMMER = [6, 7, 8, 9];

export const parkingRules: Record<string, ParkingRule> = Object.fromEntries([
  // 拱门：官方说夏天很多步道口停车场 7:30 前就满，这三处大半天都满；建议 8 点前或下午 3 点后进园
  ...lot(["arch-delicate-arch"], {
    lot: "Wolfe Ranch 停车场（精致拱门步道口）",
    fullBy: "07:30",
    freeAfter: "15:00",
    months: SUMMER,
    noteZh: "停满了可以停精致拱门观景点的停车场，沿路走约 1.6 公里到步道口（往返总共约 8 公里）；人多时公园入口会暂停放车。",
    source: "https://www.nps.gov/arch/planyourvisit/traffic.htm",
  }),
  ...lot(["arch-windows", "arch-double-arch"], {
    lot: "Windows 一带停车场",
    fullBy: "07:30",
    freeAfter: "15:00",
    months: SUMMER,
    noteZh: "停满了就一早或者傍晚再来；园内停车场都满时，入口会暂停放车，可能要等 3–5 小时。",
    source: "https://www.nps.gov/arch/planyourvisit/traffic.htm",
  }),
  ...lot(["arch-landscape-arch", "arch-double-o-arch", "arch-devils-garden-loop"], {
    lot: "Devils Garden 步道口停车场",
    fullBy: "07:30",
    freeAfter: "15:00",
    months: SUMMER,
    noteZh: "停满了就一早或者傍晚再来；房车、拖车先停在镇上或者游客中心。",
    source: "https://www.nps.gov/arch/planyourvisit/traffic.htm",
  }),
  // 锡安：游客中心停车场（2021 年官方说一般 8 点前就满，现在的页面说“一早或者上午”）
  ...lot(["zion-pa-rus", "zion-watchman-trail"], {
    lot: "锡安峡谷游客中心停车场",
    fullBy: "08:00",
    months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    noteZh: "停满了就停 Springdale 镇上的收费停车场，坐免费的小镇班车到公园的步行入口。",
    source: "https://www.nps.gov/zion/planyourvisit/traffic.htm",
  }),
  // 落基山：Glacier Gorge 步道口天一亮就满（2019 年官方说 6 点前），Bear Lake 一般 9 点前满，冬天周末也是
  ...lot(["romo-mills-lake", "romo-sky-pond", "romo-alberta-falls"], {
    lot: "Glacier Gorge 步道口停车场",
    fullBy: "06:00",
    months: SUMMER,
    noteZh: "停满了就停 Park & Ride，坐免费的 Bear Lake 路班车过来（开到 10 月中）；夏天进 Bear Lake 路这一带还要预约 Timed Entry+。",
    source: "https://www.nps.gov/romo/planyourvisit/exploring-the-bear-lake-road-corridor.htm",
  }),
  ...lot(["romo-bear-lake", "romo-emerald-lake"], {
    lot: "Bear Lake 停车场",
    fullBy: "09:00",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    noteZh: "夏天停 Park & Ride 坐免费班车过来；冬天的周末、节假日也常常一早就满。",
    source: "https://www.nps.gov/romo/planyourvisit/exploring-the-bear-lake-road-corridor.htm",
  }),
  // 冰川：洛根山口一般 8:30 到 16:00 都是满的（官方说热门停车场天亮前就开始停）
  ...lot(["glac-logan-pass", "glac-hidden-lake-overlook", "glac-highline-trail"], {
    lot: "洛根山口游客中心停车场",
    fullBy: "08:30",
    freeAfter: "16:00",
    months: [7, 8, 9],
    noteZh: "坐向阳大道班车上来，或者先去别处、下午 4 点以后再来；2026 年 7 月到劳动节在这里停车限 3 小时。",
    source: "https://www.nps.gov/glac/planyourvisit/crowds.htm",
  }),
  // 大提顿
  ...lot(["grte-jenny-lake", "grte-hidden-falls", "grte-cascade-canyon"], {
    lot: "珍妮湖南岸停车场",
    fullBy: "09:00",
    months: [7, 8],
    noteZh: "9 点前到才有把握停得上；高峰时等车位要很久。",
    source: "https://www.nps.gov/grte/planyourvisit/parking.htm",
  }),
  ...lot(["grte-lsr-preserve"], {
    lot: "洛克菲勒保护区停车场",
    fullBy: "08:00",
    freeAfter: "17:00",
    months: SUMMER,
    noteZh: "只有约 50 个车位，8 点前或者 17 点后来，最好拼车；满了只能在入口排队，可能要等 2 小时。",
    source: "https://www.nps.gov/grte/planyourvisit/lsrpreserveplan.htm",
  }),
  // 优胜美地：山谷里（酋长岩以东）的停车场一般 8 点后就满，停一次车再坐山谷班车
  ...lot(
    [
      "yose-yosemite-falls",
      "yose-upper-yosemite-fall",
      "yose-mist-trail",
      "yose-nevada-fall",
      "yose-half-dome",
      "yose-mirror-lake",
      "yose-cooks-meadow",
      "yose-sentinel-bridge",
      "yose-swinging-bridge",
      "yose-four-mile-trail",
    ],
    {
      lot: "优胜美地山谷的停车场",
      fullBy: "08:00",
      months: [4, 5, 6, 7, 8, 9, 10],
      noteZh: "8 点前进山谷停好车，之后坐免费的山谷班车或者走路；停满时车可能在酋长岩一带就被拦下。",
      source: "https://www.nps.gov/yose/planyourvisit/traffic.htm",
    },
  ),
  ...lot(["yose-glacier-point"], {
    lot: "冰川点停车场",
    fullBy: "09:00",
    months: [5, 6, 7, 8, 9, 10],
    noteZh: "9 点前到；停满了可能要等两个小时，也可以坐冰川点观光巴士，或者从山谷走四英里步道上来。",
    source: "https://www.nps.gov/yose/planyourvisit/traffic.htm",
  }),
  ...lot(["yose-tuolumne-meadows", "yose-lembert-dome", "yose-cathedral-lakes", "yose-pothole-dome"], {
    lot: "Tuolumne 草甸一带的步道口停车场",
    fullBy: "09:00",
    months: SUMMER,
    noteZh: "9 点前到；路边不能停车，满了可以坐 YARTS 或者 Tuolumne 的观光和徒步巴士。",
    source: "https://www.nps.gov/yose/planyourvisit/traffic.htm",
  }),
  ...lot(["yose-hetch-hetchy"], {
    lot: "Hetch Hetchy 停车场",
    fullBy: "10:00",
    freeAfter: "16:00",
    weekends: true,
    months: [4, 5, 6, 7, 8, 9, 10],
    noteZh: "一早或者傍晚来；停满时在 Hetch Hetchy 入口可能要等好几个小时。",
    source: "https://www.nps.gov/yose/planyourvisit/traffic.htm",
  }),
  // 雷尼尔山：周末 Paradise 和 Sunrise 上午晚些时候就满，官方建议 7 点前或 16 点后到
  ...lot(["mora-skyline-trail", "mora-myrtle-falls", "mora-nisqually-vista"], {
    lot: "Paradise 停车场",
    fullBy: "11:00",
    freeAfter: "16:00",
    weekends: true,
    months: SUMMER,
    noteZh: "最好平日来，或者 7 点前、16 点后到；满了可以停 Paradise 野餐区和 Paradise Valley Road 路边的车位。",
    source: "https://www.nps.gov/mora/planyourvisit/congestion.htm",
  }),
  ...lot(["mora-sourdough-ridge", "mora-fremont-lookout", "mora-burroughs-mountain"], {
    lot: "Sunrise 游客中心停车场",
    fullBy: "11:00",
    freeAfter: "16:00",
    weekends: true,
    months: [7, 8, 9],
    noteZh: "一早或者 16 点后来；停满时在 White River 入口出一辆放一辆。",
    source: "https://www.nps.gov/mora/planyourvisit/congestion.htm",
  }),
  // 奥林匹克
  ...lot(["olym-hall-of-mosses", "olym-spruce-nature-trail"], {
    lot: "Hoh 雨林游客中心停车场",
    fullBy: "10:00",
    freeAfter: "16:00",
    months: SUMMER,
    noteZh: "10 点前或者傍晚到；停满了要在 Hoh 入口排队，11 点到 16 点之间到可能要等一两个小时。",
    source: "https://www.nps.gov/olym/planyourvisit/visiting-in-summer.htm",
  }),
  ...lot(["olym-hurricane-ridge", "olym-hurricane-hill"], {
    lot: "飓风岭停车场",
    fullBy: "10:00",
    freeAfter: "14:00",
    weekends: true,
    months: SUMMER,
    noteZh: "10 点前或者 14 点后到（节假日 15 点后）；停满了要等有车出来才放行。",
    source: "https://www.nps.gov/olym/planyourvisit/visiting-in-summer.htm",
  }),
  // 黄石：官方说这几处 10 点到 18 点车位最紧张，建议 7 点前进园、10 点到 16 点避开热门景点
  ...lot(["yell-grand-prismatic"], {
    lot: "Midway 间歇泉盆地停车场",
    fullBy: "10:00",
    freeAfter: "18:00",
    months: SUMMER,
    noteZh: "车位有限，10 点到 18 点最难停，一早或者傍晚来；也可以从 Fairy Falls 步道上观景台看。",
    source: "https://www.nps.gov/places/000/grand-prismatic-spring.htm",
  }),
  ...lot(["yell-norris-geyser-basin"], {
    lot: "Norris 间歇泉盆地停车场",
    fullBy: "10:00",
    freeAfter: "18:00",
    months: SUMMER,
    noteZh: "车位有限，10 点到 18 点最难停，一早或者傍晚来。",
    source: "https://www.nps.gov/places/000/norris-geyser-basin-trailhead.htm",
  }),
  // 红杉：谢尔曼将军树和巨杉林博物馆的停车场一般上午就满
  ...lot(["seki-general-sherman", "seki-congress-trail"], {
    lot: "谢尔曼将军树停车场",
    fullBy: "10:00",
    months: [5, 6, 7, 8, 9],
    noteZh: "夏天坐免费班车（1、4 号线）从巨杉林博物馆、Lodgepole 或 Wolverton 过来。",
    source: "https://www.nps.gov/seki/planyourvisit/parktransit.htm",
  }),
  ...lot(["seki-big-trees-trail"], {
    lot: "巨杉林博物馆停车场",
    fullBy: "10:00",
    months: [5, 6, 7, 8, 9],
    noteZh: "夏天坐免费班车过来，或者一早、傍晚来。",
    source: "https://www.nps.gov/seki/planyourvisit/parktransit.htm",
  }),
  // 约书亚树：旺季（10 月到次年 5 月）周末官方建议 9 点前去这几处，满了停车场会暂时关闭
  ...lot(["jotr-hidden-valley"], {
    lot: "Hidden Valley 停车场",
    fullBy: "09:00",
    weekends: true,
    months: [10, 11, 12, 1, 2, 3, 4, 5],
    noteZh: "9 点前去；满了停车场会暂时关闭，先去别的地方再回来。",
    source: "https://www.nps.gov/jotr/planyourvisit/visiting-during-the-busy-season.htm",
  }),
  ...lot(["jotr-barker-dam"], {
    lot: "Barker Dam 停车场",
    fullBy: "09:00",
    weekends: true,
    months: [10, 11, 12, 1, 2, 3, 4, 5],
    noteZh: "9 点前去；满了可以停西边不远的 Echo T 停车场。",
    source: "https://www.nps.gov/jotr/planyourvisit/visiting-during-the-busy-season.htm",
  }),
  ...lot(["jotr-lost-horse-mine"], {
    lot: "Lost Horse Mine 停车场",
    fullBy: "09:00",
    weekends: true,
    months: [10, 11, 12, 1, 2, 3, 4, 5],
    noteZh: "9 点前去；满了就换一条有车位的步道。",
    source: "https://www.nps.gov/jotr/planyourvisit/visiting-during-the-busy-season.htm",
  }),
  // 大峡谷：旺季 10 点前到游客中心 1–4 号停车场一般停得上
  ...lot(["grca-mather-point"], {
    lot: "大峡谷游客中心停车场（1–4 号）",
    fullBy: "10:00",
    months: [3, 4, 5, 6, 7, 8, 9],
    noteZh: "10 点前到一般停得上；夏天也可以停在 Tusayan 镇上，坐免费的紫线班车进来。",
    source: "https://www.nps.gov/grca/planyourvisit/parking_sr.htm",
  }),
  // 圆顶礁：官方说很多步道口的停车场 9 点前就满、16 点后才松
  ...lot(["care-hickman-bridge", "care-rim-overlook"], {
    lot: "Hickman Bridge 步道口停车场",
    fullBy: "09:00",
    freeAfter: "16:00",
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    noteZh: "一早或者傍晚走。",
    source: "https://www.nps.gov/care/planyourvisit/trailguide.htm",
  }),
  ...lot(["care-grand-wash", "care-cassidy-arch"], {
    lot: "Grand Wash 步道口停车场",
    fullBy: "09:00",
    freeAfter: "16:00",
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    noteZh: "一早或者傍晚走。",
    source: "https://www.nps.gov/care/planyourvisit/trailguide.htm",
  }),
  // 德纳里：Mountain Vista 中午常满（Savage River 的停车场夏天几乎天天满，官方没说几点，没收）
  ...lot(["dena-mountain-vista"], {
    lot: "Mountain Vista 休息区停车场",
    fullBy: "12:00",
    months: [5, 6, 7, 8, 9],
    noteZh: "坐免费的 Savage River 班车过来，班车在这里停。",
    source: "https://www.nps.gov/dena/planyourvisit/savage-river-area.htm",
  }),
  // 基奈峡湾：Exit Glacier 10:30 到 15:30 车位最紧张
  ...lot(["kefj-exit-glacier", "kefj-harding-icefield"], {
    lot: "Exit Glacier 自然中心停车场",
    fullBy: "10:30",
    freeAfter: "15:30",
    months: [6, 7, 8],
    noteZh: "10:30 前或者 15:30 后到；也可以拼车、骑车，或者从 Seward 坐接驳车过来。",
    source: "https://home.nps.gov/kefj/planyourvisit/exit-glacier-area.htm",
  }),
  ...lot(["havo-nahuku"], {
    lot: "Nāhuku 熔岩管停车场（14 个车位）",
    fullBy: "09:00",
    freeAfter: "17:00",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    noteZh: "停满了就停约 800 米外的 Kīlauea Iki 观景台停车场走过来（那里也常满），或者从 Devastation 步道口经 Byron Ledge 走过来；不要沿 Crater Rim Drive 路边走。",
    source: "https://www.nps.gov/havo/planyourvisit/day-hike-nahuku.htm",
  }),
  ...lot(["havo-kilauea-iki"], {
    lot: "Kīlauea Iki 观景台停车场（64 个车位）",
    fullBy: "10:00",
    months: [12, 1, 6, 7],
    noteZh: "停满了就停 Puʻupuaʻi 观景台或 Devastation 步道口，经 Byron Ledge 走到 Kīlauea Iki（往返多走约 3–4 公里），也可以从 Kīlauea 游客中心停车场沿火山口边缘步道过来。",
    source: "https://www.nps.gov/havo/planyourvisit/eruption-viewing.htm",
  }),
  ...lot(["pinn-bear-gulch-cave", "pinn-high-peaks", "pinn-condor-gulch-overlook"], {
    lot: "Bear Gulch 一带（Moses Spring 停车场、Bear Gulch 日间区）",
    fullBy: "08:00",
    freeAfter: "15:00",
    months: [3, 4, 5],
    weekends: true,
    noteZh:
      "停满了就往回开到 Peaks View 或营地停车，走 Bench、Sycamore 步道上来（营地到 Bear Gulch 单程约 3.7 公里），春季周末也可以从营地坐接驳车；公园有时会在路口拦车，等有车出来再放行。",
    source: "https://www.nps.gov/pinn/planyourvisit/hours.htm",
  }),
  ...lot(["pinn-old-pinnacles-balconies"], {
    lot: "Old Pinnacles 停车场",
    fullBy: "08:00",
    freeAfter: "15:00",
    months: [3, 4, 5],
    weekends: true,
    noteZh: "停车场不大，满了只能从营地沿 Bench 步道走过来（营地到 Balconies 往返约 15 公里），或者改天从西侧的 Chaparral 进。",
    source: "https://www.nps.gov/pinn/planyourvisit/hours.htm",
  }),
  ...lot(["pinn-balconies-cave", "pinn-juniper-canyon"], {
    lot: "Chaparral 停车场（西侧）",
    fullBy: "08:00",
    freeAfter: "15:00",
    months: [3, 4, 5],
    weekends: true,
    noteZh:
      "停满了就停回头约 0.5 公里的 Jawbone 停车场，沿 Jawbone 步道走过来；再满就停游客服务站，走 Jawbone 步道下来（单程约 1.9 公里、下坡约 170 米）。",
    source: "https://www.nps.gov/pinn/planyourvisit/hours.htm",
  }),
  ...lot(["bibe-lost-mine"], {
    lot: "Lost Mine 步道口停车场（约 15 个车位）",
    fullBy: "08:00",
    months: [11, 12, 1, 2, 3, 4],
    noteZh:
      "停满了不能在盆地路边乱停，可以先下到盆地走 Window 或盆地环线，下午再回来碰运气；住盆地小屋的也要开车上来，没有接驳车。",
    source: "https://www.nps.gov/places/lost-mine-trail.htm",
  }),
  ...lot(["gumo-guadalupe-peak", "gumo-devils-hall"], {
    lot: "Pine Springs 步道口停车场",
    fullBy: "10:00",
    months: [3, 4, 5, 9, 10, 11, 12],
    weekends: true,
    noteZh: "停满了就停 Pine Springs 游客中心的停车场，沿营地连接小路走到步道口；不要停在 62/180 号公路边。",
    source: "https://www.nps.gov/gumo/planyourvisit/parking.htm",
  }),
  ...lot(["acad-sand-beach", "acad-beehive"], {
    lot: "Sand Beach 停车场",
    fullBy: "09:00",
    freeAfter: "17:00",
    months: [6, 7, 8, 9],
    noteZh:
      "蜂巢山步道口就在停车场对面。停满了可以停 Park Loop Road 右侧车道划好的路边车位，或者坐 Island Explorer 的 Loop Road 线（在下层停车场右边上下车）；护林员有时会在路口临时封停车场。",
    source: "https://www.nps.gov/acad/learn/news/safe-and-enjoyable-labor-day-weekend.htm",
  }),
  ...lot(["acad-jordan-pond", "acad-jordan-pond-house"], {
    lot: "乔丹池一带（北停车场、乔丹池屋停车场）",
    fullBy: "08:00",
    freeAfter: "17:00",
    months: [6, 7, 8, 9],
    noteZh:
      "乔丹池屋 11:00–16:00 最难停车。停满了就坐 Island Explorer（Jordan Pond 线从巴尔港 Village Green 发车，Loop Road 线也停），或者先去别处、下午 4 点以后再来；不许停在路边草地上。",
    source: "https://www.nps.gov/acad/learn/news/safe-and-enjoyable-labor-day-weekend.htm",
  }),
  ...lot(["acad-carriage-roads"], {
    lot: "鹰湖马车道停车场（233 号公路）",
    fullBy: "08:00",
    freeAfter: "17:00",
    months: [6, 7, 8, 9],
    noteZh: "停满了可以从巴尔港镇上骑车过来（约 5 公里），或者坐 Bicycle Express 班车连人带车到鹰湖入口；也可以改从 Hulls Cove 游客中心旁的马车道入口出发。",
    source: "https://www.nps.gov/acad/learn/news/safe-and-enjoyable-labor-day-weekend.htm",
  }),
  ...lot(["ever-shark-valley-tram"], {
    lot: "Shark Valley 停车场",
    fullBy: "10:00",
    freeAfter: "15:00",
    months: [12, 1, 2, 3, 4],
    noteZh:
      "停满了在大门外排队，出一辆进一辆，最忙的周末和节假日要等一个多小时；可以先去东边 Tamiami Trail 上坐风扇船，下午 3 点以后再回来。这里没有公共交通，坐网约车来的回程常叫不到车。",
    source: "https://www.nps.gov/ever/planyourvisit/svdirections.htm",
  }),
]);

/** 整理的日期 */
export const parkingChecked = "2026-10-03";
