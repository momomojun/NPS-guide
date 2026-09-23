import "server-only";
import { dataGovHeaders } from "./datagov";
import { fetchJson } from "./fetch-json";

const BASE = "https://developer.nps.gov/api/v1";

interface NpsList<T> {
  total: string;
  data: T[];
}

export interface NpsAlert {
  id: string;
  url: string;
  title: string;
  parkCode: string;
  description: string;
  /** "Park Closure" | "Danger" | "Caution" | "Information" */
  category: string;
  /** 形如 "2026-09-22 00:00:00.0" */
  lastIndexedDate: string;
}

export interface NpsFee {
  entranceFeeType: string;
  cost: string;
  description: string;
}

interface NpsFeesPasses {
  parkCode: string;
  fees: NpsFee[];
}

function npsGet<T>(path: string, params: Record<string, string>, revalidate: number) {
  const url = `${BASE}${path}?${new URLSearchParams(params)}`;
  return fetchJson<T>(url, { headers: dataGovHeaders(), revalidate });
}

export async function getAlerts(parkCode: string): Promise<NpsAlert[]> {
  const res = await npsGet<NpsList<NpsAlert>>("/alerts", { parkCode, limit: "50" }, 30 * 60);
  return res.data;
}

export async function getFees(parkCode: string): Promise<NpsFee[]> {
  const res = await npsGet<NpsList<NpsFeesPasses>>("/feespasses", { parkCode }, 24 * 60 * 60);
  return res.data[0]?.fees ?? [];
}
