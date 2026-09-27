import "server-only";
import { selfUseScrape } from "../self-use";
import { fuelPricesDate, gasSnapshot, TRIP_STATES, type StateFuel } from "./fuel";

// 实时油价：自用阶段读 AAA 的各州均价页面（每 12 小时一次）；关掉或读不到时用 fuel.ts 里的快照
const AAA = "https://gasprices.aaa.com/state-gas-price-averages/";
const REVALIDATE = 12 * 60 * 60;
const ROW =
  /state=([A-Z]{2})"[^>]*>[^<]*<\/a>\s*<\/td>\s*<td class="regular"[^>]*>\s*\$([\d.]+)\s*<\/td>\s*<td class="mid_grade"[^>]*>\s*\$([\d.]+)\s*<\/td>\s*<td class="premium"[^>]*>\s*\$([\d.]+)\s*<\/td>\s*<td class="diesel"[^>]*>\s*\$([\d.]+)/g;

export interface GasPrices {
  /** 州代码 → 四种油价 */
  states: Record<string, StateFuel>;
  /** 全国普通汽油均价 */
  national?: number;
  /** 价格日期，形如 "2026-09-26" */
  date: string;
  /** 是不是刚从 AAA 读到的（否则是快照） */
  live: boolean;
}

const round2 = (value: string) => Math.round(Number(value) * 100) / 100;

async function fetchAaa(): Promise<GasPrices | null> {
  const res = await fetch(AAA, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const states: Record<string, StateFuel> = {};
  for (const m of html.matchAll(ROW)) {
    if (!TRIP_STATES.includes(m[1])) continue;
    states[m[1]] = { regular: round2(m[2]), midGrade: round2(m[3]), premium: round2(m[4]), diesel: round2(m[5]) };
  }
  if (Object.keys(states).length < TRIP_STATES.length / 2) return null;
  // “Price as of 9/26/26”
  const asOf = html.match(/Price as of\s*(\d{1,2})\/(\d{1,2})\/(\d{2})/);
  const date = asOf ? `20${asOf[3]}-${asOf[1].padStart(2, "0")}-${asOf[2].padStart(2, "0")}` : new Date().toISOString().slice(0, 10);
  const national = html.match(/National Average\s*\$([\d.]+)/);
  return { states, national: national ? round2(national[1]) : undefined, date, live: true };
}

export async function getGasPrices(): Promise<GasPrices> {
  if (selfUseScrape()) {
    const live = await fetchAaa().catch(() => null);
    if (live) return { ...live, states: { ...gasSnapshot, ...live.states } };
  }
  return { states: gasSnapshot, date: fuelPricesDate, live: false };
}
