import "server-only";
import { fetchJson } from "../fetch-json";
import { tripTypeOf, type FlightPriceProvider, type FlightQuote, type FlightResult } from "./types";

// SerpApi 的 Google Flights 接口：免费账号每月 250 次、每小时 50 次（https://serpapi.com），
// key 放在 .env.local 的 SERPAPI_API_KEY；同一个查询缓存 6 小时，省额度。公开上线后用这个（或别的付费 / 合作接口）
const BASE = "https://serpapi.com/search.json";
const REVALIDATE = 6 * 60 * 60;
const MAX_QUOTES = 3;
const TYPE = { roundTrip: "1", oneWay: "2", multiCity: "3" } as const;

interface SerpSegment {
  airline?: string;
  departure_airport?: { time?: string };
  arrival_airport?: { time?: string };
}

interface SerpOption {
  price?: number;
  total_duration?: number;
  flights?: SerpSegment[];
}

interface SerpFlights {
  best_flights?: SerpOption[];
  other_flights?: SerpOption[];
  price_insights?: { price_level?: string; typical_price_range?: [number, number] };
  error?: string;
}

function toQuote(option: SerpOption): FlightQuote | null {
  if (typeof option.price !== "number" || !option.flights?.length) return null;
  return {
    price: option.price,
    airlines: [...new Set(option.flights.map((segment) => segment.airline).filter((name): name is string => Boolean(name)))],
    stops: option.flights.length - 1,
    durationMin: option.total_duration ?? 0,
    departTime: option.flights[0].departure_airport?.time,
    arriveTime: option.flights.at(-1)?.arrival_airport?.time,
  };
}

export const serpApiFlights: FlightPriceProvider = {
  name: "Google Flights（SerpApi）",
  async search(query): Promise<FlightResult | null> {
    const key = process.env.SERPAPI_API_KEY;
    if (!key) return null;
    const type = tripTypeOf(query);
    const [out, back] = query.legs;
    const params = new URLSearchParams({
      engine: "google_flights",
      type: TYPE[type],
      adults: String(query.adults),
      currency: "USD",
      hl: "en",
      gl: "us",
      api_key: key,
    });
    if (type === "multiCity") {
      params.set(
        "multi_city_json",
        JSON.stringify(query.legs.map((leg) => ({ departure_id: leg.from, arrival_id: leg.to, date: leg.date }))),
      );
    } else {
      params.set("departure_id", out.from);
      params.set("arrival_id", out.to);
      params.set("outbound_date", out.date);
      if (type === "roundTrip") params.set("return_date", back.date);
    }
    const data = await fetchJson<SerpFlights>(`${BASE}?${params}`, { revalidate: REVALIDATE });
    if (data.error) return null;
    const quotes = [...(data.best_flights ?? []), ...(data.other_flights ?? [])]
      .map(toQuote)
      .filter((quote): quote is FlightQuote => quote !== null)
      .sort((a, b) => a.price - b.price)
      .slice(0, MAX_QUOTES);
    return {
      query,
      quotes,
      priceLevel: data.price_insights?.price_level,
      typicalRange: data.price_insights?.typical_price_range,
      source: this.name,
      fetchedAt: new Date().toISOString(),
    };
  },
};
