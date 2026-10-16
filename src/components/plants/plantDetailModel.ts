/** Pure view-model helpers for the plant detail page. */
import { buildPlantingCalendar } from "@/domain/calendar";
import { plantsPerCell } from "@/domain/companions";
import { formatDisplayDate } from "@/domain/dates";
import type { CalendarEventType, ClimateProfile, Plant, PlantingWindows, ToolId } from "@/domain/types";
import { CALENDAR_EVENT_LABELS } from "@/lib/labels";

export interface TimelineRow {
  type: CalendarEventType;
  label: string;
  /** "Apr 15 – Apr 28" */
  range: string;
}

/** Planting windows and expected harvest for a climate, as display rows in date order. */
export function plantingTimeline(plant: Plant, climate: ClimateProfile, year: number): TimelineRow[] {
  return buildPlantingCalendar([plant], climate, year).map((e) => ({
    type: e.type,
    label: CALENDAR_EVENT_LABELS[e.type],
    range: e.start === e.end ? formatDisplayDate(e.start) : `${formatDisplayDate(e.start)} – ${formatDisplayDate(e.end)}`,
  }));
}

function weeksPhrase(weeks: number, reference: string): string {
  if (weeks === 0) return `at ${reference}`;
  return `${Math.abs(weeks)} ${Math.abs(weeks) === 1 ? "week" : "weeks"} ${weeks < 0 ? "before" : "after"} ${reference}`;
}

/** Climate-independent descriptions, e.g. "Start seeds indoors 6 weeks before last frost". */
export function relativeWindows(planting: PlantingWindows): string[] {
  const spring = "last spring frost";
  const fall = "first fall frost";
  const entries: [CalendarEventType, number | undefined, string][] = [
    ["start-indoors", planting.startIndoorsWeeks, spring],
    ["direct-sow", planting.directSowWeeks, spring],
    ["transplant", planting.transplantWeeks, spring],
    // Fall sowing counts weeks *before* the first frost (negative = after, e.g. bulbs); weeksPhrase uses the opposite sign.
    ["fall-sow", planting.fallSowWeeksBeforeFirstFrost === undefined ? undefined : -planting.fallSowWeeksBeforeFirstFrost, fall],
  ];
  return entries.flatMap(([type, weeks, reference]) =>
    weeks === undefined ? [] : [`${CALENDAR_EVENT_LABELS[type]} ${weeksPhrase(weeks, reference)}`],
  );
}

export interface ToolStatus {
  id: ToolId;
  owned: boolean;
}

/** Marks each required / helpful tool as owned or not. */
export function toolStatus(plant: Plant, owned: readonly ToolId[]) {
  const mark = (ids: readonly ToolId[]): ToolStatus[] => ids.map((id) => ({ id, owned: owned.includes(id) }));
  return { required: mark(plant.requiredTools), helpful: mark(plant.helpfulTools) };
}

/** Square-foot-gardening hint for a standard 12" square. */
export function densityHint(plant: Plant, cellSizeInches = 12): string {
  const { perCell, cellsNeeded } = plantsPerCell(plant, cellSizeInches);
  const unit = `${cellSizeInches}" square`;
  if (cellsNeeded > 1) {
    const side = Math.sqrt(cellsNeeded);
    return `Needs a ${side} × ${side} block of ${cellSizeInches}" squares`;
  }
  return perCell === 1 ? `1 plant per ${unit}` : `Up to ${perCell} plants per ${unit}`;
}

/** Human description of the fertilizing schedule. */
export function feedingSchedule(frequencyDays: number): string {
  if (frequencyDays <= 0) return "No regular feeding needed";
  return frequencyDays === 1 ? "Every day" : `Every ${frequencyDays} days in the growing season`;
}
