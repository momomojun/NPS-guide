import type { Locale } from "@/i18n/config";
import { localize } from "@/i18n/convert";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatBig, formatCount, formatMonths } from "@/i18n/format";
import { crowdRatios, type ParkVisits } from "@/lib/visits";

type Text = Dictionary["park"]["visits"];
type Units = Dictionary["units"];

/** 柱子的提示：鼠标移上去或者用键盘选中时显示；靠两边的柱子往里对齐，不出图 */
function Tip({ text, align }: { text: string; align: "left" | "center" | "right" }) {
  const position = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span
      className={`pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap bg-ink px-2 py-1 text-[11px] text-paper group-hover:block group-focus-visible:block ${position}`}
    >
      {text}
    </span>
  );
}

const alignOf = (i: number, n: number) => (i < 3 ? "left" : i >= n - 3 ? "right" : "center");

/** 每个月平均每天的人次：12 根柱子，最挤的那个月标出数字 */
function MonthlyChart({ daily, text, units }: { daily: number[]; text: Text; units: Units }) {
  const max = Math.max(...daily);
  const peak = daily.indexOf(max);
  return (
    <figure>
      <figcaption className="text-xs text-mute">{text.monthly}</figcaption>
      <div className="relative mt-9 flex h-40 items-end gap-[2px] border-b border-line">
        {daily.map((value, i) => {
          const label = fill(text.monthBar, { m: i + 1, n: formatBig(value, units) });
          const height = Math.max((value / max) * 100, 1);
          return (
            <div
              key={i}
              tabIndex={0}
              role="img"
              aria-label={label}
              className="group relative flex h-full flex-1 items-end justify-center outline-none"
            >
              <span
                className="w-full max-w-6 rounded-t-[4px] bg-ink-soft/70 transition-colors group-hover:bg-ink group-focus-visible:bg-ink"
                style={{ height: `${height}%` }}
              />
              {i === peak && (
                <span
                  aria-hidden
                  className="absolute mb-1 text-[11px] whitespace-nowrap text-ink tabular-nums group-hover:invisible"
                  style={{ bottom: `${height}%` }}
                >
                  {formatBig(value, units)}
                </span>
              )}
              <Tip text={label} align={alignOf(i, daily.length)} />
            </div>
          );
        })}
      </div>
      <div aria-hidden className="mt-1.5 flex gap-[2px] text-[10px] text-mute tabular-nums">
        {text.monthLabels.map((label) => (
          <span key={label} className="flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** 每年的人次：最近一年用强调色、标出数字；最多的那年离得够远也标出来；升为国家公园的那年画一条竖线 */
function AnnualChart({ visits, text, units }: { visits: ParkVisits; text: Text; units: Units }) {
  const values = visits.annual;
  const counted = values.filter((value): value is number => value !== null);
  const max = Math.max(...counted);
  const last = values.length - 1;
  const top = values.indexOf(max);
  const canada = visits.source === "canada";
  const yearLabel = (i: number) => {
    const year = visits.firstYear + i;
    return canada ? `${year}–${String(year + 1).slice(2)}` : String(year);
  };
  const barLabel = (i: number) => {
    const value = values[i];
    const year = visits.firstYear + i;
    if (value === null) return fill(text.noData, { year });
    return canada
      ? fill(text.fiscalBar, { year, next: String(year + 1).slice(2), n: formatCount(value) })
      : fill(text.yearBar, { year, n: formatCount(value) });
  };
  const x = (i: number) => ((i + 0.5) / values.length) * 100;
  const marker = visits.establishedYear !== undefined ? visits.establishedYear - visits.firstYear : null;
  // 横轴：第一年、每个整十年、最后一年（离最后一年太近的整十年不标）
  const ticks = values
    .map((_, i) => i)
    .filter((i) => i === 0 || i === last || ((visits.firstYear + i) % 10 === 0 && last - i >= 7 && i >= 4));
  const labelled = [last, ...(top !== last && last - top >= 8 ? [top] : [])];

  return (
    <figure>
      <figcaption className="text-xs text-mute">{text.annual}</figcaption>
      <div className="relative mt-9 flex h-40 items-end gap-px border-b border-line">
        {values.map((value, i) => {
          const height = value === null ? 0 : Math.max((value / max) * 100, 0.8);
          return (
            <div key={i} className="group relative flex h-full flex-1 items-end">
              {value !== null && (
                <span
                  className={`w-full rounded-t-[2px] transition-colors ${
                    i === last ? "bg-clay-600" : "bg-ink-soft/45 group-hover:bg-ink"
                  }`}
                  style={{ height: `${height}%` }}
                />
              )}
              {labelled.includes(i) && (
                <span
                  aria-hidden
                  className={`absolute mb-1 text-[11px] whitespace-nowrap text-ink tabular-nums group-hover:invisible ${
                    i === last ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                  style={{ bottom: `${height}%` }}
                >
                  {formatBig(value!, units)}
                </span>
              )}
              <Tip text={barLabel(i)} align={alignOf(i, values.length)} />
            </div>
          );
        })}
        {marker !== null && marker >= 0 && marker <= last && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 border-l border-clay-600/60"
            style={{ left: `${x(marker)}%` }}
          >
            <span
              className={`absolute top-0 bg-paper px-1 text-[10px] whitespace-nowrap text-clay-700 ${
                marker > values.length * 0.6 ? "right-0" : "left-0"
              }`}
            >
              {fill(text.established, { year: visits.establishedYear! })}
            </span>
          </span>
        )}
      </div>
      <div aria-hidden className="relative mt-1.5 h-4 text-[10px] text-mute tabular-nums">
        {ticks.map((i) => (
          <span
            key={i}
            className={`absolute ${i === 0 ? "left-0" : i === last ? "right-0" : "-translate-x-1/2"}`}
            style={i === 0 || i === last ? undefined : { left: `${x(i)}%` }}
          >
            {yearLabel(i)}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** 一段月份里的说法：几月到几月 */
const monthsOf = (ratios: number[], keep: (ratio: number) => boolean) =>
  ratios.flatMap((ratio, i) => (keep(ratio) ? [i + 1] : []));

/** 公园页“活动与开放”里的“人多不多”：每个月平均每天的人次、历年人次，加一两句话总结 */
export function VisitsSection({
  visits,
  locale,
  dict,
}: {
  visits: ParkVisits;
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.park.visits;
  const units = dict.units;
  const daily = visits.daily;
  const lines: string[] = [];
  if (daily) {
    const ratios = crowdRatios(daily);
    const max = Math.max(...daily);
    lines.push(fill(t.peak, { months: formatMonths(monthsOf(ratios, (r) => r >= 0.8), units), n: formatBig(max, units) }));
    const min = Math.min(...ratios);
    if (min >= 0.5) {
      lines.push(fill(t.flat, { share: min >= 0.7 ? t.share.most : t.share.half }));
    } else {
      const limit = min < 0.25 ? 0.25 : 0.5;
      const quiet = monthsOf(ratios, (r) => r < limit);
      const highest = Math.max(...quiet.map((m) => ratios[m - 1]));
      const share = limit === 0.5 ? t.share.half : highest < 0.1 ? t.share.tenth : t.share.quarter;
      lines.push(fill(t.quiet, { months: formatMonths(quiet, units), share }));
    }
  }
  const hint = daily
    ? fill(t.hint, { years: visits.dailyYears ?? "", first: visits.firstYear })
    : fill(t.hintCanada, { first: visits.firstYear, next: String(visits.firstYear + 1).slice(2) });

  return (
    <div id="crowds" className="mt-24 scroll-mt-32">
      <h3 className="font-serif text-2xl">{t.title}</h3>
      <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">{hint}</p>
      <div className="mt-8 grid gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4">
          {lines.map((line) => (
            <p key={line} className="text-sm leading-7">
              {line}
            </p>
          ))}
          {visits.parts.length > 0 && (
            <p className="text-xs leading-6 text-ink-soft">
              {fill(t.parts, {
                list: visits.parts
                  .map((part) => fill(t.part, { name: localize(part.nameZh, locale), n: formatBig(part.visits, units) }))
                  .join("、"),
              })}
            </p>
          )}
          {visits.complex !== undefined && (
            <p className="text-xs leading-6 text-ink-soft">{fill(t.complex, { n: formatBig(visits.complex, units) })}</p>
          )}
          <a href={visits.sourceUrl} target="_blank" rel="noreferrer" className="link-line inline-block text-xs tracking-[0.1em]">
            {visits.source === "canada" ? t.sourceCanada : t.source}
          </a>
        </div>
        <div className={`grid gap-x-12 gap-y-10 lg:col-span-8 ${daily ? "md:grid-cols-2" : ""}`}>
          {daily && <MonthlyChart daily={daily} text={t} units={units} />}
          <AnnualChart visits={visits} text={t} units={units} />
        </div>
      </div>
      <details className="mt-8 text-xs lg:ml-[calc(33.333%+1.333rem)]">
        <summary className="cursor-pointer text-mute hover:text-ink">{t.table}</summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-8 sm:grid-cols-3 xl:grid-cols-4">
          {visits.annual
            .map((value, i) => ({ value, year: visits.firstYear + i }))
            .filter(({ value }) => value !== null)
            .reverse()
            .map(({ value, year }) => (
              <div key={year} className="flex justify-between border-b border-line/70 py-1 tabular-nums">
                <dt className="text-mute">{visits.source === "canada" ? `${year}–${String(year + 1).slice(2)}` : year}</dt>
                <dd>{formatCount(value!)}</dd>
              </div>
            ))}
        </dl>
      </details>
    </div>
  );
}
