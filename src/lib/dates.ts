/** "2026-10-05" 加 n 天（按日历日，不受时区影响） */
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function monthOf(date: string): number {
  return Number(date.slice(5, 7));
}
