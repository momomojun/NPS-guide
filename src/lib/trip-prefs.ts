import { useSyncExternalStore } from "react";

// 算机票、门票、预算用的出行信息，和行程分开存：重新生成攻略也不用再填一遍
export interface TripPrefs {
  /** 从哪个机场飞（IATA 代码），空字符串表示还没填 */
  homeAirport: string;
  /** 同行人数（机票、餐饮按这个算） */
  travelers: number;
  /** 其中 16 岁以上的非美国居民：2026 年起 11 个热门公园每人另收 $100 */
  nonresidents: number;
  /** 住酒店要几间房；民宿按整套算 */
  rooms: number;
  vehicle: "gas" | "ev";
  /** 坐飞机来就要租车；自己开车来的不算租车和机票 */
  flyAndRent: boolean;
  /** 按“今天”模式的打卡学到的配速调整后面的停留时间 */
  usePace: boolean;
}

const STORAGE_KEY = "nps-guide:prefs";

export const DEFAULT_PREFS: TripPrefs = {
  homeAirport: "",
  travelers: 2,
  nonresidents: 0,
  rooms: 1,
  vehicle: "gas",
  flyAndRent: true,
  usePace: true,
};

let cachedRaw: string | null = null;
let cachedPrefs: TripPrefs = DEFAULT_PREFS;
const listeners = new Set<() => void>();

function read(): TripPrefs {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedPrefs = raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<TripPrefs>) } : DEFAULT_PREFS;
    } catch {
      cachedPrefs = DEFAULT_PREFS;
    }
  }
  return cachedPrefs;
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

export function useTripPrefs(): TripPrefs {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS);
}

export function updatePrefs(change: Partial<TripPrefs>) {
  const next = { ...read(), ...change };
  // 非居民不能比总人数多
  next.nonresidents = Math.min(next.nonresidents, next.travelers);
  cachedRaw = JSON.stringify(next);
  cachedPrefs = next;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}
