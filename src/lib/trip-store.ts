import { useSyncExternalStore } from "react";

export type ItemStatus = "planned" | "done" | "skipped";

export interface TripItem {
  id: string;
  status: ItemStatus;
}

/** 推荐住宿只存 id（名字随语言切换）；自定义住处存名字、坐标和查好的车程 */
export type TripLodging =
  | { kind: "option"; id: string }
  | {
      kind: "custom";
      id: string;
      name: string;
      lat: number;
      lon: number;
      /** 到各景点的车程（分钟），查不到时为空，按直线估算 */
      minutes: Record<string, number>;
    };

export interface Trip {
  version: 2;
  /** 形如 "2026-10-05"；空字符串表示还没定 */
  startDate: string;
  dayCount: number;
  days: TripItem[][];
  /** 已加入但还没排进哪一天的景点 */
  pool: string[];
  /** 长度为 dayCount + 1：nights[0] 是第 1 天出发前住的地方，nights[d] 是第 d 天晚上住的地方 */
  nights: (TripLodging | null)[];
}

export const MAX_DAYS = 14;

const STORAGE_KEY = "nps-guide:trip";
/** 项目改名（park-pilot → NPS Guide）前存行程用的 key */
const LEGACY_KEY = "park-pilot:trip";

// 第一次加载时把旧 key 里的行程搬到新 key，免得改名后行程丢了
if (typeof window !== "undefined") {
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
      if (window.localStorage.getItem(STORAGE_KEY) === null) window.localStorage.setItem(STORAGE_KEY, legacy);
      window.localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    // 隐私模式等拿不到 localStorage 时跳过
  }
}

const EMPTY_TRIP: Trip = {
  version: 2,
  startDate: "",
  dayCount: 3,
  days: [[], [], []],
  pool: [],
  nights: [null, null, null, null],
};

// 行程存在 localStorage，自用阶段不需要账号
let cachedRaw: string | null = null;
let cachedTrip: Trip = EMPTY_TRIP;
const listeners = new Set<() => void>();

function fitNights(nights: (TripLodging | null)[] | undefined, dayCount: number) {
  const fitted = (nights ?? []).slice(0, dayCount + 1);
  while (fitted.length < dayCount + 1) fitted.push(null);
  return fitted;
}

function parse(raw: string | null): Trip {
  if (!raw) return EMPTY_TRIP;
  try {
    const trip = JSON.parse(raw) as Omit<Trip, "version" | "nights"> & {
      version: number;
      nights?: (TripLodging | null)[];
    };
    if ((trip.version === 1 || trip.version === 2) && Array.isArray(trip.days) && Array.isArray(trip.pool)) {
      // 第 1 版没有住宿，补上空的
      return { ...trip, version: 2, nights: fitNights(trip.nights, trip.days.length) };
    }
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

export function addToTrip(ids: string | string[]) {
  updateTrip((trip) => {
    const existing = new Set(tripIds(trip));
    const added = [ids].flat().filter((id) => !existing.has(id));
    return added.length > 0 ? { ...trip, pool: [...trip.pool, ...added] } : trip;
  });
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
  return { ...trip, dayCount, days, pool: [...trip.pool, ...dropped], nights: fitNights(trip.nights, dayCount) };
}
