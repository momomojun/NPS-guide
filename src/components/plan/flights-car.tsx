"use client";

import { useState } from "react";
import { IconArrowUpRight, IconCar, IconPlane } from "@/components/icons";
import { buttonPrimary } from "@/components/ui";
import type { Airport } from "@/data/airports";
import { fill, formatDuration } from "@/i18n/format";
import { flightKey, saveFlight, type FlightStore } from "@/lib/flight-store";
import { carRates, carRatesDate, carRatesSource } from "@/lib/prices/car-rates";
import { googleFlightsUrl } from "@/lib/prices/google-tfs";
import { expediaCarsUrl, kayakCarsUrl, kayakFlightsUrl } from "@/lib/prices/links";
import type { FlightQuery, FlightResult } from "@/lib/prices/types";
import { airportMinutes } from "@/lib/travel";
import { updatePrefs, type TripPrefs } from "@/lib/trip-prefs";
import type { PlannerPark, PlannerText } from "./types";

/** 查过、还没过期（6 小时）的价格就不重查 */
const FRESH_MS = 6 * 60 * 60 * 1000;
const IATA = /^[A-Z]{3}$/;
const MAX_COMPARE = 4;
const isFresh = (result: FlightResult) => Date.now() - Date.parse(result.fetchedAt) < FRESH_MS;

const money = (amount: number) => `$${Math.round(amount).toLocaleString("en-US")}`;

export function roundTrip(home: string, airport: string, out: string, back: string, adults: number): FlightQuery {
  return {
    legs: [
      { from: home, to: airport, date: out },
      { from: airport, to: home, date: back },
    ],
    adults,
  };
}

/** 进出机场不一样时是两段的多城市行程 */
export function tripFlight(home: string, arrive: string, leave: string, out: string, back: string, adults: number): FlightQuery {
  return {
    legs: [
      { from: home, to: arrive, date: out },
      { from: leave, to: home, date: back },
    ],
    adults,
  };
}

export const daysBetween = (from: string, to: string) =>
  Math.max(1, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000));

export function FlightsCar({
  prefs,
  arrive,
  leave,
  fromTrip,
  firstPark,
  lastPark,
  airports,
  outDate,
  backDate,
  sameDayReturn,
  returnTime,
  monthOnly,
  formatDate,
  store,
  text,
  locale,
}: {
  prefs: TripPrefs;
  /** 飞到哪个机场：自动生成攻略时选的出发地，没有就是第一个公园最常用的机场 */
  arrive?: Airport;
  leave?: Airport;
  /** 进出机场是不是行程里定好的 */
  fromTrip: boolean;
  firstPark?: PlannerPark;
  lastPark?: PlannerPark;
  airports: Record<string, Airport>;
  outDate: string | null;
  backDate: string | null;
  sameDayReturn: boolean;
  /** 最后一天回到机场的时间，如 "17:30" */
  returnTime?: string;
  /** 只定了月份时，日期按那个月中旬估 */
  monthOnly: number | null;
  formatDate: (date: string) => string;
  store: FlightStore;
  text: PlannerText;
  locale: string;
}) {
  const t = text.plan.flights;
  const [homeDraft, setHomeDraft] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"notConfigured" | "failed" | null>(null);
  const hl = locale === "zh-Hant" ? "zh-TW" : "zh-CN";
  const home = prefs.homeAirport;
  const adults = prefs.travelers;
  const fly = prefs.flyAndRent;
  const hasDates = Boolean(outDate && backDate);

  const mainQuery =
    home && arrive && leave && outDate && backDate
      ? tripFlight(home, arrive.code, leave.code, outDate, backDate, adults)
      : null;
  const multiCity = arrive && leave && arrive.code !== leave.code;

  // 附近机场比较：第一个公园（和最后一个公园，如果不一样）的常用机场，都按同一个机场进出算往返
  const compareGroups = [firstPark, lastPark !== firstPark ? lastPark : undefined]
    .filter((park): park is PlannerPark => Boolean(park))
    .map((park) => {
      const codes = [...new Set([...park.airports, ...(park === firstPark && arrive ? [arrive.code] : [])])];
      // 只比开车最近的 4 个（加上行程本身用的），查价格时请求少一点
      const rows = codes
        .map((code) => ({ airport: airports[code], minutes: airportMinutes(code, park.code) }))
        .filter((row): row is { airport: Airport; minutes: number | null } => Boolean(row.airport))
        .sort((a, b) => (a.minutes ?? 9999) - (b.minutes ?? 9999));
      return {
        park,
        rows: rows.filter((row, i) => i < MAX_COMPARE || row.airport.code === arrive?.code || row.airport.code === leave?.code),
      };
    });

  const queries: FlightQuery[] = [];
  if (mainQuery) queries.push(mainQuery);
  if (home && outDate && backDate) {
    for (const group of compareGroups) {
      for (const row of group.rows) queries.push(roundTrip(home, row.airport.code, outDate, backDate, adults));
    }
  }
  const uniqueQueries = [...new Map(queries.map((query) => [flightKey(query), query])).values()].filter(
    (query) => query.legs.every((leg) => leg.from !== leg.to),
  );

  const checkPrices = async () => {
    setChecking(true);
    setStatus(null);
    let failed = false;
    try {
      for (const query of uniqueQueries) {
        const saved = store[flightKey(query)];
        if (saved && isFresh(saved)) continue;
        const legs = query.legs.map((leg) => `${leg.from}.${leg.to}.${leg.date}`).join("|");
        const res = await fetch(`/api/prices/flights?legs=${legs}&adults=${query.adults}`);
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

  const priceOf = (query: FlightQuery | null) => (query ? store[flightKey(query)] : undefined);
  const priceText = (result: FlightResult | undefined) => {
    const best = result?.quotes[0];
    if (!best) return null;
    const stops = best.stops === 0 ? t.nonstop : fill(t.stops, { n: best.stops });
    return (
      <>
        <span className="text-base font-medium text-ink tabular-nums">{fill(t.from, { price: money(best.price) })}</span>
        {adults > 1 && <span className="ml-2 text-xs text-mute">{fill(t.perPerson, { price: money(best.price / adults) })}</span>}
        <span className="mt-0.5 block text-xs text-mute">
          {[best.airlines.slice(0, 2).join(" / "), stops, result?.priceLevel ? t.level[result.priceLevel] : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </>
    );
  };
  const links = (query: FlightQuery) => (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      <a href={googleFlightsUrl(query, hl)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
        {t.openGoogle} <IconArrowUpRight />
      </a>
      <a href={kayakFlightsUrl(query)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
        {t.openKayak} <IconArrowUpRight />
      </a>
    </span>
  );

  const field =
    "mt-2 block border-b border-ink/30 bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none";
  const main = priceOf(mainQuery);
  const pickup = arrive?.code;
  const dropoff = leave?.code ?? pickup;
  const rate = pickup ? carRates[pickup] : undefined;
  const carQuery =
    pickup && dropoff && outDate && backDate ? { pickup, dropoff, from: outDate, to: backDate } : null;

  return (
    <section id="plan-flights" className="scroll-mt-32 border-t border-ink pt-5">
      <p className="eyebrow text-mute">{t.eyebrow}</p>
      <h2 className="mt-3 font-serif text-xl">{t.title}</h2>
      <p className="mt-2 text-xs leading-6 text-mute">{t.intro}</p>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
        <label className="eyebrow text-mute">
          {t.mode}
          <select
            value={fly ? "fly" : "drive"}
            onChange={(event) => updatePrefs({ flyAndRent: event.target.value === "fly" })}
            className={field}
          >
            <option value="fly">{t.modes.fly}</option>
            <option value="drive">{t.modes.drive}</option>
          </select>
        </label>
        {fly && (
          <label className="eyebrow text-mute">
            {t.home}
            <input
              value={homeDraft ?? home}
              placeholder={t.homePlaceholder}
              maxLength={3}
              title={t.homeHint}
              autoCapitalize="characters"
              onChange={(event) => {
                const value = event.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                setHomeDraft(value);
                if (IATA.test(value) || value === "") updatePrefs({ homeAirport: value });
              }}
              onBlur={() => setHomeDraft(null)}
              className={`${field} w-32 uppercase`}
            />
          </label>
        )}
        <label className="eyebrow text-mute">
          {t.travelers}
          <select
            value={adults}
            onChange={(event) => updatePrefs({ travelers: Number(event.target.value) })}
            className={field}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {fill(t.travelersOption, { n })}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!fly ? (
        <p className="mt-5 text-sm leading-7 text-ink-soft">{t.driveNote}</p>
      ) : (
        <div className="mt-6 space-y-6">
          {!fromTrip && <p className="text-xs leading-6 text-clay-700">{t.noAirport}</p>}
          {!hasDates ? (
            <p className="text-sm text-clay-700">{t.noDates}</p>
          ) : (
            <div className="text-xs leading-6 text-mute">
              <p className="text-sm text-ink">{fill(t.dates, { out: formatDate(outDate!), back: formatDate(backDate!) })}</p>
              <p>
                {fill(t.dateNote, { time: returnTime ?? "—", late: sameDayReturn ? t.sameDay : t.nextDay })}
                {monthOnly !== null && ` ${fill(t.monthOnly, { m: monthOnly })}`}
              </p>
            </div>
          )}

          {mainQuery && arrive && leave && (
            <div className="flex flex-wrap items-start justify-between gap-4 border border-line bg-paper px-4 py-3">
              <div>
                <p className="flex items-center gap-2 text-sm">
                  <IconPlane className="text-mute" />
                  {home} → {arrive.code} {arrive.city}
                  {multiCity ? ` · ${leave.code} ${leave.city} → ${home}` : ` → ${home}`}
                </p>
                {multiCity && <p className="mt-1 text-xs text-mute">{t.multiCity}</p>}
                <div className="mt-2">{links(mainQuery)}</div>
              </div>
              <div className="text-right">{priceText(main) ?? <span className="text-xs text-mute">—</span>}</div>
            </div>
          )}

          {!home && <p className="text-sm text-ink-soft">{t.needHome}</p>}

          {home && hasDates && (
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" className={buttonPrimary} onClick={checkPrices} disabled={checking}>
                {checking ? t.checking : t.check}
              </button>
              <p className="text-xs text-mute">{t.checkHint}</p>
            </div>
          )}
          {status === "notConfigured" && <p className="text-xs text-clay-700">{t.notConfigured}</p>}
          {status === "failed" && <p className="text-xs text-clay-700">{t.failed}</p>}

          {compareGroups.map(({ park, rows }) => (
            <div key={park.code}>
              <p className="text-xs tracking-[0.1em] text-ink-soft">
                {t.compare} · {park.nameZh}
              </p>
              <p className="mt-1 text-[11px] text-mute">{fill(t.compareHint, { park: park.nameZh, n: adults })}</p>
              <ul className="mt-2 divide-y divide-line border-y border-line">
                {rows.map(({ airport, minutes }) => {
                  const query = home && outDate && backDate ? roundTrip(home, airport.code, outDate, backDate, adults) : null;
                  const result = priceOf(query);
                  const current = airport.code === arrive?.code || airport.code === leave?.code;
                  return (
                    <li key={airport.code} className="flex flex-wrap items-start justify-between gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p>
                          <span className="font-medium tabular-nums">{airport.code}</span>
                          <span className="ml-2">{airport.nameZh}</span>
                          {current && fromTrip && (
                            <span className="ml-2 border border-clay-600/40 px-1.5 py-0.5 text-[11px] text-clay-700">{t.current}</span>
                          )}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-mute">
                          <IconCar className="text-sm" />
                          {minutes !== null ? fill(t.driveTo, { park: park.nameZh, d: formatDuration(minutes, text.units) }) : "—"}
                        </p>
                        {query && query.legs[0].from !== query.legs[0].to && <div className="mt-1">{links(query)}</div>}
                      </div>
                      <div className="text-right">{result ? priceText(result) : null}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {main?.typicalRange && (
            <p className="text-xs text-mute">
              {fill(t.typical, { low: money(main.typicalRange[0]), high: money(main.typicalRange[1]) })}
            </p>
          )}
          {main && (
            <p className="text-[11px] text-mute">
              {fill(t.fetched, { time: new Date(main.fetchedAt).toLocaleString(hl), source: main.source })}
            </p>
          )}

          {carQuery && (
            <div className="border-t border-line pt-4">
              <p className="flex items-center gap-2 text-xs tracking-[0.1em] text-ink-soft">
                <IconCar className="text-sm" /> {t.car}
              </p>
              <p className="mt-2 text-sm">
                {fill(t.carLine, {
                  pickup: carQuery.pickup,
                  dropoff: carQuery.dropoff,
                  from: formatDate(carQuery.from),
                  to: formatDate(carQuery.to),
                  days: daysBetween(carQuery.from, carQuery.to),
                })}
              </p>
              {carQuery.pickup !== carQuery.dropoff && <p className="mt-1 text-xs text-clay-700">{t.oneWay}</p>}
              <p className="mt-1 text-xs text-mute">
                {rate
                  ? fill(t.carRate, {
                      airport: carQuery.pickup,
                      economy: money(rate.car),
                      suv: rate.suv ? money(rate.suv) : "—",
                      date: carRatesDate,
                      source: carRatesSource,
                    })
                  : t.carNoRate}
              </p>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href={kayakCarsUrl(carQuery)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
                  {t.openKayak} <IconArrowUpRight />
                </a>
                <a href={expediaCarsUrl(carQuery)} target="_blank" rel="noreferrer" className="link-line inline-flex items-center gap-0.5">
                  {t.openExpedia} <IconArrowUpRight />
                </a>
              </p>
              <p className="mt-2 text-[11px] leading-5 text-mute">{t.carNote}</p>
            </div>
          )}
          <a href={`/${locale}/prices`} className="link-line inline-block text-xs text-ink-soft">
            {t.morePrices}
          </a>
        </div>
      )}
    </section>
  );
}
