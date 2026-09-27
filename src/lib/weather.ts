import "server-only";
import { fetchJson } from "./fetch-json";
import type { DailyWeather, WeatherAlert } from "./weather-types";

// 天气预报：Open-Meteo（免费、不要 key，最多 16 天，CC BY 4.0）；
// 天气预警：美国国家气象局 NWS（api.weather.gov，要带 User-Agent）
const FORECAST = "https://api.open-meteo.com/v1/forecast";
const NWS_ALERTS = "https://api.weather.gov/alerts/active";
const USER_AGENT = "nps-guide/0.1 (personal trip planner; https://github.com/momomojun/NPS-guide)";

interface OpenMeteoDaily {
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    snowfall_sum: number[];
    wind_speed_10m_max: number[];
  };
}

/** 几个地点未来 16 天的逐日预报，和传进来的顺序一致；查不到的是 null */
export async function getForecasts(points: { lat: number; lon: number }[]): Promise<(DailyWeather[] | null)[]> {
  if (points.length === 0) return [];
  const params = new URLSearchParams({
    latitude: points.map((p) => p.lat.toFixed(3)).join(","),
    longitude: points.map((p) => p.lon.toFixed(3)).join(","),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,snowfall_sum,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "16",
  });
  // 一个地点返回对象，几个地点返回数组
  const data = await fetchJson<OpenMeteoDaily | OpenMeteoDaily[]>(`${FORECAST}?${params}`, { revalidate: 60 * 60 });
  const list = Array.isArray(data) ? data : [data];
  return points.map((_, i) => {
    const daily = list[i]?.daily;
    if (!daily) return null;
    return daily.time.map((date, k) => ({
      date,
      code: daily.weather_code[k],
      high: Math.round(daily.temperature_2m_max[k]),
      low: Math.round(daily.temperature_2m_min[k]),
      rainChance: daily.precipitation_probability_max[k],
      snowCm: Math.round((daily.snowfall_sum[k] ?? 0) * 10) / 10,
      windKmh: Math.round(daily.wind_speed_10m_max[k]),
    }));
  });
}

interface NwsAlerts {
  features?: {
    properties: {
      event: string;
      headline: string | null;
      severity: string;
      onset: string | null;
      ends: string | null;
      expires: string | null;
    };
  }[];
}

/** 这个地点现在生效的天气预警（高温、雷暴、冬季风暴、山火烟雾……） */
export async function getWeatherAlerts(point: { lat: number; lon: number }): Promise<WeatherAlert[]> {
  const url = `${NWS_ALERTS}?point=${point.lat.toFixed(4)},${point.lon.toFixed(4)}`;
  const data = await fetchJson<NwsAlerts>(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
    revalidate: 30 * 60,
  });
  return (data.features ?? []).map(({ properties }) => ({
    event: properties.event,
    headline: properties.headline ?? properties.event,
    severity: properties.severity,
    onset: properties.onset,
    ends: properties.ends ?? properties.expires,
  }));
}
