import type { CarQuery, FlightQuery } from "./types";

// 不需要 key 的比价网站链接：机场、日期、人数都填好，点开就是实时价格（Google Flights 的链接见 google-tfs.ts）

/** Kayak：往返 /BOS-SLC/去程日期/回程日期，多城市每段一组 /BOS-SLC/日期/BZN-BOS/日期 */
export function kayakFlightsUrl(query: FlightQuery): string {
  const [out, back] = query.legs;
  const roundTrip = query.legs.length === 2 && back.from === out.to && back.to === out.from;
  const path = roundTrip
    ? `${out.from}-${out.to}/${out.date}/${back.date}`
    : query.legs.map((leg) => `${leg.from}-${leg.to}/${leg.date}`).join("/");
  const people = query.adults > 1 ? `/${query.adults}adults` : "";
  return `https://www.kayak.com/flights/${path}${people}?sort=price_a`;
}

export function kayakCarsUrl(query: CarQuery): string {
  const places = query.dropoff && query.dropoff !== query.pickup ? `${query.pickup}/${query.dropoff}` : query.pickup;
  return `https://www.kayak.com/cars/${places}/${query.from}/${query.to}?sort=price_a`;
}

/** Expedia 的日期要写成 MM/DD/YYYY */
export function expediaCarsUrl(query: CarQuery): string {
  const us = (date: string) => `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
  const params = new URLSearchParams({
    locn: query.pickup,
    loc2: query.dropoff && query.dropoff !== query.pickup ? query.dropoff : "",
    date1: us(query.from),
    date2: us(query.to),
    time1: "1000AM",
    time2: "1000AM",
  });
  return `https://www.expedia.com/carsearch?${params}`;
}
