"use client";

import { useState, type FormEvent } from "react";
import { IconArrowRight } from "@/components/icons";
import { buttonLarge } from "@/components/ui";
import type { Airport } from "@/data/airports";
import { fill } from "@/i18n/format";
import type { LodgingPref, Pace } from "@/lib/generate-trip";
import { searchPlaces, type PlaceResult } from "@/lib/geocode";
import { MAX_DAYS } from "@/lib/trip-store";
import type { PlannerPark, PlannerText } from "./types";

/** 出发地 / 回程地：机场或搜到的地点 */
export interface WizardPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface WizardInput {
  /** 第一个是主要的公园，后面是顺路一起玩的 */
  parks: string[];
  month: number;
  startDate: string;
  days: number;
  origin: WizardPlace;
  destination: WizardPlace;
  pace: Pace;
  lodgingPref: LodgingPref;
}

const PACES: Pace[] = ["relaxed", "normal", "packed"];
const LODGING_PREFS: LodgingPref[] = ["any", "hotel", "rental"];

const chip = (active: boolean) =>
  `border px-3 py-1.5 text-xs transition-colors ${
    active ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink hover:border-ink"
  }`;

const airportPlace = (airport: Airport): WizardPlace => ({
  id: airport.code,
  name: `${airport.nameZh}（${airport.code}）`,
  lat: airport.lat,
  lon: airport.lon,
});

/** 选地点：公园常用机场一键选，或者搜任意城市、地址 */
function PlacePicker({
  label,
  value,
  onChange,
  quick,
  near,
  text,
}: {
  label: string;
  value: WizardPlace | null;
  onChange: (place: WizardPlace) => void;
  quick: WizardPlace[];
  near: { lat: number; lon: number };
  text: PlannerText["plan"]["wizard"];
}) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    try {
      setResults(await searchPlaces(query.trim(), near));
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  const customValue = value && !quick.some((place) => place.id === value.id) ? value : null;

  return (
    <div>
      <p className="eyebrow text-mute">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {quick.map((place) => (
          <button
            key={place.id}
            type="button"
            aria-pressed={value?.id === place.id}
            className={chip(value?.id === place.id)}
            onClick={() => onChange(place)}
          >
            {place.name}
          </button>
        ))}
        {customValue && <span className={chip(true)}>{customValue.name}</span>}
        <button type="button" className={chip(false)} onClick={() => setSearching((open) => !open)}>
          {text.otherPlace}
        </button>
      </div>
      {searching && (
        <div className="mt-3 max-w-md">
          <form onSubmit={search} className="flex gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.searchPlaceholder}
              className="min-w-0 flex-1 border-b border-ink/30 bg-transparent py-1.5 text-sm focus:border-ink focus:outline-none"
            />
            <button type="submit" className="link-line text-xs tracking-[0.1em]" disabled={busy}>
              {busy ? text.searching : text.search}
            </button>
          </form>
          {results && results.length === 0 && <p className="mt-2 text-xs text-mute">{text.noResults}</p>}
          {results && results.length > 0 && (
            <ul className="mt-2 divide-y divide-line bg-paper">
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left hover:bg-paper-deep"
                    onClick={() => {
                      onChange({ id: place.id, name: place.name, lat: place.lat, lon: place.lon });
                      setSearching(false);
                      setResults(null);
                      setQuery("");
                    }}
                  >
                    <span className="block text-sm">{place.name}</span>
                    <span className="block truncate text-xs text-mute">{place.detail}</span>
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

/** 自动生成攻略：公园、月份、天数、出发地和回程地、节奏 */
export function TripWizard({
  parks,
  airports,
  text,
  busy,
  error,
  onGenerate,
}: {
  parks: PlannerPark[];
  airports: Record<string, Airport>;
  text: PlannerText;
  busy: boolean;
  error: string | null;
  onGenerate: (input: WizardInput) => void;
}) {
  const t = text.plan.wizard;
  const nextMonth = (new Date().getMonth() + 1) % 12 + 1;
  const [parkCode, setParkCode] = useState(parks[0]?.code ?? "");
  const [extraParks, setExtraParks] = useState<string[]>([]);
  const [lodgingPref, setLodgingPref] = useState<LodgingPref>("any");
  const [month, setMonth] = useState(nextMonth);
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(3);
  const [pace, setPace] = useState<Pace>("normal");
  const [origin, setOrigin] = useState<WizardPlace | null>(null);
  const [sameReturn, setSameReturn] = useState(true);
  const [destination, setDestination] = useState<WizardPlace | null>(null);

  const park = parks.find((p) => p.code === parkCode) ?? parks[0];
  const companions = park.nearby.flatMap((code) => parks.filter((p) => p.code === code));
  const selectedParks = [park, ...companions.filter((p) => extraParks.includes(p.code))];
  // 几个公园的常用机场合在一起，主要公园的排前面
  const quick = [...new Set(selectedParks.flatMap((p) => p.airports))]
    .map((code) => airports[code])
    .filter(Boolean)
    .map(airportPlace);
  const toggleCompanion = (code: string) =>
    setExtraParks((current) => (current.includes(code) ? current.filter((c) => c !== code) : [...current, code]));
  // 换公园时，出发地默认成新公园的第一个常用机场
  const originValue = origin && (quick.some((place) => place.id === origin.id) || !origin.id.match(/^[A-Z]{3}$/)) ? origin : quick[0] ?? null;
  const destinationValue = sameReturn ? originValue : (destination ?? originValue);

  const field = "mt-3 block w-full border-b border-ink/30 bg-transparent py-1.5 text-sm focus:border-ink focus:outline-none";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!originValue || !destinationValue) return;
    onGenerate({
      parks: selectedParks.map((p) => p.code),
      month: startDate ? Number(startDate.slice(5, 7)) : month,
      startDate,
      days,
      origin: originValue,
      destination: destinationValue,
      pace,
      lodgingPref,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <label className="eyebrow text-mute">
          {t.park}
          <select
            value={park.code}
            onChange={(event) => {
              setParkCode(event.target.value);
              setExtraParks([]);
            }}
            className={`${field} tracking-normal normal-case text-ink`}
          >
            {parks.map((p) => (
              <option key={p.code} value={p.code}>
                {p.nameZh} {p.nameEn}
              </option>
            ))}
          </select>
        </label>
        <label className="eyebrow text-mute">
          {t.month}
          <select
            value={startDate ? Number(startDate.slice(5, 7)) : month}
            onChange={(event) => {
              setMonth(Number(event.target.value));
              setStartDate("");
            }}
            className={`${field} tracking-normal normal-case text-ink`}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {fill(t.monthOption, { m })}
              </option>
            ))}
          </select>
        </label>
        <label className="eyebrow text-mute">
          {t.date}
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={`${field} tracking-normal normal-case text-ink`}
          />
        </label>
        <label className="eyebrow text-mute">
          {t.days}
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className={`${field} tracking-normal normal-case text-ink`}>
            {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {fill(t.dayOption, { n })}
              </option>
            ))}
          </select>
        </label>
      </div>

      {companions.length > 0 && (
        <div>
          <p className="eyebrow text-mute">{t.together}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {companions.map((p) => (
              <button
                key={p.code}
                type="button"
                aria-pressed={extraParks.includes(p.code)}
                className={chip(extraParks.includes(p.code))}
                onClick={() => toggleCompanion(p.code)}
              >
                + {p.nameZh} {p.nameEn}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-6 text-mute">{t.togetherHint}</p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <PlacePicker
          label={t.origin}
          value={originValue}
          onChange={setOrigin}
          quick={quick}
          near={{ lat: park.lat, lon: park.lon }}
          text={t}
        />
        <div>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input type="checkbox" checked={sameReturn} onChange={(event) => setSameReturn(event.target.checked)} className="accent-ink" />
            {t.destination} · {t.sameAsOrigin}
          </label>
          {!sameReturn && (
            <div className="mt-4">
              <PlacePicker
                label={t.destination}
                value={destinationValue}
                onChange={setDestination}
                quick={quick}
                near={{ lat: park.lat, lon: park.lon }}
                text={t}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="eyebrow text-mute">{t.pace}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PACES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={pace === option}
              onClick={() => setPace(option)}
              className={`border p-4 text-left transition-colors ${
                pace === option ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"
              }`}
            >
              <span className="block font-serif text-lg">{t.paces[option]}</span>
              <span className={`mt-1 block text-xs ${pace === option ? "text-paper/70" : "text-mute"}`}>{t.paceHints[option]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow text-mute">{t.lodgingPref}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LODGING_PREFS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={lodgingPref === option}
              className={chip(lodgingPref === option)}
              onClick={() => setLodgingPref(option)}
            >
              {t.lodgingPrefs[option]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-6 text-mute">{t.lodgingPrefHints[lodgingPref]}</p>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={busy || !originValue} className={`${buttonLarge} bg-ink text-paper hover:bg-clay-700 disabled:opacity-50`}>
          {busy ? t.generating : t.generate}
          {!busy && <IconArrowRight className="text-base" />}
        </button>
        {error && <p className="text-sm text-clay-700">{error}</p>}
      </div>
    </form>
  );
}
