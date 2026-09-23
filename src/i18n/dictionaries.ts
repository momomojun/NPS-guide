import "server-only";
import type { Locale } from "./config";
import { localize } from "./convert";

const zhHans = {
  site: {
    name: "park-pilot",
    tagline: "按日期规划美国国家公园",
    description: "按日期查看美国国家公园的公告、门票和沿途补能，行程随实际进度调整。",
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
    title: "首批 7 个国家公园",
    intro: "都是亲自去过的公园。点进去看实时公告、门票和周边的充电情况。",
    airports: "常用机场",
    nonresident: "非居民 +$100/人",
  },
  park: {
    gateway: "定位点",
    airports: "常用机场",
    nonresidentNote:
      "2026 年起，非美国居民（16 岁以上）进入本园每人另收 $100；非居民年卡 $250，可免这笔附加费。",
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
      items: [
        "按日期查看道路和区域开放",
        "沿途亚洲超市和合口味的餐厅",
        "预算估算：门票、油电、餐饮、住宿",
        "特色景点与拍照点",
      ],
    },
  },
  footer: {
    sources: "数据来源：National Park Service、U.S. DOE / NLR。仅供参考，出行前请以公园官网为准。",
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
