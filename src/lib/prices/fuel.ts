// 油价、电价：预算和价格页用。
// 汽油是 AAA 各州均价（https://gasprices.aaa.com/state-gas-price-averages/），美元 / 加仑。
// 下面是 2026-09-26 的快照：价格页和预算优先用实时的（gas.ts，自用阶段每 12 小时读一次），读不到时用这份
export const fuelPricesDate = "2026-09-26";

export type FuelGrade = "regular" | "midGrade" | "premium" | "diesel";
export type StateFuel = Record<FuelGrade, number>;

export const gasSnapshot: Record<string, StateFuel> = {
  AK: { regular: 5.06, midGrade: 5.27, premium: 5.5, diesel: 6.68 },
  AZ: { regular: 4.83, midGrade: 5.18, premium: 5.52, diesel: 6.4 },
  CA: { regular: 6.34, midGrade: 6.55, premium: 6.75, diesel: 8.43 },
  ID: { regular: 5.0, midGrade: 5.32, premium: 5.58, diesel: 6.63 },
  MT: { regular: 4.6, midGrade: 4.94, premium: 5.3, diesel: 6.29 },
  NV: { regular: 5.45, midGrade: 5.73, premium: 6.03, diesel: 6.83 },
  OR: { regular: 5.08, midGrade: 5.34, premium: 5.63, diesel: 6.87 },
  UT: { regular: 4.96, midGrade: 5.26, premium: 5.5, diesel: 6.58 },
  WA: { regular: 5.54, midGrade: 5.81, premium: 6.06, diesel: 7.46 },
  WY: { regular: 4.55, midGrade: 4.86, premium: 5.17, diesel: 6.24 },
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
};

/** 价格页列出的州：公园所在的州，加上常见出发地内华达（拉斯维加斯）、爱达荷和蒙大拿（黄石西门、北门） */
export const TRIP_STATES = ["CA", "NV", "UT", "AZ", "OR", "WA", "WY", "ID", "MT", "AK"];

/** 租来的中型 SUV / 轿车，每加仑大约跑多少英里 */
export const MILES_PER_GALLON = 25;
/** 电动车每度电大约跑多少英里（山路、开空调会少一些） */
export const MILES_PER_KWH = 3.3;
/** 公共快充（Tesla 超充等）每度电的大概价格，美元 */
export const DC_FAST_PRICE = 0.48;
