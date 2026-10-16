/** Pure derived data for the dashboard (no React, no clock access: `today` is passed in). */
import { buildPlantingCalendar, upcomingEvents } from "./calendar";
import { careContextFor, getCareTasks, type CareTaskItem } from "./care";
import { analyzeBed } from "./companions";
import { getSafetyIssues } from "./safety";
import type { CalendarEvent, Garden, Plant, PlantCatalog, Reason } from "./types";

export const UPCOMING_EVENT_DAYS = 14;

const isActive = (status: string) => status === "planned" || status === "growing";

export interface SafetyAlert {
  plant: Plant;
  issues: Reason[];
  /** True when any issue is a blocker (moderately or severely toxic to a pet). */
  severe: boolean;
}

export interface BedConflict {
  bedId: string;
  bedName: string;
  plantA: string;
  plantB: string;
}

export interface DashboardSummary {
  growingCount: number;
  plannedCount: number;
  tasksDue: CareTaskItem[];
  upcoming: CalendarEvent[];
  conflicts: BedConflict[];
  safetyAlerts: SafetyAlert[];
}

/** Distinct plants (known to the catalog) in planned or growing plantings. */
export function activePlants(garden: Garden, catalog: PlantCatalog): Plant[] {
  const seen = new Map<string, Plant>();
  for (const planting of garden.plantings) {
    if (!isActive(planting.status) || seen.has(planting.plantId)) continue;
    const plant = catalog.get(planting.plantId);
    if (plant) seen.set(plant.id, plant);
  }
  return [...seen.values()];
}

/**
 * Planting windows for the garden's active plants, filtered to the coming days.
 * Calendars are built for last, this and next year because a window can span
 * New Year in either direction (e.g. a December fall-sow running into January).
 */
export function upcomingPlantingEvents(
  garden: Garden,
  catalog: PlantCatalog,
  today: string,
  days = UPCOMING_EVENT_DAYS,
): CalendarEvent[] {
  const plants = activePlants(garden, catalog);
  if (plants.length === 0) return [];
  const year = Number(today.slice(0, 4));
  const events = [year - 1, year, year + 1].flatMap((y) => buildPlantingCalendar(plants, garden.profile.climate, y));
  return upcomingEvents(events, today, days);
}

export function findBedConflicts(garden: Garden, catalog: PlantCatalog): BedConflict[] {
  const name = (id: string) => catalog.get(id)?.name ?? id;
  return garden.beds.flatMap((bed) =>
    analyzeBed(bed, catalog).conflicts.map((pair) => ({
      bedId: bed.id,
      bedName: bed.name,
      plantA: name(pair.a),
      plantB: name(pair.b),
    })),
  );
}

/** One alert per distinct active plant that conflicts with the household's pets, children or allergies. */
export function findSafetyAlerts(garden: Garden, catalog: PlantCatalog): SafetyAlert[] {
  return activePlants(garden, catalog)
    .map((plant) => {
      const issues = getSafetyIssues(plant, garden.profile);
      return { plant, issues, severe: issues.some((i) => i.kind === "blocker") };
    })
    .filter((a) => a.issues.length > 0)
    .sort((a, b) => Number(b.severe) - Number(a.severe) || a.plant.name.localeCompare(b.plant.name));
}

export function summarizeGarden(garden: Garden, catalog: PlantCatalog, today: string): DashboardSummary {
  return {
    growingCount: garden.plantings.filter((p) => p.status === "growing").length,
    plannedCount: garden.plantings.filter((p) => p.status === "planned").length,
    tasksDue: getCareTasks(garden, catalog, today, careContextFor(garden.profile), 0),
    upcoming: upcomingPlantingEvents(garden, catalog, today),
    conflicts: findBedConflicts(garden, catalog),
    safetyAlerts: findSafetyAlerts(garden, catalog),
  };
}
