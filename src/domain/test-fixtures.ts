import type { Bed, Garden, GardenProfile, Plant, Planting } from "./types";

/** A complete, unremarkable plant: easy annual vegetable, non-toxic, no allergens. */
export function makePlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: "test-plant",
    name: "Test Plant",
    scientificName: "Testus plantus",
    emoji: "🌱",
    category: "vegetable",
    lifeCycle: "annual",
    description: "A plant used in tests.",
    difficulty: "easy",
    environments: ["indoor", "outdoor"],
    edible: true,
    sun: ["full-sun", "partial-sun"],
    indoorLight: ["bright-indirect", "direct"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes: "Keep evenly moist.",
    humidity: "average",
    temperature: { minF: 35, idealMinF: 60, idealMaxF: 80, maxF: 95 },
    hardinessZones: { min: 3, max: 9 },
    soil: { types: ["loam", "potting-mix"], phMin: 6, phMax: 7, drainage: "well-drained" },
    fertilizer: { feeding: "moderate", recommended: ["compost"], frequencyDays: 14, notes: "" },
    container: { suitable: true, minGallons: 5 },
    spacingInches: 12,
    heightInches: { min: 12, max: 24 },
    daysToMaturity: { min: 60, max: 80 },
    planting: {},
    companions: [],
    antagonists: [],
    attracts: [],
    pests: [],
    repels: [],
    toxicity: {
      cat: "non-toxic",
      dog: "non-toxic",
      horse: "non-toxic",
      bird: "non-toxic",
      rabbit: "non-toxic",
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

/** A complete outdoor garden profile in zone 6 with no pets, allergies or tools. */
export function makeProfile(overrides: Partial<GardenProfile> = {}): GardenProfile {
  return {
    setting: "outdoor",
    climate: {
      hardinessZone: 6,
      lastFrost: "04-30",
      firstFrost: "10-15",
      summerHighF: 85,
      winterLowF: 0,
      humidity: "average",
    },
    indoor: { light: "bright-indirect", averageTempF: 70, humidity: "average" },
    sunExposure: "full-sun",
    soilType: "loam",
    space: "medium",
    containersOnly: false,
    tools: [],
    interests: [],
    goals: [],
    experience: "intermediate",
    pets: [],
    allergies: [],
    hasChildren: false,
    weeklyHours: 5,
    ...overrides,
  };
}

/** A 4x4 empty raised bed with 12" cells. */
export function makeBed(overrides: Partial<Bed> = {}): Bed {
  return {
    id: "bed-1",
    name: "Raised Bed 1",
    kind: "raised-bed",
    columns: 4,
    rows: 4,
    cellSizeInches: 12,
    sun: "full-sun",
    placements: [],
    ...overrides,
  };
}

/** A growing, in-ground planting of the default test plant. */
export function makePlanting(overrides: Partial<Planting> = {}): Planting {
  return {
    id: "planting-1",
    plantId: "test-plant",
    bedId: "bed-1",
    quantity: 1,
    plantedOn: "2025-05-01",
    status: "growing",
    inContainer: false,
    ...overrides,
  };
}

/** An empty garden using the default profile. */
export function makeGarden(overrides: Partial<Garden> = {}): Garden {
  return {
    id: "garden-1",
    name: "Test Garden",
    createdAt: "2025-01-01T00:00:00.000Z",
    profile: makeProfile(),
    beds: [],
    plantings: [],
    careLog: [],
    reminders: [],
    journal: [],
    ...overrides,
  };
}
