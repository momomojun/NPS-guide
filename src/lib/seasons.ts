import "server-only";
import { activities } from "@/data/activities";
import { attractions } from "@/data/attractions";
import { climate } from "@/data/climate.generated";
import type { Park } from "@/data/parks";
import { seasonalRoads } from "@/data/roads";
import { roadDecides, roadFor } from "@/lib/roads";

// “什么时候去哪个公园”：按月整理每个公园能去的景点比例、去不了的必去景点、往年同期天气和特别活动，
// 页面上按出发日期（前后十天，跨月按天数加权）打分排序

export interface MonthClimateSummary {
  high: number;
  /** 主要片区（至少四分之一的景点）里最热的那个的平均最高气温：判断太热用这个（宁可保守） */
  hottest: number;
  low: number;
  wetDays: number;
  snowDays: number;
}

export interface ParkMonth {
  best: boolean;
  /** 这个月能去的景点比例（0–1），必去景点算两份；游客中心和园外景点不算 */
  open: number;
  /** 这个月去不了的必去景点 */
  closedMustSee: string[];
  /** 往年同期：各片区按景点数加权平均（死亡谷的景点大多在谷底，高处观景点的凉快不能拉低平均） */
  climate?: MonthClimateSummary;
  /** 这个月的特别活动（全年都有的不算） */
  events: string[];
}

/** 季节性道路通了就能去的景点：选了具体日期时按这条路往年这几天通不通算，不按开放月份 */
export interface RoadStop {
  road: string;
  /** 和 open 的算法一样：必去景点算两份 */
  weight: number;
  /** 必去景点的名字 */
  mustSee?: string;
  openMonths?: number[];
}

export interface ParkSeason {
  code: string;
  nameZh: string;
  nameEn: string;
  tagline: string;
  seasonNote: string;
  bestMonths: number[];
  /** 下标 0 是 1 月 */
  months: ParkMonth[];
  /** 参与算 open 的景点总份数 */
  totalWeight: number;
  roadStops: RoadStop[];
  /** 这个公园的季节性道路 id → 名字 */
  roadNames: Record<string, string>;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

export function parkSeason(park: Park): ParkSeason {
  const stops = attractions.filter((a) => a.park === park.code && !a.outsidePark && a.kind !== "visitor");
  // 片区按景点数加权
  const areas = Object.entries(climate[park.code] ?? {}).map(([key, area]) => ({
    months: area.months,
    weight: Math.max(stops.filter((stop) => stop.area === key).length, 0.5),
    // 至少四分之一的景点在这个片区，才拿它判断“太热”（大峡谷谷底只有一两个景点，不能让整个公园 7 月都算太热）
    major: stops.filter((stop) => stop.area === key).length >= stops.length / 4,
  }));
  const totalWeight = areas.reduce((sum, area) => sum + area.weight, 0);
  const months = Array.from({ length: 12 }, (_, i): ParkMonth => {
    const month = i + 1;
    let total = 0;
    let open = 0;
    const closedMustSee: string[] = [];
    for (const stop of stops) {
      const weight = stop.mustSee ? 2 : 1;
      const isOpen = !stop.openMonths || stop.openMonths.includes(month);
      total += weight;
      if (isOpen) open += weight;
      else if (stop.mustSee) closedMustSee.push(stop.nameZh);
    }
    const average = (pick: (m: { high: number; low: number; wetDays: number; snowDays: number }) => number) =>
      round1(areas.reduce((sum, area) => sum + pick(area.months[i]) * area.weight, 0) / totalWeight);
    return {
      best: park.bestMonths.includes(month),
      open: total ? open / total : 1,
      closedMustSee,
      climate: areas.length
        ? {
            high: average((m) => m.high),
            hottest: round1(Math.max(...areas.filter((area) => area.major).map((area) => area.months[i].high), average((m) => m.high))),
            low: average((m) => m.low),
            wetDays: average((m) => m.wetDays),
            snowDays: average((m) => m.snowDays),
          }
        : undefined,
      events: activities
        .filter((activity) => activity.park === park.code && activity.months?.includes(month))
        .map((activity) => activity.nameZh),
    };
  });
  const roadStops = stops.flatMap((stop): RoadStop[] => {
    const road = roadFor(stop.id);
    if (!road || !roadDecides(road, stop.id)) return [];
    return [{ road: road.id, weight: stop.mustSee ? 2 : 1, mustSee: stop.mustSee ? stop.nameZh : undefined, openMonths: stop.openMonths }];
  });
  return {
    code: park.code,
    nameZh: park.nameZh,
    nameEn: park.nameEn,
    tagline: park.tagline,
    seasonNote: park.seasonNote,
    bestMonths: park.bestMonths,
    months,
    totalWeight: stops.reduce((sum, stop) => sum + (stop.mustSee ? 2 : 1), 0),
    roadStops,
    roadNames: Object.fromEntries(
      seasonalRoads.filter((road) => roadStops.some((stop) => stop.road === road.id)).map((road) => [road.id, road.nameZh]),
    ),
  };
}
