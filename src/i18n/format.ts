// 把 "更新于 {date}" 这类模板里的占位符替换成实际值
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export interface UnitText {
  minutes: string;
  hours: string;
  hoursMinutes: string;
  months: string;
  month: string;
  allYear: string;
  km: string;
  meters: string;
}

/** 分钟数 → "约 1 小时 30 分" 里的时长部分，按 5 分钟取整 */
export function formatDuration(minutes: number, units: UnitText): string {
  const rounded = Math.max(5, Math.round(minutes / 5) * 5);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return fill(units.minutes, { m });
  return m === 0 ? fill(units.hours, { h }) : fill(units.hoursMinutes, { h, m });
}

/** [6,7,8,9,10] → "6–10 月"；跨年的 [11,12,1,2,3] → "11–3 月" */
export function formatMonths(months: number[], units: UnitText): string {
  const set = new Set(months);
  if (set.size >= 12) return units.allYear;
  const next = (m: number) => (m % 12) + 1;
  const prev = (m: number) => ((m + 10) % 12) + 1;
  const runs: string[] = [];
  for (let m = 1; m <= 12; m++) {
    if (!set.has(m) || set.has(prev(m))) continue;
    let end = m;
    while (set.has(next(end))) end = next(end);
    runs.push(end === m ? fill(units.month, { m }) : fill(units.months, { from: m, to: end }));
  }
  return runs.join("、");
}

export function formatKm(miles: number, units: UnitText): string {
  return fill(units.km, { km: (miles * 1.609).toFixed(1), mi: miles });
}

export function formatMeters(feet: number, units: UnitText): string {
  return fill(units.meters, { m: Math.round((feet * 0.3048) / 10) * 10 });
}
