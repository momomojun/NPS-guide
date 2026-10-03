import { CAD_TO_USD } from "@/data/fees-manual";

// 油价、电价：预算和价格页用。
// 汽油是 AAA 各州均价（https://gasprices.aaa.com/state-gas-price-averages/），美元 / 加仑。
// 下面是 2026-09-26 的快照（科罗拉多是 09-28，新墨西哥是 10-01）：价格页和预算优先用实时的（gas.ts，自用阶段每 12 小时读一次），读不到时用这份。
// 加拿大的艾伯塔、不列颠哥伦比亚 AAA 没有，用 finder.com 2026-09-22 的省均价（加元 / 升）换算成美元 / 加仑，只有普通汽油。
export const fuelPricesDate = "2026-09-26";

export type FuelGrade = "regular" | "midGrade" | "premium" | "diesel";
/** 普通汽油一定有；加拿大的省份只有普通汽油 */
export type StateFuel = { regular: number } & Partial<Record<Exclude<FuelGrade, "regular">, number>>;

const LITERS_PER_GALLON = 3.78541;
/** 加元 / 升 → 美元 / 加仑（汇率见 data/fees-manual.ts） */
const canadian = (cadPerLiter: number): StateFuel => ({ regular: Math.round(cadPerLiter * LITERS_PER_GALLON * CAD_TO_USD * 100) / 100 });

export const gasSnapshot: Record<string, StateFuel> = {
  AK: { regular: 5.06, midGrade: 5.27, premium: 5.5, diesel: 6.68 },
  CO: { regular: 4.2, midGrade: 4.58, premium: 4.91, diesel: 6.1 },
  AZ: { regular: 4.83, midGrade: 5.18, premium: 5.52, diesel: 6.4 },
  CA: { regular: 6.34, midGrade: 6.55, premium: 6.75, diesel: 8.43 },
  ID: { regular: 5.0, midGrade: 5.32, premium: 5.58, diesel: 6.63 },
  MT: { regular: 4.6, midGrade: 4.94, premium: 5.3, diesel: 6.29 },
  NV: { regular: 5.45, midGrade: 5.73, premium: 6.03, diesel: 6.83 },
  OR: { regular: 5.08, midGrade: 5.34, premium: 5.63, diesel: 6.87 },
  UT: { regular: 4.96, midGrade: 5.26, premium: 5.5, diesel: 6.58 },
  WA: { regular: 5.54, midGrade: 5.81, premium: 6.06, diesel: 7.46 },
  WY: { regular: 4.55, midGrade: 4.86, premium: 5.17, diesel: 6.24 },
  NM: { regular: 4.42, midGrade: 4.85, premium: 5.17, diesel: 6.11 },
  AB: canadian(1.77),
  BC: canadian(1.99),
};

/** 普通汽油（预算默认用这个） */
export const gasPrice: Record<string, number> = Object.fromEntries(
  Object.entries(gasSnapshot).map(([state, fuel]) => [state, fuel.regular]),
);

/** 公园在哪个州加油（跨州的公园按主要入口所在的州） */
export const parkState: Record<string, string> = {
  yose: "CA",
  seki: "CA",
  chis: "CA",
  redw: "CA",
  lavo: "CA",
  crla: "OR",
  mora: "WA",
  olym: "WA",
  noca: "WA",
  yell: "WY",
  grte: "WY",
  deva: "CA",
  zion: "UT",
  brca: "UT",
  grca: "AZ",
  dena: "AK",
  arch: "UT",
  cany: "UT",
  care: "UT",
  jotr: "CA",
  glac: "MT",
  romo: "CO",
  kefj: "AK",
  wrst: "AK",
  banf: "AB",
  jasp: "AB",
  yoho: "BC",
  ante: "AZ",
  hsbd: "AZ",
  mova: "UT",
  wave: "UT",
  whsa: "NM",
  cave: "NM",
  meve: "CO",
  pefo: "AZ",
  grsa: "CO",
  blca: "CO",
};

/** 价格页列出的州：公园所在的州，加上常见出发地内华达（拉斯维加斯）、爱达荷（黄石西门）；最后是加拿大的两个省 */
export const TRIP_STATES = ["CA", "NV", "UT", "AZ", "NM", "CO", "OR", "WA", "WY", "ID", "MT", "AK", "AB", "BC"];

/** 租来的中型 SUV / 轿车，每加仑大约跑多少英里 */
export const MILES_PER_GALLON = 25;
/** 电动车每度电大约跑多少英里（山路、开空调会少一些） */
export const MILES_PER_KWH = 3.3;
/** 公共快充（Tesla 超充等）每度电的大概价格，美元 */
export const DC_FAST_PRICE = 0.48;
