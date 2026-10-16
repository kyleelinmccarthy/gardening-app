/**
 * Tiny UTC-safe ISO date helpers. Dates are "YYYY-MM-DD" strings; all
 * arithmetic happens in UTC so DST and local timezones never shift results.
 */

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_DAY = /^(\d{2})-(\d{2})$/;

/** Full English month names, January first (index = month - 1). */
export const MONTH_NAMES_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Three-letter month abbreviations ("Jan"…"Dec"). */
export const MONTH_NAMES_SHORT: readonly string[] = MONTH_NAMES_LONG.map((n) => n.slice(0, 3));

function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

/** Formats a Date's UTC calendar fields as "YYYY-MM-DD". */
export function toIsoDate(d: Date): string {
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function isValidIsoDate(s: string): boolean {
  const m = ISO_DATE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** Parses "YYYY-MM-DD" to a Date at UTC midnight. Throws on invalid input. */
export function parseIsoDate(s: string): Date {
  if (!isValidIsoDate(s)) throw new Error(`Invalid ISO date: "${s}"`);
  const m = ISO_DATE.exec(s)!;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function addDays(iso: string, n: number): string {
  return toIsoDate(new Date(parseIsoDate(iso).getTime() + n * MS_PER_DAY));
}

export function addWeeks(iso: string, n: number): string {
  return addDays(iso, n * 7);
}

/** Whole days from a to b (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((parseIsoDate(b).getTime() - parseIsoDate(a).getTime()) / MS_PER_DAY);
}

/** The local calendar date of `now` as ISO. */
export function todayIso(now: Date = new Date()): string {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Combines "MM-DD" with a year. "02-29" in a non-leap year clamps to 02-28.
 * Throws when the month-day is malformed or impossible.
 */
export function monthDayToIso(md: string, year: number): string {
  const m = MONTH_DAY.exec(md);
  if (!m) throw new Error(`Invalid month-day: "${md}"`);
  const [month, day] = [Number(m[1]), Number(m[2])];
  if (month < 1 || month > 12) throw new Error(`Invalid month-day: "${md}"`);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // February 29th is always accepted (and clamped below) so "02-29" works in any year.
  const maxDay = month === 2 ? 29 : daysInMonth;
  if (day < 1 || day > maxDay) throw new Error(`Invalid month-day: "${md}"`);
  return `${pad(year, 4)}-${pad(month)}-${pad(Math.min(day, daysInMonth))}`;
}

export interface DisplayDateOptions {
  /** Append the year, e.g. "Apr 12, 2025". */
  year?: boolean;
  /** "short" (default) => "Apr", "long" => "April". */
  month?: "short" | "long";
}

/** Locale-independent display string such as "Apr 12". */
export function formatDisplayDate(iso: string, opts: DisplayDateOptions = {}): string {
  const d = parseIsoDate(iso);
  const name = MONTH_NAMES_LONG[d.getUTCMonth()];
  const month = opts.month === "long" ? name : name.slice(0, 3);
  const base = `${month} ${d.getUTCDate()}`;
  return opts.year ? `${base}, ${d.getUTCFullYear()}` : base;
}

/**
 * "04-15" → "Apr 15". A leap year is used so "02-29" stays valid; a value that
 * is not a real month-day (e.g. "02-31") is returned unchanged rather than throwing.
 */
export function formatMonthDay(md: string): string {
  try {
    return formatDisplayDate(monthDayToIso(md, 2000));
  } catch {
    return md;
  }
}
