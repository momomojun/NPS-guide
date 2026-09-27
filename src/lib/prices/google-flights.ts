import "server-only";
import { googleFlightsUrl } from "./google-tfs";
import type { FlightPriceProvider, FlightQuery, FlightQuote, FlightResult } from "./types";

// 自用阶段的机票价格：像开源项目 fast-flights 那样，直接请求 Google Flights 的结果页，
// 从页面里内嵌的数据（AF_initDataCallback 'ds:1'）读出价格。只在用户点“查价格”时才查，
// 同一个查询缓存 6 小时、两次请求至少隔 3 秒；页面结构一变或者被拦（验证码、同意页）就返回 null，页面退回只给链接。
// 公开上线前换成 SerpApi 等正式接口（见 index.ts）。
const CACHE_MS = 6 * 60 * 60 * 1000;
const GAP_MS = 3000;
const MAX_QUOTES = 3;
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

const cache = new Map<string, { expires: number; value: Promise<FlightResult | null> }>();
let queue: Promise<unknown> = Promise.resolve();

/** 一个接一个地请求，中间隔几秒 */
function politely<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => new Promise((resolve) => setTimeout(resolve, GAP_MS)),
    () => new Promise((resolve) => setTimeout(resolve, GAP_MS)),
  );
  return run;
}

/** 取出 key 为 ds:1 的 AF_initDataCallback 里的 data 数组 */
function embeddedData(html: string): unknown[] | null {
  const key = html.indexOf("key: 'ds:1'");
  if (key < 0) return null;
  const start = html.indexOf("data:", key);
  const end = html.indexOf(", sideChannel: {}});</script>", start);
  if (start < 0 || end < 0) return null;
  try {
    const data: unknown = JSON.parse(html.slice(start + 5, end));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

type Json = unknown;
const at = (value: Json, ...path: number[]): Json =>
  path.reduce<Json>((node, i) => (Array.isArray(node) ? node[i] : undefined), value);

/** [2026,10,10] 和 [17,1] → "2026-10-10 17:01"；整点时分钟会省掉 */
function stamp(date: Json, time: Json): string | undefined {
  if (!Array.isArray(date) || date.length < 3) return undefined;
  const pad = (n: unknown) => String(typeof n === "number" ? n : 0).padStart(2, "0");
  const day = `${date[0]}-${pad(date[1])}-${pad(date[2])}`;
  return Array.isArray(time) ? `${day} ${pad(time[0])}:${pad(time[1])}` : day;
}

function toQuote(option: Json): FlightQuote | null {
  const price = at(option, 1, 0, 1);
  const itinerary = at(option, 0);
  const segments = at(itinerary, 2);
  if (typeof price !== "number" || !Array.isArray(segments) || segments.length === 0) return null;
  const airlines = at(itinerary, 1);
  const duration = at(itinerary, 9);
  return {
    price,
    airlines: Array.isArray(airlines) ? airlines.filter((name): name is string => typeof name === "string") : [],
    stops: segments.length - 1,
    durationMin: typeof duration === "number" ? duration : 0,
    departTime: stamp(at(itinerary, 4), at(itinerary, 5)),
    arriveTime: stamp(at(itinerary, 7), at(itinerary, 8)),
  };
}

function parse(query: FlightQuery, html: string, source: string): FlightResult | null {
  const data = embeddedData(html);
  if (!data) return null;
  // data[2] 是“最佳航班”，data[3] 是其他航班；每个的 [1][0][1] 是整趟总价
  const options = [at(data, 2, 0), at(data, 3, 0)].flatMap((list) => (Array.isArray(list) ? list : []));
  const seen = new Set<string>();
  const quotes = options
    .map(toQuote)
    .filter((quote): quote is FlightQuote => quote !== null)
    .sort((a, b) => a.price - b.price)
    .filter((quote) => {
      const key = `${quote.price}|${quote.airlines.join()}|${quote.departTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_QUOTES);
  if (quotes.length === 0) return null;
  // data[5] 是价格走势：[4][1]、[5][1] 是这条航线通常的价格区间
  const low = at(data, 5, 4, 1);
  const high = at(data, 5, 5, 1);
  const typicalRange: [number, number] | undefined =
    typeof low === "number" && typeof high === "number" && low < high ? [low, high] : undefined;
  const cheapest = quotes[0].price;
  const priceLevel = typicalRange
    ? cheapest < typicalRange[0]
      ? "low"
      : cheapest > typicalRange[1]
        ? "high"
        : "typical"
    : undefined;
  return { query, quotes, priceLevel, typicalRange, source, fetchedAt: new Date().toISOString() };
}

export const googleFlightsScrape: FlightPriceProvider = {
  name: "Google Flights",
  search(query) {
    const url = googleFlightsUrl(query, "en");
    const now = Date.now();
    const hit = cache.get(url);
    if (hit && hit.expires > now) return hit.value;
    const attempt = async () => {
      const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
      if (!res.ok) {
        console.warn(`[flights] Google Flights HTTP ${res.status}`);
        return null;
      }
      const html = await res.text();
      const result = parse(query, html, this.name);
      if (!result) console.warn(`[flights] 没解析出价格（页面 ${html.length} 字节）`);
      return result;
    };
    // Google 偶尔会回一个没有结果数据的页面，隔几秒再试一次
    const value = politely(async () => {
      const first = await attempt().catch(() => null);
      if (first) return first;
      await new Promise((resolve) => setTimeout(resolve, GAP_MS));
      return attempt().catch(() => null);
    });
    cache.set(url, { expires: now + CACHE_MS, value });
    // 查失败的不缓存，下次再试
    value.then(
      (result) => {
        if (!result && cache.get(url)?.value === value) cache.delete(url);
      },
      () => {
        if (cache.get(url)?.value === value) cache.delete(url);
      },
    );
    return value;
  },
};
