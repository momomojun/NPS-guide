"use client";

import { useMemo, useState } from "react";
import { KIND_COLORS } from "@/components/attractions/kinds";
import { ParkMap, type MapPoint } from "@/components/map/park-map";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { LodgingOption } from "@/data/lodging";
import { fill, formatDuration } from "@/i18n/format";
import { addDays } from "@/lib/dates";
import { drivingMinutesFrom } from "@/lib/osrm-client";
import { buildTimeline, NOMINAL_SUN, rankLodging, type PlanStop } from "@/lib/planner";
import { formatClock, minutesOfDay, sunTimes } from "@/lib/sun";
import { moveItem, setNight } from "@/lib/trip-edit";
import { planTrip } from "@/lib/trip-plan";
import {
  MAX_DAYS,
  removeFromTrip,
  resetTrip,
  resizeDays,
  tripIds,
  updateTrip,
  useTrip,
  type Trip,
  type TripLodging,
} from "@/lib/trip-store";
import { DayCard } from "./day-card";
import { LodgingSelector } from "./lodging-selector";
import type { DayView, DragSpot, PlannerPark, PlannerText, ResolvedLodging, SunInfo } from "./types";

const LODGING_COLOR = "#3730a3";
/** 自定义住处只查这个范围内公园的景点车程 */
const MEASURE_RADIUS_KM = 400;

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function Planner({
  attractions,
  parks,
  lodgingOptions,
  text,
  locale,
}: {
  attractions: AttractionWithPhoto[];
  parks: PlannerPark[];
  lodgingOptions: LodgingOption[];
  text: PlannerText;
  locale: string;
}) {
  const t = text.plan;
  const trip = useTrip();
  const [mapDay, setMapDay] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [today, setToday] = useState(0);
  const [pickerPark, setPickerPark] = useState(parks[0]?.code ?? "");
  const [dragSource, setDragSource] = useState<DragSpot | null>(null);
  const [dragTarget, setDragTarget] = useState<DragSpot | null>(null);

  const byId = useMemo(() => new Map(attractions.map((a) => [a.id, a])), [attractions]);
  const parkByCode = useMemo(() => new Map(parks.map((p) => [p.code, p])), [parks]);
  const optionById = useMemo(() => new Map(lodgingOptions.map((o) => [o.id, o])), [lodgingOptions]);
  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-TW" : "zh-CN", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
        timeZone: "UTC",
      }),
    [locale],
  );

  const duration = (minutes: number) => formatDuration(minutes, text.units);
  const dateOf = (day: number) => (trip.startDate ? addDays(trip.startDate, day) : null);

  const resolve = (lodging: TripLodging | null | undefined): ResolvedLodging | undefined => {
    if (!lodging) return undefined;
    if (lodging.kind === "custom") return { ...lodging, custom: true };
    const option = optionById.get(lodging.id);
    return option
      ? { id: option.id, lat: option.lat, lon: option.lon, name: option.nameZh, custom: false, inPark: option.inPark, note: option.note }
      : undefined;
  };
  const nightAt = (night: number) => resolve(trip.nights[night]);

  const sunInfo = (day: number, parkCode: string | undefined): SunInfo => {
    const date = dateOf(day);
    const park = parkCode ? parkByCode.get(parkCode) : undefined;
    if (!date || !park) return { kind: "unknown" };
    const sun = sunTimes(date, park.lat, park.lon);
    if (sun.kind !== "normal") return { kind: sun.kind };
    return {
      kind: "normal",
      window: { sunrise: minutesOfDay(sun.sunrise, park.timeZone), sunset: minutesOfDay(sun.sunset, park.timeZone) },
    };
  };
  const sunWindow = (day: number, parkCode: string) => {
    const info = sunInfo(day, parkCode);
    return info.kind === "normal" ? info.window : NOMINAL_SUN;
  };

  // 逐天推算时间线：早上从前一晚住处出发，晚上回当晚住处
  const dayViews: DayView[] = [];
  let previous: PlanStop | undefined;
  for (let day = 0; day < trip.days.length; day++) {
    const rows = trip.days[day].flatMap((item, index) => {
      const stop = byId.get(item.id);
      return stop ? [{ item, index, stop }] : [];
    });
    const from = nightAt(day);
    const to = nightAt(day + 1);
    const sun = sunInfo(day, rows[0]?.stop.park ?? previous?.park);
    const timeline = buildTimeline(
      rows.map((row) => row.stop),
      { sun: sun.kind === "normal" ? sun.window : NOMINAL_SUN, from, to, previous },
    );
    dayViews.push({ day, date: dateOf(day), rows, sun, timeline, from, to });
    previous = rows.at(-1)?.stop ?? previous;
  }

  // 第 night 晚的推荐住处：当天最后一站所在公园和第二天第一站所在公园的住宿，按车程排序
  const rankedFor = (night: number) => {
    const lastStop = dayViews[night - 1]?.rows.at(-1)?.stop;
    const nextStop = dayViews[night]?.rows[0]?.stop;
    const parksNearby = new Set([lastStop?.park, nextStop?.park].filter(Boolean));
    const candidates = lodgingOptions
      .filter((option) => parksNearby.has(option.park))
      .map((option) => resolve({ kind: "option", id: option.id })!);
    return rankLodging(candidates, lastStop, nextStop);
  };
  const searchNearFor = (night: number) => {
    const stop = dayViews[night - 1]?.rows.at(-1)?.stop ?? dayViews[night]?.rows[0]?.stop;
    const park = parks.find((p) => p.code === (stop?.park ?? pickerPark)) ?? parks[0];
    return stop ?? { lat: park.lat, lon: park.lon };
  };

  const measure = (place: { lat: number; lon: number }) => {
    const nearbyParks = new Set(
      parks.filter((park) => distanceKm(place, park) < MEASURE_RADIUS_KM).map((park) => park.code),
    );
    return drivingMinutesFrom(
      place,
      attractions.filter((a) => nearbyParks.has(a.park)).map((a) => ({ id: a.id, ...(a.start ?? a) })),
    );
  };

  const allIds = tripIds(trip);
  const plannedCount = trip.days.flat().filter((item) => item.status === "planned").length;

  const runPlan = (fromDay: number) =>
    updateTrip((current: Trip) => ({
      ...current,
      days: planTrip(current, byId, sunWindow, nightAt, fromDay),
      pool: [],
    }));
  const autoPlan = () => {
    if (plannedCount > 0 && !window.confirm(t.autoPlanConfirm)) return;
    runPlan(0);
  };
  const clearTrip = () => {
    if (window.confirm(t.clearConfirm)) resetTrip();
  };
  // 给还没定的每晚（第 1 天到最后一天的晚上）选车程最短的推荐住处
  const fillLodging = () =>
    updateTrip((current) => {
      let next = current;
      for (let night = 1; night <= current.dayCount; night++) {
        const best = current.nights[night] ? undefined : rankedFor(night)[0];
        if (best) next = setNight(next, night, { kind: "option", id: best.lodging.id });
      }
      return next;
    });
  const hasEmptyNight = trip.nights.slice(1).some((night) => night === null) && plannedCount > 0;

  const drag = {
    source: dragSource,
    target: dragTarget,
    start: (spot: DragSpot) => setDragSource(spot),
    over: (spot: DragSpot) => {
      if (dragTarget?.day !== spot.day || dragTarget.index !== spot.index) setDragTarget(spot);
    },
    drop: () => {
      if (dragSource && dragTarget) {
        updateTrip((current) => moveItem(current, dragSource.day, dragSource.index, dragTarget.day, dragTarget.index));
      }
      setDragSource(null);
      setDragTarget(null);
    },
    end: () => {
      setDragSource(null);
      setDragTarget(null);
    },
  };

  const selectOnMap = (id: string) => {
    setSelectedId(id);
    document.getElementById(`plan-item-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const selectInList = (day: number, id: string) => {
    setSelectedId(id);
    setMapDay(day);
  };

  // 地图：选中那天的住处 → 景点 → 当晚住处；那天没有景点时显示整个行程的景点
  const mapIndex = Math.min(mapDay, trip.days.length - 1);
  const mapView = dayViews[mapIndex];
  const lodgingPoint = (lodging: ResolvedLodging, id: string): MapPoint => ({
    id,
    lat: lodging.lat,
    lon: lodging.lon,
    label: lodging.name,
    color: LODGING_COLOR,
    badge: "住",
  });
  const mapPoints: MapPoint[] = [];
  const mapRoute: { lat: number; lon: number }[] = [];
  if (mapView && mapView.rows.length > 0) {
    if (mapView.from) {
      mapPoints.push(lodgingPoint(mapView.from, "lodging-from"));
      mapRoute.push(mapView.from);
    }
    mapView.rows.forEach(({ stop }, k) => {
      mapPoints.push({ id: stop.id, lat: stop.lat, lon: stop.lon, label: stop.nameZh, color: KIND_COLORS[stop.kind], badge: String(k + 1) });
      mapRoute.push(stop);
    });
    if (mapView.to) {
      if (mapView.to.id !== mapView.from?.id) mapPoints.push(lodgingPoint(mapView.to, "lodging-to"));
      mapRoute.push(mapView.to);
    }
  } else {
    for (const id of allIds) {
      const stop = byId.get(id);
      if (stop) mapPoints.push({ id, lat: stop.lat, lon: stop.lon, label: stop.nameZh, color: KIND_COLORS[stop.kind] });
    }
  }

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs ${
      active
        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
    }`;
  const card = "rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900";
  const field =
    "mt-1 block rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-sm text-stone-900 dark:border-stone-700 dark:text-stone-100";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-stone-600 dark:text-stone-400">{t.intro}</p>
      </header>

      <div className={`${card} flex flex-wrap items-end gap-4 p-4`}>
        <label className="text-xs text-stone-500">
          {t.startDate}
          <input
            type="date"
            value={trip.startDate}
            onChange={(event) => updateTrip((current) => ({ ...current, startDate: event.target.value }))}
            className={field}
          />
        </label>
        <label className="text-xs text-stone-500">
          {t.days}
          <select
            value={trip.dayCount}
            onChange={(event) => updateTrip((current) => resizeDays(current, Number(event.target.value)))}
            className={field}
          >
            {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {fill(t.dayOption, { n })}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={buttonPrimary} onClick={autoPlan} disabled={allIds.length === 0}>
          {t.autoPlan}
        </button>
        <button type="button" className={buttonSecondary} onClick={fillLodging} disabled={!hasEmptyNight} title={t.lodging.fillHint}>
          🏨 {t.lodging.fillAll}
        </button>
        <button type="button" className={buttonSecondary} onClick={clearTrip} disabled={allIds.length === 0}>
          {t.clear}
        </button>
        {!trip.startDate && <p className="basis-full text-xs text-amber-700 dark:text-amber-400">{t.noDate}</p>}
        {plannedCount > 0 && <p className="basis-full text-xs text-stone-500">{t.lodging.fillHint}</p>}
      </div>

      {allIds.length === 0 && (
        <p className={`${card} p-4 text-sm text-stone-600 dark:text-stone-400`}>{t.empty}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {trip.pool.length > 0 && (
            <section className="rounded-2xl border border-dashed border-emerald-400 p-4">
              <h2 className="font-semibold">{fill(t.pool, { n: trip.pool.length })}</h2>
              <p className="text-xs text-stone-500">{t.poolHint}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {trip.pool.map((id) => (
                  <li key={id} className="flex items-center gap-1 rounded-full bg-stone-100 py-1 pr-1 pl-3 text-xs dark:bg-stone-800">
                    {byId.get(id)?.nameZh ?? id}
                    <button
                      type="button"
                      aria-label={t.actions.remove}
                      title={t.actions.remove}
                      className="rounded-full px-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                      onClick={() => removeFromTrip(id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plannedCount > 0 && <p className="text-xs text-stone-400">⠿ {t.dragHint}</p>}

          {dayViews.map((view) => {
            const night = view.day + 1;
            const parkNames = [...new Set(view.rows.map((row) => row.stop.park))].map(
              (code) => parkByCode.get(code)?.nameZh ?? code,
            );
            const status =
              view.to && view.timeline.returnAt !== undefined
                ? `${fill(t.lodging.back, { name: view.to.name, time: formatClock(view.timeline.returnAt) })} · ${fill(t.drive, { d: duration(view.timeline.returnDriveMin) })}`
                : undefined;
            return (
              <DayCard
                key={view.day}
                view={view}
                dayCount={trip.days.length}
                itemCount={trip.days[view.day].length}
                dateLabel={view.date ? dateFormat.format(new Date(`${view.date}T00:00:00Z`)) : null}
                parkNames={parkNames}
                text={text}
                selectedId={selectedId}
                onSelect={(id) => selectInList(view.day, id)}
                onEdit={updateTrip}
                drag={drag}
                header={
                  view.day === 0 && view.rows.length > 0 ? (
                    <LodgingSelector
                      label={t.lodging.start}
                      hint={t.lodging.startHint}
                      current={view.from}
                      ranked={rankedFor(0)}
                      searchNear={searchNearFor(0)}
                      text={text}
                      onChange={(lodging) => updateTrip((current) => setNight(current, 0, lodging))}
                      measure={measure}
                    />
                  ) : undefined
                }
                footer={
                  <LodgingSelector
                    label={t.lodging.tonight}
                    current={view.to}
                    status={status}
                    ranked={rankedFor(night)}
                    previous={trip.nights[night - 1]}
                    searchNear={searchNearFor(night)}
                    text={text}
                    onChange={(lodging) => updateTrip((current) => setNight(current, night, lodging))}
                    measure={measure}
                  />
                }
              />
            );
          })}

          {plannedCount > 0 && trip.days.length > 1 && (
            <section className={`${card} p-4`}>
              <h2 className="font-semibold">{t.replan}</h2>
              <p className="mt-1 text-xs text-stone-500">{t.replanHint}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  {t.replanToday}
                  <select
                    value={Math.min(today, trip.days.length - 1)}
                    onChange={(event) => setToday(Number(event.target.value))}
                    className="rounded-lg border border-stone-300 bg-transparent px-2 py-1 dark:border-stone-700"
                  >
                    {trip.days.map((_, day) => (
                      <option key={day} value={day}>
                        {fill(t.day, { n: day + 1 })}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className={buttonPrimary} onClick={() => runPlan(Math.min(today, trip.days.length - 1))}>
                  {t.replanButton}
                </button>
              </div>
            </section>
          )}

          <section className={`${card} p-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{t.add}</h2>
              <select
                value={pickerPark}
                aria-label={t.addPlaceholder}
                onChange={(event) => setPickerPark(event.target.value)}
                className="rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-sm dark:border-stone-700"
              >
                {parks.map((park) => (
                  <option key={park.code} value={park.code}>
                    {park.nameZh}
                  </option>
                ))}
              </select>
            </div>
            <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
              {attractions
                .filter((a) => a.park === pickerPark)
                .map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ backgroundColor: KIND_COLORS[a.kind] }} />
                      {a.nameZh}
                      {a.mustSee && <span className="ml-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">★</span>}
                      <span className="ml-2 text-xs text-stone-500">{duration(a.durationMin)}</span>
                    </span>
                    <AddToTripButton id={a.id} text={text.trip} />
                  </li>
                ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-2 lg:sticky lg:top-20">
            {trip.days.length > 1 && (
              <div className="flex flex-wrap gap-1" role="group" aria-label={t.showOnMap}>
                {trip.days.map((_, day) => (
                  <button key={day} type="button" className={chip(day === mapIndex)} onClick={() => setMapDay(day)}>
                    {fill(t.day, { n: day + 1 })}
                  </button>
                ))}
              </div>
            )}
            <ParkMap
              points={mapPoints}
              route={mapRoute}
              selectedId={selectedId}
              onSelect={(id) => {
                if (!id.startsWith("lodging-")) selectOnMap(id);
              }}
              text={text.map}
              className="h-96 lg:h-[calc(100vh-9rem)]"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-500">{t.credit}</p>
    </div>
  );
}
