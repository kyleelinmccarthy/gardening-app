import { ZONES } from "@/data/zones";
import { createId } from "@/lib/id";
import { climateFromZone } from "./climate";
import type { Bed, BedKind, Garden, GardenProfile, SunExposure } from "./types";

const DEFAULT_ZONE = 7;

/** A beginner-friendly outdoor profile (USDA zone 7, climate derived from the zone data); override any top-level field. */
export function createDefaultProfile(overrides: Partial<GardenProfile> = {}): GardenProfile {
  return {
    setting: "outdoor",
    climate: climateFromZone(DEFAULT_ZONE, ZONES),
    indoor: { light: "bright-indirect", averageTempF: 70, humidity: "average" },
    sunExposure: "full-sun",
    soilType: "loam",
    space: "medium",
    containersOnly: false,
    tools: ["hand-trowel", "watering-can", "garden-gloves"],
    interests: [],
    goals: ["edible"],
    experience: "beginner",
    pets: [],
    allergies: [],
    hasChildren: false,
    weeklyHours: 3,
    ...overrides,
  };
}

export function createGarden(
  name: string,
  profile: GardenProfile,
  id: string = createId("garden"),
  now: Date = new Date(),
): Garden {
  return {
    id,
    name,
    createdAt: now.toISOString(),
    profile,
    beds: [],
    plantings: [],
    careLog: [],
    reminders: [],
    journal: [],
  };
}

export interface NewBedInput {
  name: string;
  kind: BedKind;
  columns: number;
  rows: number;
  sun: SunExposure;
  /** Defaults to 12 (square-foot gardening). */
  cellSizeInches?: number;
}

export function createBed(input: NewBedInput, id: string = createId("bed")): Bed {
  return {
    id,
    name: input.name,
    kind: input.kind,
    columns: input.columns,
    rows: input.rows,
    cellSizeInches: input.cellSizeInches ?? 12,
    sun: input.sun,
    placements: [],
  };
}
