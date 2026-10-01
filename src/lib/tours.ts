import type { MonthDay } from "../data/bookings";
import { tourSchedules, type TourSchedule } from "../data/tours";

// 有固定班次的游船、导览团：这一天有哪些班次。只按日期落在哪一段算，不按星期（只定了月份时日期是估的）

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

/** date 这天的班次；没有固定班次的景点、或者不知道日期是 null */
export function departuresOn(id: string, date: string | null | undefined): Departures | null {
  const schedule = byId.get(id);
  if (!schedule || !date) return null;
  const md = date.slice(5, 10);
  const period = schedule.periods.find(({ from, to }) => inPeriod(md, from, to));
  return {
    times: period ? period.departures.map(minutesOf).sort((a, b) => a - b) : [],
    checkIn: schedule.checkInMin,
  };
}

/** 这天开不开（没有固定班次的算开） */
export function runsOn(id: string, date: string | null | undefined): boolean {
  const departures = departuresOn(id, date);
  return departures === null || departures.times.length > 0;
}

/** 一年里开的日子：最早的一段开始到最晚的一段结束（攻略说明里说“几月几号到几月几号才开”） */
export function tourSeason(schedule: TourSchedule): { from: MonthDay; to: MonthDay } {
  const froms = schedule.periods.map((period) => period.from).sort();
  const tos = schedule.periods.map((period) => period.to).sort();
  return { from: froms[0], to: tos.at(-1)! };
}
