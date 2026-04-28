const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseSeasonDate(s: string, year: number): Date {
  const [monStr, dayStr] = s.trim().split(/\s+/);
  const month = MONTHS[monStr.slice(0, 3).toLowerCase()];
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day);
}

export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function seasonDayOfYear(s: string): number {
  return dayOfYear(parseSeasonDate(s, 2001));
}

export interface SeasonRange {
  start: string;
  end: string;
}

export function isInRange(today: Date, range: SeasonRange): boolean {
  const t = dayOfYear(today);
  const s = seasonDayOfYear(range.start);
  const e = seasonDayOfYear(range.end);
  if (s <= e) return t >= s && t <= e;
  return t >= s || t <= e;
}

export function weeksUntil(today: Date, startStr: string): number {
  const t = dayOfYear(today);
  let s = seasonDayOfYear(startStr);
  let diff = s - t;
  if (diff < 0) diff += 365;
  return Math.max(1, Math.round(diff / 7));
}

export function weeksSince(today: Date, endStr: string): number {
  const t = dayOfYear(today);
  const e = seasonDayOfYear(endStr);
  let diff = t - e;
  if (diff < 0) diff += 365;
  return Math.max(1, Math.round(diff / 7));
}

export function currentMonthName(d: Date): string {
  return d.toLocaleString("en-US", { month: "long" });
}
