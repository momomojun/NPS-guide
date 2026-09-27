import { useSyncExternalStore } from "react";
import type { FlightQuery, FlightResult } from "./prices/types";

// 查到的机票价格存在 localStorage：预算里要用，离线时也能看到上次查的价格
const STORAGE_KEY = "nps-guide:flights";
const MAX_ENTRIES = 40;

export type FlightStore = Record<string, FlightResult>;

const EMPTY: FlightStore = {};
let cachedRaw: string | null = null;
let cached: FlightStore = EMPTY;
const listeners = new Set<() => void>();

/** 同一趟航程（机场、日期、人数都一样）用同一个 key */
export function flightKey(query: FlightQuery): string {
  return `${query.legs.map((leg) => `${leg.from}.${leg.to}.${leg.date}`).join("|")}#${query.adults}`;
}

function read(): FlightStore {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = raw ? (JSON.parse(raw) as FlightStore) : EMPTY;
    } catch {
      cached = EMPTY;
    }
  }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFlightStore(): FlightStore {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function saveFlight(result: FlightResult) {
  const entries = Object.entries({ ...read(), [flightKey(result.query)]: result })
    .sort(([, a], [, b]) => b.fetchedAt.localeCompare(a.fetchedAt))
    .slice(0, MAX_ENTRIES);
  cachedRaw = JSON.stringify(Object.fromEntries(entries));
  cached = JSON.parse(cachedRaw) as FlightStore;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}
