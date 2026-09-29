"use client";

import { useState } from "react";
import { IconArrowUpRight, IconCar, IconPlane } from "@/components/icons";
import { daysBetween, roundTrip } from "@/components/plan/flights-car";
import { buttonPrimary } from "@/components/ui";
import type { Airport } from "@/data/airports";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDuration } from "@/i18n/format";
import { addDays } from "@/lib/dates";
import { flightKey, saveFlight, useFlightStore } from "@/lib/flight-store";
import { carRates, carRatesDate, carRatesSource, DEFAULT_CAR_RATE } from "@/lib/prices/car-rates";
import {
  DC_FAST_PRICE,
  fuelPricesDate,
  gasSnapshot,
  MILES_PER_GALLON,
  MILES_PER_KWH,
  TRIP_STATES,
  type FuelGrade,
} from "@/lib/prices/fuel";
import type { GasPrices } from "@/lib/prices/gas";
import { googleFlightsUrl } from "@/lib/prices/google-tfs";
import { expediaCarsUrl, kayakCarsUrl, kayakFlightsUrl } from "@/lib/prices/links";
import type { FlightQuery, FlightResult } from "@/lib/prices/types";
import { airportMinutes } from "@/lib/travel";
import { updatePrefs, useTripPrefs } from "@/lib/trip-prefs";
import { useJson, useToday } from "@/lib/use-json";

export type PricesText = Dictionary["prices"] & { units: Dictionary["units"]; states: Record<string, string> };

export interface PricePark {
  code: string;
  nameZh: string;
  airports: string[];
  state: string;
}

const KM_PER_MILE = 1.609;
const IATA = /^[A-Z]{3}$/;
const GRADES: FuelGrade[] = ["regular", "midGrade", "premium", "diesel"];
const money = (amount: number) => `$${Math.round(amount).toLocaleString("en-US")}`;
const cents = (amount: number) => `$${amount.toFixed(2)}`;

function FlightPrice({ result, adults, text }: { result?: FlightResult; adults: number; text: PricesText }) {
  const best = result?.quotes[0];
  if (!best) return null;
  const stops = best.stops === 0 ? text.nonstop : fill(text.stops, { n: best.stops });
  return (
    <div className="text-right">
      <p>
        <span className="text-base font-medium tabular-nums">{fill(text.from, { price: money(best.price) })}</span>
        {adults > 1 && <span className="ml-2 text-xs text-mute">{fill(text.perPerson, { price: money(best.price / adults) })}</span>}
      </p>
      <p className="mt-0.5 text-xs text-mute">
        {[best.airlines.slice(0, 2).join(" / "), stops, result?.priceLevel ? text.level[result.priceLevel] : null]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {result?.typicalRange && (
        <p className="text-[11px] text-mute">
          {fill(text.typical, { low: money(result.typicalRange[0]), high: money(result.typicalRange[1]) })}
        </p>
      )}
    </div>
  );
}

export function PriceCenter({
  airports,
  parks,
  locale,
  text,
}: {
  airports: Record<string, Airport>;
  parks: PricePark[];
  locale: string;
  text: PricesText;
}) {
  const hl = locale === "zh-Hant" ? "zh-TW" : "zh-CN";
  const prefs = useTripPrefs();
  const store = useFlightStore();
  const today = useToday();
  const defaultOut = today ? addDays(today, 30) : "";

  // ---------- 机票 ----------
  const [homeDraft, setHomeDraft] = useState<string | null>(null);
  const [destination, setDestination] = useState("SLC");
  const [out, setOut] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [comparePark, setComparePark] = useState(parks.find((p) => p.code === "yell")?.code ?? parks[0]?.code ?? "");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"notConfigured" | "failed" | null>(null);
  const home = prefs.homeAirport;
  const adults = prefs.travelers;
  const outDate = out ?? defaultOut;
  const backDate = back ?? (outDate ? addDays(outDate, 7) : "");
  const query = (to: string): FlightQuery | null => {
    if (!IATA.test(home) || !IATA.test(to) || !outDate || home === to) return null;
    return backDate
      ? roundTrip(home, to, outDate, backDate, adults)
      : { legs: [{ from: home, to, date: outDate }], adults };
  };
  const park = parks.find((p) => p.code === comparePark);
  const compareRows = (park?.airports ?? [])
    .map((code) => ({ airport: airports[code], minutes: park ? airportMinutes(code, park.code) : null }))
    .filter((row): row is { airport: Airport; minutes: number | null } => Boolean(row.airport))
    .sort((a, b) => (a.minutes ?? 9999) - (b.minutes ?? 9999));

  const check = async (queries: (FlightQuery | null)[]) => {
    setChecking(true);
    setStatus(null);
    let failed = false;
    try {
      for (const q of queries) {
        if (!q) continue;
        const legs = q.legs.map((leg) => `${leg.from}.${leg.to}.${leg.date}`).join("|");
        const res = await fetch(`/api/prices/flights?legs=${legs}&adults=${q.adults}`);
        const body = (await res.json().catch(() => null)) as { configured?: boolean; result?: FlightResult | null } | null;
        if (body?.configured === false) {
          setStatus("notConfigured");
          return;
        }
        if (body?.result) saveFlight(body.result);
        else failed = true;
      }
      if (failed) setStatus("failed");
    } catch {
      setStatus("failed");
    } finally {
      setChecking(false);
    }
  };
  const links = (q: FlightQuery) => (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      <a href={googleFlightsUrl(q, hl)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
        Google Flights <IconArrowUpRight />
      </a>
      <a href={kayakFlightsUrl(q)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
        Kayak <IconArrowUpRight />
      </a>
    </span>
  );

  // ---------- 租车 ----------
  const [pickup, setPickup] = useState("SLC");
  const [dropoff, setDropoff] = useState<string | null>(null);
  const [carFrom, setCarFrom] = useState<string | null>(null);
  const [carTo, setCarTo] = useState<string | null>(null);
  const rentFrom = carFrom ?? defaultOut;
  const rentTo = carTo ?? (rentFrom ? addDays(rentFrom, 7) : "");
  const drop = dropoff ?? pickup;
  const rentDays = rentFrom && rentTo ? daysBetween(rentFrom, rentTo) : 7;
  const rate = carRates[pickup];
  const carQuery = rentFrom && rentTo ? { pickup, dropoff: drop, from: rentFrom, to: rentTo } : null;
  const airportParks = (code: string) => parks.filter((p) => p.airports.includes(code)).map((p) => p.nameZh);
  const airportList = Object.values(airports).sort((a, b) => a.code.localeCompare(b.code));

  // ---------- 油价 ----------
  const gasData = useJson<GasPrices>("/api/prices/gas");
  const gas = gasData ?? { states: gasSnapshot, date: fuelPricesDate, live: false };
  const [km, setKm] = useState(1500);
  const [mpg, setMpg] = useState(MILES_PER_GALLON);
  const [fuelState, setFuelState] = useState("UT");
  const miles = km / KM_PER_MILE;
  const gasCost = (miles / Math.max(mpg, 1)) * (gas.states[fuelState]?.regular ?? 5);
  const evCost = (miles / MILES_PER_KWH) * DC_FAST_PRICE;
  const statesParks = (state: string) => parks.filter((p) => p.state === state).map((p) => p.nameZh);

  const field =
    "mt-2 block border-b border-ink/30 bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none";
  const airportOptions = (
    <>
      {parks.map((p) => (
        <optgroup key={p.code} label={p.nameZh}>
          {p.airports
            .filter((code) => airports[code])
            .map((code) => (
              <option key={`${p.code}-${code}`} value={code}>
                {code} · {airports[code].nameZh}
              </option>
            ))}
        </optgroup>
      ))}
    </>
  );

  return (
    <div className="space-y-24">
      {/* 机票 */}
      <section id="flights" className="scroll-mt-32 border-t border-ink pt-6">
        <p className="eyebrow text-mute">{text.flightsEyebrow}</p>
        <h2 className="mt-4 flex items-center gap-3 font-serif text-3xl">
          <IconPlane className="text-2xl text-mute" /> {text.flightsTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{text.flightsIntro}</p>

        <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-5">
          <label className="eyebrow text-mute">
            {text.home}
            <input
              value={homeDraft ?? home}
              placeholder={text.homePlaceholder}
              maxLength={3}
              onChange={(event) => {
                const value = event.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                setHomeDraft(value);
                if (IATA.test(value) || value === "") updatePrefs({ homeAirport: value });
              }}
              onBlur={() => setHomeDraft(null)}
              className={`${field} w-28 uppercase`}
            />
          </label>
          <label className="eyebrow text-mute">
            {text.to}
            <select value={destination} onChange={(event) => setDestination(event.target.value)} className={field}>
              {airportOptions}
            </select>
          </label>
          <label className="eyebrow text-mute">
            {text.depart}
            <input type="date" value={outDate} onChange={(event) => setOut(event.target.value)} className={field} />
          </label>
          <label className="eyebrow text-mute">
            {text.return}
            <input type="date" value={backDate} onChange={(event) => setBack(event.target.value)} className={field} />
          </label>
          <label className="eyebrow text-mute">
            {text.travelers}
            <select value={adults} onChange={(event) => updatePrefs({ travelers: Number(event.target.value) })} className={field}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {fill(text.travelersOption, { n })}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={buttonPrimary} disabled={checking || !query(destination)} onClick={() => check([query(destination)])}>
            {checking ? text.checking : text.check}
          </button>
        </div>
        <p className="mt-3 text-xs text-mute">{backDate ? text.roundTripHint : text.oneWayHint}</p>
        {!home && <p className="mt-2 text-xs text-clay-700">{text.needHome}</p>}
        {status === "notConfigured" && <p className="mt-2 text-xs text-clay-700">{text.notConfigured}</p>}
        {status === "failed" && <p className="mt-2 text-xs text-clay-700">{text.failed}</p>}

        {(() => {
          const q = query(destination);
          if (!q) return null;
          const result = store[flightKey(q)];
          return (
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div>
                <p className="text-sm">
                  {home} {backDate ? "⇄" : "→"} {destination} {airports[destination]?.city}
                </p>
                <div className="mt-2">{links(q)}</div>
                {result && (
                  <p className="mt-2 text-[11px] text-mute">
                    {fill(text.fetched, { time: new Date(result.fetchedAt).toLocaleString(hl), source: result.source })}
                  </p>
                )}
              </div>
              <FlightPrice result={result} adults={adults} text={text} />
            </div>
          );
        })()}

        <div className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.1em] text-ink-soft">{text.compareTitle}</p>
              <p className="mt-1 text-[11px] text-mute">{fill(text.compareHint, { n: adults })}</p>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="eyebrow text-mute">
                {text.park}
                <select value={comparePark} onChange={(event) => setComparePark(event.target.value)} className={field}>
                  {parks.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.nameZh}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={buttonPrimary}
                disabled={checking || !IATA.test(home)}
                onClick={() => check(compareRows.map((row) => query(row.airport.code)))}
              >
                {checking ? text.checking : text.checkAll}
              </button>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {compareRows.map(({ airport, minutes }) => {
              const q = query(airport.code);
              return (
                <li key={airport.code} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p>
                      <span className="font-medium tabular-nums">{airport.code}</span>
                      <span className="ml-2">{airport.nameZh}</span>
                      <span className="ml-2 text-xs text-mute">{airport.city}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-mute">
                      <IconCar className="text-sm" />
                      {minutes !== null && park
                        ? fill(text.driveTo, { park: park.nameZh, d: formatDuration(minutes, text.units) })
                        : "—"}
                    </p>
                    {q && <div className="mt-1">{links(q)}</div>}
                  </div>
                  <FlightPrice result={q ? store[flightKey(q)] : undefined} adults={adults} text={text} />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 租车 */}
      <section id="car" className="scroll-mt-32 border-t border-ink pt-6">
        <p className="eyebrow text-mute">{text.carEyebrow}</p>
        <h2 className="mt-4 flex items-center gap-3 font-serif text-3xl">
          <IconCar className="text-2xl text-mute" /> {text.carTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{text.carIntro}</p>

        <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-5">
          <label className="eyebrow text-mute">
            {text.pickup}
            <select value={pickup} onChange={(event) => setPickup(event.target.value)} className={field}>
              {airportList.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} · {a.nameZh}
                </option>
              ))}
            </select>
          </label>
          <label className="eyebrow text-mute">
            {text.dropoff}
            <select value={drop} onChange={(event) => setDropoff(event.target.value)} className={field}>
              {airportList.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} · {a.nameZh}
                </option>
              ))}
            </select>
          </label>
          <label className="eyebrow text-mute">
            {text.pickupDate}
            <input type="date" value={rentFrom} onChange={(event) => setCarFrom(event.target.value)} className={field} />
          </label>
          <label className="eyebrow text-mute">
            {text.dropoffDate}
            <input type="date" value={rentTo} onChange={(event) => setCarTo(event.target.value)} className={field} />
          </label>
        </div>

        <div className="mt-6 grid gap-6 border border-line bg-paper px-4 py-4 sm:grid-cols-[1fr_auto]">
          <div className="text-sm leading-7">
            <p>
              {fill(text.carEstimate, {
                days: rentDays,
                car: money(rentDays * (rate?.car ?? DEFAULT_CAR_RATE)),
                suv: rate?.suv ? money(rentDays * rate.suv) : "—",
              })}
            </p>
            <p className="text-xs text-mute">
              {rate
                ? fill(text.carRate, { airport: pickup, car: money(rate.car), suv: rate.suv ? money(rate.suv) : "—", date: carRatesDate, source: carRatesSource })
                : fill(text.carNoRate, { rate: money(DEFAULT_CAR_RATE) })}
            </p>
            {drop !== pickup && <p className="mt-1 text-xs text-clay-700">{text.oneWay}</p>}
          </div>
          {carQuery && (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <a href={kayakCarsUrl(carQuery)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
                Kayak <IconArrowUpRight />
              </a>
              <a href={expediaCarsUrl(carQuery)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
                Expedia <IconArrowUpRight />
              </a>
            </p>
          )}
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink text-xs text-mute">
                <th className="py-2 pr-4 font-normal">{text.table.airport}</th>
                <th className="py-2 pr-4 font-normal">{text.table.parks}</th>
                <th className="py-2 pr-4 text-right font-normal">{text.table.car}</th>
                <th className="py-2 text-right font-normal">{text.table.suv}</th>
              </tr>
            </thead>
            <tbody>
              {airportList.map((a) => {
                const r = carRates[a.code];
                return (
                  <tr
                    key={a.code}
                    className={`cursor-pointer border-b border-line transition-colors hover:bg-paper-deep/60 ${a.code === pickup ? "bg-paper-deep" : ""}`}
                    onClick={() => setPickup(a.code)}
                  >
                    <td className="py-2.5 pr-4">
                      <span className="font-medium tabular-nums">{a.code}</span>
                      <span className="ml-2">{a.nameZh}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-ink-soft">{airportParks(a.code).join("、") || "—"}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{r ? money(r.car) : "—"}</td>
                    <td className="py-2.5 text-right tabular-nums">{r?.suv ? money(r.suv) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-5 space-y-1 text-xs leading-6 text-mute">
          {text.carNotes.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      </section>

      {/* 油价 */}
      <section id="gas" className="scroll-mt-32 border-t border-ink pt-6">
        <p className="eyebrow text-mute">{text.gasEyebrow}</p>
        <h2 className="mt-4 font-serif text-3xl">{text.gasTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{text.gasIntro}</p>
        <p className="mt-2 text-xs text-mute">
          {fill(gas.live ? text.gasLive : text.gasSnapshot, { date: gas.date })}
          {gas.national ? ` · ${fill(text.national, { price: cents(gas.national) })}` : ""}
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink text-xs text-mute">
                <th className="py-2 pr-4 font-normal">{text.table.state}</th>
                {GRADES.map((grade) => (
                  <th key={grade} className="py-2 pr-4 text-right font-normal">
                    {text.grades[grade]}
                  </th>
                ))}
                <th className="py-2 font-normal">{text.table.parks}</th>
              </tr>
            </thead>
            <tbody>
              {TRIP_STATES.map((state) => {
                const fuel = gas.states[state];
                if (!fuel) return null;
                return (
                  <tr key={state} className="border-b border-line">
                    <td className="py-2.5 pr-4">
                      {text.states[state] ?? state}
                      <span className="ml-1.5 text-xs text-mute">{state}</span>
                    </td>
                    {GRADES.map((grade) => (
                      <td key={grade} className={`py-2.5 pr-4 text-right tabular-nums ${grade === "regular" ? "font-medium" : "text-ink-soft"}`}>
                        {fuel[grade] !== undefined ? cents(fuel[grade]) : "—"}
                      </td>
                    ))}
                    <td className="py-2.5 text-xs text-ink-soft">{statesParks(state).join("、") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-8 border border-line bg-paper p-5 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <label className="eyebrow text-mute">
              {text.distance}
              <input
                type="number"
                min={0}
                step={50}
                value={km}
                onChange={(event) => setKm(Math.max(0, Number(event.target.value)))}
                className={`${field} w-28 tabular-nums`}
              />
            </label>
            <label className="eyebrow text-mute">
              {text.mpg}
              <input
                type="number"
                min={10}
                max={60}
                value={mpg}
                onChange={(event) => setMpg(Number(event.target.value))}
                className={`${field} w-20 tabular-nums`}
              />
            </label>
            <label className="eyebrow text-mute">
              {text.fuelState}
              <select value={fuelState} onChange={(event) => setFuelState(event.target.value)} className={field}>
                {TRIP_STATES.map((state) => (
                  <option key={state} value={state}>
                    {text.states[state] ?? state}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="space-y-1 text-sm leading-7">
            <p>
              {fill(text.gasCost, {
                km: km.toLocaleString("en-US"),
                mi: Math.round(miles).toLocaleString("en-US"),
                gallons: (miles / Math.max(mpg, 1)).toFixed(0),
                cost: money(gasCost),
              })}
            </p>
            <p className="text-ink-soft">
              {fill(text.evCost, { kwh: (miles / MILES_PER_KWH).toFixed(0), cost: money(evCost), price: cents(DC_FAST_PRICE), eff: MILES_PER_KWH })}
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-1 text-xs leading-6 text-mute">
          {text.gasNotes.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
