const HAN = /[\u3400-\u9fff\uf900-\ufaff]/;
const LATIN = /[A-Za-z0-9]/;

/**
 * 把 "更新于 {date}" 这类模板里的占位符替换成实际值。
 * 汉字紧挨着的值以英文字母、数字开头或结尾时补一个空格，和手写的“近 20 年”一样
 * （“要走{road}” + “Stevens Canyon Road” → “要走 Stevens Canyon Road”）；以后加日语界面要另外处理
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string, offset: number) => {
    if (!(key in values)) return match;
    let value = String(values[key]);
    if (value === "") return value;
    if (HAN.test(template[offset - 1] ?? "") && LATIN.test(value[0])) value = ` ${value}`;
    if (HAN.test(template[offset + match.length] ?? "") && LATIN.test(value.at(-1)!)) value = `${value} `;
    return value;
  });
}

/** 机器翻译出来的中文：汉字和英文字母、数字之间补空格，去掉全角括号里多出来的空格（“白河（ White River ）”） */
export function tidyChinese(text: string): string {
  return text
    .replace(/（\s+/g, "（")
    .replace(/\s+）/g, "）")
    .replace(/\s*([，。；：、！？])\s*/g, "$1")
    .replace(/([\u3400-\u9fff\uf900-\ufaff])([A-Za-z0-9])/g, "$1 $2")
    .replace(/([A-Za-z0-9])([\u3400-\u9fff\uf900-\ufaff])/g, "$1 $2")
    .replace(/ {2,}/g, " ");
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

/** 12130 → "12,130"；固定用英文分隔，服务端和浏览器输出一致 */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatMeters(feet: number, units: UnitText): string {
  return fill(units.meters, { m: Math.round((feet * 0.3048) / 10) * 10 });
}
