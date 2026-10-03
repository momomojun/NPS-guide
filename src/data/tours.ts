// 有固定班次的游船、导览团：排行程时按班次开始（要提前到的按提前报到算），赶不上最后一班、或者这天根本不开都会提醒。
// 时间是当地时间（“HH:MM”）；scheduleYear 是时刻表的年份，之后的年份按同样的日期和时间估，出发前以官网为准。
// 有班次的景点，停留时间（durationMin）是从开船、发车到回来，不含提前报到。
import type { MonthDay } from "./bookings";

export type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

/** 一段时间里的班次（比如 6 月班次少，7 月起多） */
export interface TourPeriod {
  from: MonthDay;
  to: MonthDay;
  departures: string[];
  /** 只在这几天开；不填是每天 */
  days?: Weekday[];
  /** 只是这一年的日期（满月徒步这种跟着月相、每年日期都不同的场次）：别的年份不算，等公布了再补 */
  year?: number;
}

export interface TourSchedule {
  /** 景点 id */
  id: string;
  scheduleYear: number;
  /** 不在这些时间段里的日子不开 */
  periods: TourPeriod[];
  /** 要提前多久到（报到、停车） */
  checkInMin: number;
  /** 不是每天都开的，写在这里提醒（定了日期的自动生成攻略按 periods 里的 days 挑日子） */
  daysZh?: string;
  /** 在哪上船、上车 */
  meetZh: string;
  noteZh?: string;
  sources: string[];
}

export const tourSchedules: TourSchedule[] = [
  {
    id: "glac-many-glacier-boat",
    scheduleYear: 2026,
    periods: [
      { from: "06-10", to: "06-30", departures: ["09:00", "11:00", "14:00", "17:00"] },
      { from: "07-01", to: "09-19", departures: ["08:30", "09:00", "11:00", "13:00", "14:00", "15:30", "17:00"] },
    ],
    checkInMin: 30,
    meetZh: "Many Glacier Hotel 后面的码头",
    noteZh:
      "开船前 30 分钟到售票处报到；停车位很少，官方建议提前 1 小时以上到停车场。8:30 那班所有人都要在 Josephine 湖头下船，回程按 9:45 起的回程船先到先上。",
    sources: ["https://www.glacierparkboats.com/index.php/tours-rentals/many-glacier"],
  },
  {
    id: "glac-red-bus-tour",
    scheduleYear: 2026,
    periods: [{ from: "06-20", to: "09-27", departures: ["09:30", "13:30"] }],
    checkInMin: 15,
    meetZh: "Lake McDonald Lodge 前台",
    noteZh:
      "Western Alpine 团（约 3 小时）向阳大道通车后才开，开车前 15 分钟到前台报到；西侧停车场（Quarter Circle）还有 9:00、13:30 出发的车（7 月 1 日到 9 月 15 日加开 9:30、14:00），Apgar 的 Village Inn 只接住店客人。",
    sources: ["https://www.glaciernationalparklodges.com/red-bus-tours/west-side-tours/"],
  },
  {
    id: "kefj-fjords-cruise",
    scheduleYear: 2026,
    // Kenai Fjords Tours（6 小时、7 小时的 Captain's Choice）和 Major Marine Tours（6 小时、7.5 小时）合起来的班次
    periods: [
      { from: "05-01", to: "05-15", departures: ["11:30"] },
      { from: "05-16", to: "05-21", departures: ["11:30", "12:00"] },
      { from: "05-22", to: "06-05", departures: ["08:00", "09:30", "11:30", "12:00"] },
      { from: "06-06", to: "08-30", departures: ["08:00", "09:00", "09:30", "11:30", "12:00"] },
      { from: "08-31", to: "09-07", departures: ["08:00", "09:30", "11:30", "12:00"] },
      { from: "09-08", to: "09-12", departures: ["09:30", "11:30", "12:00"] },
      { from: "09-13", to: "09-27", departures: ["11:30"] },
    ],
    checkInMin: 60,
    meetZh: "Seward 小船港（Kenai Fjords Tours、Major Marine Tours 在港边各有报到处）",
    noteZh:
      "官方要求开船前 1 小时到；12:00 那班 5.5 小时，配合阿拉斯加铁路从安克雷奇当天往返；Kenai Fjords Tours 6 月 13 日到 8 月 16 日还加开 11:00。",
    sources: [
      "https://www.alaskacollection.com/day-tours/kenai-fjords-tours/tours/classic-kenai-fjords-park-tour/",
      "https://www.alaskacollection.com/day-tours/kenai-fjords-tours/tours/captains-choice-national-park-tour/",
      "https://majormarine.com/tour/6-hour-kenai-fjords-national-park-cruise/",
      "https://majormarine.com/tour/7-5-hour-kenai-fjords-national-park-cruise/",
    ],
  },
  {
    id: "kefj-northwestern-fjord",
    scheduleYear: 2026,
    periods: [{ from: "05-28", to: "09-06", departures: ["08:30"] }],
    checkInMin: 60,
    meetZh: "Seward 小船港",
    noteZh: "Kenai Fjords Tours（8 小时，5 月 30 日到 8 月 30 日）和 Major Marine Tours（8.5 小时，12 岁以下不能上船）都是 8:30 开。",
    sources: [
      "https://www.alaskacollection.com/day-tours/kenai-fjords-tours/tours/northwestern-fjord-tour/",
      "https://majormarine.com/tour/8-5-hour-northwestern-fjord-cruise/",
    ],
  },
  {
    id: "kefj-resurrection-bay-cruise",
    scheduleYear: 2026,
    periods: [
      { from: "03-12", to: "05-14", departures: ["12:00", "12:30"] },
      { from: "05-15", to: "05-21", departures: ["12:30"] },
      { from: "05-22", to: "06-11", departures: ["08:30", "12:30"] },
      { from: "06-12", to: "08-23", departures: ["08:30", "10:00", "12:30", "15:00"] },
      { from: "08-24", to: "09-11", departures: ["08:30", "12:30"] },
      { from: "09-12", to: "10-11", departures: ["12:30"] },
    ],
    checkInMin: 60,
    daysZh: "3 月中到 5 月中的春季航线，Kenai Fjords Tours 只在周四到周日开",
    meetZh: "Seward 小船港",
    noteZh: "3 到 4.5 小时，只在复活湾里，不去潮水冰川；春季（3–5 月）主要看灰鲸迁徙。",
    sources: [
      "https://www.alaskacollection.com/day-tours/kenai-fjords-tours/tours/resurrection-bay-tour/",
      "https://www.alaskacollection.com/day-tours/kenai-fjords-tours/tours/resurrection-bay-express-tour/",
      "https://www.alaskacollection.com/day-tours/kenai-fjords-tours/tours/spring-resurrection-bay-tour/",
      "https://majormarine.com/tour/4-hour-kenai-fjords-wildlife-cruise/",
      "https://majormarine.com/tour/spring-wildlife-cruise/",
    ],
  },
  {
    id: "noca-diablo-lake-cruise",
    scheduleYear: 2026,
    // 官网只写了几点开始报到（午餐团 10:15、下午的游船 14:45），没写几点开船，按报到开始算
    periods: [
      { from: "07-03", to: "09-07", departures: ["10:15", "14:45"], days: ["Wed", "Thu", "Fri", "Sat", "Sun"] },
      { from: "09-12", to: "09-27", departures: ["10:15", "14:45"], days: ["Sat", "Sun"] },
    ],
    checkInMin: 0,
    daysZh: "7 月 3 日到 9 月 7 日每周三到周日开（劳动节的周一也开），9 月 12–27 日只有周六、周日",
    meetZh: "Diablo 湖边的北瀑布环境学习中心（North Cascades Environmental Learning Center）",
    noteZh:
      "10:15 开始报到的是午餐团（2.5–3 小时，含午餐，只到 9 月 7 日；9 月中下旬周末上午换成不含午餐的秋季游船），14:45 开始报到的是下午游船（约 2 小时）。",
    sources: [
      "https://ncascades.org/signup/programs/skagit-tours",
      "https://ncascades.org/signup/programs/skagit-tours/diablo-lake-and-lunch",
      "https://ncascades.org/signup/programs/skagit-tours/diablo-lake-afternoon-cruise",
    ],
  },
  {
    id: "yoho-lake-ohara",
    scheduleYear: 2026,
    periods: [{ from: "06-19", to: "10-04", departures: ["08:30", "10:30"] }],
    checkInMin: 20,
    meetZh: "Lake O'Hara 停车场（露易丝湖以西约 12 公里、Field 以东约 13 公里）",
    noteZh: "一日游坐 8:30 或 10:30 上山的车，下山的车 9:30、11:30、14:30、16:30、18:30；车不等人，至少提前 20 分钟到集合点。",
    sources: [
      "https://www.parks.canada.ca/pn-np/bc/yoho/activ/randonnee-hike/ohara/visit",
      "https://parks.canada.ca/termes-terms/reservation",
    ],
  },
  {
    id: "wrst-mill-tour",
    scheduleYear: 2026,
    periods: [
      { from: "05-22", to: "06-30", departures: ["09:30", "13:30", "15:30"] },
      { from: "07-01", to: "08-15", departures: ["09:30", "11:30", "13:30", "15:30"] },
      { from: "08-16", to: "09-13", departures: ["09:30", "13:30", "15:30"] },
    ],
    checkInMin: 10,
    meetZh: "Kennecott 的 St. Elias Alpine Guides 办公室",
    noteZh: "约 2 小时，要走约 1.6 公里、爬约 45 米，还要下梯子和陡楼梯；提前 10 分钟到。",
    sources: [
      "https://www.steliasguides.com/trips/kennecott-mill-town-tour/",
      "https://www.alaska.org/detail/kennecott-mill-town-tour-with-st-elias-alpine-guides",
    ],
  },
  {
    id: "whsa-moonlight-hike",
    scheduleYear: 2026,
    // 每月满月前后一晚，日期跟着月相走，只有 2026 年公布了
    periods: [
      { from: "03-03", to: "03-03", departures: ["18:15"], year: 2026 },
      { from: "04-01", to: "04-01", departures: ["19:00"], year: 2026 },
      { from: "05-02", to: "05-02", departures: ["20:00"], year: 2026 },
      { from: "05-30", to: "05-30", departures: ["19:45"], year: 2026 },
      { from: "06-30", to: "06-30", departures: ["20:30"], year: 2026 },
      { from: "08-28", to: "08-28", departures: ["19:45"], year: 2026 },
      { from: "09-27", to: "09-27", departures: ["19:00"], year: 2026 },
      { from: "10-26", to: "10-26", departures: ["18:00"], year: 2026 },
      { from: "11-24", to: "11-24", departures: ["16:30"], year: 2026 },
    ],
    checkInMin: 30,
    daysZh: "每月只有满月前后的一晚，日期每年随月相变；这里只有 2026 年的日期，之后的年份等 NPS 公布",
    meetZh: "Dune Life Nature Trail 步道口（从收费站开进去约 3.7 公里）",
    noteZh: "约 1.5–2 小时；开始前 30 分钟开始报到，名单上没有名字的不能参加，护林员准时出发，迟到就跟不上。",
    sources: ["https://www.nps.gov/whsa/planyourvisit/moonlight-hike.htm"],
  },
  {
    id: "whsa-lake-lucero",
    scheduleYear: 2026,
    periods: [
      { from: "11-21", to: "11-21", departures: ["10:00"], year: 2026 },
      { from: "12-19", to: "12-19", departures: ["10:00"], year: 2026 },
      { from: "01-09", to: "01-09", departures: ["10:00"], year: 2027 },
      { from: "02-13", to: "02-13", departures: ["10:00"], year: 2027 },
      { from: "03-13", to: "03-13", departures: ["10:00"], year: 2027 },
    ],
    checkInMin: 30,
    daysZh: "11 月到次年 3 月每月一个周六，日期每年不同；这里是 2026–27 年冬季的日期",
    meetZh: "US-70 公路 174–175 英里桩之间的 Small Missile Range 大门（公园西南约 40 公里）",
    noteZh: "9:30 开始报到，10:00 车队准时出发，迟到就进不去；全程约 3–4 小时，含在靶场里跟车队开约 28 公里到步道口。",
    sources: ["https://www.nps.gov/whsa/planyourvisit/lake-lucero-tour.htm"],
  },
  {
    id: "cave-kings-palace",
    scheduleYear: 2026,
    // 感恩节（11-26）、圣诞节、元旦全园关闭
    periods: [
      { from: "01-02", to: "11-25", departures: ["10:30", "13:30"], days: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue"] },
      { from: "11-27", to: "12-24", departures: ["10:30", "13:30"], days: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue"] },
      { from: "12-26", to: "12-31", departures: ["10:30", "13:30"], days: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue"] },
    ],
    checkInMin: 30,
    daysZh: "周四到周二（周三不开），而且只在当天人手够时开",
    meetZh: "游客中心售票处（取票后坐电梯下洞集合）",
    noteZh: "2026 年只卖当天的现场票，每团最多 12 人；导览票至少提前 30 分钟在游客中心取。",
    sources: ["https://www.nps.gov/cave/planyourvisit/tour_schedule.htm", "https://www.nps.gov/thingstodo/king-s-palace-tour.htm"],
  },
  {
    id: "cave-lower-cave",
    scheduleYear: 2026,
    periods: [
      { from: "01-02", to: "11-25", departures: ["09:30"], days: ["Wed"] },
      { from: "11-27", to: "12-24", departures: ["09:30"], days: ["Wed"] },
      { from: "12-26", to: "12-31", departures: ["09:30"], days: ["Wed"] },
    ],
    // Recreation.gov 写的是最晚 9:15 取票
    checkInMin: 15,
    daysZh: "每周三一场",
    meetZh: "游客中心放映厅（先到售票处取票）",
    noteZh: "约 3 小时，要爬梯子、走湿滑的土路；12 岁以上，必须穿抓地好的登山鞋，另要进洞预约和门票。",
    sources: ["https://www.nps.gov/cave/planyourvisit/lower_cave.htm", "https://www.recreation.gov/ticket/234637/ticket/77"],
  },
  {
    id: "meve-cliff-palace",
    scheduleYear: 2026,
    periods: [
      {
        from: "05-04",
        to: "05-09",
        departures: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:30", "15:00"],
      },
      {
        from: "05-10",
        to: "05-21",
        departures: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
      },
      {
        from: "05-22",
        to: "08-16",
        departures: [
          "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        ],
      },
      {
        from: "08-17",
        to: "10-21",
        departures: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
      },
    ],
    checkInMin: 15,
    meetZh: "Cliff Palace 观景台（从 Cliff Palace 停车场走约 110 米）",
    noteZh:
      "导览约 45 分钟，开团前 15 分钟到观景台集合听安全说明，迟到可能被取消、不退款；从公园入口开过来官方建议留 75 分钟。每周三另加下午的团（5 月 22 日–8 月 16 日加 16:00，8 月 17 日起加 15:30、16:00）。",
    sources: ["https://www.recreation.gov/ticket/233362/ticket/502", "https://www.nps.gov/meve/planyourvisit/cliff_dwelling_tours.htm"],
  },
  {
    id: "meve-balcony-house",
    scheduleYear: 2026,
    periods: [
      { from: "05-04", to: "05-22", departures: ["09:00", "09:30", "13:30", "14:00", "14:30", "15:00"] },
      {
        from: "05-23",
        to: "08-16",
        departures: ["09:00", "09:30", "10:30", "11:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
      },
      { from: "08-17", to: "09-07", departures: ["09:30", "11:00", "13:00", "13:30", "14:00", "14:30", "15:00"] },
      { from: "09-08", to: "10-21", departures: ["13:00", "13:30", "14:00", "14:30", "15:00"] },
    ],
    checkInMin: 15,
    meetZh: "Balcony House 停车场的遮阳棚（长椅处）",
    noteZh:
      "导览约 1 小时，开团前 15 分钟到集合听安全说明；从公园入口开过来官方建议留 1 小时到 1 小时 15 分。要爬约 10 米的木梯、钻岩缝隧道，恐高或幽闭恐惧的人别报。",
    sources: ["https://www.recreation.gov/ticket/233362/ticket/500", "https://www.nps.gov/meve/planyourvisit/cliff_dwelling_tours.htm"],
  },
  {
    id: "meve-long-house",
    scheduleYear: 2026,
    periods: [{ from: "05-22", to: "10-21", departures: ["09:45", "10:30", "13:00", "13:45"] }],
    // 开团时间是在步道口出发：要提前 15 分钟到步道口，从停车场走过去约 20 分钟
    checkInMin: 35,
    meetZh: "Long House 步道口（从 Wetherill Mesa 停车场沿铺装路走约 1.2 公里、20 分钟）",
    noteZh:
      "导览 90 分钟，加上来回走路全程约 2 小时。Wetherill Mesa 闸门 8:30 开、14:00 后不能再进、16:00 前必须离开；从公园入口开到停车场官方建议留 1.5 小时。",
    sources: [
      "https://www.recreation.gov/ticket/facility/233362",
      "https://www.nps.gov/meve/planyourvisit/cliff_dwelling_tours.htm",
      "https://www.nps.gov/meve/planyourvisit/wetherill-mesa.htm",
    ],
  },
];
