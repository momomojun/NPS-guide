"use client";

import { closedIn } from "@/components/attractions/attraction-card";
import type { AttractionWithPhoto } from "@/data/attractions";
import { fill, formatDuration } from "@/i18n/format";
import { formatClock } from "@/lib/sun";
import { dayColor } from "./day-colors";
import type { DayView, PlannerText } from "./types";

/** 早于这个时间出发，算“一早就要出发” */
const EARLY_DEPART = 6 * 60 + 30;
/** 晚于这个时间才回到住处，提醒一下 */
const LATE_RETURN = 21 * 60 + 30;
/** 每段行程最多点名几个景点 */
const HIGHLIGHTS = 4;
const KM_PER_MILE = 1.609;

/** 出发地和终点是不是同一个地方（生成攻略时两头的 id 不一样，按名字和位置比） */
function samePlace(a: { id: string; name: string; lat: number; lon: number }, b: { id: string; name: string; lat: number; lon: number }) {
  return a.id === b.id || a.name === b.name || (Math.abs(a.lat - b.lat) < 0.001 && Math.abs(a.lon - b.lon) < 0.001);
}

/** 必去优先，其次按热度名次 */
function importance(stop: AttractionWithPhoto) {
  return (stop.mustSee ? 0 : 1000) + (stop.hotRank ?? 500);
}

/** 这天主要在哪个公园：景点最多的那个 */
function mainPark(view: DayView): string | undefined {
  const counts = new Map<string, number>();
  for (const { stop } of view.rows) counts.set(stop.park, (counts.get(stop.park) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

/**
 * 行程总览：一句话概括（几天、几个公园、从哪到哪）、几个数字、按公园分段的描述、
 * 开车最多的一天和要注意的事，再加一张每天一行的表，点一行跳到那天。
 */
export function TripOverview({
  views,
  dateLabels,
  parkName,
  month,
  startDate,
  dayCount,
  text,
  onJump,
}: {
  views: DayView[];
  /** 每天的日期（定了出发日期才有） */
  dateLabels: (string | null)[];
  parkName: (code: string) => string;
  month: number | null;
  startDate: string;
  dayCount: number;
  text: PlannerText;
  onJump: (day: number) => void;
}) {
  const t = text.plan.overview;
  const duration = (minutes: number) => formatDuration(minutes, text.units);
  const stops = views.flatMap((view) => view.rows.map((row) => row.stop));
  if (stops.length === 0) return null;

  const origin = views[0]?.from;
  const destination = views.at(-1)?.to;
  const parkCodes = [...new Set(stops.map((stop) => stop.park))];
  const parkList = parkCodes.map(parkName).join(" · ");
  const parkJoined = parkCodes.map(parkName).join(t.and);
  const mustSee = stops.filter((stop) => stop.mustSee).length;
  const totalDrive = views.reduce((sum, view) => sum + (view.rows.length > 0 ? view.timeline.driveMin : 0), 0);
  const activeDays = views.filter((view) => view.rows.length > 0);
  const averageDrive = activeDays.length ? Math.round(totalDrive / activeDays.length) : 0;
  const hikeKm = stops.reduce((sum, stop) => sum + (stop.hike?.distanceMi ?? 0), 0) * KM_PER_MILE;
  // 中间几晚住过的地方（不算出发地和终点）
  const stays = views
    .slice(0, -1)
    .map((view) => view.to)
    .filter((lodging) => lodging && !lodging.endpoint);
  const stayCount = new Set(stays.map((lodging) => lodging!.id)).size;
  const departs = activeDays.map((view) => view.timeline.departAt).filter((m): m is number => m !== undefined);
  const earliest = departs.length ? Math.min(...departs) : undefined;

  // 按主要公园把连续的几天分成一段
  const segments: { from: number; to: number; park?: string }[] = [];
  for (const view of views) {
    const park = mainPark(view);
    const last = segments.at(-1);
    if (last && last.park === park) last.to = view.day;
    else segments.push({ from: view.day, to: view.day, park });
  }
  const range = (from: number, to: number) =>
    from === to ? fill(t.oneDay, { n: from + 1 }) : fill(t.dayRange, { a: from + 1, b: to + 1 });
  const segmentText = segments.map((segment) => {
    const days = views.slice(segment.from, segment.to + 1);
    if (!segment.park) return fill(t.restDays, { range: range(segment.from, segment.to) });
    const segmentStops = days.flatMap((view) => view.rows.map((row) => row.stop));
    const picked = new Set(
      [...segmentStops]
        .sort((a, b) => importance(a) - importance(b))
        .slice(0, HIGHLIGHTS)
        .map((stop) => stop.id),
    );
    // 挑出来的景点按游览顺序念
    const highlights = segmentStops.filter((stop) => picked.has(stop.id)).map((stop) => stop.nameZh);
    const more = segmentStops.length - highlights.length;
    const lodging = [
      ...new Set(
        days
          .map((view) => view.to)
          .filter((stay) => stay && !stay.endpoint)
          .map((stay) => stay!.name),
      ),
    ];
    return fill(t.segment, {
      range: range(segment.from, segment.to),
      park: parkName(segment.park),
      highlights: highlights.join("、"),
      more: more > 0 ? fill(t.more, { n: segmentStops.length }) : "",
      lodging: lodging.length ? fill(t.segmentLodging, { names: lodging.join("、") }) : "",
    });
  });

  // 开车最多的一天，第一天、最后一天多半是进出公园的长途
  const longest = activeDays.reduce((best, view) => (view.timeline.driveMin > best.timeline.driveMin ? view : best), activeDays[0]);
  const longestReason =
    longest.day === 0 && origin?.endpoint === "origin"
      ? fill(t.fromOrigin, { name: origin.name })
      : longest.day === views.length - 1 && destination?.endpoint === "destination"
        ? fill(t.toDestination, { name: destination.name })
        : "";

  // 要注意的事
  const notes: string[] = [];
  for (const view of activeDays) {
    const first = view.timeline.entries[0];
    if (view.timeline.departAt !== undefined && view.timeline.departAt < EARLY_DEPART) {
      notes.push(
        fill(first?.slot === "sunrise" ? t.earlySunrise : t.early, {
          day: view.day + 1,
          time: formatClock(view.timeline.departAt),
          name: view.rows[0]?.stop.nameZh ?? "",
        }),
      );
    }
    if (view.timeline.returnAt !== undefined && view.timeline.returnAt > LATE_RETURN) {
      notes.push(fill(t.late, { day: view.day + 1, time: formatClock(view.timeline.returnAt) }));
    }
    if (view.timeline.overloaded) notes.push(fill(t.overloaded, { day: view.day + 1 }));
  }
  const booking = stops.filter((stop) => stop.permit);
  if (booking.length) notes.push(fill(t.booking, { n: booking.length, names: booking.map((s) => s.nameZh).join("、") }));
  const closedNow = stops.filter((stop) => closedIn(stop, null) === "all");
  if (closedNow.length) notes.push(fill(t.closedNow, { names: closedNow.map((s) => s.nameZh).join("、") }));
  const closedMonth = month !== null ? stops.filter((stop) => closedIn(stop, month) === "month") : [];
  if (closedMonth.length) notes.push(fill(t.closed, { names: closedMonth.map((s) => s.nameZh).join("、"), month: month! }));
  const emptyDays = views.filter((view) => view.rows.length === 0).map((view) => view.day + 1);
  if (emptyDays.length) notes.push(fill(t.emptyDays, { days: emptyDays.join("、") }));

  const dateRange =
    startDate && dateLabels[0] && dateLabels.at(-1)
      ? fill(t.dateRange, { from: dateLabels[0], to: dateLabels.at(-1)! })
      : month !== null
        ? fill(t.monthOnly, { m: month })
        : null;
  const stats: [string, string, string?][] = [
    [t.stops, fill(t.stopsValue, { n: stops.length }), mustSee ? fill(t.mustSee, { n: mustSee }) : undefined],
    [t.drive, duration(totalDrive), fill(t.perDay, { d: duration(averageDrive) })],
    ...(hikeKm >= 1 ? ([[t.hike, fill(t.kmValue, { km: Math.round(hikeKm) })]] as [string, string][]) : []),
    ...(stayCount ? ([[t.lodging, fill(t.lodgingValue, { n: stayCount })]] as [string, string][]) : []),
    ...(earliest !== undefined ? ([[t.earliest, formatClock(earliest)]] as [string, string][]) : []),
  ];

  return (
    <section className="border-t border-ink pt-6">
      <p className="eyebrow text-mute">{t.eyebrow}</p>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">
          {fill(t.title, { parks: parkList, days: dayCount })}
        </h2>
        {dateRange && <p className="text-sm text-ink-soft">{dateRange}</p>}
      </div>

      <dl className="mt-8 grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="flex flex-col-reverse border-b border-line py-4 pr-4">
            <dt className="mt-1.5 text-xs text-mute">
              {label}
              {sub && <span className="ml-2 text-ink-soft">{sub}</span>}
            </dt>
            <dd className="text-[22px] leading-7 font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 text-[15px] leading-8 text-ink-soft lg:col-span-7">
          <p className="text-ink">
            {origin && destination
              ? fill(t.opening, {
                  origin: origin.name,
                  days: dayCount,
                  parks: parkJoined,
                  n: stops.length,
                  back: samePlace(origin, destination) ? t.backSame : t.backOther,
                  destination: destination.name,
                })
              : fill(t.openingNoOrigin, { days: dayCount, parks: parkJoined, n: stops.length })}
          </p>
          <p>{segmentText.join("")}</p>
          {longest && (
            <p>
              {fill(t.driveLine, {
                total: duration(totalDrive),
                day: longest.day + 1,
                longest: duration(longest.timeline.driveMin),
                reason: longestReason,
              })}
            </p>
          )}
        </div>
        {notes.length > 0 && (
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.1em] text-clay-700">{t.headsUp}</p>
            <ul className="mt-3 space-y-2 border-l border-clay-600 pl-4 text-sm leading-6 text-ink-soft">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink text-xs text-mute">
              <th className="py-2 pr-4 font-normal">{t.table.day}</th>
              <th className="py-2 pr-4 font-normal">{t.table.stops}</th>
              <th className="py-2 pr-4 font-normal">{t.table.time}</th>
              <th className="py-2 pr-4 font-normal">{t.table.drive}</th>
              <th className="py-2 font-normal">{t.table.sleep}</th>
            </tr>
          </thead>
          <tbody>
            {views.map((view) => {
              const names = view.rows.map((row) => row.stop.nameZh);
              const lodging = view.day < views.length - 1 || !view.to?.endpoint ? view.to?.name : undefined;
              return (
                <tr
                  key={view.day}
                  className="cursor-pointer border-b border-line align-top transition-colors hover:bg-paper-deep/60"
                  onClick={() => onJump(view.day)}
                >
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span aria-hidden className="inline-block h-[3px] w-4" style={{ backgroundColor: dayColor(view.day) }} />
                      <button type="button" className="font-medium hover:text-clay-700" onClick={() => onJump(view.day)}>
                        {fill(text.plan.day, { n: view.day + 1 })}
                      </button>
                    </span>
                    {dateLabels[view.day] && <span className="mt-0.5 block pl-6 text-xs text-mute">{dateLabels[view.day]}</span>}
                    {view.rows.length > 0 && (
                      <span className="mt-0.5 block pl-6 text-xs text-mute">
                        {[...new Set(view.rows.map((row) => row.stop.park))].map(parkName).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 leading-6">
                    {names.length ? names.join(" → ") : <span className="text-mute">{t.table.free}</span>}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap tabular-nums">
                    {view.rows.length > 0 && view.timeline.entries.length > 0
                      ? `${formatClock(view.timeline.departAt ?? view.timeline.entries[0].start)}–${formatClock(
                          view.timeline.returnAt ?? view.timeline.entries.at(-1)!.end,
                        )}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{view.rows.length > 0 ? duration(view.timeline.driveMin) : "—"}</td>
                  <td className="py-3 leading-6">
                    {lodging ?? <span className="text-mute">{view.day === views.length - 1 ? "—" : t.table.unset}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
