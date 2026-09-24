import { useSyncExternalStore } from "react";

export type ItemStatus = "planned" | "done" | "skipped";

export interface TripItem {
  id: string;
  status: ItemStatus;
}

export interface Trip {
  version: 1;
  /** 形如 "2026-10-05"；空字符串表示还没定 */
  startDate: string;
  dayCount: number;
  days: TripItem[][];
  /** 已加入但还没排进哪一天的景点 */
  pool: string[];
}

export const MAX_DAYS = 14;

const STORAGE_KEY = "park-pilot:trip";

const EMPTY_TRIP: Trip = { version: 1, startDate: "", dayCount: 3, days: [[], [], []], pool: [] };

// 行程存在 localStorage，自用阶段不需要账号
let cachedRaw: string | null = null;
let cachedTrip: Trip = EMPTY_TRIP;
const listeners = new Set<() => void>();

function parse(raw: string | null): Trip {
  if (!raw) return EMPTY_TRIP;
  try {
    const trip = JSON.parse(raw) as Trip;
    if (trip.version === 1 && Array.isArray(trip.days) && Array.isArray(trip.pool)) return trip;
  } catch {
    // 数据损坏时当作空行程
  }
  return EMPTY_TRIP;
}

function read(): Trip {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedTrip = parse(raw);
  }
  return cachedTrip;
}

function write(trip: Trip) {
  cachedRaw = JSON.stringify(trip);
  cachedTrip = trip;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 其他标签页改了行程也同步过来
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTrip(): Trip {
  return useSyncExternalStore(subscribe, read, () => EMPTY_TRIP);
}

export function tripIds(trip: Trip): string[] {
  return [...trip.days.flat().map((item) => item.id), ...trip.pool];
}

export function updateTrip(change: (trip: Trip) => Trip) {
  write(change(read()));
}

export function addToTrip(id: string) {
  updateTrip((trip) => (tripIds(trip).includes(id) ? trip : { ...trip, pool: [...trip.pool, id] }));
}

export function removeFromTrip(id: string) {
  updateTrip((trip) => ({
    ...trip,
    days: trip.days.map((day) => day.filter((item) => item.id !== id)),
    pool: trip.pool.filter((poolId) => poolId !== id),
  }));
}

export function resetTrip() {
  write(EMPTY_TRIP);
}

/** 改天数：多出来的天补空，被砍掉的天里的景点放回待安排 */
export function resizeDays(trip: Trip, dayCount: number): Trip {
  const days = trip.days.slice(0, dayCount);
  while (days.length < dayCount) days.push([]);
  const dropped = trip.days.slice(dayCount).flat().map((item) => item.id);
  return { ...trip, dayCount, days, pool: [...trip.pool, ...dropped] };
}
