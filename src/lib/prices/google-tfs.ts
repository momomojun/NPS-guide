import type { FlightLeg, FlightQuery } from "./types";
import { tripTypeOf } from "./types";

// Google Flights 的 tfs 参数是一段 protobuf（base64），写明每段航程的日期、出发和到达机场。
// 字段编号参考开源项目 fast-flights；浏览器和服务器都能用：生成比价链接，也给自用抓取用。

function varint(value: number): number[] {
  const out: number[] = [];
  let n = value;
  while (n > 0x7f) {
    out.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  out.push(n);
  return out;
}

const utf8 = (text: string) => [...new TextEncoder().encode(text)];
/** wire type 2 = 长度 + 内容，0 = 数字 */
const bytesField = (num: number, payload: number[]) => [...varint((num << 3) | 2), ...varint(payload.length), ...payload];
const numberField = (num: number, value: number) => [...varint(num << 3), ...varint(value)];

function encodeLeg(leg: FlightLeg): number[] {
  return [
    ...bytesField(2, utf8(leg.date)),
    ...bytesField(13, bytesField(2, utf8(leg.from))),
    ...bytesField(14, bytesField(2, utf8(leg.to))),
  ];
}

const TRIP_CODE = { roundTrip: 1, oneWay: 2, multiCity: 3 } as const;

export function encodeTfs(query: FlightQuery): string {
  const info = [
    ...query.legs.flatMap((leg) => bytesField(3, encodeLeg(leg))),
    // 乘客：每个成人一个 1（packed）；舱位 1 = 经济舱
    ...bytesField(8, Array<number>(query.adults).fill(1)),
    ...numberField(9, 1),
    ...numberField(19, TRIP_CODE[tripTypeOf(query)]),
  ];
  let binary = "";
  for (const byte of info) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** 打开就是这几段航程的实时价格；hl 用页面语言（zh-CN / zh-TW / en） */
export function googleFlightsUrl(query: FlightQuery, hl = "en"): string {
  return `https://www.google.com/travel/flights?tfs=${encodeURIComponent(encodeTfs(query))}&hl=${hl}&curr=USD`;
}
