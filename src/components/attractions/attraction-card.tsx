"use client";

import { CreditedPhoto } from "@/components/credited-photo";
import { AddToTripButton } from "@/components/trip/add-to-trip-button";
import { buttonSecondary } from "@/components/ui";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDuration, formatKm, formatMeters, formatMonths } from "@/i18n/format";
import { KIND_COLORS } from "./kinds";

export type AttractionText = Pick<
  Dictionary,
  "attraction" | "kinds" | "difficulty" | "timeOfDay" | "units" | "trip" | "map"
>;

export function AttractionCard({
  attraction: a,
  text,
  selected,
  onShowOnMap,
}: {
  attraction: AttractionWithPhoto;
  text: AttractionText;
  selected: boolean;
  onShowOnMap: () => void;
}) {
  const t = text.attraction;
  const destination = a.start ?? a;

  return (
    <article
      id={`attraction-${a.id}`}
      className={`scroll-mt-4 overflow-hidden rounded-2xl border bg-white transition dark:bg-stone-900 ${
        selected ? "border-emerald-500 ring-2 ring-emerald-500/40" : "border-stone-200 dark:border-stone-800"
      }`}
    >
      {a.photo && (
        <CreditedPhoto
          photo={a.photo}
          alt={`${a.nameZh} ${a.nameEn}`}
          creditTemplate={t.photoCredit}
          sizes="(min-width: 1024px) 400px, 100vw"
          className="h-44"
        />
      )}

      <div className="space-y-3 p-4">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{a.nameZh}</h3>
            {a.mustSee && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white">
                {t.mustSee}
              </span>
            )}
            {a.outsidePark && (
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                {t.outsidePark}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500">{a.nameEn}</p>
        </header>

        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
          <li className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ backgroundColor: KIND_COLORS[a.kind] }} />
            {text.kinds[a.kind]}
          </li>
          <li>{fill(t.duration, { d: formatDuration(a.durationMin, text.units) })}</li>
          {a.hike?.distanceMi && (
            <li>
              {formatKm(a.hike.distanceMi, text.units)}
              {a.hike.loop ? ` · ${t.loop}` : ""}
            </li>
          )}
          {a.hike?.gainFt && <li>{formatMeters(a.hike.gainFt, text.units)}</li>}
          {a.hike && <li>{text.difficulty[a.hike.difficulty]}</li>}
          {a.bestTime && <li>{a.bestTime.map((time) => text.timeOfDay[time]).join(" / ")}</li>}
        </ul>

        {(a.openMonths || a.bestMonths || a.permit) && (
          <ul className="flex flex-wrap gap-1.5 text-[11px]">
            {a.openMonths && (
              <li className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                {fill(t.openMonths, { months: formatMonths(a.openMonths, text.units) })}
              </li>
            )}
            {a.bestMonths && (
              <li className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-900 dark:bg-sky-950 dark:text-sky-200">
                {fill(t.bestMonths, { months: formatMonths(a.bestMonths, text.units) })}
              </li>
            )}
            {a.permit && (
              <li className="rounded bg-red-100 px-1.5 py-0.5 text-red-900 dark:bg-red-950 dark:text-red-200">
                {t.permit}
              </li>
            )}
          </ul>
        )}

        <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{a.summary}</p>

        {(a.tips || a.permit || a.start) && (
          <details className="text-sm">
            <summary className="cursor-pointer text-emerald-700 dark:text-emerald-400">{t.tips}</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-600 dark:text-stone-400">
              {a.permit && <li>{a.permit}</li>}
              {a.tips?.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
              {a.start && <li>{fill(t.start, { name: a.start.nameZh })}</li>}
            </ul>
          </details>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <AddToTripButton id={a.id} text={text.trip} />
          <button type="button" className={buttonSecondary} onClick={onShowOnMap}>
            {t.showOnMap}
          </button>
          <a
            className={buttonSecondary}
            href={`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lon}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.navigate}
          </a>
        </div>
      </div>
    </article>
  );
}
