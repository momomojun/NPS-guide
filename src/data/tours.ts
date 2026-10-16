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
  {
    id: "glba-day-boat",
    scheduleYear: 2026,
    periods: [{ from: "05-22", to: "09-07", departures: ["07:15"] }],
    checkInMin: 25,
    meetZh: "Bartlett Cove 公共码头（Glacier Bay Lodge 下方）",
    noteZh:
      "每天只有这一班：6:50 登船、7:15 开、约 15:30 回到码头（约 8 小时）；住 Gustavus 的要提前约好出租车或接驳车，早上赶到码头。",
    sources: [
      "https://www.nps.gov/glba/planyourvisit/glacier-bay-lodge.htm",
      "https://www.visitglacierbay.com/tours/glacier-bay-day-tour/",
    ],
  },
  {
    id: "glba-kayak",
    scheduleYear: 2026,
    // Glacier Bay Sea Kayaks 官网写了几点出发，没写营业日期；这里先按 Glacier Bay Lodge、游船的营业季算
    periods: [{ from: "05-22", to: "09-07", departures: ["09:00", "14:00"] }],
    checkInMin: 15,
    meetZh: "Bartlett Cove 码头边的海滩（住 Gustavus 的可以让公司开车来接）",
    noteZh: "半日团 9:00–12:30、14:00–17:30，全日团 9:00–15:00；官网没写具体的营业日期，出发前以订票确认为准。",
    sources: ["https://glacierbayseakayaks.com/day-trips/one-day-kayak-adventure/"],
  },
  {
    id: "gaar-fairbanks-flight",
    scheduleYear: 2026,
    // 北阿拉斯加旅游公司的 Gates of the Arctic Air Adventure，2027 年也是 6 月 1 日到 8 月 31 日每天 19:00
    periods: [{ from: "06-01", to: "08-31", departures: ["19:00"] }],
    checkInMin: 60,
    meetZh: "费尔班克斯机场东侧北阿拉斯加旅游公司航站（3820 University Ave S）",
    noteZh: "全程约 4.5–5 小时，中途在 Coldfoot 落地休息，23:30–24:00 回到费尔班克斯；起飞前至少 1 小时报到。",
    sources: [
      "https://www.northernalaska.com/tours/gates-of-the-arctic-air-adventure/",
      "https://www.alaskatravel.com/fairbanks/arctic-circle-fly/",
    ],
  },
  {
    id: "gaar-anaktuvuk-pass",
    scheduleYear: 2026,
    // Wright Air 的定期航班（2026 年 8 月时刻表）：工作日 9:00、13:00，周末只有 13:00；当天往返只能坐工作日早班
    periods: [{ from: "01-01", to: "12-31", departures: ["09:00"], days: ["Mon", "Tue", "Wed", "Thu", "Fri"] }],
    checkInMin: 60,
    daysZh: "当天往返只能坐周一到周五早上 9:00 的航班；周末只有 13:00 一班，来不及当天回，博物馆周末也不开",
    meetZh: "费尔班克斯机场东侧 Wright Air 航站（3842 University Ave S）",
    noteZh:
      "这是航空公司的定期航班，不是旅行团：航空公司希望提前 90 分钟报到，最晚 60 分钟；有时经停 Coldfoot。时刻表每季会变，订票时确认回程时间。",
    sources: ["https://wrightairservice.com/wp-content/uploads/2026/08/CURRENT-TIMETABLE-2026-08.pdf"],
  },
  {
    id: "katm-vtts",
    scheduleYear: 2026,
    // 景点的出发点是 King Salmon 的水上飞机码头：checkInMin 包括约 20 分钟的水上飞机和到了 Brooks Camp 先听的熊安全讲座
    periods: [{ from: "06-05", to: "09-17", departures: ["09:00"] }],
    checkInMin: 60,
    meetZh: "Brooks Camp 下游观熊台（河口高架桥南头）集合；从 King Salmon 来的先坐 Katmai Air 的水上飞机（约 20 分钟）",
    noteZh:
      "每天只有这一班，9:00 开、16:00 回到 Brooks Camp，再坐水上飞机回 King Salmon；住 Brooks Lodge 或营地的直接去集合点。",
    sources: [
      "https://katmailand.com/katmai-national-park/valley-of-ten-thousand-smokes/",
      "https://katmailand.com/wp-content/uploads/2026/02/2026-Brooks-Lodge-Trip-Planner.pdf",
    ],
  },
  {
    id: "lacl-crescent-lake",
    scheduleYear: 2026,
    // Rust's 的 Lake Clark National Park Bear Viewing：8 月 8:00、9 月 9:00 起飞，约 11 小时
    periods: [
      { from: "08-01", to: "08-31", departures: ["08:00"] },
      { from: "09-01", to: "09-25", departures: ["09:00"] },
    ],
    checkInMin: 30,
    meetZh: "安克雷奇 Lake Hood 南岸的 Rust's Flying Service",
    noteZh: "全程约 11 小时，单程飞约 70 分钟；官网没写要提前多久到，按 30 分钟算，以确认邮件为准。看天气起飞。",
    sources: ["https://flyrusts.com/bearviewing/lake-clark-national-park-bear-viewing/"],
  },
  {
    id: "grba-lehman-caves",
    scheduleYear: 2026,
    // Grand Palace 导览（90 分钟）能提前订的场次，按 NPS 洞穴导览页（2026-09-28）和 Recreation.gov 2026 年 8–12 月的排班；只在现场卖的场次没算进来。
    // 2026 年 1 月到 7 月 9 日洞里换灯，没有 Grand Palace 导览；1 月 2 日到 5 月 21 日、5 月 22 日到 7 月 9 日按 2026 年冬季、盛夏的场次估。
    periods: [
      { from: "01-02", to: "05-21", departures: ["09:30"] },
      { from: "05-22", to: "09-07", departures: ["09:45", "12:15", "13:45"] },
      { from: "09-08", to: "10-29", departures: ["08:30", "12:00", "13:30"] },
      { from: "10-30", to: "12-24", departures: ["09:30"] },
      { from: "12-26", to: "12-31", departures: ["09:30"] },
    ],
    checkInMin: 15,
    daysZh: "冬季（10 月 30 日起）周六、周日另加 13:30 一场；感恩节、圣诞节、元旦不开团。",
    meetZh: "Lehman Caves 游客中心服务台报到",
    noteZh:
      "开团前 15 分钟到游客中心报到，开团前 5 分钟还没报到就作废。另有只在当天现场卖的场次（比如 9–10 月的 10:00、13:00），不保证有。2026 年 10 月 23 日公园 40 周年庆典，当天 Grand Palace 导览全部免费、早上 8 点起现场发票（8:30、9:15、9:45、11:00、11:30、15:30、16:00）。2027 年的场次一般提前 1–3 个月才公布。",
    sources: [
      "https://www.nps.gov/grba/planyourvisit/lehman-caves-tours.htm",
      "https://www.recreation.gov/ticket/facility/251853",
      "https://www.nps.gov/grba/planyourvisit/40th-anniversary.htm",
    ],
  },
  {
    id: "thro-medora-musical",
    scheduleYear: 2026,
    periods: [{ from: "06-03", to: "09-12", departures: ["19:30"], days: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }],
    checkInMin: 30,
    daysZh: "周二到周日演出，周一停演",
    meetZh: "Medora 镇西 Chateau Road 上的 Burning Hills 露天剧场",
    noteZh:
      "提前约半小时到，停车、找座位；先吃叉子烤牛排的话傍晚 5 点多就要到剧场旁的山顶露台。演出约 2 小时，散场后回 Medora 镇上的酒店只要几分钟。",
    sources: [
      "https://medora.com/medora-musical/",
      "https://www.thedickinsonpress.com/news/local/what-to-expect-from-this-years-medora-musical",
      "https://medora.com/pitchforksteakfondue/",
    ],
  },
  {
    id: "badl-night-sky-program",
    scheduleYear: 2026,
    // 按开始时间（先是 30 分钟夜间讲解，接着星空观测）；NPS Ranger Programs 页面只写了 6–7 月、8 月、9 月三档，
    // 没写 9 月哪天结束，这里按其他夏季护林员活动的结束日（9 月 26 日）算
    periods: [
      { from: "06-01", to: "07-31", departures: ["21:00"] },
      { from: "08-01", to: "08-31", departures: ["20:30"] },
      { from: "09-01", to: "09-26", departures: ["20:00"] },
    ],
    checkInMin: 10,
    meetZh: "Cedar Pass 营地入口旁的露天剧场（停车场在营地门口）",
    noteZh:
      "夜间讲解约 30 分钟，星空观测紧接着开始（2026 年 6–7 月 21:30、8 月 21:00、9 月 20:30），约 30–45 分钟；阴雨天取消，当天在游客中心或营地门口确认。",
    sources: [
      "https://www.nps.gov/thingstodo/badl-ranger-programs.htm",
      "https://www.nps.gov/thingstodo/night-sky-badl.htm",
    ],
  },
  {
    id: "wica-natural-entrance-tour",
    scheduleYear: 2026,
    periods: [
      { from: "05-01", to: "05-22", departures: ["09:00", "11:30", "13:00", "14:30"] },
      {
        from: "05-23",
        to: "05-25",
        departures: ["08:40", "09:20", "10:30", "11:30", "12:30", "14:30", "15:30", "16:20", "17:00"],
      },
      { from: "05-26", to: "06-06", departures: ["09:00", "10:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
      {
        from: "06-07",
        to: "08-08",
        departures: ["08:40", "09:20", "10:00", "11:20", "12:20", "13:40", "14:20", "15:40", "16:20"],
      },
      { from: "08-09", to: "09-07", departures: ["09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30"] },
      { from: "09-08", to: "09-19", departures: ["09:00", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30"] },
      { from: "09-20", to: "09-30", departures: ["08:40", "10:30", "11:30", "12:30", "13:30", "14:30"] },
    ],
    checkInMin: 30,
    meetZh: "风洞游客中心（在前台取票，护林员从这里带队）",
    noteZh: "约 1 小时 15 分钟；路线每年 10 月 1 日起冬季关闭。约一半的票在 Recreation.gov 提前卖，另一半当天在游客中心先到先得。",
    sources: ["https://www.nps.gov/wica/planyourvisit/guidedtours.htm"],
  },
  {
    id: "wica-fairgrounds-tour",
    scheduleYear: 2026,
    periods: [
      { from: "01-02", to: "04-04", departures: ["13:00"] },
      { from: "04-05", to: "04-30", departures: ["09:30", "13:30"] },
      { from: "05-23", to: "05-25", departures: ["11:00", "13:00", "15:00"] },
      { from: "06-07", to: "08-08", departures: ["08:40", "10:40", "12:40", "14:40", "15:20", "16:00"] },
      { from: "08-09", to: "09-07", departures: ["09:00", "13:00", "15:00"] },
      { from: "10-01", to: "10-31", departures: ["09:00", "11:40", "13:00", "13:40", "14:20"] },
      { from: "11-01", to: "11-25", departures: ["13:00"] },
      { from: "11-27", to: "12-24", departures: ["13:00"] },
      { from: "12-26", to: "12-31", departures: ["13:00"] },
    ],
    checkInMin: 30,
    daysZh: "5 月（阵亡将士纪念日周末除外）、6 月上旬和 9 月 8–30 日不开",
    meetZh: "风洞游客中心（在前台取票，护林员从这里带队）",
    noteZh: "约 1 小时 30 分钟、450 级台阶；冬天每天只有 13:00 一场。",
    sources: ["https://www.nps.gov/wica/planyourvisit/guidedtours.htm"],
  },
  {
    id: "wica-garden-of-eden-tour",
    scheduleYear: 2026,
    periods: [
      { from: "01-02", to: "04-04", departures: ["10:00", "15:00"] },
      { from: "04-05", to: "04-30", departures: ["11:30", "15:30"] },
      { from: "05-01", to: "05-22", departures: ["10:00", "15:30"] },
      { from: "05-23", to: "05-25", departures: ["10:00", "12:00", "14:00"] },
      { from: "05-26", to: "06-06", departures: ["11:00", "13:30", "15:30"] },
      { from: "06-07", to: "08-08", departures: ["09:40", "11:40", "13:40", "15:40"] },
      { from: "08-09", to: "09-07", departures: ["10:00", "12:00", "14:00", "16:00"] },
      { from: "09-08", to: "09-19", departures: ["10:00", "12:00", "14:00", "15:00", "16:00"] },
      { from: "09-20", to: "09-30", departures: ["09:00", "10:00", "12:00", "14:00", "15:00"] },
      { from: "10-01", to: "10-31", departures: ["10:00", "11:30", "14:00"] },
      { from: "11-01", to: "11-25", departures: ["10:00", "15:00"] },
      { from: "11-27", to: "12-24", departures: ["10:00", "15:00"] },
      { from: "12-26", to: "12-31", departures: ["10:00", "15:00"] },
    ],
    checkInMin: 30,
    meetZh: "风洞游客中心（在前台取票，护林员从这里带队）",
    noteZh: "约 1 小时、150 级台阶，全年都有；冬天只有两场，节假日周末常满。",
    sources: ["https://www.nps.gov/wica/planyourvisit/guidedtours.htm"],
  },
  {
    id: "wica-candlelight-tour",
    scheduleYear: 2026,
    periods: [
      { from: "06-07", to: "08-08", departures: ["10:30", "14:00"] },
      { from: "08-09", to: "08-22", departures: ["13:30"] },
    ],
    checkInMin: 30,
    meetZh: "风洞游客中心",
    noteZh: "约 2 小时，每团 10 人，必须提前打电话预约；要穿长裤和系带登山鞋。",
    sources: ["https://www.nps.gov/wica/planyourvisit/guidedtours.htm"],
  },
  {
    id: "wica-wild-cave-tour",
    scheduleYear: 2026,
    periods: [{ from: "06-07", to: "09-07", departures: ["13:00"] }],
    checkInMin: 30,
    meetZh: "风洞游客中心",
    noteZh: "最长约 4 小时，每团 6 人，必须提前打电话预约；公园提供头盔、头灯、手套和护膝。",
    sources: ["https://www.nps.gov/wica/planyourvisit/guidedtours.htm"],
  },
  {
    id: "wica-rushmore-lighting",
    scheduleYear: 2026,
    periods: [
      { from: "05-23", to: "08-09", departures: ["21:00"] },
      { from: "08-10", to: "09-30", departures: ["20:00"] },
    ],
    checkInMin: 30,
    meetZh: "拉什莫尔山头像下方的露天剧场（从停车楼走国旗大道过去约 5 分钟）",
    noteZh:
      "约 45 分钟，头像 21:30（8 月 10 日起 20:30）亮灯到 23:00；免费、不用预约，NPS 建议提前半小时到。2026 年 7 月 2 日晚到 3 日只对抽中烟花票的人开放。",
    sources: ["https://www.nps.gov/moru/planyourvisit/hours.htm"],
  },
  {
    id: "sagu-sabino-canyon",
    scheduleYear: 2026,
    periods: [
      {
        from: "01-01",
        to: "12-31",
        departures: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
      },
    ],
    checkInMin: 15,
    meetZh: "Sabino Canyon 游客中心旁的接驳车站（Sabino Canyon Crawler 售票亭）",
    noteZh:
      "官方要求发车前 15 分钟到上车点，旺季停车再多留 30 分钟；感恩节、圣诞节、元旦停开。下过雨溪水大时改走 Highwater 线，只到第 2 站和 Sabino Dam。",
    sources: ["https://sabinocanyoncrawler.com/"],
  },
  {
    id: "shen-rapidan-camp",
    scheduleYear: 2026,
    // Recreation.gov 2026 年 8–10 月的场次：周四到周一 10:00、14:00 两班，最后一天 10 月 25 日（周日）；
    // 5–7 月的场次已经查不到，按官方“5 月下旬起、每周四到周日”和 8 月以后的周一场次估
    periods: [
      { from: "05-21", to: "10-25", departures: ["10:00", "14:00"], days: ["Thu", "Fri", "Sat", "Sun", "Mon"] },
    ],
    checkInMin: 15,
    daysZh: "只在周四到周一开，周二、周三没有导览",
    meetZh: "Byrd 游客中心（天际线公路 51 英里）门前的旗杆",
    noteZh:
      "坐公园的面包车走约 30 分钟土路下到营地，全程约 2.5 小时（含往返车程）；官方介绍写周四到周日，2026 年 8–10 月实际也有周一的场次。",
    sources: [
      "https://www.recreation.gov/ticket/facility/251745",
      "https://www.nps.gov/shen/planyourvisit/rangerprograms.htm",
    ],
  },
  {
    id: "ever-flamingo-boat-tour",
    scheduleYear: 2026,
    // NPS：荒野线全年单数整点（9、11、13、15 点），佛罗里达湾线 11–4 月双数整点（10、12、14、16 点）；两条线合在一起
    periods: [
      { from: "11-01", to: "04-30", departures: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"] },
      { from: "05-01", to: "10-31", departures: ["09:00", "11:00", "13:00", "15:00"] },
    ],
    checkInMin: 15,
    meetZh: "Flamingo 码头的游船售票亭（Marina Activities Booth）",
    noteZh:
      "11–4 月整点都有船：单数整点是钻红树林水道的荒野线，双数整点是佛罗里达湾线；5–10 月只有荒野线。11 月 14 日到 2 月 26 日每天 14:00 的佛罗里达湾线有护林员随船。佛罗里达湾线哪天开始、哪天结束 NPS 只写了“11 月到 4 月”，按整月算。",
    sources: [
      "https://www.nps.gov/ever/planyourvisit/flamingo-ranger-guided-tours.htm",
      "https://www.nps.gov/ever/planyourvisit/guidedtours.htm",
    ],
  },
  {
    id: "ever-shark-valley-tram",
    scheduleYear: 2026,
    // Shark Valley Tram Tours：2025-12-20 到 2026-04-30 每小时一班，2026-05-01 到 12-18 一天 4 班（周末和节假日周加开 16:00）
    periods: [
      { from: "12-19", to: "04-30", departures: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"] },
      { from: "05-01", to: "12-18", departures: ["09:30", "11:00", "12:30", "14:00"] },
    ],
    checkInMin: 20,
    meetZh: "Shark Valley 游客中心旁的电车售票处",
    noteZh:
      "5 月到 12 月中旬的周六、周日和节假日那一周还加开 16:00 一班（这里没算进去）。冬季时刻表 2026 年从 12 月几号开始官网还没写，按 2025 年的 12 月 20 日前后算成 12 月 19 日。旺季停车场上午 10 点前就可能停满，订了早班也要提前到。",
    sources: ["https://www.sharkvalleytramtours.com/hours-and-rates/"],
  },
  {
    id: "bisc-heritage-cruise",
    scheduleYear: 2026,
    periods: [{ from: "01-01", to: "12-31", departures: ["09:30", "13:30"] }],
    checkInMin: 30,
    meetZh: "Convoy Point 的 Dante Fascell 游客中心二楼商店（9700 SW 328th St, Homestead）",
    noteZh: "3.5 小时，按当天风浪在 Elliott Key、Boca Chita 或 Adams Key 其中一个岛上停约 1 小时；官网没写哪几天开，订票日历上看。",
    sources: ["https://www.biscaynenationalparkinstitute.org/heritage-of-biscayne-cruise/"],
  },
  {
    id: "bisc-snorkel",
    scheduleYear: 2026,
    periods: [{ from: "01-01", to: "12-31", departures: ["09:15", "13:30"] }],
    checkInMin: 30,
    meetZh: "Convoy Point 的 Dante Fascell 游客中心二楼商店",
    noteZh: "3.5 小时；风浪大时取消，订票日历上看哪天有位子。",
    sources: ["https://www.biscaynenationalparkinstitute.org/snorkeling/snorkel-experience-2/"],
  },
  {
    id: "bisc-jones-lagoon",
    scheduleYear: 2026,
    periods: [{ from: "01-01", to: "12-31", departures: ["09:00", "13:30"] }],
    checkInMin: 30,
    meetZh: "Convoy Point 的 Dante Fascell 游客中心二楼商店",
    noteZh: "约 3.5 小时（含单程 30–45 分钟的快艇），每船最多 6 人。",
    sources: ["https://www.biscaynenationalparkinstitute.org/paddling/jones-lagoon-paddle-eco-adventure/"],
  },
  {
    id: "bisc-boca-chita",
    scheduleYear: 2026,
    // 11 月 1 日到 5 月 31 日 9:15，6 月 1 日到 10 月 31 日 13:30（跨年的一段拆成两段写）
    periods: [
      { from: "01-01", to: "05-31", departures: ["09:15"] },
      { from: "06-01", to: "10-31", departures: ["13:30"] },
      { from: "11-01", to: "12-31", departures: ["09:15"] },
    ],
    checkInMin: 30,
    meetZh: "Dinner Key Marina 9 号码头（3400 Pan American Dr, Coconut Grove，Miami Watersports 和 7 号码头牌子之间）",
    noteZh: "3.5 小时，在 Boca Chita 岛上约 1 小时；6–8 月多 1 小时湾里的入门浮潜，约 4.5 小时。",
    sources: ["https://www.biscaynenationalparkinstitute.org/island-experiences/boca-chita-key-heritage-cruise/"],
  },
  {
    id: "bisc-stiltsville",
    scheduleYear: 2026,
    periods: [{ from: "01-01", to: "12-31", departures: ["12:30", "15:00"], days: ["Thu", "Fri", "Sat", "Sun"] }],
    checkInMin: 30,
    daysZh: "只在周四到周日开",
    meetZh: "Dinner Key Marina 9 号码头（Coconut Grove）",
    noteZh: "2 小时，船最多 40 人，不靠岸。",
    sources: ["https://www.biscaynenationalparkinstitute.org/stiltsville-guided-tour-from-coconut-grove/"],
  },
  {
    id: "drto-ferry",
    scheduleYear: 2026,
    periods: [{ from: "01-01", to: "12-31", departures: ["08:00"] }],
    checkInMin: 60,
    meetZh: "Key West Bight 渡轮码头（100 Grinnell St）；停车在 300 Grinnell St 的市政停车楼",
    noteZh:
      "每天一班：7:00 报到（露营 6:00）、7:30 登船、8:00 开，约 10:15–10:30 到 Garden Key，15:00 离岛，约 17:15–17:30 回到 Key West（看风浪）；风浪太大时船长会取消。",
    sources: [
      "https://www.drytortugas.com/",
      "https://www.historictours.com/key-west/yankee-freedom-ferry-tickets",
    ],
  },
  {
    id: "hsbd-glen-canyon-float",
    scheduleYear: 2026,
    periods: [
      { from: "03-01", to: "05-15", departures: ["10:00"] },
      { from: "05-16", to: "05-31", departures: ["08:00", "11:30"] },
      { from: "06-01", to: "07-31", departures: ["08:00", "15:00"] },
      { from: "08-01", to: "09-30", departures: ["08:00", "10:00"] },
      { from: "10-01", to: "10-31", departures: ["10:00"] },
    ],
    checkInMin: 45,
    meetZh: "佩吉 199 Kaibab Rd 的 Wilderness River Adventures 河运总部（签到后坐大巴去 Lees Ferry 上船）",
    noteZh:
      "6–7 月下午 15:00 那班要 14:00 签到、20:00 才回到佩吉；不满 8 位全价乘客当班取消。回程大巴经 Navajo 大桥、朱红悬崖开回佩吉。",
    sources: ["https://www.lakepowell.com/things-to-do/horseshoe-bend-rafting-trip"],
  },
];
