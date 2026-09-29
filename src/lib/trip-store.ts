import { useSyncExternalStore } from "react";
import type { GuideInfo } from "./generate-trip";

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
      /** 自动生成攻略时的出发地 / 回程地（机场、城市），不是住处 */
      endpoint?: "origin" | "destination";
    };

export interface Trip {
  version: 2;
  /** 形如 "2026-10-05"；空字符串表示还没定 */
  startDate: string;
  /** 只定了月份、没定具体日期时的月份（1–12），日出日落和季节提示按这个月算 */
  month?: number;
  dayCount: number;
  days: TripItem[][];
  /** 已加入但还没排进哪一天的景点 */
  pool: string[];
  /** 长度为 dayCount + 1：nights[0] 是第 1 天出发前住的地方，nights[d] 是第 d 天晚上住的地方 */
  nights: (TripLodging | null)[];
  /** 自动生成攻略时记下的说明（哪些景点没排进去、为什么） */
  guide?: GuideInfo;
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

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isString = (value: unknown): value is string => typeof value === "string";

/** 检查一晚的住处：分享链接、导入的文件都是外来数据，字段不对的当作没定 */
function normalizeLodging(value: unknown): TripLodging | null {
  if (!value || typeof value !== "object") return null;
  const night = value as Record<string, unknown>;
  if (night.kind === "option" && isString(night.id)) return { kind: "option", id: night.id };
  if (night.kind === "custom" && isString(night.id) && isString(night.name) && isNumber(night.lat) && isNumber(night.lon)) {
    const minutes = Object.fromEntries(
      Object.entries(night.minutes && typeof night.minutes === "object" ? night.minutes : {}).filter(([, m]) => isNumber(m)),
    ) as Record<string, number>;
    const endpoint = night.endpoint === "origin" || night.endpoint === "destination" ? night.endpoint : undefined;
    return { kind: "custom", id: night.id, name: night.name, lat: night.lat, lon: night.lon, minutes, ...(endpoint ? { endpoint } : {}) };
  }
  return null;
}

/** 把外来的行程数据（分享链接、导入的文件）整理成合法的行程；不像行程就返回 null */
export function normalizeTrip(value: unknown): Trip | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.days) || !Array.isArray(raw.pool)) return null;
  const days = raw.days.slice(0, MAX_DAYS).map((day) =>
    (Array.isArray(day) ? day : []).flatMap((item): TripItem[] => {
      const entry = item as Record<string, unknown> | null;
      if (!entry || !isString(entry.id)) return [];
      const status: ItemStatus = entry.status === "done" || entry.status === "skipped" ? entry.status : "planned";
      return [{ id: entry.id, status }];
    }),
  );
  if (days.length === 0) days.push([]);
  const nights = Array.isArray(raw.nights) ? raw.nights.map(normalizeLodging) : [];
  const startDate = isString(raw.startDate) && /^\d{4}-\d{2}-\d{2}$/.test(raw.startDate) ? raw.startDate : "";
  const month = isNumber(raw.month) && raw.month >= 1 && raw.month <= 12 ? raw.month : undefined;
  return {
    version: 2,
    startDate,
    ...(month && !startDate ? { month } : {}),
    dayCount: days.length,
    days,
    pool: raw.pool.filter(isString),
    nights: fitNights(nights, days.length),
    ...(raw.guide && typeof raw.guide === "object" ? { guide: raw.guide as Trip["guide"] } : {}),
  };
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

/** 换成另一个行程（导入分享的行程） */
export function replaceTrip(trip: Trip) {
  write(trip);
}

/** 改天数：多出来的天补空，被砍掉的天里的景点放回待安排 */
export function resizeDays(trip: Trip, dayCount: number): Trip {
  const days = trip.days.slice(0, dayCount);
  while (days.length < dayCount) days.push([]);
  const dropped = trip.days.slice(dayCount).flat().map((item) => item.id);
  return { ...trip, dayCount, days, pool: [...trip.pool, ...dropped], nights: fitNights(trip.nights, dayCount) };
}
