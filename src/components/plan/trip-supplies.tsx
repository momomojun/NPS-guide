"use client";

import type { ComponentType, SVGProps } from "react";
import { IconBolt, IconBowl, IconCart, IconFuel } from "@/components/icons";
import type { ServiceKind, ServicePoint } from "@/data/services.generated";
import { fill } from "@/i18n/format";
import type { PlannerText } from "./types";

export const SERVICE_COLORS: Record<ServiceKind, string> = {
  grocery: "#3f6b4f",
  asianGrocery: "#b5452f",
  asianFood: "#c98a2b",
  fuel: "#6b6660",
  dcFast: "#2f5d8a",
};

export const SERVICE_KINDS: ServiceKind[] = ["grocery", "asianGrocery", "asianFood", "fuel", "dcFast"];

const ICONS: Record<ServiceKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  grocery: IconCart,
  asianGrocery: IconCart,
  asianFood: IconBowl,
  fuel: IconFuel,
  dcFast: IconBolt,
};

/** 超过这个直线距离就不算“附近”，只说最近的在多远 */
const NEAR_KM: Record<ServiceKind, number> = { grocery: 40, asianGrocery: 120, asianFood: 50, fuel: 40, dcFast: 80 };

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearest(points: ServicePoint[], kind: ServiceKind, place: { lat: number; lon: number }) {
  let best: { point: ServicePoint; km: number } | undefined;
  for (const point of points) {
    if (point.kind !== kind) continue;
    const km = distanceKm(place, point);
    if (!best || km < best.km) best = { point, km };
  }
  return best;
}

const kmText = (km: number) => (km < 10 ? km.toFixed(1) : String(Math.round(km)));
const mapsUrl = (point: { lat: number; lon: number }) =>
  `https://www.google.com/maps/search/?api=1&query=${point.lat.toFixed(5)}%2C${point.lon.toFixed(5)}`;

export interface SupplyStay {
  id: string;
  /** 连着住同一个地方的几晚 */
  nights: number[];
  name: string;
  lat: number;
  lon: number;
}

export interface SupplyEntry {
  park: string;
  parkName: string;
  /** 进园后的第一站 */
  stop: { nameZh: string; lat: number; lon: number };
}

export function TripSupplies({
  origin,
  stays,
  entries,
  points,
  showOnMap,
  onToggleMap,
  updated,
  text,
}: {
  /** 从机场或城市出发：落地后先去最近的亚洲超市采购 */
  origin?: { name: string; lat: number; lon: number };
  stays: SupplyStay[];
  entries: SupplyEntry[];
  /** 还在加载时是 undefined */
  points: ServicePoint[] | undefined;
  showOnMap: boolean;
  onToggleMap: (show: boolean) => void;
  updated: string;
  text: PlannerText;
}) {
  const t = text.plan.supplies;

  const line = (kind: ServiceKind, place: { lat: number; lon: number }) => {
    const hit = points ? nearest(points, kind, place) : undefined;
    const Icon = ICONS[kind];
    return (
      <div key={kind} className="flex gap-3 py-0.5">
        <dt className="flex w-[4.5rem] shrink-0 items-center gap-1.5 text-mute">
          <Icon className="shrink-0 text-sm" style={{ color: SERVICE_COLORS[kind] }} />
          {t.kinds[kind]}
        </dt>
        <dd className="min-w-0 text-ink-soft">
          {!hit ? (
            t.none
          ) : hit.km > NEAR_KM[kind] ? (
            <span className="text-mute">{fill(t.far, { km: Math.round(hit.km) })}</span>
          ) : (
            <>
              <a href={mapsUrl(hit.point)} target="_blank" rel="noreferrer" className="link-line">
                {hit.point.name}
              </a>
              {kind === "dcFast" && hit.point.tesla && <span className="ml-1.5 text-mute">{t.tesla}</span>}
              {kind === "dcFast" && hit.point.ports ? <span className="ml-1.5 text-mute">{fill(t.ports, { n: hit.point.ports })}</span> : null}
              <span className="ml-1.5 text-mute tabular-nums">{fill(t.km, { km: kmText(hit.km) })}</span>
            </>
          )}
          {hit && kind === "asianGrocery" && hit.km > NEAR_KM[kind] && (
            <a href={mapsUrl(hit.point)} target="_blank" rel="noreferrer" className="link-line ml-1.5">
              {hit.point.name}
            </a>
          )}
        </dd>
      </div>
    );
  };

  return (
    <section id="plan-supplies" className="scroll-mt-32 border-t border-ink pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-mute">{t.eyebrow}</p>
          <h2 className="mt-3 font-serif text-xl">{t.title}</h2>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={showOnMap} onChange={(event) => onToggleMap(event.target.checked)} className="accent-ink" />
          {t.showOnMap}
        </label>
      </div>
      <p className="mt-2 text-xs leading-6 text-mute">{t.intro}</p>

      {points === undefined ? (
        <p className="mt-5 text-sm text-mute">{t.loading}</p>
      ) : (
        <>
          {(origin || entries.length > 0) && (
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {origin && (
                <div className="border-l border-clay-600 pl-4">
                  <p className="text-sm font-medium">{fill(t.origin, { name: origin.name })}</p>
                  <p className="mt-0.5 text-[11px] text-mute">{t.originHint}</p>
                  <dl className="mt-2 text-xs">{line("asianGrocery", origin)}</dl>
                </div>
              )}
              {entries.map((entry) => (
                <div key={entry.park} className="border-l border-clay-600 pl-4">
                  <p className="text-sm font-medium">{fill(t.lastStop, { park: entry.parkName })}</p>
                  <p className="mt-0.5 text-[11px] text-mute">{fill(t.lastStopHint, { name: entry.stop.nameZh })}</p>
                  <dl className="mt-2 text-xs">{(["grocery", "fuel"] as ServiceKind[]).map((kind) => line(kind, entry.stop))}</dl>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {stays.map((stay) => (
              <div key={`${stay.id}-${stay.nights[0]}`} className="border-t border-line pt-3">
                <p className="text-sm font-medium">
                  {stay.nights.length > 1
                    ? fill(t.nights, { a: stay.nights[0], b: stay.nights.at(-1)!, name: stay.name })
                    : fill(t.night, { n: stay.nights[0], name: stay.name })}
                </p>
                <dl className="mt-2 text-xs">{SERVICE_KINDS.map((kind) => line(kind, stay))}</dl>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-5 text-[11px] leading-5 text-mute">{fill(t.source, { date: updated })}</p>
    </section>
  );
}
