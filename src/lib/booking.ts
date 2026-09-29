import type { BookingRule, BookingWindow, MonthDay } from "@/data/bookings";
import { addDays } from "./dates";

/** 行程里的一天：日期、在哪些公园、去哪些景点、当晚住哪 */
export interface TripVisit {
  day: number;
  date: string;
  parks: string[];
  stops: string[];
  /** 当晚住的推荐住宿 id（最后一天回程，没有） */
  lodging?: string;
}

/** 某种预约方式对去的那天来说：哪天开放、到哪天截止、哪天出结果 */
export interface Opening {
  window: BookingWindow;
  /** 开订或开始申请的日期；先到先得、那一年还没公布时是 null */
  opens: string | null;
  time?: string;
  tz?: string;
  /** 抽签截止的日期（含），当天几点截止 */
  closes?: string;
  until?: string;
  /** 出结果的日期；当天出结果的（前一天抽签）是几点 */
  results?: string;
  resultsTime?: string;
}

export type OpeningState =
  /** 还没开放 */
  | { state: "upcoming"; inDays: number }
  /** 现在能订或能申请；抽签的 closesInDays 天后截止 */
  | { state: "open"; sinceDays: number; closesInDays?: number }
  /** 申请截止了，等结果 */
  | { state: "waiting"; results?: string }
  /** 这一轮已经截止 */
  | { state: "closed" }
  /** 那一年的开放日期还没公布 */
  | { state: "unknown" }
  /** 没有固定的开放日，现在就能订 */
  | { state: "anytime" }
  /** 不用订，先到先得 */
  | { state: "none" };

export interface BookingItem {
  rule: BookingRule;
  /** 要订的是第几天（从 0 开始）和那几天的日期 */
  days: number[];
  dates: string[];
  /** 按第一天算的开放时间：先是主要的方式，后面是错过了还有的机会 */
  openings: Opening[];
  /** 滚动开放时，后面几天各自的开放日期（和第一天不同的） */
  later: string[];
}

const parse = (date: string) => date.split("-").map(Number) as [number, number, number];
const pad = (n: number) => String(n).padStart(2, "0");

/** 某年某月某日；月份可以超出 1–12（自动进位），日子超过那个月的天数就取月底 */
function dateOf(year: number, month: number, day: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const y = first.getUTCFullYear();
  const m = first.getUTCMonth() + 1;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${pad(m)}-${pad(Math.min(day, last))}`;
}

function addMonths(date: string, months: number): string {
  const [year, month, day] = parse(date);
  return dateOf(year, month + months, day);
}

const withYear = (monthDay: MonthDay, year: number) => {
  const [month, day] = monthDay.split("-").map(Number);
  return dateOf(year, month, day);
};
const yearOf = (date: string) => Number(date.slice(0, 4));

/** 两个日期之间差几天（b − a） */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = parse(a);
  const [by, bm, bd] = parse(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** "MM-DD" 在不在 from–to 里（可以跨年，比如 11-01 到 03-31） */
function inRange(monthDay: MonthDay, from: MonthDay, to: MonthDay): boolean {
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

function applies(rule: BookingRule, date: string): boolean {
  if (!rule.applies) return true;
  const monthDay = date.slice(5);
  return rule.applies.some((range) => inRange(monthDay, range.from, range.to));
}

/** 去 visit 那天，这种预约方式哪天开放；不适用（比如不在抽签的季节里）就是 null */
export function openingFor(window: BookingWindow, visit: string): Opening | null {
  switch (window.type) {
    case "rolling": {
      const opens = window.months ? addMonths(visit, -window.months) : addDays(visit, -(window.days ?? 0));
      return { window, opens, time: window.time, tz: window.tz };
    }
    case "block": {
      const [year, month, day] = parse(visit);
      // 去的日子在 visitDay 号以前的，属于上个月那一段
      const blockMonth = day >= (window.visitDay ?? window.day) ? month : month - 1;
      return { window, opens: dateOf(year, blockMonth - window.monthsAhead, window.day), time: window.time, tz: window.tz };
    }
    case "seasonal-lottery": {
      const monthDay = visit.slice(5);
      const season = window.seasons.find((s) => inRange(monthDay, s.visit[0], s.visit[1]));
      if (!season) return null;
      // 这一季从哪天开始（跨年的季节，1、2 月去的算前一年开始）
      const wraps = season.visit[0] > season.visit[1];
      const seasonStart = withYear(season.visit[0], yearOf(visit) - (wraps && monthDay <= season.visit[1] ? 1 : 0));
      // 申请截止在这一季开始之前，开始申请又在截止之前
      let closes = withYear(season.apply[1], yearOf(seasonStart));
      if (closes > seasonStart) closes = withYear(season.apply[1], yearOf(closes) - 1);
      let opens = withYear(season.apply[0], yearOf(closes));
      if (opens > closes) opens = withYear(season.apply[0], yearOf(opens) - 1);
      let results = season.results ? withYear(season.results, yearOf(closes)) : undefined;
      if (results && season.results && results < closes) results = withYear(season.results, yearOf(results) + 1);
      return { window, opens, closes, results, time: window.time, tz: window.tz };
    }
    case "seasonal-release": {
      const monthDay = visit.slice(5);
      const season = window.seasons.find((s) => inRange(monthDay, s.visit[0], s.visit[1]));
      if (!season) return null;
      const wraps = season.visit[0] > season.visit[1];
      const seasonStart = withYear(season.visit[0], yearOf(visit) - (wraps && monthDay <= season.visit[1] ? 1 : 0));
      let opens = withYear(season.opens, yearOf(seasonStart));
      if (opens > seasonStart) opens = withYear(season.opens, yearOf(opens) - 1);
      return { window, opens, time: window.time, tz: window.tz };
    }
    case "monthly-lottery": {
      const [year, month] = parse(visit);
      const [first, last] = window.applyDays ?? [1, 31];
      const applyMonth = dateOf(year, month - window.monthsAhead, 1);
      const [ay, am] = parse(applyMonth);
      return {
        window,
        opens: dateOf(ay, am, first),
        closes: dateOf(ay, am, last),
        results: window.resultsDay ? dateOf(ay, am + 1, window.resultsDay) : undefined,
      };
    }
    case "days-before": {
      const opens = addDays(visit, -window.days);
      return { window, opens, closes: opens, time: window.time, until: window.until, resultsTime: window.results, tz: window.tz };
    }
    case "fixed-date":
      // 公布的是别的年份的开订日期：这一年的还不知道
      if (window.forYear && window.forYear !== yearOf(visit)) return { window, opens: null };
      return { window, opens: window.opens, time: window.time, tz: window.tz };
    case "anytime":
    case "first-come":
      return { window, opens: null };
  }
}

/** today（"YYYY-MM-DD"）时，这个开放时间处在哪一步 */
export function openingState(opening: Opening, today: string): OpeningState {
  if (opening.window.type === "first-come") return { state: "none" };
  if (opening.window.type === "anytime") return { state: "anytime" };
  if (!opening.opens) return { state: "unknown" };
  if (today < opening.opens) return { state: "upcoming", inDays: daysBetween(today, opening.opens) };
  const sinceDays = daysBetween(opening.opens, today);
  if (!opening.closes) return { state: "open", sinceDays };
  if (today <= opening.closes) return { state: "open", sinceDays, closesInDays: daysBetween(today, opening.closes) };
  if (opening.results && today < opening.results) return { state: "waiting", results: opening.results };
  return { state: "closed" };
}

/** 这次行程要提前订的：按规则对到行程里的景点、住处和公园，算出第一天的开放时间 */
export function bookingsForTrip(visits: TripVisit[], rules: BookingRule[]): BookingItem[] {
  const items: BookingItem[] = [];
  for (const rule of rules) {
    if (rule.targets.length === 0 && rule.places?.length) continue;
    const hits = visits.filter((visit) => {
      const matches =
        rule.targets.length > 0
          ? rule.targets.some((id) => visit.stops.includes(id) || visit.lodging === id)
          : visit.parks.includes(rule.park);
      return matches && applies(rule, visit.date);
    });
    if (hits.length === 0) continue;
    const openings = [rule.window, ...(rule.also ?? [])]
      .map((window) => openingFor(window, hits[0].date))
      .filter((opening): opening is Opening => opening !== null);
    if (openings.length === 0) continue;
    const firstOpens = openings[0].opens;
    const later = [
      ...new Set(
        hits
          .slice(1)
          .map((visit) => openingFor(rule.window, visit.date)?.opens)
          .filter((opens): opens is string => Boolean(opens) && opens !== firstOpens),
      ),
    ];
    items.push({ rule, days: hits.map((visit) => visit.day), dates: hits.map((visit) => visit.date), openings, later });
  }
  return items;
}

/** 下一件要做的事是哪天：还没开放的按开放日，能订的算今天；已经截止、先到先得的排最后 */
export function nextActionDate(item: BookingItem, today: string): string {
  for (const opening of item.openings) {
    const status = openingState(opening, today);
    if (status.state === "open" || status.state === "anytime") return today;
    if (status.state === "upcoming" && opening.opens) return opening.opens;
    if (status.state === "waiting" && status.results) return status.results;
  }
  return "9999-12-31";
}

// ---- 日历提醒（.ics）

/** tz 时区的 date time 是 UTC 的哪一刻 */
export function zonedToUtc(date: string, time: string, tz: string): Date {
  const [year, month, day] = parse(date);
  const [hour, minute] = time.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = (instant: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(instant));
    const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")) - instant;
  };
  const first = guess - offset(guess);
  // 夏令时切换附近再校一次
  return new Date(guess - offset(first));
}

export interface CalendarEvent {
  uid: string;
  title: string;
  date: string;
  /** 有具体时间就是那一刻开始的 30 分钟；没有就是全天 */
  time?: string;
  tz?: string;
  description: string;
  url?: string;
}

const icsText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** 每行不超过 75 个字节（按 UTF-8 算，不把一个汉字拆开），续行以空格开头 */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** 生成日历文件：每个事件提前一天和开始前提醒 */
export function calendarFile(events: CalendarEvent[], now: Date, name: string): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NPS Guide//Bookings//ZH", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  lines.push(`X-WR-CALNAME:${icsText(name)}`);
  for (const event of events) {
    lines.push("BEGIN:VEVENT", `UID:${event.uid}`, `DTSTAMP:${stamp(now)}`);
    if (event.time && event.tz) {
      const start = zonedToUtc(event.date, event.time, event.tz);
      lines.push(`DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(start.getTime() + 30 * 60_000))}`);
    } else {
      const compact = event.date.replace(/-/g, "");
      lines.push(`DTSTART;VALUE=DATE:${compact}`, `DTEND;VALUE=DATE:${addDays(event.date, 1).replace(/-/g, "")}`);
    }
    lines.push(`SUMMARY:${icsText(event.title)}`, `DESCRIPTION:${icsText(event.description)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    // 全天事件的提醒相对当天 0 点：前一天早上 9 点；有时间的提前一天和提前 15 分钟
    const alarms = event.time && event.tz ? ["-P1D", "-PT15M"] : ["-PT15H"];
    for (const trigger of alarms) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText(event.title)}`, `TRIGGER:${trigger}`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
