"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight } from "@/components/icons";
import { seasonalRoads } from "@/data/roads";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatMonths } from "@/i18n/format";
import { addDays } from "@/lib/dates";
import { bestRoadDay, ROAD_LIKELY, roadStatus, type RoadStatus } from "@/lib/roads";
import type { MonthClimateSummary, ParkMonth, ParkSeason } from "@/lib/seasons";
import { useToday } from "@/lib/use-json";

/** 一趟大概玩十天：看出发日起这十天落在哪几个月，按天数加权 */
const WINDOW_DAYS = 10;

type Verdict = "great" | "ok" | "poor";
type Reason = { text: string; good: boolean };

export type SeasonText = Dictionary["when"] & { units: Dictionary["units"] };

/**
 * 一个月的分数：最佳季节 +2，能去的景点比例 ×3，天气舒服（白天 15°C 以上）+1，太热（看最热的片区）、太冷、雨雪多扣分，
 * 特别活动每个 +0.4（最多 3 个）
 */
function monthScore(month: ParkMonth): number {
  let score = (month.best ? 2 : 0) + 3 * month.open + Math.min(month.events.length, 3) * 0.4;
  const climate = month.climate;
  if (climate) {
    if (climate.hottest >= 38) score -= 2.5;
    else if (climate.hottest >= 33) score -= 1;
    else if (climate.high >= 15) score += 1;
    else if (climate.high < 5) score -= 1.5;
    if (climate.snowDays >= 8) score -= 1;
    else if (climate.snowDays >= 4) score -= 0.5;
    if (climate.wetDays >= 15) score -= 1;
    else if (climate.wetDays >= 10) score -= 0.5;
  }
  return score;
}

const verdictOf = (score: number): Verdict => (score >= 5.2 ? "great" : score >= 3 ? "ok" : "poor");

/** 季节性道路往年这几天的情况（把握很大的不列） */
interface RoadReason {
  road: string;
  date: string;
  status: RoadStatus;
  chance: number;
}

/** 往年这几天十有八九都通车的路，不用特别说 */
const ROAD_SURE = 0.9;

interface ParkWindow {
  park: ParkSeason;
  score: number;
  verdict: Verdict;
  /** 这几天里各月合在一起 */
  best: boolean;
  open: number;
  closedMustSee: string[];
  climate?: MonthClimateSummary;
  events: string[];
  roads: RoadReason[];
}

/**
 * 这几天（dates，只选了月份时没有）合起来的情况。选了具体日期时，季节性道路通了就能去的景点按往年这几天里
 * 把握最大的一天算（和自动生成攻略一样），不按开放月份：能去的比例、去不了的必去景点和分数都跟着改
 */
function combine(park: ParkSeason, weights: Map<number, number>, dates: string[] | null): ParkWindow {
  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  const entries = [...weights.entries()].map(([month, weight]) => ({
    month,
    info: park.months[month - 1],
    share: weight / total,
  }));
  let roadShift = 0;
  const openByRoad = new Set<string>();
  const closedByRoad = new Set<string>();
  const roads: RoadReason[] = [];
  for (const id of dates ? [...new Set(park.roadStops.map((stop) => stop.road))] : []) {
    const road = seasonalRoads.find((candidate) => candidate.id === id);
    const best = road && dates ? bestRoadDay(road, dates) : null;
    const status = road && best ? roadStatus(road, best.date) : null;
    if (!best || !status) continue;
    const open = best.chance >= ROAD_LIKELY;
    for (const stop of park.roadStops.filter((candidate) => candidate.road === id)) {
      const byMonth = entries.reduce(
        (sum, { month, share }) => sum + (!stop.openMonths || stop.openMonths.includes(month) ? share : 0),
        0,
      );
      roadShift += (stop.weight * ((open ? 1 : 0) - byMonth)) / Math.max(park.totalWeight, 1);
      if (stop.mustSee) (open ? openByRoad : closedByRoad).add(stop.mustSee);
    }
    if (best.chance < ROAD_SURE) roads.push({ road: id, date: best.date, status, chance: best.chance });
  }
  // 分数里能去的景点比例是 ×3
  const score = entries.reduce((sum, { info, share }) => sum + monthScore(info) * share, 0) + 3 * roadShift;
  const climates = entries.filter(({ info }) => info.climate);
  const weighted = (pick: (c: MonthClimateSummary) => number) =>
    climates.reduce((sum, { info, share }) => sum + pick(info.climate!) * share, 0) /
    climates.reduce((sum, { share }) => sum + share, 0);
  return {
    park,
    score,
    verdict: verdictOf(score),
    best: entries.every(({ info }) => info.best),
    open: entries.reduce((sum, { info, share }) => sum + info.open * share, 0) + roadShift,
    closedMustSee: [
      ...new Set([
        ...entries.flatMap(({ info }) => info.closedMustSee).filter((name) => !openByRoad.has(name)),
        ...closedByRoad,
      ]),
    ],
    climate: climates.length
      ? {
          high: weighted((c) => c.high),
          hottest: weighted((c) => c.hottest),
          low: weighted((c) => c.low),
          wetDays: weighted((c) => c.wetDays),
          snowDays: weighted((c) => c.snowDays),
        }
      : undefined,
    // 活动的月份要覆盖这几天的一半以上才算（9 月底出发时，9 月才有的活动不算）
    events: [...new Set(entries.flatMap(({ info }) => info.events))].filter(
      (event) => entries.reduce((sum, { info, share }) => sum + (info.events.includes(event) ? share : 0), 0) > 0.5,
    ),
    roads,
  };
}

const degrees = (value: number) => {
  const rounded = Math.round(value);
  return rounded < 0 ? `−${Math.abs(rounded)}` : String(rounded);
};

function reasonsOf(item: ParkWindow, text: SeasonText): Reason[] {
  const t = text.reasons;
  const reasons: Reason[] = [];
  reasons.push(
    item.best
      ? { text: t.best, good: true }
      : { text: fill(t.notBest, { months: formatMonths(item.park.bestMonths, text.units) }), good: false },
  );
  const names = (list: string[]) => (list.length > 3 ? fill(t.andMore, { names: list.slice(0, 3).join("、"), n: list.length }) : list.join("、"));
  if (item.closedMustSee.length === 0) reasons.push({ text: item.open >= 0.9 ? t.allOpen : t.mustSeeOpen, good: true });
  else if (item.open >= 0.6) reasons.push({ text: fill(t.someClosed, { names: names(item.closedMustSee) }), good: false });
  else reasons.push({ text: fill(t.mostClosed, { names: names(item.closedMustSee) }), good: false });
  const day = (md: string) => fill(text.dayLabel, { m: Number(md.slice(0, 2)), d: Number(md.slice(3, 5)) });
  for (const { road, date, status, chance } of item.roads) {
    const values = { road: item.park.roadNames[road] ?? road, date: day(date.slice(5, 10)), year: date.slice(0, 4) };
    const reason =
      status.kind === "odds"
        ? fill(status.phase === "opening" ? t.roadOpening : t.roadClosing, { ...values, n: status.known, k: status.open })
        : status.kind === "notYet"
          ? fill(t.roadNotYet, { ...values, opened: day(status.opened) })
          : status.kind === "closed"
            ? fill(t.roadClosed, { ...values, closed: day(status.closed) })
            : null;
    if (reason) reasons.push({ text: reason, good: chance >= ROAD_LIKELY });
  }
  const climate = item.climate;
  if (climate) {
    if (climate.hottest >= 33) reasons.push({ text: fill(t.hot, { high: degrees(climate.hottest) }), good: false });
    else if (climate.high < 5) reasons.push({ text: fill(t.cold, { high: degrees(climate.high) }), good: false });
    else if (climate.high >= 15) reasons.push({ text: t.comfortable, good: true });
    else reasons.push({ text: fill(t.cool, { low: degrees(climate.low) }), good: false });
    if (climate.snowDays >= 4) reasons.push({ text: fill(t.snowy, { n: Math.round(climate.snowDays) }), good: false });
    else if (climate.wetDays >= 10) reasons.push({ text: fill(t.rainy, { n: Math.round(climate.wetDays) }), good: false });
  }
  if (item.events.length) reasons.push({ text: fill(t.events, { names: item.events.slice(0, 3).join("、") }), good: true });
  return reasons;
}

export function SeasonGuide({ parks, locale, text }: { parks: ParkSeason[]; locale: string; text: SeasonText }) {
  const today = useToday();
  const [picked, setPicked] = useState<string | null>(null);
  const [wholeMonth, setWholeMonth] = useState<number | null>(null);
  const start = picked ?? today;

  // 这几天分别在哪个月
  const weights = new Map<number, number>();
  let label = "";
  if (wholeMonth !== null) {
    weights.set(wholeMonth, 1);
    label = fill(text.monthLabel, { m: wholeMonth });
  } else if (start) {
    const end = addDays(start, WINDOW_DAYS - 1);
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const month = Number(addDays(start, i).slice(5, 7));
      weights.set(month, (weights.get(month) ?? 0) + 1);
    }
    const md = (date: string) => fill(text.dayLabel, { m: Number(date.slice(5, 7)), d: Number(date.slice(8, 10)) });
    label = fill(text.rangeLabel, { from: md(start), to: md(end) });
  }

  // 选了具体日期：这几天的日期（季节性道路按天算）
  const dates = wholeMonth === null && start ? Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(start, i)) : null;
  const results = weights.size ? parks.map((park) => combine(park, weights, dates)).sort((a, b) => b.score - a.score) : [];
  const groups: { verdict: Verdict; items: ParkWindow[] }[] = (["great", "ok", "poor"] as Verdict[]).map((verdict) => ({
    verdict,
    items: results.filter((item) => item.verdict === verdict),
  }));
  const planHref = (code: string) =>
    `/${locale}/plan?park=${code}${wholeMonth === null && start ? `&date=${start}` : ""}`;

  const chip = (active: boolean) =>
    `border px-3 py-1.5 text-xs tabular-nums transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink hover:border-ink"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-5 border-y border-line py-6">
        <label className="eyebrow text-mute">
          {text.dateField}
          <input
            type="date"
            value={wholeMonth === null ? (start ?? "") : ""}
            onChange={(event) => {
              setPicked(event.target.value || null);
              setWholeMonth(null);
            }}
            className="mt-2 block border-b border-ink/30 bg-transparent py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <div>
          <p className="eyebrow text-mute">{text.monthField}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              className={chip(wholeMonth === null && picked === null)}
              onClick={() => {
                setPicked(null);
                setWholeMonth(null);
              }}
            >
              {text.now}
            </button>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button key={m} type="button" className={chip(wholeMonth === m)} onClick={() => setWholeMonth(m)}>
                {fill(text.monthChip, { m })}
              </button>
            ))}
          </div>
        </div>
      </div>

      {label && (
        <p className="mt-8 font-serif text-[clamp(1.4rem,2.4vw,2rem)]">
          {fill(text.headline, { when: label })}
        </p>
      )}
      <p className="mt-2 text-xs leading-6 text-mute">{text.method}</p>

      {results.length === 0 ? (
        <p className="mt-10 text-sm text-mute">{text.loading}</p>
      ) : (
        <div className="mt-10 space-y-14">
          {groups.map(({ verdict, items }) =>
            items.length === 0 ? null : (
              <section key={verdict}>
                <h2 className="flex items-baseline gap-3 border-t border-ink pt-4">
                  <span className={`font-serif text-2xl ${verdict === "poor" ? "text-mute" : ""}`}>{text.verdicts[verdict]}</span>
                  <span className="text-xs text-mute">{fill(text.count, { n: items.length })}</span>
                </h2>
                <p className="mt-1 text-xs text-mute">{text.verdictHints[verdict]}</p>
                <ul className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <li key={item.park.code} className="flex flex-col border-t border-line pt-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link href={`/${locale}/parks/${item.park.code}`} className="group">
                          <span className="font-serif text-xl group-hover:text-clay-700">{item.park.nameZh}</span>
                          <span className="ml-2 text-[11px] tracking-[0.14em] text-mute uppercase">{item.park.nameEn}</span>
                        </Link>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">{item.park.tagline}</p>
                      {item.climate && (
                        <p className="mt-3 text-sm tabular-nums">
                          {fill(text.climate, {
                            high: degrees(item.climate.high),
                            low: degrees(item.climate.low),
                            n: Math.round(item.climate.wetDays),
                          })}
                        </p>
                      )}
                      <ul className="mt-3 space-y-1 text-xs leading-5">
                        {reasonsOf(item, text).map((reason) => (
                          <li key={reason.text} className={`flex gap-2 ${reason.good ? "text-pine-700" : "text-clay-700"}`}>
                            <span aria-hidden>{reason.good ? "✓" : "×"}</span>
                            <span>{reason.text}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[11px] leading-5 text-mute">{item.park.seasonNote}</p>
                      {item.verdict !== "poor" && (
                        <Link
                          href={planHref(item.park.code)}
                          className="link-line mt-auto inline-flex w-fit items-center gap-1 pt-4 text-xs tracking-[0.1em]"
                        >
                          {text.plan} <IconArrowRight />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
      <p className="mt-14 text-[11px] leading-5 text-mute">{text.source}</p>
    </div>
  );
}
