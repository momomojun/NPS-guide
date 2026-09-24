"use client";

import { useMemo, useState } from "react";
import { KIND_COLORS } from "@/components/attractions/kinds";
import { ParkMap, type MapPoint } from "@/components/map/park-map";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDuration, formatMonths } from "@/i18n/format";
import { addDays, monthOf } from "@/lib/dates";
import { buildTimeline, NOMINAL_SUN, type DayTimeline, type SunWindow } from "@/lib/planner";
import { formatClock, minutesOfDay, sunTimes } from "@/lib/sun";
import { moveToDay, moveWithinDay, removeItem, setItemStatus } from "@/lib/trip-edit";
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
  type TripItem,
} from "@/lib/trip-store";

export interface PlannerPark {
  code: string;
  nameZh: string;
  lat: number;
  lon: number;
  timeZone: string;
}

export type PlannerText = Pick<Dictionary, "plan" | "kinds" | "units" | "map" | "trip">;

type SunInfo = { kind: "normal"; window: SunWindow } | { kind: "polar-day" | "polar-night" | "unknown" };

interface DayView {
  day: number;
  date: string | null;
  rows: { item: TripItem; index: number; stop: AttractionWithPhoto }[];
  sun: SunInfo;
  timeline: DayTimeline;
}

type Tone = "warn" | "info";

export function Planner({
  attractions,
  parks,
  text,
  locale,
}: {
  attractions: AttractionWithPhoto[];
  parks: PlannerPark[];
  text: PlannerText;
  locale: string;
}) {
  const t = text.plan;
  const trip = useTrip();
  const [mapDay, setMapDay] = useState(0);
  const [today, setToday] = useState(0);
  const [pickerPark, setPickerPark] = useState(parks[0]?.code ?? "");

  const byId = useMemo(() => new Map(attractions.map((a) => [a.id, a])), [attractions]);
  const parkByCode = useMemo(() => new Map(parks.map((p) => [p.code, p])), [parks]);
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

  const sunInfo = (day: number, parkCode: string | undefined): SunInfo => {
    const date = dateOf(day);
    const park = parkCode ? parkByCode.get(parkCode) : undefined;
    if (!date || !park) return { kind: "unknown" };
    const sun = sunTimes(date, park.lat, park.lon);
    if (sun.kind !== "normal") return { kind: sun.kind };
    return {
      kind: "normal",
      window: {
        sunrise: minutesOfDay(sun.sunrise, park.timeZone),
        sunset: minutesOfDay(sun.sunset, park.timeZone),
      },
    };
  };
  const sunWindow = (day: number, parkCode: string) => {
    const info = sunInfo(day, parkCode);
    return info.kind === "normal" ? info.window : NOMINAL_SUN;
  };

  // 逐天推算时间线；跨公园的来程要用到前一天最后一个景点
  const dayViews: DayView[] = [];
  let previous: AttractionWithPhoto | undefined;
  for (let day = 0; day < trip.days.length; day++) {
    const rows = trip.days[day].flatMap((item, index) => {
      const stop = byId.get(item.id);
      return stop ? [{ item, index, stop }] : [];
    });
    const sun = sunInfo(day, rows[0]?.stop.park ?? previous?.park);
    const timeline = buildTimeline(
      rows.map((row) => row.stop),
      sun.kind === "normal" ? sun.window : NOMINAL_SUN,
      previous,
    );
    dayViews.push({ day, date: dateOf(day), rows, sun, timeline });
    previous = rows.at(-1)?.stop ?? previous;
  }

  const allIds = tripIds(trip);
  const plannedCount = trip.days.flat().filter((item) => item.status === "planned").length;

  const runPlan = (fromDay: number) =>
    updateTrip((current: Trip) => ({
      ...current,
      days: planTrip(current, byId, sunWindow, fromDay),
      pool: [],
    }));
  const autoPlan = () => {
    if (plannedCount > 0 && !window.confirm(t.autoPlanConfirm)) return;
    runPlan(0);
  };
  const clearTrip = () => {
    if (window.confirm(t.clearConfirm)) resetTrip();
  };

  const seasonalNotes = (stop: AttractionWithPhoto, date: string | null) => {
    const notes: { text: string; tone: Tone }[] = [];
    if (date) {
      const month = monthOf(date);
      if (stop.openMonths && !stop.openMonths.includes(month)) {
        notes.push({ text: fill(t.warnings.closed, { months: formatMonths(stop.openMonths, text.units) }), tone: "warn" });
      } else if (stop.bestMonths && !stop.bestMonths.includes(month)) {
        notes.push({ text: fill(t.warnings.notBest, { months: formatMonths(stop.bestMonths, text.units) }), tone: "info" });
      }
    }
    if (stop.permit) notes.push({ text: t.warnings.permit, tone: "warn" });
    return notes;
  };

  const mapIndex = Math.min(mapDay, trip.days.length - 1);
  const mapRows = dayViews[mapIndex]?.rows ?? [];
  const mapPoints: MapPoint[] =
    mapRows.length > 0
      ? mapRows.map(({ stop }, k) => ({
          id: stop.id,
          lat: stop.lat,
          lon: stop.lon,
          label: stop.nameZh,
          color: KIND_COLORS[stop.kind],
          order: k + 1,
        }))
      : allIds.flatMap((id) => {
          const stop = byId.get(id);
          return stop
            ? [{ id, lat: stop.lat, lon: stop.lon, label: stop.nameZh, color: KIND_COLORS[stop.kind] }]
            : [];
        });

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs ${
      active
        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
        : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
    }`;
  const iconButton =
    "rounded-md px-1.5 py-0.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 dark:hover:bg-stone-800 dark:hover:text-stone-100";
  const card = "rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900";

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
            className="mt-1 block rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-sm text-stone-900 dark:border-stone-700 dark:text-stone-100"
          />
        </label>
        <label className="text-xs text-stone-500">
          {t.days}
          <select
            value={trip.dayCount}
            onChange={(event) => updateTrip((current) => resizeDays(current, Number(event.target.value)))}
            className="mt-1 block rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-sm text-stone-900 dark:border-stone-700 dark:text-stone-100"
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
        <button type="button" className={buttonSecondary} onClick={clearTrip} disabled={allIds.length === 0}>
          {t.clear}
        </button>
        {!trip.startDate && <p className="basis-full text-xs text-amber-700 dark:text-amber-400">{t.noDate}</p>}
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
                  <li
                    key={id}
                    className="flex items-center gap-1 rounded-full bg-stone-100 py-1 pr-1 pl-3 text-xs dark:bg-stone-800"
                  >
                    {byId.get(id)?.nameZh ?? id}
                    <button
                      type="button"
                      aria-label={t.actions.remove}
                      title={t.actions.remove}
                      className={iconButton}
                      onClick={() => removeFromTrip(id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dayViews.map(({ day, date, rows, sun, timeline }) => {
            const parkNames = [...new Set(rows.map((row) => row.stop.park))].map(
              (code) => parkByCode.get(code)?.nameZh ?? code,
            );
            return (
              <section key={day} className={card}>
                <header className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
                  <div>
                    <h2 className="font-semibold">
                      {fill(t.day, { n: day + 1 })}{" "}
                      {date && (
                        <span className="text-sm font-normal text-stone-500">
                          {dateFormat.format(new Date(`${date}T00:00:00Z`))}
                        </span>
                      )}
                    </h2>
                    {parkNames.length > 0 && <p className="text-xs text-stone-500">{parkNames.join(" → ")}</p>}
                  </div>
                  <div className="text-right text-xs text-stone-500">
                    {sun.kind === "normal" && (
                      <p>
                        {fill(t.sunrise, { time: formatClock(sun.window.sunrise) })} ·{" "}
                        {fill(t.sunset, { time: formatClock(sun.window.sunset) })}
                      </p>
                    )}
                    {sun.kind === "polar-day" && <p>{t.polarDay}</p>}
                    {sun.kind === "polar-night" && <p>{t.polarNight}</p>}
                    {rows.length > 0 && (
                      <p>
                        {fill(t.summary, { active: duration(timeline.activeMin), drive: duration(timeline.driveMin) })}
                      </p>
                    )}
                  </div>
                </header>

                {timeline.overloaded && (
                  <p className="bg-red-50 px-4 py-2 text-xs text-red-800 dark:bg-red-950/60 dark:text-red-200">
                    {t.warnings.overloaded}
                  </p>
                )}

                {rows.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-stone-500">{t.empty_day}</p>
                ) : (
                  <ol className="divide-y divide-stone-100 dark:divide-stone-800">
                    {rows.map(({ item, index, stop }, k) => {
                      const entry = timeline.entries[k];
                      const finished = item.status !== "planned";
                      const notes = finished
                        ? []
                        : [
                            ...seasonalNotes(stop, date),
                            ...entry.warnings.map((w) => ({ text: t.warnings[w], tone: "warn" as Tone })),
                          ];
                      const edit = (change: (current: Trip) => Trip) => updateTrip(change);
                      return (
                        <li key={item.id} className="px-4 py-3">
                          {entry.driveMin > 0 && (
                            <p className="mb-1 text-xs text-stone-500">🚗 {fill(t.drive, { d: duration(entry.driveMin) })}</p>
                          )}
                          {entry.waitMin >= 30 && (
                            <p className="mb-1 text-xs text-stone-400">☕ {fill(t.free, { d: duration(entry.waitMin) })}</p>
                          )}
                          <div className="flex items-start gap-3">
                            <span className="w-24 shrink-0 pt-0.5 text-xs text-stone-500 tabular-nums">
                              {formatClock(entry.start)}–{formatClock(entry.end)}
                            </span>
                            <div className={`min-w-0 flex-1 ${finished ? "opacity-50" : ""}`}>
                              <p className={`text-sm font-medium ${item.status === "done" ? "line-through" : ""}`}>
                                <span
                                  className="mr-1.5 inline-block size-2 rounded-full align-middle"
                                  style={{ backgroundColor: KIND_COLORS[stop.kind] }}
                                />
                                {stop.nameZh} <span className="text-xs font-normal text-stone-500">{stop.nameEn}</span>
                              </p>
                              <p className="text-xs text-stone-500">
                                {text.kinds[stop.kind]} · {duration(stop.durationMin)}
                                {item.status !== "planned" && ` · ${t.status[item.status]}`}
                              </p>
                              {notes.length > 0 && (
                                <ul className="mt-1 flex flex-wrap gap-1">
                                  {notes.map((note) => (
                                    <li
                                      key={note.text}
                                      className={`rounded px-1.5 py-0.5 text-[11px] ${
                                        note.tone === "warn"
                                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                          : "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200"
                                      }`}
                                    >
                                      {note.text}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-wrap justify-end gap-0.5">
                              <button type="button" className={iconButton} title={t.actions.up} aria-label={t.actions.up}
                                disabled={index === 0} onClick={() => edit((c) => moveWithinDay(c, day, index, -1))}>↑</button>
                              <button type="button" className={iconButton} title={t.actions.down} aria-label={t.actions.down}
                                disabled={index === trip.days[day].length - 1} onClick={() => edit((c) => moveWithinDay(c, day, index, 1))}>↓</button>
                              <button type="button" className={iconButton} title={t.actions.prevDay} aria-label={t.actions.prevDay}
                                disabled={day === 0} onClick={() => edit((c) => moveToDay(c, day, index, day - 1))}>←</button>
                              <button type="button" className={iconButton} title={t.actions.nextDay} aria-label={t.actions.nextDay}
                                disabled={day === trip.days.length - 1} onClick={() => edit((c) => moveToDay(c, day, index, day + 1))}>→</button>
                              {finished ? (
                                <button type="button" className={iconButton}
                                  onClick={() => edit((c) => setItemStatus(c, day, index, "planned"))}>{t.status.undo}</button>
                              ) : (
                                <>
                                  <button type="button" className={iconButton}
                                    onClick={() => edit((c) => setItemStatus(c, day, index, "done"))}>✓ {t.status.done}</button>
                                  <button type="button" className={iconButton}
                                    onClick={() => edit((c) => setItemStatus(c, day, index, "skipped"))}>{t.status.skipped}</button>
                                </>
                              )}
                              <button type="button" className={iconButton} title={t.actions.remove} aria-label={t.actions.remove}
                                onClick={() => edit((c) => removeItem(c, day, index))}>✕</button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
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
                <button
                  type="button"
                  className={buttonPrimary}
                  onClick={() => runPlan(Math.min(today, trip.days.length - 1))}
                >
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
                      <span
                        className="mr-1.5 inline-block size-2 rounded-full align-middle"
                        style={{ backgroundColor: KIND_COLORS[a.kind] }}
                      />
                      {a.nameZh}
                      <span className="ml-2 text-xs text-stone-500">{duration(a.durationMin)}</span>
                    </span>
                    <AddToTripButton id={a.id} text={text.trip} />
                  </li>
                ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-2 lg:sticky lg:top-4">
            {trip.days.length > 1 && (
              <div className="flex flex-wrap gap-1" role="group" aria-label={t.showOnMap}>
                {trip.days.map((_, day) => (
                  <button key={day} type="button" className={chip(day === mapIndex)} onClick={() => setMapDay(day)}>
                    {fill(t.day, { n: day + 1 })}
                  </button>
                ))}
              </div>
            )}
            <ParkMap points={mapPoints} showRoute={mapRows.length > 1} text={text.map} className="h-80 lg:h-[70vh]" />
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-500">{t.credit}</p>
    </div>
  );
}
