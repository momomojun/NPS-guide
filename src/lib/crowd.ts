// 人多不多：和这个公园一年里最挤的月份（按平均每天的人次）比。不带数据，浏览器里（“什么时候去”）也能用

export type CrowdLevel = "peak" | "busy" | "moderate" | "quiet";

/** 最挤的月份的八成以上算最挤，一半以上算人多，四分之一以上算人不多，再少算人少 */
export const crowdLevel = (ratio: number): CrowdLevel =>
  ratio >= 0.8 ? "peak" : ratio >= 0.5 ? "busy" : ratio >= 0.25 ? "moderate" : "quiet";

/** 每个月平均每天的人次 → 和最挤的月份的比例（0–1） */
export function crowdRatios(daily: number[]): number[] {
  const peak = Math.max(...daily);
  return daily.map((value) => (peak > 0 ? value / peak : 0));
}

/** 一段日子（各月按天数加权）平均下来和最挤的月份比，是哪一档；没有按月数字的公园是 null */
export function crowdOf(daily: number[] | undefined, weights: Map<number, number>) {
  if (!daily) return null;
  const ratios = crowdRatios(daily);
  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  const average = (pick: (month: number) => number) =>
    [...weights.entries()].reduce((sum, [month, weight]) => sum + pick(month) * weight, 0) / total;
  const ratio = average((month) => ratios[month - 1]);
  return { ratio, level: crowdLevel(ratio), perDay: average((month) => daily[month - 1]) };
}
