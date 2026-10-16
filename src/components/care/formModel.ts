/** Parsing/validation for the care hub forms (reminder, journal, manual log entry). */
import { isValidIsoDate } from "@/domain/dates";
import type { CareType } from "@/domain/types";

export type FormResult<TValues, TField extends string> =
  | { ok: true; value: TValues }
  | { ok: false; errors: Partial<Record<TField, string>> };

const DATE_ERROR = "Pick a valid date.";
const orUndefined = (s: string): string | undefined => (s.trim() === "" ? undefined : s.trim());

// --- reminder --------------------------------------------------------------

export interface ReminderFormValues {
  title: string;
  dueDate: string;
  /** Empty = does not repeat. */
  repeatDays: string;
  /** Empty = not tied to a planting. */
  plantingId: string;
}
export interface ReminderFields {
  title: string;
  dueDate: string;
  repeatDays: number | undefined;
  plantingId: string | undefined;
}
type ReminderField = "title" | "dueDate" | "repeatDays";

export function parseReminderForm(v: ReminderFormValues): FormResult<ReminderFields, ReminderField> {
  const errors: Partial<Record<ReminderField, string>> = {};
  const title = v.title.trim();
  if (!title) errors.title = "Give the reminder a title.";
  if (!isValidIsoDate(v.dueDate)) errors.dueDate = DATE_ERROR;

  let repeatDays: number | undefined;
  if (v.repeatDays.trim() !== "") {
    const n = Number(v.repeatDays);
    if (!Number.isInteger(n) || n < 1) errors.repeatDays = "Repeat must be a whole number of days (1 or more).";
    else repeatDays = n;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { title, dueDate: v.dueDate, repeatDays, plantingId: orUndefined(v.plantingId) } };
}

// --- journal ---------------------------------------------------------------

export interface JournalFormValues {
  date: string;
  title: string;
  text: string;
  plantingId: string;
}
export interface JournalFields {
  date: string;
  title: string;
  text: string;
  plantingId: string | undefined;
}
type JournalField = "date" | "title";

export function parseJournalForm(v: JournalFormValues): FormResult<JournalFields, JournalField> {
  const errors: Partial<Record<JournalField, string>> = {};
  const title = v.title.trim();
  if (!title) errors.title = "Give the entry a title.";
  if (!isValidIsoDate(v.date)) errors.date = DATE_ERROR;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { date: v.date, title, text: v.text.trim(), plantingId: orUndefined(v.plantingId) } };
}

// --- care log --------------------------------------------------------------

export interface LogFormValues {
  type: CareType;
  date: string;
  plantingId: string;
  note: string;
}
export interface LogFields {
  type: CareType;
  date: string;
  plantingId: string | undefined;
  note: string | undefined;
}

export function parseLogForm(v: LogFormValues): FormResult<LogFields, "date"> {
  if (!isValidIsoDate(v.date)) return { ok: false, errors: { date: DATE_ERROR } };
  return { ok: true, value: { type: v.type, date: v.date, plantingId: orUndefined(v.plantingId), note: orUndefined(v.note) } };
}
