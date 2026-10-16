/** Test-only builders for domain objects. Never imported by production code. */
import { createDefaultProfile } from "@/domain/defaults";
import type { AppData, Bed, Garden, GardenProfile, Plant, Planting } from "@/domain/types";
import { createEmptyAppData } from "@/storage/schema";

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

/** A complete outdoor profile in the app's default zone (7) with no pets, allergies, tools or interests. */
export function makeProfile(overrides: Partial<GardenProfile> = {}): GardenProfile {
  return {
    ...createDefaultProfile(),
    tools: [],
    interests: [],
    goals: [],
    experience: "intermediate",
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
    name: "Backyard",
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

/** AppData containing the given gardens; the first one is active. */
export function makeAppData(gardens: Garden[] = [makeGarden()], overrides: Partial<AppData> = {}): AppData {
  return {
    ...createEmptyAppData(),
    gardens,
    activeGardenId: gardens[0]?.id ?? null,
    ...overrides,
  };
}

/** A small, varied plant dataset (tomato, basil, lily, pothos) for component tests that mock "@/data/plants". */
export function makeTestPlants(): Plant[] {
  /** Shared growing facts for the set (outdoor-vegetable-ish; individual plants override). */
  const base: Partial<Plant> = {
    description: "A test plant.",
    waterNotes: "Water deeply.",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 3, max: 11 },
    soil: { types: ["loam"], phMin: 6, phMax: 6.8, drainage: "well-drained" },
    fertilizer: { feeding: "heavy", recommended: ["compost"], frequencyDays: 14, notes: "Feed biweekly." },
    spacingInches: 24,
    heightInches: { min: 36, max: 72 },
    daysToMaturity: undefined,
    planting: { transplantWeeks: 2 },
  };
  return [
    makePlant({
      ...base,
      id: "tomato",
      name: "Tomato",
      scientificName: "Solanum lycopersicum",
      emoji: "🍅",
      category: "vegetable",
      difficulty: "easy",
      environments: ["outdoor"],
      sun: ["full-sun"],
      indoorLight: undefined,
      water: "moderate",
      companions: ["basil"],
      antagonists: ["lily"],
      attracts: ["honeybees"],
      pests: ["aphids", "tomato-hornworm"],
      repels: [],
      allergens: ["nightshade"],
      allergyNotes: "Leaves can irritate skin.",
      requiredTools: ["tomato-cage"],
      helpfulTools: ["hand-trowel"],
      goals: ["edible"],
      toxicity: { cat: "mild", dog: "mild", horse: "mild", bird: "non-toxic", rabbit: "mild", human: "non-toxic", notes: "Leaves and stems are mildly toxic." },
      careTips: ["Stake early."],
      harvestTips: "Pick when fully coloured.",
      planting: { startIndoorsWeeks: -6, transplantWeeks: 2 },
      daysToMaturity: { min: 70, max: 90 },
      fertilizer: { feeding: "heavy", recommended: ["compost", "tomato-feed"], frequencyDays: 14, notes: "Feed biweekly." },
    }),
    makePlant({
      ...base,
      id: "basil",
      name: "Basil",
      scientificName: "Ocimum basilicum",
      emoji: "🌿",
      category: "herb",
      difficulty: "easy",
      environments: ["indoor", "outdoor"],
      sun: ["full-sun", "partial-sun"],
      indoorLight: ["bright-indirect", "direct"],
      companions: ["tomato"],
      antagonists: [],
      attracts: ["honeybees", "native-bees"],
      pests: ["aphids"],
      repels: ["whiteflies"],
      allergens: [],
      toxicity: { cat: "non-toxic", dog: "non-toxic", horse: "non-toxic", bird: "non-toxic", rabbit: "non-toxic", human: "non-toxic" },
      goals: ["edible", "fragrance", "kid-friendly"],
      planting: { directSowWeeks: 1 },
    }),
    makePlant({
      ...base,
      id: "lily",
      name: "Lily",
      scientificName: "Lilium",
      emoji: "🌸",
      category: "flower",
      lifeCycle: "perennial",
      difficulty: "moderate",
      environments: ["outdoor"],
      edible: false,
      sun: ["partial-sun", "partial-shade"],
      indoorLight: undefined,
      companions: [],
      antagonists: ["tomato"],
      attracts: [],
      pests: [],
      allergens: ["pollen", "strong-fragrance"],
      toxicity: { cat: "severe", dog: "mild", horse: "mild", bird: "mild", rabbit: "mild", human: "mild", notes: "All parts are severely toxic to cats." },
      container: { suitable: true, minGallons: 3 },
      planting: { notes: "Plant bulbs in autumn." },
      goals: ["ornamental", "fragrance"],
    }),
    makePlant({
      ...base,
      id: "pothos",
      name: "Pothos",
      scientificName: "Epipremnum aureum",
      emoji: "🪴",
      category: "houseplant",
      lifeCycle: "perennial",
      difficulty: "easy",
      environments: ["indoor"],
      edible: false,
      sun: ["partial-shade"],
      indoorLight: ["low", "medium", "bright-indirect"],
      companions: [],
      antagonists: [],
      attracts: [],
      pests: ["mealybugs"],
      allergens: [],
      toxicity: { cat: "moderate", dog: "moderate", horse: "mild", bird: "mild", rabbit: "mild", human: "mild" },
      container: { suitable: true, minGallons: 1 },
      planting: { notes: "Pot up any time." },
      goals: ["air-purifying", "low-maintenance"],
    }),
  ];
}
