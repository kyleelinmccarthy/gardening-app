import { addDays, diffDays } from "./dates";
import type {
  CareLogEntry,
  CareTask,
  CareType,
  Garden,
  GardenSetting,
  Humidity,
  Plant,
  PlantCatalog,
  Planting,
  Reminder,
} from "./types";

// ---------------------------------------------------------------------------
// Tunable constants
// ---------------------------------------------------------------------------

/** Potted plants dry out faster than in-ground plants. */
export const CONTAINER_WATERING_FACTOR = 0.6;
/** Hot outdoor summers increase evaporation. */
export const HOT_SUMMER_WATERING_FACTOR = 0.7;
export const HOT_SUMMER_THRESHOLD_F = 90;
export const SUMMER_MONTHS: readonly number[] = [6, 7, 8];
/** Dry air dries soil faster; humid air slows it. */
export const LOW_HUMIDITY_WATERING_FACTOR = 0.85;
export const HIGH_HUMIDITY_WATERING_FACTOR = 1.15;
/** Indoor plants grow slowly in winter and need water less often. */
export const INDOOR_WINTER_WATERING_FACTOR = 1.3;
export const WINTER_MONTHS: readonly number[] = [11, 12, 1, 2];
/** Categories whose feeding is paused during indoor winter dormancy. */
const WINTER_DORMANT_CATEGORIES: readonly Plant["category"][] = ["houseplant", "succulent"];

export const PEST_INSPECTION_INTERVAL_DAYS = 7;
/** After a harvest is logged, re-check for ripe produce this many days later. */
export const HARVEST_RECHECK_DAYS = 7;
const TOP_PESTS_IN_DETAIL = 3;

// ---------------------------------------------------------------------------
// Intervals
// ---------------------------------------------------------------------------

export interface WateringContext {
  inContainer: boolean;
  setting: GardenSetting;
  summerHighF?: number;
  humidity?: Humidity;
  /** Calendar month, 1-12. */
  month?: number;
}

export type FertilizeContext = Pick<WateringContext, "setting" | "month">;

function isIndoorWinter(setting: GardenSetting, month: number | undefined): boolean {
  return setting === "indoor" && month !== undefined && WINTER_MONTHS.includes(month);
}

/** Days between waterings after adjusting the plant's baseline for conditions (min 1). */
export function wateringIntervalDays(plant: Plant, ctx: WateringContext): number {
  let interval = plant.wateringIntervalDays;
  if (ctx.inContainer) interval *= CONTAINER_WATERING_FACTOR;
  if (
    ctx.setting === "outdoor" &&
    ctx.summerHighF !== undefined &&
    ctx.summerHighF >= HOT_SUMMER_THRESHOLD_F &&
    ctx.month !== undefined &&
    SUMMER_MONTHS.includes(ctx.month)
  ) {
    interval *= HOT_SUMMER_WATERING_FACTOR;
  }
  if (ctx.humidity === "low") interval *= LOW_HUMIDITY_WATERING_FACTOR;
  if (ctx.humidity === "high") interval *= HIGH_HUMIDITY_WATERING_FACTOR;
  if (isIndoorWinter(ctx.setting, ctx.month)) interval *= INDOOR_WINTER_WATERING_FACTOR;
  return Math.max(1, Math.round(interval));
}

/** Days between feedings, or null when the plant should not be fed right now. */
export function fertilizeIntervalDays(plant: Plant, ctx: FertilizeContext): number | null {
  if (plant.fertilizer.frequencyDays <= 0) return null;
  if (WINTER_DORMANT_CATEGORIES.includes(plant.category) && isIndoorWinter(ctx.setting, ctx.month)) return null;
  return plant.fertilizer.frequencyDays;
}

// ---------------------------------------------------------------------------
// Task generation
// ---------------------------------------------------------------------------

/** A care task, carrying the repeat interval when it comes from a recurring reminder. */
export interface CareTaskItem extends CareTask {
  repeatDays?: number;
}

export interface CareTaskContext {
  setting: GardenSetting;
  summerHighF: number;
  humidity: Humidity;
}

function lastLogDate(log: readonly CareLogEntry[], plantingId: string, type: CareType): string | undefined {
  let latest: string | undefined;
  for (const entry of log) {
    if (entry.plantingId === plantingId && entry.type === type && (latest === undefined || entry.date > latest)) {
      latest = entry.date;
    }
  }
  return latest;
}

function humanize(id: string): string {
  return id.replace(/-/g, " ");
}

function pestDetail(plant: Plant): string {
  const top = plant.pests.slice(0, TOP_PESTS_IN_DETAIL).map(humanize);
  return top.length > 0
    ? `Look for ${top.join(", ")}. Check leaf undersides and new growth.`
    : "Look over leaves and stems for pests and disease.";
}

function plantingTasks(
  planting: Planting,
  plant: Plant,
  bedName: string | undefined,
  log: readonly CareLogEntry[],
  today: string,
  ctx: CareTaskContext,
): CareTaskItem[] {
  const month = Number(today.slice(5, 7));
  const lastDone = (type: CareType) => lastLogDate(log, planting.id, type) ?? planting.plantedOn;
  const where = bedName ? ` (bed: ${bedName})` : "";
  const make = (type: CareType, verb: string, suffix: string, detail: string, dueDate: string): CareTaskItem => ({
    id: `${type}:${planting.id}`,
    type,
    plantingId: planting.id,
    title: `${verb} ${plant.name}${suffix}${where}`,
    detail,
    dueDate,
    overdueDays: Math.max(0, diffDays(dueDate, today)),
  });
  const tasks: CareTaskItem[] = [];

  const waterEvery = wateringIntervalDays(plant, {
    inContainer: planting.inContainer,
    setting: ctx.setting,
    summerHighF: ctx.summerHighF,
    humidity: ctx.humidity,
    month,
  });
  tasks.push(make("water", "Water", "", plant.waterNotes, addDays(lastDone("water"), waterEvery)));

  const feedEvery = fertilizeIntervalDays(plant, { setting: ctx.setting, month });
  if (feedEvery !== null) {
    tasks.push(make("fertilize", "Fertilize", "", plant.fertilizer.notes, addDays(lastDone("fertilize"), feedEvery)));
  }

  tasks.push(
    make(
      "inspect-pests",
      "Inspect",
      " for pests",
      pestDetail(plant),
      addDays(lastDone("inspect-pests"), PEST_INSPECTION_INTERVAL_DAYS),
    ),
  );

  if (plant.edible && plant.daysToMaturity) {
    const ready = addDays(planting.plantedOn, plant.daysToMaturity.min);
    const lastHarvest = lastLogDate(log, planting.id, "harvest");
    const recheck = lastHarvest ? addDays(lastHarvest, HARVEST_RECHECK_DAYS) : ready;
    const due = recheck > ready ? recheck : ready;
    tasks.push(make("harvest", "Harvest", "", plant.harvestTips ?? "Check for ripe produce.", due));
  }
  return tasks;
}

function reminderTask(reminder: Reminder, today: string): CareTaskItem {
  const repeating = reminder.repeatDays !== undefined && reminder.repeatDays > 0;
  return {
    id: `reminder:${reminder.id}`,
    type: "custom",
    reminderId: reminder.id,
    plantingId: reminder.plantingId,
    title: reminder.title,
    detail: repeating ? `Repeats every ${reminder.repeatDays} days.` : "",
    dueDate: reminder.dueDate,
    overdueDays: Math.max(0, diffDays(reminder.dueDate, today)),
    ...(repeating ? { repeatDays: reminder.repeatDays } : {}),
  };
}

/**
 * Care tasks that are due today, overdue, or due within `horizonDays` days.
 * Sorted by due date then title.
 */
export function getCareTasks(
  garden: Garden,
  catalog: PlantCatalog,
  today: string,
  ctx: CareTaskContext,
  horizonDays = 0,
): CareTaskItem[] {
  const cutoff = addDays(today, horizonDays);
  const beds = new Map(garden.beds.map((b) => [b.id, b.name]));
  const tasks: CareTaskItem[] = [];

  for (const planting of garden.plantings) {
    if (planting.status !== "growing") continue;
    const plant = catalog.get(planting.plantId);
    if (!plant) continue;
    const bedName = planting.bedId ? beds.get(planting.bedId) : undefined;
    tasks.push(...plantingTasks(planting, plant, bedName, garden.careLog, today, ctx));
  }
  for (const reminder of garden.reminders) {
    if (!reminder.done) tasks.push(reminderTask(reminder, today));
  }

  return tasks
    .filter((t) => t.dueDate <= cutoff)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));
}

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------

export interface TaskCompletion {
  log?: CareLogEntry;
  reminderUpdate?: Partial<Reminder> & { id: string };
}

/** Next occurrence of a repeating reminder: strictly after `date`, stepping by whole intervals. */
function nextOccurrence(dueDate: string, repeatDays: number, date: string): string {
  const next = addDays(dueDate, repeatDays);
  if (next > date) return next;
  const steps = Math.ceil((diffDays(next, date) + 1) / repeatDays);
  return addDays(next, steps * repeatDays);
}

/**
 * Pure result of completing a task on `date`: a care-log entry for planting
 * tasks, or a reminder update (reschedule if recurring, otherwise done).
 */
export function completeTask(task: CareTaskItem, date: string, id: string): TaskCompletion {
  if (task.reminderId) {
    if (task.repeatDays !== undefined && task.repeatDays > 0) {
      return {
        reminderUpdate: { id: task.reminderId, dueDate: nextOccurrence(task.dueDate, task.repeatDays, date) },
      };
    }
    return { reminderUpdate: { id: task.reminderId, done: true } };
  }
  return { log: { id, plantingId: task.plantingId, type: task.type, date } };
}
