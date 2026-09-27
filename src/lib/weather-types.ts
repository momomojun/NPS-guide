// 天气接口（/api/weather）返回的数据，浏览器和服务端共用

export interface DailyWeather {
  /** "2026-10-10"（当地日期） */
  date: string;
  /** WMO 天气代码 */
  code: number;
  high: number;
  low: number;
  /** 当天最大降水概率（%） */
  rainChance: number | null;
  /** 当天降雪（厘米） */
  snowCm: number;
  /** 最大风速（公里 / 小时） */
  windKmh: number;
}

export interface WeatherAlert {
  /** NWS 预警类型，比如 "Winter Storm Warning" */
  event: string;
  headline: string;
  severity: string;
  onset: string | null;
  ends: string | null;
}

export interface WeatherResponse {
  /** 和请求的地点一一对应，查不到的是 null */
  forecasts: (DailyWeather[] | null)[];
  alerts: WeatherAlert[][];
}
