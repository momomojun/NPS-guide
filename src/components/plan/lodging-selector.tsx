"use client";

import { useState, type FormEvent } from "react";
import { IconBed } from "@/components/icons";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { fill, formatDuration } from "@/i18n/format";
import { searchPlaces, type PlaceResult } from "@/lib/geocode";
import type { LodgingRank } from "@/lib/planner";
import type { TripLodging } from "@/lib/trip-store";
import type { PlannerText, ResolvedLodging } from "./types";

export function LodgingSelector({
  label,
  hint,
  current,
  status,
  ranked,
  previous,
  searchNear,
  text,
  onChange,
  measure,
}: {
  label: string;
  hint?: string;
  current?: ResolvedLodging;
  /** 当前住处的状态说明，比如“回 Springdale，约 19:05 到” */
  status?: string;
  /** 推荐住宿，已按车程排好 */
  ranked: LodgingRank<ResolvedLodging>[];
  /** 前一晚的住处，用于“和前一晚一样” */
  previous?: TripLodging | null;
  searchNear: { lat: number; lon: number };
  text: PlannerText;
  onChange: (lodging: TripLodging | null) => void;
  /** 自定义住处：向 OSRM 查到各景点的车程 */
  measure: (place: { lat: number; lon: number }) => Promise<Record<string, number>>;
}) {
  const t = text.plan.lodging;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [busy, setBusy] = useState<"searching" | "measuring" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const duration = (minutes: number) => formatDuration(minutes, text.units);
  const legs = (rank: LodgingRank<ResolvedLodging>) =>
    [
      rank.backMin !== undefined ? fill(t.backLeg, { d: duration(rank.backMin) }) : null,
      rank.outMin !== undefined ? fill(t.outLeg, { d: duration(rank.outMin) }) : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const choose = (lodging: TripLodging | null) => {
    onChange(lodging);
    setOpen(false);
    setResults(null);
    setQuery("");
  };

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy("searching");
    setNotice(null);
    try {
      setResults(await searchPlaces(query.trim(), searchNear));
    } catch {
      setResults([]);
    } finally {
      setBusy(null);
    }
  };

  const pickPlace = async (place: PlaceResult) => {
    setBusy("measuring");
    let minutes: Record<string, number> = {};
    try {
      minutes = await measure(place);
    } catch {
      setNotice(t.estimated);
    }
    setBusy(null);
    choose({ kind: "custom", id: `custom-${place.id}`, name: place.name, lat: place.lat, lon: place.lon, minutes });
  };

  const tag = (lodging: ResolvedLodging) =>
    lodging.custom ? null : (
      <span
        className={`ml-2 border px-1.5 text-[10px] ${
          lodging.inPark ? "border-pine-600/50 text-pine-700" : "border-line text-mute"
        }`}
      >
        {lodging.inPark ? t.inPark : t.outside}
      </span>
    );

  return (
    <div className="bg-paper-deep/70 px-4 py-3.5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-1">
            <IconBed className="mr-1 text-base text-mute" />
            <span className="text-mute">{label}：</span>
            {current ? (
              <span className="font-serif text-base">
                {current.name}
                {tag(current)}
              </span>
            ) : (
              <span className="text-mute">{t.unset}</span>
            )}
          </p>
          {current && status && <p className="mt-1 pl-6 text-xs text-mute">{status}</p>}
          {!current && hint && <p className="mt-1 pl-6 text-xs text-mute">{hint}</p>}
          {notice && <p className="mt-1 pl-6 text-xs text-clay-700">{notice}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {!current &&
            !open &&
            ranked.slice(0, 2).map((rank) => (
              <button
                key={rank.lodging.id}
                type="button"
                className={buttonSecondary}
                title={rank.lodging.note}
                onClick={() => choose({ kind: "option", id: rank.lodging.id })}
              >
                {rank.lodging.name}
                {rank.backMin !== undefined && <span className="ml-1 text-mute">{duration(rank.backMin)}</span>}
              </button>
            ))}
          <button type="button" className={buttonSecondary} onClick={() => setOpen((value) => !value)}>
            {open ? t.collapse : current ? t.change : t.choose}
          </button>
          {current && (
            <button type="button" className={buttonSecondary} onClick={() => choose(null)}>
              {t.clear}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          {previous && previous.id !== current?.id && (
            <button type="button" className={buttonSecondary} onClick={() => choose(previous)}>
              {t.sameAsLast}
            </button>
          )}

          {ranked.length > 0 && (
            <div>
              <p className="eyebrow mb-2 text-mute">{t.suggested}</p>
              <ul className="divide-y divide-line bg-paper">
                {ranked.slice(0, 6).map((rank) => (
                  <li key={rank.lodging.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-serif text-base">
                        {rank.lodging.name}
                        {tag(rank.lodging)}
                      </p>
                      {rank.lodging.note && <p className="mt-0.5 text-xs text-mute">{rank.lodging.note}</p>}
                      <p className="mt-0.5 text-xs text-ink-soft">{legs(rank)}</p>
                    </div>
                    <button
                      type="button"
                      className={`${buttonPrimary} shrink-0`}
                      onClick={() => choose({ kind: "option", id: rank.lodging.id })}
                    >
                      {t.pick}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={search} className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="min-w-0 flex-1 border-b border-ink/30 bg-transparent py-1.5 text-sm focus:border-ink focus:outline-none"
            />
            <button type="submit" className={buttonSecondary} disabled={busy !== null}>
              {busy === "searching" ? t.searching : t.search}
            </button>
          </form>
          {busy === "measuring" && <p className="text-xs text-mute">{t.measuring}</p>}
          {results && results.length === 0 && <p className="text-xs text-mute">{t.noResults}</p>}
          {results && results.length > 0 && (
            <ul className="divide-y divide-line bg-paper">
              {results.map((place) => (
                <li key={place.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base">{place.name}</p>
                    <p className="truncate text-xs text-mute">{place.detail}</p>
                  </div>
                  <button
                    type="button"
                    className={`${buttonPrimary} shrink-0`}
                    disabled={busy !== null}
                    onClick={() => pickPlace(place)}
                  >
                    {t.pick}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
