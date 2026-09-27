// 机票、租车价格的数据源抽成一层：页面只认这里的类型，换数据源（自用抓取、SerpApi、以后的付费 / 合作接口）不影响上层

/** 一段航程：日期（"2026-10-10"）、出发机场、到达机场（IATA 代码） */
export interface FlightLeg {
  date: string;
  from: string;
  to: string;
}

/**
 * 查一趟机票：往返是两段（回程是去程反过来），进出不同机场是两段多城市，单程是一段。
 * 价格是整趟、所有乘客合计。
 */
export interface FlightQuery {
  legs: FlightLeg[];
  adults: number;
}

export type TripType = "roundTrip" | "oneWay" | "multiCity";

export function tripTypeOf(query: FlightQuery): TripType {
  const [out, back] = query.legs;
  if (query.legs.length === 1) return "oneWay";
  if (query.legs.length === 2 && back.from === out.to && back.to === out.from) return "roundTrip";
  return "multiCity";
}

export interface FlightQuote {
  /** 美元，整趟、所有乘客合计 */
  price: number;
  airlines: string[];
  /** 去程中转次数 */
  stops: number;
  /** 去程总时长（分钟） */
  durationMin: number;
  /** 去程出发、到达的当地时间，形如 "2026-10-10 07:15" */
  departTime?: string;
  arriveTime?: string;
}

export interface FlightResult {
  query: FlightQuery;
  /** 从便宜到贵，最多几条 */
  quotes: FlightQuote[];
  /** 这条航线这段时间的价位："low" | "typical" | "high"（数据源给了才有） */
  priceLevel?: string;
  /** 这条航线通常的价格区间（美元，整趟所有乘客） */
  typicalRange?: [number, number];
  /** 数据来源，显示给用户看 */
  source: string;
  /** 查询时间（ISO） */
  fetchedAt: string;
}

export interface FlightPriceProvider {
  name: string;
  search(query: FlightQuery): Promise<FlightResult | null>;
}

/** 租车：取车、还车机场和日期（还车机场不同就是异地还车） */
export interface CarQuery {
  pickup: string;
  dropoff: string;
  from: string;
  to: string;
}

export interface CarQuote {
  /** 整段租期总价（美元，不含保险） */
  total: number;
  company: string;
  carClass: string;
}

export interface CarPriceProvider {
  name: string;
  search(query: CarQuery): Promise<CarQuote[] | null>;
}
