import { parkFees } from "@/data/fees.generated";
import { perDiem, perDiemYear } from "@/data/perdiem.generated";
import { carRates, DEFAULT_CAR_RATE } from "@/lib/prices/car-rates";
import { DC_FAST_PRICE, gasPrice, MILES_PER_GALLON, MILES_PER_KWH, parkState } from "@/lib/prices/fuel";
import type { TripPrefs } from "@/lib/trip-prefs";

// 预算粗算：门票（逐个买还是买年卡）、住宿和吃饭（GSA 标准）、油 / 电、租车、机票

export const KM_PER_MILE = 1.609;
/** 2026 年起的年卡价格 */
export const RESIDENT_PASS = 80;
export const NONRESIDENT_PASS = 250;
/** 非居民在 11 个热门公园每人另收 */
export const SURCHARGE = 100;
/** 一晚住处都没有参考价时按这个估 */
const FALLBACK_LODGING = 150;
/** GSA 的全国标准餐饮费（不在列表里的地方） */
const FALLBACK_MEALS = 68;

export interface BudgetNight {
  /** 推荐住宿的 id；自定义住处没有 */
  lodgingId?: string;
  /** 这晚所在月份（1–12） */
  month: number;
}

export interface BudgetInput {
  prefs: TripPrefs;
  /** 行程里有景点的公园 */
  parks: { code: string; nonresidentSurcharge: boolean }[];
  /** 要住的每一晚（不含出发地和终点） */
  nights: BudgetNight[];
  dayCount: number;
  /** 全程开车公里数 */
  km: number;
  /** 租车天数和取车机场（坐飞机来才有） */
  rentalDays: number;
  pickup?: string;
  /** 查到的机票最低价（所有人、整趟），没查就是 undefined */
  flights?: number;
  /** 各州普通汽油价格（实时的），没有就用快照 */
  gas?: Record<string, number>;
}

export interface Budget {
  fees: {
    total: number;
    pay: number;
    pass: number;
    passKind: "resident" | "nonresident";
    usePass: boolean;
    /** 收附加费的公园个数 */
    surchargeParks: number;
    /** 不收门票的公园 */
    freeParks: string[];
  };
  lodging: { total: number; nights: number; guessed: number; year: number };
  meals: { total: number; rate: number };
  fuel: { total: number; km: number; price: number; states: string[] };
  car?: { total: number; rate: number; guessed: boolean };
  flights?: number;
  total: number;
  perPerson: number;
  /** 机票还没查（坐飞机来时） */
  missingFlights: boolean;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const average = (values: number[], fallback: number) => (values.length ? sum(values) / values.length : fallback);

export function computeBudget(input: BudgetInput): Budget {
  const { prefs } = input;
  const travelers = Math.max(prefs.travelers, 1);
  const nonresidents = Math.min(prefs.nonresidents, travelers);

  // 门票：逐个公园买（自驾一车一张；只按人收的公园按人数），加上非居民附加费；
  // 年卡：同车有美国居民就买居民年卡（$80），全是非居民就买非居民年卡（$250），全车门票和附加费都免
  let pay = 0;
  let surchargeParks = 0;
  const freeParks: string[] = [];
  for (const park of input.parks) {
    const fee = parkFees[park.code];
    const entry = fee ? (fee.vehicle > 0 ? fee.vehicle : (fee.perPerson ?? 0) * travelers) : 0;
    if (entry === 0) freeParks.push(park.code);
    pay += entry;
    if (park.nonresidentSurcharge && nonresidents > 0) {
      pay += nonresidents * SURCHARGE;
      surchargeParks++;
    }
  }
  const passKind = nonresidents < travelers ? "resident" : "nonresident";
  const pass = passKind === "resident" ? RESIDENT_PASS : NONRESIDENT_PASS;
  const usePass = pass < pay;

  // 住宿：GSA 这个月的住宿标准 × 房间数；没有参考价的晚上按其他几晚的平均
  const rates = input.nights.map((night) => (night.lodgingId ? perDiem[night.lodgingId]?.lodging[night.month - 1] : undefined));
  const known = rates.filter((rate): rate is number => rate !== undefined);
  const fallback = average(known, FALLBACK_LODGING);
  const rooms = Math.max(prefs.rooms, 1);
  const lodgingTotal = sum(rates.map((rate) => (rate ?? fallback) * rooms));

  // 吃饭：GSA 餐饮标准（M&IE）× 人数 × 天数
  const mealRates = input.nights
    .map((night) => (night.lodgingId ? perDiem[night.lodgingId]?.meals : undefined))
    .filter((rate): rate is number => rate !== undefined);
  const mealRate = Math.round(average(mealRates, FALLBACK_MEALS));

  // 油 / 电
  const states = [...new Set(input.parks.map((park) => parkState[park.code]).filter(Boolean))];
  const miles = input.km / KM_PER_MILE;
  const gas = average(
    states.map((state) => input.gas?.[state] ?? gasPrice[state]).filter((price): price is number => price !== undefined),
    5,
  );
  const fuelPrice = prefs.vehicle === "ev" ? DC_FAST_PRICE : gas;
  const fuelTotal = prefs.vehicle === "ev" ? (miles / MILES_PER_KWH) * DC_FAST_PRICE : (miles / MILES_PER_GALLON) * gas;

  const carRate = input.pickup ? carRates[input.pickup]?.car : undefined;
  const car =
    prefs.flyAndRent && input.rentalDays > 0
      ? {
          total: input.rentalDays * (carRate ?? DEFAULT_CAR_RATE),
          rate: carRate ?? DEFAULT_CAR_RATE,
          guessed: carRate === undefined,
        }
      : undefined;
  const flights = prefs.flyAndRent ? input.flights : undefined;

  const feesTotal = usePass ? pass : pay;
  const mealsTotal = mealRate * travelers * input.dayCount;
  const total = feesTotal + lodgingTotal + mealsTotal + fuelTotal + (car?.total ?? 0) + (flights ?? 0);
  return {
    fees: { total: feesTotal, pay, pass, passKind, usePass, surchargeParks, freeParks },
    lodging: { total: lodgingTotal, nights: input.nights.length, guessed: rates.length - known.length, year: perDiemYear },
    meals: { total: mealsTotal, rate: mealRate },
    fuel: { total: fuelTotal, km: input.km, price: fuelPrice, states },
    car,
    flights,
    total,
    perPerson: total / travelers,
    missingFlights: prefs.flyAndRent && flights === undefined,
  };
}
