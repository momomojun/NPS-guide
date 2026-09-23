import "server-only";
import { dataGovHeaders } from "./datagov";
import { fetchJson } from "./fetch-json";
import { daysSince } from "./time";

// 旧域名 developer.nrel.gov 已于 2026-05-29 停用
const BASE = "https://developer.nlr.gov/api/alt-fuel-stations/v1";

export interface ChargingStation {
  id: number;
  station_name: string;
  city: string;
  state: string;
  /** 到查询点的直线距离（英里） */
  distance: number;
  ev_network: string | null;
  ev_level2_evse_num: number | null;
  ev_dc_fast_num: number | null;
  /** E = 可用，T = 暂时不可用 */
  status_code: "E" | "P" | "T";
  /** 形如 "2026-08-27" */
  date_last_confirmed: string | null;
}

interface NearestResponse {
  total_results: number;
  fuel_stations: ChargingStation[];
}

/** 公共充电站，按直线距离从近到远 */
export async function getChargersNear(
  lat: number,
  lon: number,
  radiusMiles: number,
): Promise<ChargingStation[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    radius: String(radiusMiles),
    fuel_type: "ELEC",
    access: "public",
    status: "E,T",
    limit: "200",
  });
  const res = await fetchJson<NearestResponse>(`${BASE}/nearest.json?${params}`, {
    headers: dataGovHeaders(),
    revalidate: 24 * 60 * 60,
  });
  return res.fuel_stations;
}

export const isDcFast = (station: ChargingStation) => (station.ev_dc_fast_num ?? 0) > 0;

export const isTeslaSupercharger = (station: ChargingStation) =>
  station.ev_network === "Tesla" && isDcFast(station);

export type StationFlag = "unavailable" | "stale" | "nonNetworked";

/** 可靠度的第一版：看状态、最后确认时间、是否联网上报 */
export function stationFlags(station: ChargingStation): StationFlag[] {
  const flags: StationFlag[] = [];
  if (station.status_code === "T") flags.push("unavailable");
  if (station.date_last_confirmed && daysSince(station.date_last_confirmed) > 365) {
    flags.push("stale");
  }
  if (station.ev_network === "Non-Networked") flags.push("nonNetworked");
  return flags;
}
