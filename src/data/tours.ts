// 有固定班次的游船、导览团：排行程时按班次开始（要提前到的按提前报到算），赶不上最后一班、或者这天根本不开都会提醒。
// 时间是当地时间（“HH:MM”）；scheduleYear 是时刻表的年份，之后的年份按同样的日期和时间估，出发前以官网为准。
// 有班次的景点，停留时间（durationMin）是从开船、发车到回来，不含提前报到。
import type { MonthDay } from "./bookings";

/** 一段时间里的班次（比如 6 月班次少，7 月起多） */
export interface TourPeriod {
  from: MonthDay;
  to: MonthDay;
  departures: string[];
}

export interface TourSchedule {
  /** 景点 id */
  id: string;
  scheduleYear: number;
  /** 不在这些时间段里的日子不开 */
  periods: TourPeriod[];
  /** 要提前多久到（报到、停车） */
  checkInMin: number;
  /** 不是每天都开的，写在这里提醒；排行程时不按星期算 */
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
      { from: "07-03", to: "09-07", departures: ["10:15", "14:45"] },
      { from: "09-12", to: "09-27", departures: ["10:15", "14:45"] },
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
];
