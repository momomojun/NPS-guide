import "server-only";
import { selfUseScrape } from "../self-use";
import { googleFlightsScrape } from "./google-flights";
import { serpApiFlights } from "./serpapi";
import type { CarPriceProvider, FlightPriceProvider } from "./types";

/** 现在用哪个机票数据源：配了 SerpApi key 用 SerpApi，否则自用抓取；都没有就只给比价网站的链接 */
export function flightProvider(): FlightPriceProvider | null {
  if (process.env.SERPAPI_API_KEY) return serpApiFlights;
  if (selfUseScrape()) return googleFlightsScrape;
  return null;
}

/** 租车目前没有免费的价格接口（各家都要合作账号），先用手动整理的参考价（car-rates.ts）和链接；以后接上数据源在这里返回 */
export function carProvider(): CarPriceProvider | null {
  return null;
}
