import { createId } from "@/lib/id";
import type { Bed, BedKind, Garden, GardenProfile, SunExposure } from "./types";

/** A beginner-friendly outdoor profile (USDA zone 7); override any top-level field. */
export function createDefaultProfile(overrides: Partial<GardenProfile> = {}): GardenProfile {
  return {
    setting: "outdoor",
    climate: {
      hardinessZone: 7,
      lastFrost: "04-15",
      firstFrost: "10-15",
      summerHighF: 85,
      winterLowF: 5,
      humidity: "average",
    },
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
