import "server-only";
import type { Locale } from "./config";
import { localize } from "./convert";

const zhHans = {
  site: {
    name: "park-pilot",
    tagline: "按日期规划美国国家公园",
    description: "美国国家公园的景点地图、行程规划和实时公告，行程随实际进度调整。",
  },
  nav: {
    parks: "公园",
    plan: "我的行程",
  },
  common: {
    allParks: "← 所有公园",
    dataUnavailable: "数据暂时拿不到，稍后刷新再试。",
    rateLimited: "接口调用太频繁，被限流了。",
    demoKeyLimited: "DEMO_KEY 的额度用完了（每小时 30 次）。",
    demoKeyNotice:
      "当前用的是 DEMO_KEY，每小时只能调用 30 次。到 api.data.gov/signup 申请免费 key，填进 .env.local 的 DATA_GOV_API_KEY。",
  },
  regions: {
    sierra: "加州 Sierra",
    vegas: "拉斯维加斯出发",
    alaska: "阿拉斯加",
  },
  home: {
    heroTitle: "美国国家公园，按日期规划",
    heroSubtitle: "景点地图、每天路线和住宿一次排好，按日出日落安排时间；到了公园进度有变，一键重排剩下的天。",
    planCta: "开始规划行程",
    browseCta: "浏览公园",
    continueTitle: "继续你的行程",
    continueSummary: "{n} 个景点 · {days} 天",
    continueStart: "{date} 出发",
    continueCta: "打开行程 →",
    stepsTitle: "三步排好行程",
    steps: [
      { title: "挑景点", text: "在公园地图上看照片、徒步难度和开放季节，把想去的加入行程。" },
      { title: "自动排", text: "设好日期和天数，按真实车程和日出日落排好每天几点到哪。" },
      { title: "定住宿，随时调", text: "选每晚住哪，车程从住处算起；进度变了，一键重排剩下的天。" },
    ],
    seasonTitle: "{month} 月适合去",
    seasonHint: "按各公园的最佳季节推荐",
    mapTitle: "公园分布",
    alaska: "阿拉斯加 · 德纳里 →",
    parksTitle: "7 个国家公园",
    mustSee: "必去：{names}",
    bestMonths: "最佳 {months}",
    viewPark: "看景点地图",
    addMustSee: "加入 {n} 个必去景点",
    addedMustSee: "必去景点已加入 ✓",
    airports: "常用机场",
    nonresident: "非居民 +$100/人",
    attractions: "{n} 个景点",
  },
  park: {
    gateway: "定位点",
    airports: "常用机场",
    nonresidentNote:
      "2026 年起，非美国居民（16 岁以上）进入本园每人另收 $100；非居民年卡 $250，可免这笔附加费。",
    introTitle: "公园特色",
    attractionsTitle: "景点地图",
    infoTitle: "实时信息",
    alerts: {
      title: "实时公告",
      source: "来源：NPS 官方 API",
      empty: "目前没有公告。",
      updated: "更新于 {date}",
      stale: "超过半年没更新，可能已过期",
      categories: {
        "Park Closure": "关闭",
        Danger: "危险",
        Caution: "注意",
        Information: "信息",
      } as Record<string, string>,
    },
    fees: {
      title: "门票",
      source: "来源：NPS 官方 API",
      empty: "没有查到个人门票信息。",
      types: {
        "Entrance - Private Vehicle": "自驾车（含车上所有人）",
        "Entrance - Motorcycle": "摩托车",
        "Entrance - Per Person": "每人（步行、骑行）",
        Nonresident: "非居民附加费（每人）",
      } as Record<string, string>,
    },
    chargers: {
      title: "补能：充电桩",
      source: "来源：美国能源部 NLR 充电站数据，距离为直线距离",
      scope: "定位点 {radius} 英里内的公共充电站",
      stats: {
        total: "充电站",
        dcFast: "有快充",
        tesla: "Tesla 超充",
        unavailable: "暂不可用",
      },
      nearestDcFast: "最近的可用快充：{name}，直线 {distance} 英里",
      noDcFast: "{radius} 英里内没有可用的快充，进园前务必充满。",
      empty: "{radius} 英里内没有公共充电站。",
      columns: {
        name: "充电站",
        distance: "直线距离",
        type: "类型",
        status: "状态",
      },
      level2: "L2 慢充 ×{n}",
      dcFast: "快充 ×{n}",
      ok: "正常",
      flags: {
        unavailable: "暂不可用",
        stale: "超过一年未确认",
        nonNetworked: "不联网，状态不实时",
      },
      networks: {
        Tesla: "Tesla 超充",
        "Tesla Destination": "Tesla 目的地充电",
        "Non-Networked": "独立桩",
      } as Record<string, string>,
      more: "只显示最近的 {shown} 个，共 {total} 个。",
    },
    upcoming: {
      title: "接下来要做",
      items: ["按日期查看道路和区域开放", "沿途亚洲超市和合口味的餐厅", "预算估算：门票、油电、餐饮、住宿"],
    },
  },
  map: {
    map: "地图",
    satellite: "卫星",
    terrain: "3D 地形",
    routeNote: "虚线只表示游览顺序，不是实际道路",
    loading: "地图加载中…",
  },
  attraction: {
    all: "全部",
    mustSee: "必去",
    addAllMustSee: "加入全部必去（{n}）",
    allMustSeeAdded: "必去已全部加入 ✓",
    details: "查看详情",
    close: "关闭",
    duration: "建议停留 {d}",
    loop: "环线",
    openMonths: "通常 {months} 可去",
    bestMonths: "最佳 {months}",
    permit: "需许可证 / 预约",
    outsidePark: "园外",
    start: "出发点：{name}",
    tips: "实用提示",
    showOnMap: "在地图上看",
    navigate: "导航",
    photoCredit: "照片：{author} · {license}",
  },
  kinds: {
    viewpoint: "观景点",
    hike: "徒步",
    waterfall: "瀑布",
    grove: "巨杉林",
    landmark: "地标",
    drive: "景观道",
    experience: "体验",
    visitor: "游客中心",
  },
  difficulty: {
    easy: "简单",
    moderate: "中等",
    hard: "困难",
  },
  timeOfDay: {
    sunrise: "日出",
    morning: "上午",
    afternoon: "下午",
    sunset: "日落",
    night: "夜晚",
  },
  units: {
    minutes: "{m} 分钟",
    hours: "{h} 小时",
    hoursMinutes: "{h} 小时 {m} 分",
    months: "{from}–{to} 月",
    month: "{m} 月",
    allYear: "全年",
    km: "{km} 公里（{mi} 英里）",
    meters: "爬升 {m} 米",
  },
  trip: {
    add: "加入行程",
    added: "已加入 ✓",
  },
  plan: {
    title: "我的行程",
    intro:
      "从公园页把景点加入行程，再按天数自动排好每天去哪、几点到。进度变了，可以把没完成的景点重新排进后面几天。",
    empty: "行程里还没有景点。去公园页点“加入行程”，或者在下面直接添加。",
    startDate: "出发日期",
    days: "天数",
    dayOption: "{n} 天",
    autoPlan: "自动排行程",
    autoPlanConfirm: "会重新安排所有还没完成的景点，手动调整会被覆盖。继续吗？",
    clear: "清空",
    clearConfirm: "确定清空整个行程？",
    pool: "待安排（{n}）",
    poolHint: "点“自动排行程”把它们排进每一天。",
    add: "添加景点",
    addPlaceholder: "选择公园",
    day: "第 {n} 天",
    empty_day: "这天没有安排，可以休息或机动。",
    sunrise: "日出 {time}",
    sunset: "日落 {time}",
    polarDay: "极昼，太阳不落",
    polarNight: "极夜",
    noDate: "设置出发日期后，会按当天的日出日落排时间，并提示季节性关闭。",
    summary: "活动约 {active} · 开车约 {drive}",
    drive: "开车约 {d}",
    free: "空闲约 {d}",
    dragHint: "拖动景点可以调整顺序，或拖到别的天",
    more: "更多操作",
    moveTo: "移到第 {n} 天",
    lodging: {
      start: "出发地",
      startHint: "第 1 天出发前住的地方（可选）",
      tonight: "今晚住",
      unset: "还没定住哪",
      depart: "{time} 从 {name} 出发",
      back: "回 {name}，约 {time} 到",
      choose: "选住处",
      change: "更换",
      collapse: "收起",
      clear: "清除",
      suggested: "推荐（按车程）",
      sameAsLast: "和前一晚一样",
      inPark: "园内",
      outside: "园外",
      backLeg: "回程 {d}",
      outLeg: "第二天 {d}",
      searchPlaceholder: "搜酒店名或地址，如 Springdale Holiday Inn",
      search: "搜索",
      searching: "搜索中…",
      noResults: "没找到，换个关键词试试",
      measuring: "正在计算车程…",
      estimated: "查不到路网车程，按直线距离估算",
      pick: "住这里",
      fillAll: "一键安排住宿",
      fillHint: "按当天最后一站和第二天第一站推荐车程最短的住处；定好住宿后可以再点一次“自动排行程”。",
    },
    replan: "按实际进度调整",
    replanToday: "今天是",
    replanButton: "重排剩余行程",
    replanHint: "之前没完成的景点会和今天起的安排一起重新分配，已完成和已跳过的不动。",
    showOnMap: "地图显示这天",
    status: {
      done: "完成",
      skipped: "跳过",
      undo: "撤销",
    },
    actions: {
      up: "上移",
      down: "下移",
      prevDay: "移到前一天",
      nextDay: "移到后一天",
      remove: "移除",
    },
    warnings: {
      closed: "通常 {months} 才能去，这天可能不开放",
      notBest: "最佳季节是 {months}",
      permit: "需要许可证 / 预约",
      dark: "结束时天已经黑了",
      missSunset: "赶不上日落",
      overloaded: "这天安排太满（超过 11 小时）",
      farTransfer: "车程太长，建议飞过去或拆成两段旅行",
      lateReturn: "回到住处已经很晚了",
    },
    credit: "车程为估算，路网数据来自 OSRM / OpenStreetMap；日出日落按公园位置计算。",
  },
  footer: {
    sources:
      "数据来源：National Park Service、U.S. DOE / NLR、OpenStreetMap、Wikimedia Commons。仅供参考，出行前请以公园官网为准。",
  },
};

export type Dictionary = typeof zhHans;

function convertDeep<T>(value: T, locale: Locale): T {
  if (typeof value === "string") return localize(value, locale) as T;
  if (Array.isArray(value)) return value.map((item) => convertDeep(item, locale)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, convertDeep(item, locale)]),
    ) as T;
  }
  return value;
}

const cache = new Map<Locale, Dictionary>();

export function getDictionary(locale: Locale): Dictionary {
  let dict = cache.get(locale);
  if (!dict) {
    dict = convertDeep(zhHans, locale);
    cache.set(locale, dict);
  }
  return dict;
}
