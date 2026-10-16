import { z } from "zod";
import { MAX_BED_DIMENSION, MIN_BED_DIMENSION } from "@/domain/constants";
import { isValidIsoDate } from "@/domain/dates";
import {
  ALLERGENS,
  BED_KINDS,
  CARE_TYPES,
  DRAINAGES,
  FEEDING_LEVELS,
  FERTILIZER_IDS,
  GARDEN_SETTINGS,
  INSECT_IDS,
  LIFE_CYCLES,
  PLANTING_STATUSES,
  TEMPERATURE_UNITS,
  TOOL_IDS,
  DIFFICULTIES,
  EXPERIENCE_LEVELS,
  GARDEN_GOALS,
  HUMIDITY_LEVELS,
  INDOOR_LIGHTS,
  PETS,
  PLANT_CATEGORIES,
  SOIL_TYPES,
  SPACE_SIZES,
  SUN_EXPOSURES,
  TOXICITY_LEVELS,
  WATER_NEEDS,
  type AppData,
} from "@/domain/types";

// --- Enums -----------------------------------------------------------------
// Unions that have a const array in types.ts reuse it; the rest are listed here
// once. The compile-time check at the bottom guarantees they stay in sync.

const sunExposure = z.enum(SUN_EXPOSURES);
const indoorLight = z.enum(INDOOR_LIGHTS);
const waterNeed = z.enum(WATER_NEEDS);
const humidity = z.enum(HUMIDITY_LEVELS);
const soilType = z.enum(SOIL_TYPES);
const plantCategory = z.enum(PLANT_CATEGORIES);
const difficulty = z.enum(DIFFICULTIES);
const experience = z.enum(EXPERIENCE_LEVELS);
const pet = z.enum(PETS);
const toxicityLevel = z.enum(TOXICITY_LEVELS);
const allergen = z.enum(ALLERGENS);
const gardenGoal = z.enum(GARDEN_GOALS);
const spaceSize = z.enum(SPACE_SIZES);

const drainage = z.enum(DRAINAGES);
const lifeCycle = z.enum(LIFE_CYCLES);
const feedingLevel = z.enum(FEEDING_LEVELS);
const gardenSetting = z.enum(GARDEN_SETTINGS);
const temperatureUnit = z.enum(TEMPERATURE_UNITS);
const bedKind = z.enum(BED_KINDS);
const plantingStatus = z.enum(PLANTING_STATUSES);
const careType = z.enum(CARE_TYPES);
const toolId = z.enum(TOOL_IDS);
const insectId = z.enum(INSECT_IDS);
const fertilizerId = z.enum(FERTILIZER_IDS);

// --- Building blocks -------------------------------------------------------

const range = z.object({ min: z.number(), max: z.number() });
const id = z.string().min(1);
const isoDate = z.string().refine(isValidIsoDate, "must be a valid YYYY-MM-DD date");
const positiveInt = z.number().int().positive();

/** "MM-DD" with a real month and day (Feb 29 allowed). */
function isValidMonthDay(s: string): boolean {
  const m = /^(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [month, day] = [Number(m[1]), Number(m[2])];
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(2024, month, 0)).getUTCDate();
}
const monthDay = z.string().refine(isValidMonthDay, "must be a valid MM-DD date").nullable();
const bedDimension = z.number().int().min(MIN_BED_DIMENSION).max(MAX_BED_DIMENSION);

// --- Plant -----------------------------------------------------------------

const plantSchema = z.object({
  id,
  name: z.string(),
  scientificName: z.string(),
  emoji: z.string(),
  category: plantCategory,
  lifeCycle,
  description: z.string(),
  difficulty,
  environments: z.array(gardenSetting),
  edible: z.boolean(),
  sun: z.array(sunExposure),
  indoorLight: z.array(indoorLight).optional(),
  water: waterNeed,
  wateringIntervalDays: z.number(),
  waterNotes: z.string(),
  humidity,
  temperature: z.object({
    minF: z.number(),
    idealMinF: z.number(),
    idealMaxF: z.number(),
    maxF: z.number(),
  }),
  hardinessZones: range,
  soil: z.object({
    types: z.array(soilType),
    phMin: z.number(),
    phMax: z.number(),
    drainage,
  }),
  fertilizer: z.object({
    feeding: feedingLevel,
    recommended: z.array(fertilizerId),
    frequencyDays: z.number(),
    notes: z.string(),
  }),
  container: z.object({
    suitable: z.boolean(),
    minGallons: z.number().optional(),
    notes: z.string().optional(),
  }),
  spacingInches: z.number(),
  heightInches: range,
  daysToMaturity: range.optional(),
  planting: z.object({
    startIndoorsWeeks: z.number().optional(),
    transplantWeeks: z.number().optional(),
    directSowWeeks: z.number().optional(),
    fallSowWeeksBeforeFirstFrost: z.number().optional(),
    notes: z.string().optional(),
  }),
  companions: z.array(z.string()),
  antagonists: z.array(z.string()),
  companionNotes: z.string().optional(),
  attracts: z.array(insectId),
  pests: z.array(insectId),
  repels: z.array(insectId),
  toxicity: z.object({
    cat: toxicityLevel,
    dog: toxicityLevel,
    horse: toxicityLevel,
    bird: toxicityLevel,
    rabbit: toxicityLevel,
    human: toxicityLevel,
    notes: z.string().optional(),
  }),
  allergens: z.array(allergen),
  allergyNotes: z.string().optional(),
  requiredTools: z.array(toolId),
  helpfulTools: z.array(toolId),
  goals: z.array(gardenGoal),
  careTips: z.array(z.string()),
  harvestTips: z.string().optional(),
  custom: z.boolean().optional(),
});

// --- Garden ----------------------------------------------------------------

const gardenProfileSchema = z.object({
  setting: gardenSetting,
  climate: z.object({
    hardinessZone: z.number(),
    lastFrost: monthDay,
    firstFrost: monthDay,
    summerHighF: z.number(),
    winterLowF: z.number(),
    humidity,
    zip: z.string().optional(),
  }),
  indoor: z.object({
    light: indoorLight,
    averageTempF: z.number(),
    humidity,
  }),
  sunExposure,
  soilType,
  space: spaceSize,
  containersOnly: z.boolean(),
  tools: z.array(toolId),
  interests: z.array(plantCategory),
  goals: z.array(gardenGoal),
  experience,
  pets: z.array(pet),
  allergies: z.array(allergen),
  hasChildren: z.boolean(),
  weeklyHours: z.number(),
});

const bedSchema = z.object({
  id,
  name: z.string(),
  kind: bedKind,
  columns: bedDimension,
  rows: bedDimension,
  cellSizeInches: z.number().positive(),
  sun: sunExposure,
  placements: z.array(
    z.object({ plantId: z.string(), x: z.number().int().min(0), y: z.number().int().min(0) }),
  ),
});

const plantingSchema = z.object({
  id,
  plantId: z.string(),
  bedId: z.string().optional(),
  quantity: positiveInt,
  plantedOn: isoDate,
  status: plantingStatus,
  inContainer: z.boolean(),
  notes: z.string().optional(),
});

const careLogEntrySchema = z.object({
  id,
  plantingId: z.string().optional(),
  type: careType,
  date: isoDate,
  note: z.string().optional(),
});

const reminderSchema = z.object({
  id,
  title: z.string(),
  dueDate: isoDate,
  repeatDays: positiveInt.optional(),
  done: z.boolean(),
  plantingId: z.string().optional(),
});

const journalEntrySchema = z.object({
  id,
  date: isoDate,
  title: z.string(),
  text: z.string(),
  plantingId: z.string().optional(),
});

const gardenSchema = z.object({
  id,
  name: z.string(),
  createdAt: z.string(),
  profile: gardenProfileSchema,
  beds: z.array(bedSchema),
  plantings: z.array(plantingSchema),
  careLog: z.array(careLogEntrySchema),
  reminders: z.array(reminderSchema),
  journal: z.array(journalEntrySchema),
});

export const appDataSchema = z.object({
  version: z.literal(1),
  gardens: z.array(gardenSchema),
  activeGardenId: z.string().nullable(),
  customPlants: z.array(plantSchema),
  settings: z.object({ temperatureUnit }),
});

// --- Compile-time contract check ------------------------------------------
// The schema and AppData must be mutually assignable; a mismatch (e.g. a new
// enum member in types.ts) is a type error here.

type Inferred = z.infer<typeof appDataSchema>;
type Assert<T extends true> = T;
type Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export type _SchemaMatchesAppData = Assert<Mutual<Inferred, AppData>>;

// --- Public API ------------------------------------------------------------

export type ParseResult = { ok: true; data: AppData } | { ok: false; error: string };

const MAX_REPORTED_ISSUES = 5;

export function createEmptyAppData(): AppData {
  return {
    version: 1,
    gardens: [],
    activeGardenId: null,
    customPlants: [],
    settings: { temperatureUnit: "F" },
  };
}

export function parseAppData(input: unknown): ParseResult {
  const result = appDataSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: formatIssues(result.error.issues) };
}

function formatIssues(issues: readonly z.core.$ZodIssue[]): string {
  const lines = issues.slice(0, MAX_REPORTED_ISSUES).map((issue) => {
    const path = issue.path.map(String).join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  const hidden = issues.length - lines.length;
  if (hidden > 0) lines.push(`…and ${hidden} more problem${hidden === 1 ? "" : "s"}`);
  return `This doesn't look like valid garden data.\n${lines.join("\n")}`;
}
