import { tempClosures, UNKNOWN_REOPEN_DAYS, type TempClosure } from "@/data/closures";
import { addDays } from "./dates";

const byAttraction = new Map<string, TempClosure[]>();
for (const closure of tempClosures) {
  for (const id of closure.attractions) byAttraction.set(id, [...(byAttraction.get(id) ?? []), closure]);
}

export interface ClosureState {
  closure: TempClosure;
  /** true：这天肯定关着；false：没公布重开时间、离核对那天已经很久，可能已经开了 */
  certain: boolean;
}

/** 这个景点 date（YYYY-MM-DD）这天有没有临时关闭 */
export function closureOn(id: string, date: string | null | undefined): ClosureState | null {
  if (!date) return null;
  for (const closure of byAttraction.get(id) ?? []) {
    if (date < closure.from) continue;
    if (closure.weekdays && !closure.weekdays.includes(new Date(`${date}T12:00:00Z`).getUTCDay())) continue;
    if (closure.reopen) {
      if (date < closure.reopen) return { closure, certain: true };
      continue;
    }
    const certain = closure.longTerm === true || date < addDays(closure.checked, UNKNOWN_REOPEN_DAYS);
    return { closure, certain };
  }
  return null;
}

/** 这几天都肯定关着（自动生成攻略就不排了） */
export function closedAllDays(id: string, dates: (string | null | undefined)[]): ClosureState | null {
  const known = dates.filter((date): date is string => Boolean(date));
  if (known.length === 0) return null;
  const states = known.map((date) => closureOn(id, date));
  return states.every((state) => state?.certain) ? states[0] : null;
}

export const closuresOf = (id: string) => byAttraction.get(id) ?? [];

/** 每周关的那几天，写成“周三”“周六、周日” */
export const weekdaysZh = (weekdays: number[]) => weekdays.map((day) => `周${"日一二三四五六"[day]}`).join("、");
