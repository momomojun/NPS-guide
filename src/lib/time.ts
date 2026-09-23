const DAY_MS = 24 * 60 * 60 * 1000;

/** 距今多少天；date 形如 "2026-09-22" 或 "2026-09-22 00:00:00.0" */
export function daysSince(date: string): number {
  return (Date.now() - Date.parse(date.slice(0, 10))) / DAY_MS;
}
