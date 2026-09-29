import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";
import { DEFAULT_PREFS, type TripPrefs } from "./trip-prefs";
import { normalizeTrip, tripIds, type Trip } from "./trip-store";

// 分享行程：把行程和出行设置（人数、车型、出发机场）压缩后放进网址 # 后面，在另一台设备（或朋友的手机）上
// 打开链接就能导入。# 后面的内容不会发给服务器。这是一次性的拷贝，不是实时同步：改了行程要重新分享一次。
// 也可以导出成文件备份，或者通过微信、邮件发过去再导入。

export interface SharedTrip {
  trip: Trip;
  prefs?: TripPrefs;
}

const VERSION = 1;
const FILE_KIND = "nps-guide-trip";

/** 自定义住处（机场、自己搜的酒店）存着到附近所有景点的车程，分享时只留行程里用到的，链接短很多 */
function slim(trip: Trip): Trip {
  const used = new Set(tripIds(trip));
  return {
    ...trip,
    nights: trip.nights.map((night) =>
      night?.kind === "custom"
        ? { ...night, minutes: Object.fromEntries(Object.entries(night.minutes).filter(([id]) => used.has(id))) }
        : night,
    ),
  };
}

function normalizePrefs(value: unknown): TripPrefs | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const count = (v: unknown, fallback: number) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 20 ? v : fallback);
  return {
    homeAirport: typeof raw.homeAirport === "string" && /^[A-Z]{3}$/.test(raw.homeAirport) ? raw.homeAirport : DEFAULT_PREFS.homeAirport,
    travelers: Math.max(count(raw.travelers, DEFAULT_PREFS.travelers), 1),
    nonresidents: count(raw.nonresidents, DEFAULT_PREFS.nonresidents),
    rooms: Math.max(count(raw.rooms, DEFAULT_PREFS.rooms), 1),
    vehicle: raw.vehicle === "ev" ? "ev" : "gas",
    flyAndRent: typeof raw.flyAndRent === "boolean" ? raw.flyAndRent : DEFAULT_PREFS.flyAndRent,
  };
}

function fromData(data: unknown): SharedTrip | null {
  if (!data || typeof data !== "object") return null;
  const raw = data as { v?: unknown; trip?: unknown; prefs?: unknown };
  if (raw.v !== VERSION) return null;
  const trip = normalizeTrip(raw.trip);
  return trip ? { trip, prefs: normalizePrefs(raw.prefs) } : null;
}

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (text: string) => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

/** 压缩成网址里能用的一串字符 */
export function encodeTrip(shared: SharedTrip): string {
  const json = JSON.stringify({ v: VERSION, trip: slim(shared.trip), prefs: shared.prefs });
  return toBase64Url(deflateSync(strToU8(json), { level: 9 }));
}

/** 读分享链接里的行程；复制不完整、数据不对都返回 null */
export function decodeTrip(code: string): SharedTrip | null {
  try {
    return fromData(JSON.parse(strFromU8(inflateSync(fromBase64Url(code)))));
  } catch {
    return null;
  }
}

export function shareUrl(origin: string, locale: string, code: string): string {
  return `${origin}/${locale}/plan#trip=${code}`;
}

/** 网址 # 后面的分享码；没有就是 null */
export function codeFromHash(hash: string): string | null {
  return hash.match(/^#trip=([A-Za-z0-9_-]+)$/)?.[1] ?? null;
}

/** 导出成文件的内容 */
export function tripFileText(shared: SharedTrip, exportedAt: string): string {
  return JSON.stringify({ kind: FILE_KIND, v: VERSION, exportedAt, trip: shared.trip, prefs: shared.prefs }, null, 2);
}

/** 读导出的文件；不是这个网站导出的就返回 null */
export function readTripFile(text: string): SharedTrip | null {
  try {
    const data = JSON.parse(text) as { kind?: unknown };
    return data.kind === FILE_KIND ? fromData(data) : null;
  } catch {
    return null;
  }
}
