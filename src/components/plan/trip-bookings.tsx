"use client";

import { fill } from "@/i18n/format";
import {
  calendarFile,
  nextActionDate,
  openingState,
  type BookingItem,
  type CalendarEvent,
  type Opening,
  type OpeningState,
} from "@/lib/booking";
import type { PlannerText } from "./types";

/** 开放已经超过这么多天的，提醒可能订满了 */
const LONG_OPEN_DAYS = 30;
/** 这么多天内就开放的，用强调色 */
const SOON_DAYS = 30;

/** 要提前订的：按行程日期算出每项哪天开放、还剩几天，按先后排；可以一键加到日历 */
export function TripBookings({
  items,
  others,
  today,
  approximate,
  formatDate,
  text,
}: {
  items: BookingItem[];
  /** 景点写了要许可证、但没有开放时间规则的（只显示说明） */
  others: { id: string; name: string; permit: string }[];
  today: string | null;
  /** 只定了月份：日期按那个月 15 号左右算 */
  approximate: boolean;
  /** 带年份的日期（开订常常在前一年） */
  formatDate: (date: string) => string;
  text: PlannerText;
}) {
  const b = text.plan.bookings;
  if (items.length === 0 && others.length === 0) return null;

  const sorted = today
    ? [...items].sort((x, y) => nextActionDate(x, today).localeCompare(nextActionDate(y, today)))
    : items;
  const date = (value: string) => (approximate ? fill(b.approx, { date: formatDate(value) }) : formatDate(value));
  const at = (opening: Opening, time = opening.time) =>
    time ? fill(b.at, { time: time.replace(/^0/, ""), tz: (opening.tz && b.tz[opening.tz as keyof typeof b.tz]) || opening.tz || "" }) : "";

  const describe = (opening: Opening, lottery: boolean): string => {
    const window = opening.window;
    if (window.type === "first-come") return b.window.firstCome;
    if (window.type === "anytime") return b.window.anytime;
    if (!opening.opens) {
      return window.type === "fixed-date" ? fill(b.window.unknownYear, { date: formatDate(window.opens) }) : b.window.unknown;
    }
    const results = opening.results ? fill(b.window.results, { date: date(opening.results) }) : "";
    switch (window.type) {
      case "rolling":
        return fill(b.window.rolling, {
          date: date(opening.opens),
          time: at(opening),
          ahead: window.months ? fill(b.months, { n: window.months }) : fill(b.daysAhead, { n: window.days ?? 0 }),
        });
      case "seasonal-lottery":
      case "monthly-lottery":
        return fill(b.window.lottery, { from: date(opening.opens), to: date(opening.closes ?? opening.opens), results });
      case "days-before":
        return fill(lottery ? b.window.daysBefore : b.window.daysBeforeOpen, {
          n: window.days,
          date: date(opening.opens),
          time: at(opening),
          until:
            (opening.until ? fill(b.window.until, { time: opening.until.replace(/^0/, "") }) : "") +
            (opening.resultsTime ? fill(b.window.resultsAt, { time: opening.resultsTime.replace(/^0/, "") }) : ""),
        });
      default:
        return fill(b.window.opens, { date: date(opening.opens), time: at(opening) });
    }
  };

  const stateLabel = (status: OpeningState, lottery: boolean): string => {
    switch (status.state) {
      case "upcoming":
        return status.inDays === 0 ? b.state.today : fill(b.state.upcoming, { n: status.inDays });
      case "open":
        if (status.closesInDays !== undefined) {
          return status.closesInDays === 0 ? b.state.lastDay : fill(b.state.openLottery, { n: status.closesInDays });
        }
        if (status.sinceDays === 0) return b.state.today;
        return !lottery && status.sinceDays > LONG_OPEN_DAYS ? b.state.openLong : b.state.open;
      case "waiting":
        return status.results ? fill(b.state.waiting, { date: formatDate(status.results) }) : b.state.waitingNoDate;
      case "closed":
        return b.state.closed;
      case "unknown":
        return b.state.unknown;
      case "anytime":
        return b.state.anytime;
      case "none":
        return b.state.none;
    }
  };
  const chipClass = (status: OpeningState) =>
    status.state === "open" || status.state === "anytime"
      ? "border-pine-600/50 text-pine-700"
      : status.state === "upcoming" && status.inDays <= SOON_DAYS
        ? "border-clay-600/60 text-clay-700"
        : status.state === "upcoming" || status.state === "waiting"
          ? "border-ink/40 text-ink"
          : "border-line text-mute";

  // 日历：还没到的开订、开始申请、截止和出结果
  const eventsOf = (item: BookingItem): CalendarEvent[] => {
    if (!today) return [];
    const { rule } = item;
    const description = [rule.noteZh, rule.url].join("\n");
    return item.openings.flatMap((opening, index): CalendarEvent[] => {
      if (!opening.opens) return [];
      const base = { description, url: rule.url, tz: opening.tz };
      const uid = (kind: string, day: string) => `${rule.id}-${index}-${kind}-${day}@nps-guide`;
      const events: CalendarEvent[] = [];
      const lottery = opening.window.type === "seasonal-lottery" || opening.window.type === "monthly-lottery";
      if (opening.opens >= today) {
        events.push({
          ...base,
          uid: uid("opens", opening.opens),
          title: fill(lottery || opening.window.type === "days-before" ? b.eventApply : b.eventOpens, { title: rule.titleZh }),
          date: opening.opens,
          time: opening.time,
        });
      }
      if (lottery && opening.closes && opening.closes >= today && opening.closes !== opening.opens) {
        events.push({ ...base, uid: uid("closes", opening.closes), title: fill(b.eventDeadline, { title: rule.titleZh }), date: opening.closes, time: opening.until });
      }
      if (opening.results && opening.results >= today) {
        events.push({ ...base, uid: uid("results", opening.results), title: fill(b.eventResults, { title: rule.titleZh }), date: opening.results, tz: undefined });
      }
      return events;
    });
  };
  const allEvents = sorted.flatMap(eventsOf);
  const download = (events: CalendarEvent[], name: string) => {
    const blob = new Blob([calendarFile(events, new Date(), b.calendarName)], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${name}.ics`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10000);
  };

  const dayList = (days: number[]) => {
    const n = days.map((day) => day + 1);
    // 连续的几天写成“第 2–4 天”
    const consecutive = n.every((value, i) => i === 0 || value === n[i - 1] + 1);
    return consecutive && n.length > 2 ? `${n[0]}–${n.at(-1)}` : n.join("、");
  };

  return (
    <section id="plan-bookings" className="scroll-mt-32 border-t border-ink pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow text-mute">{b.eyebrow}</p>
          <h2 className="mt-4 font-serif text-2xl leading-snug">{b.title}</h2>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{b.intro}</p>
          {approximate && <p className="mt-2 text-xs leading-6 text-clay-700">{b.approxNote}</p>}
        </div>
        {!approximate && allEvents.length > 0 && (
          <div className="max-w-xs print:hidden">
            <button type="button" className="link-line text-xs tracking-[0.1em]" onClick={() => download(allEvents, b.calendarName)}>
              {b.calendarAll}
            </button>
            <p className="mt-2 text-xs leading-5 text-mute">{b.calendarHint}</p>
          </div>
        )}
      </div>

      {sorted.length > 0 && (
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {sorted.map((item) => {
            const { rule } = item;
            const [main, ...also] = item.openings;
            const status = today ? openingState(main, today) : null;
            const lottery = main.window.type === "seasonal-lottery" || main.window.type === "monthly-lottery";
            // 主要的方式截止了（或还没公布），后面的机会才显示状态
            const fallback = also.find((opening) => {
              const next = today ? openingState(opening, today) : null;
              return next && (next.state === "upcoming" || next.state === "open");
            });
            const lodging = rule.kind === "lodging" || rule.kind === "campground";
            const events = eventsOf(item);
            return (
              <li key={rule.id} className="grid gap-3 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <div className="space-y-2">
                  {status && (
                    <span className={`inline-block border px-2 py-0.5 text-[11px] leading-5 ${chipClass(status)}`}>
                      {stateLabel(status, lottery)}
                    </span>
                  )}
                  <p className="text-xs text-mute">
                    {b.kinds[rule.kind]} · {fill(lodging ? b.nights : b.days, { n: dayList(item.days) })}
                  </p>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] leading-6">{rule.titleZh}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{describe(main, rule.kind === "lottery")}</p>
                  {item.later.length > 0 && main.window.type !== "block" && (
                    <p className="text-xs leading-6 text-mute">
                      {fill(b.later, { dates: item.later.slice(0, 4).map(date).join("、") })}
                    </p>
                  )}
                  {item.later.length > 0 && main.window.type === "block" && (
                    <p className="text-xs leading-6 text-mute">{fill(b.laterBlock, { dates: item.later.map(date).join("、") })}</p>
                  )}
                  {also.map((opening, i) => {
                    const next = today ? openingState(opening, today) : null;
                    return (
                      <p key={i} className="mt-1 text-sm leading-6 text-ink-soft">
                        <span className="text-mute">{b.also}</span>
                        {describe(opening, rule.kind === "lottery")}
                        {next && opening === fallback && status && (status.state === "closed" || status.state === "unknown") && (
                          <span className={`ml-2 inline-block border px-1.5 text-[10px] leading-4 ${chipClass(next)}`}>
                            {stateLabel(next, false)}
                          </span>
                        )}
                      </p>
                    );
                  })}
                  <p className="mt-2 text-xs leading-6 text-mute">{rule.noteZh}</p>
                  <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs tracking-[0.1em] print:hidden">
                    <a href={rule.url} target="_blank" rel="noreferrer" className="link-line">
                      {main.window.type === "first-come" ? b.source : b.book}
                    </a>
                    {rule.source !== rule.url && main.window.type !== "first-come" && (
                      <a href={rule.source} target="_blank" rel="noreferrer" className="link-line">
                        {b.source}
                      </a>
                    )}
                    {!approximate && events.length > 0 && (
                      <button type="button" className="link-line" onClick={() => download(events, rule.titleZh)}>
                        {b.calendarOne}
                      </button>
                    )}
                    <span className="tracking-normal text-mute">{fill(b.verified, { date: rule.verified })}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {others.length > 0 && (
        <div className="mt-8">
          <h3 className="font-serif text-xl">{b.others}</h3>
          <ul className="mt-4 space-y-3">
            {others.map((other) => (
              <li key={other.id} className="text-sm leading-6">
                {other.name}
                <span className="block text-xs text-mute">{other.permit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
