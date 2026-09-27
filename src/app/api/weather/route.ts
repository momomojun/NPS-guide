import { getForecasts, getWeatherAlerts } from "@/lib/weather";
import type { WeatherResponse } from "@/lib/weather-types";

// 行程最多 14 天，每天一个地点
const MAX_POINTS = 16;

/** 行程每天所在地点的天气预报和预警：GET ?points=44.46,-110.83|44.73,-110.49 */
export async function GET(request: Request) {
  const points = (new URL(request.url).searchParams.get("points") ?? "")
    .split("|")
    .map((pair) => pair.split(",").map(Number))
    .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180)
    .slice(0, MAX_POINTS)
    .map(([lat, lon]) => ({ lat, lon }));
  if (points.length === 0) return Response.json({ forecasts: [], alerts: [] } satisfies WeatherResponse);

  const [forecasts, alerts] = await Promise.all([
    getForecasts(points).catch(() => points.map(() => null)),
    Promise.all(points.map((point) => getWeatherAlerts(point).catch(() => []))),
  ]);
  return Response.json({ forecasts, alerts } satisfies WeatherResponse);
}
