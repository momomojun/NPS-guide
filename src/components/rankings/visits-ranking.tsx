"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatBig, formatCount } from "@/i18n/format";

export interface RankingRow {
  code: string;
  nameZh: string;
  nameEn: string;
  statesZh: string;
  visits: number;
  previous: number | null;
  areaKm2: number;
  /** 网站上的公园页 */
  page?: string;
}

type Text = Dictionary["rankings"]["visits"] & { units: Dictionary["units"] };

/** 默认先列这么多，点“全部”再展开 */
const FIRST = 20;

/** 榜单页：国家公园按人次（或面积）排，横条是数值，网站上有的公园用强调色 */
export function VisitsRanking({
  rows,
  year,
  locale,
  text,
}: {
  rows: RankingRow[];
  year: number;
  locale: string;
  text: Text;
}) {
  const [metric, setMetric] = useState<"visits" | "area">("visits");
  const [oursOnly, setOursOnly] = useState(false);
  const [ascending, setAscending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const valueOf = (row: RankingRow) => (metric === "visits" ? row.visits : row.areaKm2);
  // 名次按从多到少算，倒过来看时名次不变
  const ranked = [...rows].sort((a, b) => valueOf(b) - valueOf(a)).map((row, i) => ({ row, rank: i + 1 }));
  const scoped = ranked.filter(({ row }) => !oursOnly || row.page);
  const ordered = ascending ? [...scoped].reverse() : scoped;
  const shown = expanded ? ordered : ordered.slice(0, FIRST);
  const max = Math.max(...rows.map(valueOf));
  const ours = rows.filter((row) => row.page).length;

  const chip = (active: boolean) =>
    `border px-3 py-1.5 text-xs transition-colors ${
      active ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink hover:border-ink"
    }`;
  const display = (row: RankingRow) =>
    metric === "visits" ? formatBig(row.visits, text.units) : fill(text.units.km2, { n: formatCount(row.areaKm2) });
  /** 比前一年涨跌多少（“+0.8%”“−5.4%”）；按面积排时不显示 */
  const change = (row: RankingRow) => {
    if (metric !== "visits" || !row.previous) return "";
    const percent = ((row.visits / row.previous - 1) * 100).toFixed(1);
    return `${Number(percent) > 0 ? "+" : ""}${percent.replace("-", "−")}%`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex gap-1.5">
          <button type="button" className={chip(metric === "visits")} onClick={() => setMetric("visits")}>
            {text.byVisits}
          </button>
          <button type="button" className={chip(metric === "area")} onClick={() => setMetric("area")}>
            {text.byArea}
          </button>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className={chip(!oursOnly)} onClick={() => setOursOnly(false)}>
            {fill(text.all, { n: rows.length })}
          </button>
          <button type="button" className={chip(oursOnly)} onClick={() => setOursOnly(true)}>
            {fill(text.ours, { n: ours })}
          </button>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className={chip(!ascending)} onClick={() => setAscending(false)}>
            {text.descending}
          </button>
          <button type="button" className={chip(ascending)} onClick={() => setAscending(true)}>
            {text.ascending}
          </button>
        </div>
      </div>

      {!oursOnly && (
        <p className="mt-5 flex gap-5 text-[11px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2.5 w-4 rounded-r-[3px] bg-clay-600" />
            {text.legendOurs}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2.5 w-4 rounded-r-[3px] bg-ink/20" />
            {text.legendOthers}
          </span>
        </p>
      )}

      <ol className="mt-4 border-t border-ink">
        {shown.map(({ row, rank }) => {
          const value = valueOf(row);
          return (
            <li
              key={row.code}
              className="grid grid-cols-[2rem_1fr] items-center gap-x-3 gap-y-1.5 border-b border-line py-2.5 md:grid-cols-[2.5rem_minmax(14rem,18rem)_1fr]"
            >
              <span className="text-xs text-mute tabular-nums">{rank}</span>
              <div className="min-w-0">
                {row.page ? (
                  <Link href={`/${locale}/parks/${row.page}`} className="font-serif text-base hover:text-clay-700">
                    {row.nameZh}
                  </Link>
                ) : (
                  <span className="font-serif text-base text-ink-soft">{row.nameZh}</span>
                )}
                <span className="ml-2 text-[10px] tracking-[0.12em] text-mute uppercase">{row.nameEn}</span>
                <span className="block text-[11px] text-mute">
                  {row.statesZh}
                  {!row.page && (
                    <>
                      {" · "}
                      <a href={`https://www.nps.gov/${row.code}/`} target="_blank" rel="noreferrer" className="hover:text-ink">
                        {text.officialSite}
                      </a>
                    </>
                  )}
                </span>
              </div>
              <div className="col-span-2 grid grid-cols-[1fr_4.5rem_3.5rem] items-center gap-x-3 md:col-span-1 md:grid-cols-[1fr_5.5rem_7.5rem]">
                <span className="relative h-2.5">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-r-[4px] ${row.page ? "bg-clay-600" : "bg-ink/20"}`}
                    style={{ width: `${Math.max((value / max) * 100, 0.4)}%` }}
                  />
                </span>
                <span className="text-sm tabular-nums">{display(row)}</span>
                <span className="text-right text-[11px] text-mute tabular-nums md:text-left">
                  {change(row) && <span className="hidden md:inline">{fill(text.change, { year: year - 1 })} </span>}
                  {change(row)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {ordered.length > FIRST && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="link-line mt-5 text-xs tracking-[0.1em]"
        >
          {expanded ? text.collapse : fill(text.showAll, { n: ordered.length })}
        </button>
      )}
    </div>
  );
}
