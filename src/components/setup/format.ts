import { formatDisplayDate, monthDayToIso } from "@/domain/dates";

/** "04-15" → "Apr 15"; null → "none". Leap year used so "02-29" stays valid. */
export function formatMonthDay(md: string | null): string {
  if (md === null) return "none";
  try {
    return formatDisplayDate(monthDayToIso(md, 2000));
  } catch {
    return md;
  }
}
