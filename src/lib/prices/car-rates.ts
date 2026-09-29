// 租车参考价：2026-09-26 在 Kayak 上查 10 月 9–17 日（8 天）机场取还的价格，按天折算（美元，含税，不含保险）。
// car 是最便宜 5 辆轿车（经济型到全尺寸）的中位数，suv 是页面上最便宜的 SUV。
// 淡旺季差很多（夏天常贵一倍），异地还车另算，只当参考；实际价格点比价链接看。
// 西黄石（WYS）是季节性机场，10 月基本没车，没有参考价。
// 新加公园的机场（摩押、大章克申、丹佛、佩吉、卡尔加里、埃德蒙顿、温哥华、棕榈泉）是 2026-09-28 查的同一段日期；
// 安大略（ONT）、橙县（SNA）和冰川附近的 FCA、MSO、GTF 还没查，按默认价估。
export const carRatesDate = "2026-09-26";
export const carRatesSource = "Kayak";

export interface CarRate {
  /** 轿车，美元 / 天 */
  car: number;
  /** SUV，美元 / 天；没查到就没有 */
  suv?: number;
}

export const carRates: Record<string, CarRate> = {
  SFO: { car: 39, suv: 37 },
  OAK: { car: 31, suv: 36 },
  SJC: { car: 34, suv: 36 },
  FAT: { car: 39, suv: 42 },
  // 洛杉矶最便宜的几家是机场外要坐接驳车的小公司，大牌一般贵不少
  LAX: { car: 11, suv: 15 },
  BUR: { car: 41, suv: 43 },
  SBA: { car: 58, suv: 56 },
  ACV: { car: 40, suv: 62 },
  CEC: { car: 40, suv: 57 },
  MFR: { car: 46, suv: 46 },
  RDD: { car: 59 },
  SMF: { car: 31, suv: 34 },
  RNO: { car: 56, suv: 56 },
  RDM: { car: 45, suv: 46 },
  EUG: { car: 39, suv: 40 },
  PDX: { car: 50, suv: 60 },
  SEA: { car: 41, suv: 37 },
  PAE: { car: 41, suv: 73 },
  BLI: { car: 39, suv: 41 },
  BZN: { car: 32, suv: 32 },
  JAC: { car: 43, suv: 49 },
  IDA: { car: 52, suv: 58 },
  BIL: { car: 41, suv: 41 },
  COD: { car: 59, suv: 73 },
  SLC: { car: 42, suv: 44 },
  LAS: { car: 42, suv: 50 },
  SGU: { car: 78, suv: 74 },
  PHX: { car: 53, suv: 54 },
  FLG: { car: 43, suv: 44 },
  ANC: { car: 43, suv: 38 },
  FAI: { car: 45, suv: 57 },
  // 摩押的小机场只有一两家，贵很多，从大章克申或盐湖城租车进出更便宜
  CNY: { car: 106, suv: 110 },
  GJT: { car: 42, suv: 50 },
  DEN: { car: 35, suv: 38 },
  PGA: { car: 52, suv: 96 },
  // 加拿大的机场在 Kayak 美国站上也按美元显示
  YYC: { car: 33, suv: 33 },
  YEG: { car: 26, suv: 29 },
  YVR: { car: 29, suv: 33 },
  PSP: { car: 43, suv: 40 },
};

/** 没有这个机场的参考价时按这个估（上面各机场轿车价的中位数左右） */
export const DEFAULT_CAR_RATE = 42;
