import type { TripItem } from "./trip-store";

// 个人配速：按“今天”模式里的打卡（到了、走了）看这个人在景点实际停了多久，是估算的几倍。
// 徒步和其他景点分开算（走得快慢和拍照、逛的时间是两回事），各取中位数，忘了点“走了”这种偶尔的离谱数字影响不大。
// 开车也一样：前一站点了“走了”、下一站点了“到了”，中间就是实际开过去（含停车、走到景点）的时间，和估算的车程比。

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
/** 开车：估算不到这么久的一段不算（短的路停车、找车位占大头），至少这么多段才算，倍数的范围 */
const MIN_PLANNED_DRIVE_MIN = 15;
const MIN_DRIVE_SAMPLES = 3;
const MIN_DRIVE = 0.7;
const MAX_DRIVE = 1.6;
/** 实际比估算多出这么多倍的一段，多半是中间去吃饭、加油了，不算 */
const MAX_DRIVE_RATIO = 2.5;

export interface PersonalPace {
  /** 徒步实际时间是估算的几倍（没学到是 1） */
  hike: number;
  /** 其他景点 */
  other: number;
  /** 开车实际时间是估算车程的几倍 */
  drive: number;
  /** 各用了几站（开车是几段） */
  samples: { hike: number; other: number; drive: number };
}

export const NEUTRAL_PACE: PersonalPace = { hike: 1, other: 1, drive: 1, samples: { hike: 0, other: 0, drive: 0 } };

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function factor(ratios: number[], min: number, low = MIN_FACTOR, high = MAX_FACTOR): number {
  if (ratios.length < min) return 1;
  const value = Math.min(Math.max(median(ratios), low), high);
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
    if (item.status !== "done" || item.arrivedAt === undefined || item.leftAt === undefined) continue;
    if (!stop || stop.durationMin < MIN_PLANNED_MIN) continue;
    const actual = (item.leftAt - item.arrivedAt) / 60_000;
    if (actual < MIN_ACTUAL_MIN) continue;
    ratios[stop.kind === "hike" ? "hike" : "other"].push(actual / stop.durationMin);
  }
  return {
    hike: factor(ratios.hike, MIN_SAMPLES.hike),
    other: factor(ratios.other, MIN_SAMPLES.other),
    drive: 1,
    samples: { hike: ratios.hike.length, other: ratios.other.length, drive: 0 },
  };
}

/**
 * 从打卡学开车：同一天里按到达的先后，前一站有“走了”、后一站有“到了”的每一段，实际用时和估算车程（legOf）比。
 * 坐班车的段不算（等车的时间说不准），没打卡跳过的景点不算一站
 */
export function learnDrive(
  days: TripItem[][],
  legOf: (from: string, to: string, day: number) => { minutes: number; shuttle: boolean } | null,
): { drive: number; samples: number } {
  const ratios: number[] = [];
  days.forEach((day, d) => {
    const visited = day
      .filter((item) => item.arrivedAt !== undefined || item.leftAt !== undefined)
      .sort((a, b) => (a.arrivedAt ?? a.leftAt!) - (b.arrivedAt ?? b.leftAt!));
    for (let k = 1; k < visited.length; k++) {
      const [from, to] = [visited[k - 1], visited[k]];
      if (from.leftAt === undefined || to.arrivedAt === undefined) continue;
      const leg = legOf(from.id, to.id, d);
      if (!leg || leg.shuttle || leg.minutes < MIN_PLANNED_DRIVE_MIN) continue;
      const ratio = (to.arrivedAt - from.leftAt) / 60_000 / leg.minutes;
      if (ratio > 0 && ratio <= MAX_DRIVE_RATIO) ratios.push(ratio);
    }
  });
  return { drive: factor(ratios, MIN_DRIVE_SAMPLES, MIN_DRIVE, MAX_DRIVE), samples: ratios.length };
}

/** 学到的配速和估算不一样（要调整后面的时间） */
export const paceAdjusts = (pace: PersonalPace) => pace.hike !== 1 || pace.other !== 1 || pace.drive !== 1;

/** 按配速调整停留时间（取整到 5 分钟） */
export function pacedMinutes(stop: { durationMin: number; kind: string }, pace: PersonalPace): number {
  const factor = stop.kind === "hike" ? pace.hike : pace.other;
  return factor === 1 ? stop.durationMin : Math.max(5, Math.round((stop.durationMin * factor) / 5) * 5);
}
