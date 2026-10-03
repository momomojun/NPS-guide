"use client";

import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { fill, formatDuration } from "@/i18n/format";
import type { AttractionWithPhoto } from "@/data/attractions";
import type { ParkAlert } from "@/lib/alert-match";
import { paceAdjusts, type PersonalPace } from "@/lib/personal-pace";
import type { DayTimeline, TimelineEntry } from "@/lib/planner";
import { formatClock } from "@/lib/sun";
import { departuresOn } from "@/lib/tours";
import { checkIn, checkOut, setItemStatus } from "@/lib/trip-edit";
import type { Trip } from "@/lib/trip-store";
import type { DayRow, DayView, PlannerText, ResolvedLodging } from "./types";
import type { DayWeather } from "./weather";
import { WeatherLine } from "./weather-line";

/** 比计划早 / 晚超过这么多分钟才提醒 */
const SLACK_MIN = 10;

type Place = { lat: number; lon: number };
const googleNav = (place: Place) => `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
const appleNav = (place: Place) => `https://maps.apple.com/?daddr=${place.lat},${place.lon}&dirflg=d`;
const arrivalOf = (entry: TimelineEntry) => entry.start - entry.waitMin;

function NavLinks({ place, text }: { place: Place; text: PlannerText }) {
  const t = text.plan.today;
  return (
    <span className="inline-flex flex-wrap gap-x-4 gap-y-1 text-xs">
      <a href={googleNav(place)} target="_blank" rel="noreferrer" className="link-line text-ink">
        {t.navigate}
      </a>
      <a href={appleNav(place)} target="_blank" rel="noreferrer" className="link-line text-ink-soft">
        {t.appleMaps}
      </a>
    </span>
  );
}

/** 配速倍数：1.25、1.3 */
const times = (factor: number) => String(Number(factor.toFixed(2)));

/** 学到的配速一句话：“徒步大约是估算的 1.3 倍，其他景点大约是估算的 0.85 倍，开车大约是估算的 1.2 倍” */
export function paceParts(pace: PersonalPace, text: PlannerText): string {
  const t = text.plan.today;
  return [
    ...(pace.hike !== 1 ? [fill(t.paceHike, { x: times(pace.hike) })] : []),
    ...(pace.other !== 1 ? [fill(t.paceOther, { x: times(pace.other) })] : []),
    ...(pace.drive !== 1 ? [fill(t.paceDrive, { x: times(pace.drive) })] : []),
  ].join("，");
}

/**
 * 出发后的“今天”：下一站是哪、现在出发几点能到、比计划早还是晚、离日落还有多久，一键导航；
 * 到了点“到了”，走的时候点“走了”，后面的时间按现在重新推算，两次打卡的时间也用来学这个人的配速。
 * 去不了的可以挪到后面几天重排。
 */
export function TodayPanel({
  view,
  dateLabel,
  now,
  live,
  arrivedAt,
  pace,
  usePace,
  onUsePace,
  weather,
  tomorrow,
  alertsFor,
  onEdit,
  onReplanLater,
  text,
}: {
  view: DayView;
  dateLabel: string | null;
  /** 现在是当天第几分钟（公园当地时间） */
  now: number;
  /** 按现在的时间和位置推算的剩下行程 */
  live: DayTimeline;
  /** 今天已经到了下一站（当天第几分钟到的），还没走 */
  arrivedAt?: number;
  /** 按打卡学到的配速，和现在用不用它 */
  pace: PersonalPace;
  usePace: boolean;
  onUsePace: (use: boolean) => void;
  weather?: DayWeather;
  /** 明天的第一站和出发时间 */
  tomorrow?: { name: string; departAt?: number };
  alertsFor: (stop: AttractionWithPhoto) => ParkAlert[];
  onEdit: (change: (trip: Trip) => Trip) => void;
  /** 把今天没去的挪到后面几天重排；最后一天没有 */
  onReplanLater?: () => void;
  text: PlannerText;
}) {
  const t = text.plan.today;
  const duration = (minutes: number) => formatDuration(Math.max(Math.round(minutes), 0), text.units);
  const remaining: DayRow[] = view.rows.filter((row) => row.item.status === "planned");
  const done = view.rows.filter((row) => row.item.status === "done").length;
  const next = remaining[0];
  const nextLive = live.entries[0];
  const nextPlanned = next ? view.timeline.entries.find((entry) => entry.id === next.item.id) : undefined;
  const lodging: ResolvedLodging | undefined = view.to;

  // 还没到计划出发的时间就按计划说；过了出发时间，按现在出发推算
  let timing: string | null = null;
  let delay = 0;
  if (next && nextLive && nextPlanned) {
    const plannedDepart = arrivalOf(nextPlanned) - nextPlanned.driveMin;
    const line = (id: string) => text.shuttleNames[id] ?? id;
    if (now < plannedDepart) {
      timing = nextPlanned.shuttle
        ? fill(t.plannedShuttle, { time: formatClock(plannedDepart), drive: duration(nextPlanned.driveMin), line: line(nextPlanned.shuttle.line) })
        : fill(t.plannedDepart, { time: formatClock(plannedDepart), drive: duration(nextPlanned.driveMin) });
    } else {
      delay = arrivalOf(nextLive) - arrivalOf(nextPlanned);
      timing = nextLive.shuttle
        ? fill(t.etaShuttle, { time: formatClock(arrivalOf(nextLive)), drive: duration(nextLive.driveMin), line: line(nextLive.shuttle.line) })
        : fill(t.eta, { time: formatClock(arrivalOf(nextLive)), drive: duration(nextLive.driveMin) });
    }
    // 有固定班次的游船、导览团：说赶哪一班
    const entry = now < plannedDepart ? nextPlanned : nextLive;
    if (departuresOn(next.item.id, view.date)?.times.includes(entry.start)) timing += fill(t.tourCatch, { time: formatClock(entry.start) });
  }
  const delayLabel = delay > SLACK_MIN ? fill(t.late, { d: duration(delay) }) : delay < -SLACK_MIN ? fill(t.early, { d: duration(-delay) }) : null;

  const warnings = live.entries.flatMap((entry, k) => {
    const name = remaining[k]?.stop.nameZh ?? "";
    return [
      ...(entry.warnings.includes("dark") ? [fill(t.warnDark, { name })] : []),
      ...(entry.warnings.includes("missSunset") ? [fill(t.warnSunset, { name })] : []),
      ...(entry.warnings.includes("lastShuttle") ? [fill(t.warnShuttle, { name })] : []),
      ...(entry.warnings.includes("missDeparture") ? [fill(t.warnDeparture, { name })] : []),
      ...(entry.warnings.includes("noService") ? [fill(t.warnNoService, { name })] : []),
      ...(entry.warnings.includes("afterHours") ? [fill(t.warnAfterHours, { name })] : []),
    ];
  });
  if (live.lateReturn && live.returnAt !== undefined) warnings.push(fill(t.warnLate, { time: formatClock(live.returnAt) }));

  const sun = view.sun.kind === "normal" ? view.sun.window : null;
  const nextAlerts = next ? alertsFor(next.stop) : [];
  // 到了还没走：计划停多久（已经按配速算了）、大概几点走；停得比计划久了就说多停了多少
  const plannedStay = nextPlanned ? nextPlanned.end - nextPlanned.start : 0;
  const stayed = arrivedAt !== undefined ? now - arrivedAt : 0;


  return (
    <section id="plan-today" className="scroll-mt-32 border-t-2 border-clay-600 bg-paper-deep p-6 sm:p-8 print:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <p className="eyebrow text-clay-700">{t.eyebrow}</p>
          <h2 className="mt-3 font-serif text-2xl">
            {fill(t.title, { n: view.day + 1 })}
            {dateLabel && <span className="ml-3 text-base text-ink-soft">{dateLabel}</span>}
          </h2>
        </div>
        <p className="text-xs text-mute">{fill(t.progress, { done, total: view.rows.length })}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-soft">
        {sun && (
          <span>
            {now < sun.sunset
              ? fill(t.sunset, { time: formatClock(sun.sunset), left: duration(sun.sunset - now) })
              : fill(t.sunsetPassed, { time: formatClock(sun.sunset) })}
          </span>
        )}
        {weather && <WeatherLine weather={weather} text={text} />}
      </div>

      {next && nextLive ? (
        <div className="mt-6 border-t border-ink/15 pt-5">
          <p className="eyebrow text-mute">{arrivedAt !== undefined ? t.here : t.next}</p>
          <p className="mt-2 font-serif text-xl">
            {next.stop.nameZh}
            <span className="eyebrow ml-2 text-mute">{next.stop.nameEn}</span>
          </p>
          {arrivedAt !== undefined ? (
            <p className="mt-2 text-sm text-ink-soft">
              {stayed > plannedStay + SLACK_MIN
                ? fill(t.overstay, { time: formatClock(arrivedAt), stayed: duration(stayed), over: duration(stayed - plannedStay) })
                : fill(t.hereSince, { time: formatClock(arrivedAt), stay: duration(plannedStay), leave: formatClock(nextLive.end) })}
            </p>
          ) : (
            timing && (
              <p className="mt-2 text-sm text-ink-soft">
                {timing}
                {delayLabel && <span className={delay > 0 ? "ml-2 text-clay-700" : "ml-2 text-pine-700"}>{delayLabel}</span>}
              </p>
            )
          )}
          {nextAlerts.slice(0, 2).map((alert) => (
            <p key={alert.id} className="mt-1 text-xs text-clay-700">
              {fill(t.alert, { title: alert.titleZh ?? alert.title })}
            </p>
          ))}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {arrivedAt !== undefined ? (
              <>
                <button
                  type="button"
                  className={buttonPrimary}
                  onClick={() => onEdit((trip) => checkOut(trip, view.day, next.index, Date.now()))}
                >
                  {remaining.length > 1 ? t.leave : t.leaveLast}
                </button>
                <button
                  type="button"
                  className="link-line text-xs text-mute"
                  onClick={() => onEdit((trip) => checkIn(trip, view.day, next.index, null))}
                >
                  {t.undoArrive}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={buttonPrimary}
                  onClick={() => onEdit((trip) => checkIn(trip, view.day, next.index, Date.now()))}
                >
                  {t.arrived}
                </button>
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => onEdit((trip) => setItemStatus(trip, view.day, next.index, "skipped"))}
                >
                  {t.skip}
                </button>
                <NavLinks place={next.stop.start ?? next.stop} text={text} />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 border-t border-ink/15 pt-5 text-sm text-ink-soft">
          <p>{view.rows.length > 0 ? t.allDone : t.restDay}</p>
          {tomorrow && (
            <p className="mt-2">
              {tomorrow.departAt !== undefined
                ? fill(t.tomorrow, { time: formatClock(tomorrow.departAt), name: tomorrow.name })
                : fill(t.tomorrowNoTime, { name: tomorrow.name })}
            </p>
          )}
        </div>
      )}

      {remaining.length > 1 && (
        <div className="mt-6">
          <p className="eyebrow text-mute">{t.later}</p>
          <ol className="mt-2 space-y-1.5 text-sm">
            {remaining.slice(1).map((row, k) => {
              const entry = live.entries[k + 1];
              return (
                <li key={row.item.id} className="grid grid-cols-[3.5rem_1fr] gap-3">
                  <span className="text-ink-soft tabular-nums">{entry ? formatClock(arrivalOf(entry)) : ""}</span>
                  <span>{row.stop.nameZh}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {lodging && (
        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span>
            {remaining.length > 0 && live.returnAt !== undefined
              ? fill(t.back, { time: formatClock(live.returnAt), name: lodging.name })
              : fill(t.backNoTime, { name: lodging.name })}
          </span>
          <NavLinks place={lodging} text={text} />
        </p>
      )}

      {paceAdjusts(pace) && (
        <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs leading-6 text-ink-soft">
          <span>{fill(usePace ? t.pace : t.paceOff, { parts: paceParts(pace, text) })}</span>
          <button type="button" className="link-line text-xs" onClick={() => onUsePace(!usePace)}>
            {usePace ? t.paceUseOriginal : t.paceUseMine}
          </button>
        </p>
      )}

      {warnings.length > 0 && (
        <div className="mt-5 border-l border-clay-600 pl-4 text-xs leading-6 text-clay-700">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}

      {onReplanLater && remaining.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" className={buttonSecondary} onClick={onReplanLater}>
            {t.replanLater}
          </button>
          <p className="text-xs text-mute">{t.replanHint}</p>
        </div>
      )}
    </section>
  );
}
