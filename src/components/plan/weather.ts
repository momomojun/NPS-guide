import type { MonthClimate } from "@/data/climate.generated";
import type { DailyWeather, WeatherAlert } from "@/lib/weather-types";

/** 某一天的天气：16 天内有预报，更远或者只定了月份时用往年同期 */
export type DayWeather =
  | { kind: "forecast"; day: DailyWeather; alerts: WeatherAlert[] }
  | { kind: "climate"; month: number; climate: MonthClimate };

export type Condition = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "showers" | "snow" | "thunder";

/** WMO 天气代码归成几类 */
export function conditionOf(code: number): Condition {
  if (code === 0) return "clear";
  if (code <= 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code >= 95) return "thunder";
  return "cloudy";
}

export type WeatherWarning = "heat" | "thunder" | "snow" | "freeze" | "wind" | "rain";

/** 预报里要提醒的：高温（≥ 38°C）、雷暴、降雪、严寒（≤ −8°C）、大风、很可能下雨 */
export function forecastWarnings(day: DailyWeather): WeatherWarning[] {
  const warnings: WeatherWarning[] = [];
  if (day.high >= 38) warnings.push("heat");
  if (conditionOf(day.code) === "thunder") warnings.push("thunder");
  if (day.snowCm >= 1) warnings.push("snow");
  if (day.low <= -8) warnings.push("freeze");
  if (day.windKmh >= 55) warnings.push("wind");
  if ((day.rainChance ?? 0) >= 70 && !warnings.includes("thunder") && !warnings.includes("snow")) warnings.push("rain");
  return warnings;
}

export type ClimateWarning = "heat" | "snow" | "freeze" | "rain";

/** 往年同期要提醒的：常高温、常下雪、很冷、雨多 */
export function climateWarnings(month: MonthClimate): ClimateWarning[] {
  const warnings: ClimateWarning[] = [];
  if (month.high >= 38) warnings.push("heat");
  if (month.snowDays >= 4) warnings.push("snow");
  if (month.low <= -8) warnings.push("freeze");
  if (month.wetDays >= 12) warnings.push("rain");
  return warnings;
}

export const fahrenheit = (celsius: number) => Math.round((celsius * 9) / 5 + 32);

/** 预警在这一天（当地日期）有没有效：开始得比这天晚、或者这天之前就结束了的不算；没写结束时间的只算今明两天 */
export function alertCovers(alert: WeatherAlert, date: string, today: string): boolean {
  const start = alert.onset?.slice(0, 10) ?? today;
  const end = alert.ends?.slice(0, 10);
  if (start > date) return false;
  if (end) return end >= date;
  const tomorrow = new Date(`${today}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return date <= tomorrow.toISOString().slice(0, 10);
}
