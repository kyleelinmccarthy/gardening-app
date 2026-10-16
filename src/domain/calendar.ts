import { addDays, addWeeks, monthDayToIso, toIsoDate } from "./dates";
import type { CalendarEvent, CalendarEventType, ClimateProfile, Plant } from "./types";

/**
 * Frost-free climates (no frost dates) are approximated with a nominal last
 * frost of Feb 1 and first frost of Dec 1 so that planting windows still
 * land in a sensible cool-season/warm-season order.
 */
export const FROST_FREE_LAST_FROST = "02-01";
export const FROST_FREE_FIRST_FROST = "12-01";

/** Window lengths in days (inclusive end = start + length - 1). */
const START_INDOORS_WINDOW_DAYS = 14;
const DIRECT_SOW_WINDOW_DAYS = 21;
const TRANSPLANT_WINDOW_DAYS = 14;
const FALL_SOW_WINDOW_DAYS = 14;

function makeWindow(plantId: string, type: CalendarEventType, start: string, lengthDays: number): CalendarEvent {
  return { plantId, type, start, end: addDays(start, lengthDays - 1) };
}

function plantEvents(plant: Plant, lastFrost: string, firstFrost: string): CalendarEvent[] {
  const { planting, daysToMaturity } = plant;
  const events: CalendarEvent[] = [];

  if (planting.startIndoorsWeeks !== undefined) {
    events.push(
      makeWindow(plant.id, "start-indoors", addWeeks(lastFrost, planting.startIndoorsWeeks), START_INDOORS_WINDOW_DAYS),
    );
  }
  if (planting.directSowWeeks !== undefined) {
    events.push(makeWindow(plant.id, "direct-sow", addWeeks(lastFrost, planting.directSowWeeks), DIRECT_SOW_WINDOW_DAYS));
  }
  if (planting.transplantWeeks !== undefined) {
    events.push(makeWindow(plant.id, "transplant", addWeeks(lastFrost, planting.transplantWeeks), TRANSPLANT_WINDOW_DAYS));
  }
  if (planting.fallSowWeeksBeforeFirstFrost !== undefined) {
    events.push(
      makeWindow(plant.id, "fall-sow", addWeeks(firstFrost, -planting.fallSowWeeksBeforeFirstFrost), FALL_SOW_WINDOW_DAYS),
    );
  }

  if (daysToMaturity) {
    // Maturity is counted from the earliest outdoor planting; otherwise fall back to
    // fall-sow, then to the indoor start.
    const starts = (types: CalendarEventType[]) =>
      events.filter((e) => types.includes(e.type)).map((e) => e.start).sort();
    const reference =
      starts(["transplant", "direct-sow"])[0] ?? starts(["fall-sow"])[0] ?? starts(["start-indoors"])[0];
    if (reference) {
      events.push({
        plantId: plant.id,
        type: "harvest",
        start: addDays(reference, daysToMaturity.min),
        end: addDays(reference, daysToMaturity.max),
      });
    }
  }
  return events;
}

/** All planting-window and harvest events for the plants in the given year, sorted by start date. */
export function buildPlantingCalendar(plants: readonly Plant[], climate: ClimateProfile, year: number): CalendarEvent[] {
  const lastFrost = monthDayToIso(climate.lastFrost ?? FROST_FREE_LAST_FROST, year);
  const firstFrost = monthDayToIso(climate.firstFrost ?? FROST_FREE_FIRST_FROST, year);
  return plants
    .flatMap((p) => plantEvents(p, lastFrost, firstFrost))
    .sort((a, b) => a.start.localeCompare(b.start) || a.plantId.localeCompare(b.plantId) || a.type.localeCompare(b.type));
}

/** Events overlapping the given month (monthIndex0: 0 = January). */
export function eventsInMonth(events: readonly CalendarEvent[], year: number, monthIndex0: number): CalendarEvent[] {
  const first = toIsoDate(new Date(Date.UTC(year, monthIndex0, 1)));
  const last = toIsoDate(new Date(Date.UTC(year, monthIndex0 + 1, 0)));
  return events.filter((e) => e.start <= last && e.end >= first);
}

/** Events that are ongoing or begin within `days` days of today. */
export function upcomingEvents(events: readonly CalendarEvent[], today: string, days = 30): CalendarEvent[] {
  const horizon = addDays(today, days);
  return events
    .filter((e) => e.end >= today && e.start <= horizon)
    .sort((a, b) => a.start.localeCompare(b.start) || a.plantId.localeCompare(b.plantId));
}
