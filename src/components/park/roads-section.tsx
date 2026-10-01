import type { AttractionWithPhoto } from "@/data/attractions";
import type { MonthDay } from "@/data/bookings";
import type { SeasonalRoad } from "@/data/roads";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/format";
import { medianOf, recentYears, ROAD_YEARS } from "@/lib/roads";

/** 图上画最近几年 */
const CHART_YEARS = 15;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** 横轴从 3 月 1 日（一年里的第 59 天，从 0 算）画到 12 月 31 日 */
const AXIS_START = 59;
const AXIS_DAYS = 365 - AXIS_START;

const dayOfYear = (md: MonthDay) => {
  const [month, day] = md.split("-").map(Number);
  return MONTH_DAYS.slice(0, month - 1).reduce((sum, days) => sum + days, 0) + day - 1;
};
/** 日期在横轴上的位置（百分比） */
const x = (md: MonthDay) => Math.min(Math.max((dayOfYear(md) - AXIS_START) / AXIS_DAYS, 0), 1) * 100;
const pad = (n: number) => String(n).padStart(2, "0");
/** 关闭日在开通日之前是关到了第二年年初，图上画到年底 */
const closeOf = (open: MonthDay | null, close: MonthDay | null) => (close && open && close < open ? "12-31" : close);

/** 公园页：季节性道路历年的通车时段（最近 15 年一行一年），一般哪天通车、关闭，今年哪天通的车 */
export function RoadsSection({
  roads,
  attractions,
  dict,
}: {
  roads: SeasonalRoad[];
  attractions: AttractionWithPhoto[];
  dict: Dictionary;
}) {
  const t = dict.park.activities.roads;
  const day = (md: MonthDay) => fill(t.monthDay, { m: Number(md.slice(0, 2)), d: Number(md.slice(3, 5)) });
  const nameOf = (id: string) => attractions.find((a) => a.id === id)?.nameZh;
  const months = t.months.map((label, i) => ({
    label,
    start: x(`${pad(i + 3)}-01`),
    middle: x(`${pad(i + 3)}-15`),
  }));

  return (
    <div className="mt-24">
      <h3 className="font-serif text-2xl">{t.title}</h3>
      <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">{t.hint}</p>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {roads.map((road) => {
          const recent = recentYears(road);
          const opens = recent.map(([, open]) => open).filter((open): open is MonthDay => open !== null);
          const closes = recent
            .map(([, open, close]) => closeOf(open, close))
            .filter((close): close is MonthDay => close !== null);
          const medianOpen = medianOf(opens);
          const medianClose = medianOf(closes);
          const sorted = [...opens].sort();
          const [latestYear, latestOpen] = road.years[0] ?? [];
          const skipped = road.years.slice(0, CHART_YEARS).filter(([, , , skip]) => skip);
          const links = (ids: string[]) =>
            ids
              .filter((id) => nameOf(id))
              .map((id, i) => (
                <span key={id}>
                  {i > 0 && "、"}
                  <a href={`#attraction-${id}`} className="hover:text-clay-700">
                    {nameOf(id)}
                  </a>
                </span>
              ));
          return (
            <article key={road.id} className="grid gap-x-16 gap-y-6 py-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-serif text-lg">{road.nameZh}</span>
                  <span className="text-[11px] tracking-[0.12em] text-mute uppercase">{road.nameEn}</span>
                </p>
                {medianOpen && sorted.length > 0 && (
                  <p className="mt-3 text-sm leading-7 text-ink">
                    {fill(t.stats, {
                      n: Math.min(recent.length, ROAD_YEARS),
                      open: day(medianOpen),
                      earliest: day(sorted[0]),
                      latest: day(sorted.at(-1)!),
                      close: medianClose ? day(medianClose) : "",
                    })}
                    {latestYear && latestOpen && !road.years[0][3] && (
                      <span className="text-clay-700"> {fill(t.thisYear, { year: latestYear, date: day(latestOpen) })}</span>
                    )}
                  </p>
                )}
                <p className="mt-2 text-xs leading-6 text-ink-soft">{road.noteZh}</p>
                {road.attractions.some(nameOf) && (
                  <p className="mt-3 text-xs leading-6">
                    <span className="text-mute">{t.attractions}：</span>
                    {links(road.attractions)}
                  </p>
                )}
                {road.afterRoad?.some(nameOf) && (
                  <p className="mt-1 text-xs leading-6">
                    <span className="text-mute">{t.afterRoad}：</span>
                    {links(road.afterRoad)}
                  </p>
                )}
                <a href={road.source} target="_blank" rel="noreferrer" className="link-line mt-4 inline-block text-xs tracking-[0.1em]">
                  {t.source}
                </a>
              </div>

              <div className="lg:col-span-8">
                <div className="relative">
                  {/* 月份分隔线和一般通车、关闭的日子，盖在所有年份上面 */}
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-12">
                    {months.map((month) => (
                      <span key={month.label} className="absolute inset-y-0 border-l border-line" style={{ left: `${month.start}%` }} />
                    ))}
                    {[medianOpen, medianClose].map(
                      (md) =>
                        md && (
                          <span
                            key={md}
                            className="absolute inset-y-0 border-l border-dashed border-clay-600/70"
                            style={{ left: `${x(md)}%` }}
                          />
                        ),
                    )}
                  </div>
                  <div aria-hidden className="relative ml-12 h-6 text-[10px] text-mute">
                    {months.map((month) => (
                      <span key={month.label} className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: `${month.middle}%` }}>
                        {month.label}
                      </span>
                    ))}
                  </div>
                  {road.years.slice(0, CHART_YEARS).map(([year, open, close, skip]) => {
                    const end = closeOf(open, close);
                    const latest = year === latestYear;
                    // 还没关（今年）：实线画到整理数据的那天，之后渐隐到一般关闭的日子
                    const fadeTo = x(medianClose ?? "11-15");
                    const checked = road.checked.startsWith(`${year}-`) ? x(road.checked.slice(5, 10)) : null;
                    const solid =
                      open && checked !== null && fadeTo > x(open) ? ((checked - x(open)) / (fadeTo - x(open))) * 100 : 60;
                    const label = !open
                      ? fill(t.skippedYear, { year, reason: skip ? `（${skip}）` : "" })
                      : end
                        ? fill(t.rowLabel, { year, open: day(open), close: day(close!) })
                        : fill(t.rowOpen, { year, open: day(open) });
                    return (
                      <div key={year} role="img" aria-label={label} title={label} className="flex h-5 items-center gap-3">
                        <span className={`w-9 shrink-0 text-right text-[11px] tabular-nums ${latest ? "text-clay-700" : "text-mute"}`}>
                          {year}
                        </span>
                        <span className="relative h-2.5 flex-1">
                          {open && (
                            <span
                              className={`absolute inset-y-0 ${skip ? "bg-mute/35" : latest ? "bg-clay-600" : "bg-ink-soft"}`}
                              style={{
                                left: `${x(open)}%`,
                                width: `${Math.max((end ? x(end) : fadeTo) - x(open), 0.6)}%`,
                                ...(end ? {} : { maskImage: `linear-gradient(to right, black ${Math.min(solid, 100)}%, transparent)` }),
                              }}
                            />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {skipped.length > 0 && (
                  <p className="mt-3 ml-12 text-[11px] leading-5 text-mute">
                    {fill(t.skipped, {
                      list: skipped.map(([year, , , skip]) => fill(t.skippedYear, { year, reason: `（${skip}）` })).join("、"),
                    })}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
