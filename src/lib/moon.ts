// 月亮：月相（亮了几成）和某个晚上什么时候在天上，看星空用。
// 位置按低精度的月球历表（平黄经加主要的周期项，误差约 1°，换算成升落时间差几分钟），月相按距上一次新月的天数算

const RAD = Math.PI / 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const J2000_MS = Date.UTC(2000, 0, 1, 12);
/** 朔望月（天） */
const SYNODIC = 29.530588853;
/** 2000 年 1 月 6 日 18:14（UTC）的新月 */
const NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
/** 月亮中心到这个高度算升起（考虑了大气折射、视差和月亮半径） */
const RISE_ALTITUDE = 0.133;
/** 一个晚上逐 10 分钟算一次高度 */
const STEP_MIN = 10;

/** 距上一次新月几天（0–29.5），和亮了多少（0–1） */
export function moonPhase(at: Date): { age: number; fraction: number } {
  const age = ((((at.getTime() - NEW_MOON_MS) / DAY_MS) % SYNODIC) + SYNODIC) % SYNODIC;
  return { age, fraction: (1 - Math.cos((2 * Math.PI * age) / SYNODIC)) / 2 };
}

/** 月亮的高度（度） */
function moonAltitude(at: Date, lat: number, lon: number): number {
  const d = (at.getTime() - J2000_MS) / DAY_MS;
  const meanLon = 218.316 + 13.176396 * d;
  const anomaly = (134.963 + 13.064993 * d) * RAD;
  const node = (93.272 + 13.22935 * d) * RAD;
  const eclLon = (meanLon + 6.289 * Math.sin(anomaly)) * RAD;
  const eclLat = 5.128 * Math.sin(node) * RAD;
  const tilt = 23.4397 * RAD;
  const ra = Math.atan2(
    Math.sin(eclLon) * Math.cos(tilt) - Math.tan(eclLat) * Math.sin(tilt),
    Math.cos(eclLon),
  );
  const dec = Math.asin(Math.sin(eclLat) * Math.cos(tilt) + Math.cos(eclLat) * Math.sin(tilt) * Math.sin(eclLon));
  const sidereal = (280.16 + 360.9856235 * d + lon) * RAD;
  const hourAngle = sidereal - ra;
  const phi = lat * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle)) / RAD;
}

/** "2026-10-05" 当地的第 minutes 分钟（可以超过 1440，算到第二天）是哪个时刻 */
function zonedInstant(date: string, minutes: number, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, 0, minutes);
  // 这个时刻在当地是几点，和想要的差多少就挪多少（时区偏移在一天内基本不变）
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(guess));
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const local = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"));
  return new Date(guess - (local - guess));
}

export interface MoonNight {
  /** 亮了几成（0–1） */
  fraction: number;
  /** 上半月（月亮越来越圆）还是下半月 */
  waxing: boolean;
  /** 当天下午到第二天中午之间月亮升起、落下的时刻（当天第几分钟，第二天的加 1440）；没有就是 null */
  rise: number | null;
  set: number | null;
  /** from–to 这段时间里，月亮在天上的分钟数 */
  upMin: number;
}

/**
 * date 这天晚上 from–to（当天第几分钟，可以超过 1440）月亮在不在天上、有多亮。
 * 升起、落下的时刻在当天 12:00 到第二天 12:00 之间找
 */
export function moonNight(date: string, from: number, to: number, lat: number, lon: number, timeZone: string): MoonNight {
  const start = zonedInstant(date, 12 * 60, timeZone).getTime();
  const altitudes: number[] = [];
  for (let m = 0; m <= 24 * 60; m += STEP_MIN) altitudes.push(moonAltitude(new Date(start + m * 60_000), lat, lon) - RISE_ALTITUDE);
  const at = (k: number) => 12 * 60 + k * STEP_MIN;
  let rise: number | null = null;
  let set: number | null = null;
  for (let k = 1; k < altitudes.length; k++) {
    const [a, b] = [altitudes[k - 1], altitudes[k]];
    if ((a < 0) === (b < 0)) continue;
    // 两次之间按线性插值找过地平线的时刻
    const crossing = at(k - 1) + (STEP_MIN * a) / (a - b);
    if (a < 0 && rise === null) rise = crossing;
    if (a >= 0 && set === null) set = crossing;
  }
  let upMin = 0;
  for (let k = 0; k < altitudes.length - 1; k++) {
    const minute = at(k);
    if (minute >= from && minute < to && altitudes[k] > 0) upMin += STEP_MIN;
  }
  const { age, fraction } = moonPhase(new Date(start + 12 * 60 * 60_000));
  return { fraction, waxing: age < SYNODIC / 2, rise, set, upMin: Math.min(upMin, Math.max(to - from, 0)) };
}
