/** Test-only builders for domain objects. Not imported by production code. */
import { createDefaultProfile } from "@/domain/defaults";
import type { AppData, Bed, Garden, Plant } from "@/domain/types";
import { createEmptyAppData } from "@/storage/schema";

export function makePlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: "test-tomato",
    name: "Test Tomato",
    scientificName: "Solanum lycopersicum",
    emoji: "🍅",
    category: "vegetable",
    lifeCycle: "annual",
    description: "A test plant.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes: "Water deeply.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 3, max: 11 },
    soil: { types: ["loam"], phMin: 6, phMax: 6.8, drainage: "well-drained" },
    fertilizer: { feeding: "heavy", recommended: ["compost"], frequencyDays: 14, notes: "Feed biweekly." },
    container: { suitable: true, minGallons: 5 },
    spacingInches: 24,
    heightInches: { min: 36, max: 72 },
    planting: { transplantWeeks: 2 },
    companions: [],
    antagonists: [],
    attracts: [],
    pests: [],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "mild",
      rabbit: "mild",
      human: "non-toxic",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: [],
    goals: ["edible"],
    careTips: [],
    ...overrides,
  };
}

export function makeBed(overrides: Partial<Bed> = {}): Bed {
  return {
    id: "bed-1",
    name: "Bed 1",
    kind: "raised-bed",
    columns: 4,
    rows: 4,
    cellSizeInches: 12,
    sun: "full-sun",
    placements: [],
    ...overrides,
  };
}

export function makeGarden(overrides: Partial<Garden> = {}): Garden {
  return {
    id: "garden-1",
    name: "Backyard",
    createdAt: "2026-01-01T00:00:00.000Z",
    profile: createDefaultProfile(),
    beds: [],
    plantings: [],
    careLog: [],
    reminders: [],
    journal: [],
    ...overrides,
  };
}

/** AppData containing the given gardens; the first one is active. */
export function makeAppData(gardens: Garden[] = [makeGarden()], overrides: Partial<AppData> = {}): AppData {
  return {
    ...createEmptyAppData(),
    gardens,
    activeGardenId: gardens[0]?.id ?? null,
    ...overrides,
  };
}
