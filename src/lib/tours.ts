import type { MonthDay } from "../data/bookings";
import { tourSchedules, type TourSchedule, type Weekday } from "../data/tours";

// 有固定班次的游船、导览团：这一天有哪些班次。排时间线只按日期落在哪一段算，不按星期（只定了月份时日期是估的）；
// 定了日期的行程另外用 runsOn(…, true) 看这天是星期几、开不开

const byId = new Map(tourSchedules.map((schedule) => [schedule.id, schedule]));

export function tourScheduleOf(id: string): TourSchedule | undefined {
  return byId.get(id);
}

export interface Departures {
  /** 开船、发车的时间（当天第几分钟，从早到晚）；这天不开是空的 */
  times: number[];
  /** 要提前多久到 */
  checkIn: number;
}

const minutesOf = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));
const inPeriod = (md: MonthDay, from: MonthDay, to: MonthDay) => (from <= to ? md >= from && md <= to : md >= from || md <= to);

/** date 落在哪一段（只写了某一年日期的段，别的年份不算） */
const periodOn = (schedule: TourSchedule, date: string) => {
  const md = date.slice(5, 10);
  const year = Number(date.slice(0, 4));
  return schedule.periods.find((period) => inPeriod(md, period.from, period.to) && (!period.year || period.year === year));
};

/** 场次是按某一年的日期写的（每年日期都不同） */
export const datedSchedule = (schedule: TourSchedule) => schedule.periods.some((period) => period.year !== undefined);

/** date 这天的班次；没有固定班次的景点、或者不知道日期是 null */
export function departuresOn(id: string, date: string | null | undefined): Departures | null {
  const schedule = byId.get(id);
  if (!schedule || !date) return null;
  const period = periodOn(schedule, date);
  return {
    times: period ? period.departures.map(minutesOf).sort((a, b) => a - b) : [],
    checkIn: schedule.checkInMin,
  };
}

const WEEKDAYS: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "2027-07-12" 是星期几 */
export const weekdayOf = (date: string): Weekday => WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

/** 这天开不开（没有固定班次的算开）；exact：日期是定好的，只在某几天开的也按星期算 */
export function runsOn(id: string, date: string | null | undefined, exact = false): boolean {
  const departures = departuresOn(id, date);
  if (departures === null) return true;
  if (departures.times.length === 0) return false;
  if (!exact || !date) return true;
  const period = periodOn(byId.get(id)!, date);
  return !period?.days || period.days.includes(weekdayOf(date));
}

/** 一年里开的日子：最早的一段开始到最晚的一段结束（攻略说明里说“几月几号到几月几号才开”） */
export function tourSeason(schedule: TourSchedule): { from: MonthDay; to: MonthDay } {
  const froms = schedule.periods.map((period) => period.from).sort();
  const tos = schedule.periods.map((period) => period.to).sort();
  return { from: froms[0], to: tos.at(-1)! };
}
