const RAD = Math.PI / 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const J2000_MS = Date.UTC(2000, 0, 1, 12);

export type SunTimes =
  | { kind: "normal"; sunrise: Date; sunset: Date }
  | { kind: "polar-day" }
  | { kind: "polar-night" };

/**
 * 某地某天的日出日落（Wikipedia “Sunrise equation” 的算法，误差一两分钟）。
 * date 形如 "2026-10-05"，按当地日历日计算。
 */
export function sunTimes(date: string, lat: number, lon: number): SunTimes {
  const [year, month, day] = date.split("-").map(Number);
  const n = Math.round((Date.UTC(year, month - 1, day, 12) - J2000_MS) / DAY_MS);
  const meanNoon = n - lon / 360;
  const anomaly = (357.5291 + 0.98560028 * meanNoon) % 360;
  const center =
    1.9148 * Math.sin(anomaly * RAD) +
    0.02 * Math.sin(2 * anomaly * RAD) +
    0.0003 * Math.sin(3 * anomaly * RAD);
  const eclipticLon = (anomaly + center + 180 + 102.9372) % 360;
  const transit =
    2451545 + meanNoon + 0.0053 * Math.sin(anomaly * RAD) - 0.0069 * Math.sin(2 * eclipticLon * RAD);
  const sinDecl = Math.sin(eclipticLon * RAD) * Math.sin(23.4397 * RAD);
  const cosDecl = Math.cos(Math.asin(sinDecl));
  const cosHourAngle =
    (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sinDecl) / (Math.cos(lat * RAD) * cosDecl);

  if (cosHourAngle < -1) return { kind: "polar-day" };
  if (cosHourAngle > 1) return { kind: "polar-night" };

  const hourAngle = Math.acos(cosHourAngle) / RAD;
  const toDate = (julian: number) => new Date((julian - 2440587.5) * DAY_MS);
  return {
    kind: "normal",
    sunrise: toDate(transit - hourAngle / 360),
    sunset: toDate(transit + hourAngle / 360),
  };
}

/** 某个时刻在指定时区是当天的第几分钟 */
export function minutesOfDay(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return value("hour") * 60 + value("minute");
}

/** 当天第几分钟 → "07:05" */
export function formatClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
