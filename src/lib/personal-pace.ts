import type { TripItem } from "./trip-store";

// 个人配速：按“今天”模式里的打卡（到了、走了）看这个人在景点实际停了多久，是估算的几倍。
// 徒步和其他景点分开算（走得快慢和拍照、逛的时间是两回事），各取中位数，忘了点“走了”这种偶尔的离谱数字影响不大。

/** 至少这么多站才算数：徒步 2 站，其他景点 3 站 */
const MIN_SAMPLES = { hike: 2, other: 3 };
/** 估算不到这么久的景点不算（几分钟的观景点差一点就是好几倍） */
const MIN_PLANNED_MIN = 15;
/** 实际停留短于这么久，多半是点错了 */
const MIN_ACTUAL_MIN = 5;
/** 倍数的范围；和 1 差不到 0.1 当作一样，不调整 */
const MIN_FACTOR = 0.6;
const MAX_FACTOR = 1.8;
const NOISE = 0.1;

export interface PersonalPace {
  /** 徒步实际时间是估算的几倍（没学到是 1） */
  hike: number;
  /** 其他景点 */
  other: number;
  /** 各用了几站 */
  samples: { hike: number; other: number };
}

export const NEUTRAL_PACE: PersonalPace = { hike: 1, other: 1, samples: { hike: 0, other: 0 } };

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function factor(ratios: number[], min: number): number {
  if (ratios.length < min) return 1;
  const value = Math.min(Math.max(median(ratios), MIN_FACTOR), MAX_FACTOR);
  return Math.abs(value - 1) < NOISE ? 1 : Math.round(value * 20) / 20;
}

/** 从整个行程里打过卡（到了、走了都有）的景点学配速 */
export function learnPace(
  items: TripItem[],
  stopOf: (id: string) => { durationMin: number; kind: string } | undefined,
): PersonalPace {
  const ratios = { hike: [] as number[], other: [] as number[] };
  for (const item of items) {
    const stop = stopOf(item.id);
    if (item.status !== "done" || !item.arrivedAt || !item.leftAt || !stop || stop.durationMin < MIN_PLANNED_MIN) continue;
    const actual = (item.leftAt - item.arrivedAt) / 60_000;
    if (actual < MIN_ACTUAL_MIN) continue;
    ratios[stop.kind === "hike" ? "hike" : "other"].push(actual / stop.durationMin);
  }
  return {
    hike: factor(ratios.hike, MIN_SAMPLES.hike),
    other: factor(ratios.other, MIN_SAMPLES.other),
    samples: { hike: ratios.hike.length, other: ratios.other.length },
  };
}

/** 学到的配速和估算不一样（要调整后面的时间） */
export const paceAdjusts = (pace: PersonalPace) => pace.hike !== 1 || pace.other !== 1;

/** 按配速调整停留时间（取整到 5 分钟） */
export function pacedMinutes(stop: { durationMin: number; kind: string }, pace: PersonalPace): number {
  const factor = stop.kind === "hike" ? pace.hike : pace.other;
  return factor === 1 ? stop.durationMin : Math.max(5, Math.round((stop.durationMin * factor) / 5) * 5);
}
