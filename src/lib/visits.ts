import { canadianParks, nationalParks, nationalParksOf, type NationalPark } from "../data/national-parks";
import {
  annualVisits,
  canadaFirstYear,
  canadaSourceUrl,
  canadaVisits,
  dailyByMonth,
  dailyYears,
  visitsFirstYear,
  visitsLastYear,
} from "../data/visits.generated";

export { crowdLevel, crowdRatios, type CrowdLevel } from "./crowd";

// 游客人次：榜单页的排名、公园页的历年和每个月人数、“什么时候去”的人多不多

/** NPS 单位某一年的人次；没有统计是 null */
export const visitsIn = (code: string, year: number) => annualVisits[code]?.[year - visitsFirstYear] ?? null;

export interface RankedPark extends NationalPark {
  visits: number;
  /** 前一年的人次（算涨跌） */
  previous: number | null;
  /** 63 座里按人次排第几 */
  rank: number;
}

/** 63 座国家公园按某一年的人次从多到少排 */
export function visitRanking(year = visitsLastYear): RankedPark[] {
  return nationalParks
    .map((park) => ({ ...park, visits: visitsIn(park.code, year) ?? 0, previous: visitsIn(park.code, year - 1) }))
    .sort((a, b) => b.visits - a.visits)
    .map((park, i) => ({ ...park, rank: i + 1 }));
}

export interface ParkVisits {
  /** nps：美国国家公园（按日历年）；canada：Parks Canada（按财年，4 月到次年 3 月） */
  source: "nps" | "canada";
  firstYear: number;
  lastYear: number;
  /** 每年的人次，下标 0 是 firstYear；没有统计是 null */
  annual: (number | null)[];
  /** 最近一年 */
  latest: number;
  /** 拆开说的部分：红杉、国王峡谷各多少、排第几 */
  parts: { nameZh: string; visits: number; rank: number }[];
  /** 美国 63 座里排第几（一个公园页对应一座国家公园时） */
  rank?: number;
  /** 哪一年升为国家公园（图上标出来；比统计开始得早的不标） */
  establishedYear?: number;
  /** 每个月平均每天多少人次（下标 0 是 1 月）；加拿大没有按月的数字 */
  daily?: number[];
  /** 每个月的数字是哪几年平均的（"2023–2025"） */
  dailyYears?: string;
  /** 北瀑布：加上旁边两个国家休闲区一共多少人次 */
  complex?: number;
  /** 来源：NPS 这个公园的统计页 / Parks Canada 最近一个财年的数据集 */
  sourceUrl: string;
}

/** 几个单位每年的人次加起来（红杉 + 国王峡谷） */
const sumYears = (lists: (number | null)[][]) =>
  lists[0].map((_, i) =>
    lists.every((list) => list[i] === null) ? null : lists.reduce((sum, list) => sum + (list[i] ?? 0), 0),
  );

/** 公园页（网站的公园代码）的人次：美国按 NPS，seki 是红杉 + 国王峡谷；加拿大按 Parks Canada；园外名胜没有 */
export function parkVisits(page: string): ParkVisits | null {
  const canadian = canadianParks.find((park) => park.code === page);
  if (canadian) {
    const annual = canadaVisits[page];
    if (!annual) return null;
    return {
      source: "canada",
      firstYear: canadaFirstYear,
      lastYear: canadaFirstYear + annual.length - 1,
      annual,
      latest: annual.at(-1) ?? 0,
      parts: [],
      sourceUrl: canadaSourceUrl,
    };
  }
  const units = nationalParksOf(page);
  if (units.length === 0) return null;
  const ranking = visitRanking();
  const annual = sumYears(units.map((unit) => annualVisits[unit.code]));
  const daily = units.every((unit) => dailyByMonth[unit.code])
    ? dailyByMonth[units[0].code].map((_, m) => units.reduce((sum, unit) => sum + dailyByMonth[unit.code][m], 0))
    : undefined;
  const established = Math.min(...units.map((unit) => Number(unit.established.slice(0, 4))));
  const firstCounted = visitsFirstYear + annual.findIndex((value) => value !== null);
  const rankOf = (code: string) => ranking.find((park) => park.code === code)!;
  const parts = units.map((unit) => ({ nameZh: unit.nameZh, visits: rankOf(unit.code).visits, rank: rankOf(unit.code).rank }));
  return {
    source: "nps",
    firstYear: visitsFirstYear,
    lastYear: visitsLastYear,
    annual,
    latest: annual.at(-1) ?? 0,
    parts: units.length > 1 ? parts : [],
    sourceUrl:
      units.length === 1 ? `https://irma.nps.gov/Stats/Reports/Park/${units[0].code.toUpperCase()}` : "https://irma.nps.gov/Stats/",
    ...(units.length === 1 ? { rank: rankOf(units[0].code).rank } : {}),
    ...(established > firstCounted ? { establishedYear: established } : {}),
    ...(daily ? { daily, dailyYears } : {}),
    ...(page === "noca"
      ? { complex: ["noca", "rola", "lach"].reduce((sum, code) => sum + (visitsIn(code, visitsLastYear) ?? 0), 0) }
      : {}),
  };
}
