/**
 * Pure helpers for the care hub: task grouping, log filtering/sorting and
 * labels. Scheduling rules themselves live in `@/domain/care`.
 */
import {
  fertilizeIntervalDays,
  wateringIntervalDays,
  type CareTaskContext,
  type CareTaskItem,
  type TaskCompletion,
} from "@/domain/care";
import { formatDisplayDate } from "@/domain/dates";
import type {
  CareLogEntry,
  CareType,
  Garden,
  GardenProfile,
  JournalEntry,
  Plant,
  Planting,
  PlantingStatus,
  PlantCatalog,
  Reminder,
} from "@/domain/types";
import type { AppAction } from "@/state/appReducer";

/** Humidity that matters for watering: outdoor climate, or the indoor room. */
export function careContext(profile: GardenProfile): CareTaskContext {
  return {
    setting: profile.setting,
    summerHighF: profile.climate.summerHighF,
    humidity: profile.setting === "indoor" ? profile.indoor.humidity : profile.climate.humidity,
  };
}

/** ISO date of the newest log entry for a planting and care type. */
export function lastLogDate(log: readonly CareLogEntry[], plantingId: string, type: CareType): string | undefined {
  let latest: string | undefined;
  for (const e of log) {
    if (e.plantingId === plantingId && e.type === type && (latest === undefined || e.date > latest)) latest = e.date;
  }
  return latest;
}

// --- tasks -----------------------------------------------------------------

export const CARE_TYPE_ORDER: readonly CareType[] = [
  "water",
  "fertilize",
  "inspect-pests",
  "harvest",
  "prune",
  "mulch",
  "repot",
  "custom",
];

export function partitionTasks(tasks: readonly CareTaskItem[], today: string) {
  return {
    due: tasks.filter((t) => t.dueDate <= today),
    upcoming: tasks.filter((t) => t.dueDate > today),
  };
}

export interface TaskGroup {
  type: CareType;
  tasks: CareTaskItem[];
}

/** Tasks grouped by care type (fixed order; empty types omitted); order within a group is kept. */
export function groupTasksByType(tasks: readonly CareTaskItem[]): TaskGroup[] {
  return CARE_TYPE_ORDER.map((type) => ({ type, tasks: tasks.filter((t) => t.type === type) })).filter(
    (g) => g.tasks.length > 0,
  );
}

export function dueLabel(task: Pick<CareTaskItem, "dueDate" | "overdueDays">, today: string): string {
  if (task.overdueDays > 0) return `${task.overdueDays} ${task.overdueDays === 1 ? "day" : "days"} overdue`;
  return task.dueDate <= today ? "Due today" : `Due ${formatDisplayDate(task.dueDate)}`;
}

/** The store actions that record a completed task. */
export function completionActions(gardenId: string, completion: TaskCompletion): AppAction[] {
  const actions: AppAction[] = [];
  if (completion.log) actions.push({ type: "care/log", gardenId, entry: completion.log });
  if (completion.reminderUpdate) {
    const { id, ...changes } = completion.reminderUpdate;
    actions.push({ type: "reminder/update", gardenId, reminderId: id, changes });
  }
  return actions;
}

// --- plantings -------------------------------------------------------------

/** Planned → growing also stamps today as the planting date. */
export function statusChanges(
  planting: Pick<Planting, "status">,
  next: PlantingStatus,
  today: string,
): Partial<Pick<Planting, "status" | "plantedOn">> {
  return planting.status === "planned" && next === "growing" ? { status: next, plantedOn: today } : { status: next };
}

export interface PlantingIntervals {
  /** Days between waterings with today's conditions. */
  waterEvery: number;
  /** Days between feedings, or null when feeding is paused / not needed. */
  feedEvery: number | null;
}

/** Watering/feeding cadence for a planting, adjusted for container, climate and the month of `today`. */
export function plantingIntervals(
  planting: Pick<Planting, "inContainer">,
  plant: Plant,
  profile: GardenProfile,
  today: string,
): PlantingIntervals {
  const ctx = careContext(profile);
  const month = Number(today.slice(5, 7));
  return {
    waterEvery: wateringIntervalDays(plant, {
      inContainer: planting.inContainer,
      setting: ctx.setting,
      summerHighF: ctx.summerHighF,
      humidity: ctx.humidity,
      month,
    }),
    feedEvery: fertilizeIntervalDays(plant, { setting: ctx.setting, month }),
  };
}

export function intervalLabel(days: number | null): string {
  if (days === null) return "not needed right now";
  return days === 1 ? "every day" : `every ${days} days`;
}

/** "Tomato (Bed name)" for a planting id; safe for ids that no longer exist. */
export function plantingLabel(garden: Pick<Garden, "plantings" | "beds">, catalog: PlantCatalog, plantingId: string): string {
  const planting = garden.plantings.find((p) => p.id === plantingId);
  if (!planting) return "Removed planting";
  const name = catalog.get(planting.plantId)?.name ?? planting.plantId.replace(/-/g, " ");
  const bed = planting.bedId ? garden.beds.find((b) => b.id === planting.bedId) : undefined;
  return bed ? `${name} (${bed.name})` : name;
}

// --- log, reminders, journal ----------------------------------------------

/** Newest first; entries added later win ties on the same date. */
function newestFirst<T extends { date: string }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.date.localeCompare(a.item.date) || b.index - a.index)
    .map((x) => x.item);
}

export interface LogFilter {
  plantingId?: string;
  type?: CareType;
}

export function filterCareLog(log: readonly CareLogEntry[], filter: LogFilter): CareLogEntry[] {
  return newestFirst(
    log.filter(
      (e) => (!filter.plantingId || e.plantingId === filter.plantingId) && (!filter.type || e.type === filter.type),
    ),
  );
}

export function sortJournal(entries: readonly JournalEntry[]): JournalEntry[] {
  return newestFirst(entries);
}

/** Open reminders by due date, then completed ones. */
export function sortReminders(reminders: readonly Reminder[]): Reminder[] {
  return [...reminders].sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate));
}

/** `{ value, label }` options for choosing a planting in a Select. */
export function plantingOptions(garden: Pick<Garden, "plantings" | "beds">, catalog: PlantCatalog) {
  return garden.plantings.map((p) => ({ value: p.id, label: plantingLabel(garden, catalog, p.id) }));
}
