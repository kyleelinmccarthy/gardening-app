/**
 * Pure form model for creating/editing a custom plant: the values type and
 * the blank form. Conversion lives in `convert.ts`, validation in `validate.ts`.
 *
 * Numeric fields that may be left blank are kept as strings; temperatures are
 * kept as whole °F numbers (the storage unit) and shown in the user's unit by
 * `TemperatureInput`.
 */
import type {
  Allergen,
  Difficulty,
  Drainage,
  FeedingLevel,
  FertilizerId,
  GardenGoal,
  GardenSetting,
  Humidity,
  IndoorLight,
  InsectId,
  LifeCycle,
  PlantCategory,
  Pet,
  SoilType,
  SunExposure,
  ToolId,
  ToxicityLevel,
  WaterNeed,
} from "@/domain/types";

export type ToxicityTarget = Pet | "human";
export const TOXICITY_TARGETS: readonly ToxicityTarget[] = ["cat", "dog", "horse", "bird", "rabbit", "human"];

export interface CustomPlantFormValues {
  // basics
  name: string;
  scientificName: string;
  emoji: string;
  category: PlantCategory;
  lifeCycle: LifeCycle;
  description: string;
  difficulty: Difficulty;
  environments: GardenSetting[];
  edible: boolean;
  // light & water
  sun: SunExposure[];
  indoorLight: IndoorLight[];
  water: WaterNeed;
  wateringIntervalDays: string;
  waterNotes: string;
  humidity: Humidity;
  // climate (°F; null while the field is empty, which validation rejects)
  minF: number | null;
  idealMinF: number | null;
  idealMaxF: number | null;
  maxF: number | null;
  zoneMin: string;
  zoneMax: string;
  // soil & feeding
  soilTypes: SoilType[];
  phMin: string;
  phMax: string;
  drainage: Drainage;
  feeding: FeedingLevel;
  fertilizers: FertilizerId[];
  feedFrequencyDays: string;
  fertilizerNotes: string;
  // size & timing
  spacingInches: string;
  heightMin: string;
  heightMax: string;
  daysMin: string;
  daysMax: string;
  startIndoorsWeeks: string;
  transplantWeeks: string;
  directSowWeeks: string;
  fallSowWeeks: string;
  plantingNotes: string;
  // containers
  containerSuitable: boolean;
  containerMinGallons: string;
  containerNotes: string;
  // companions
  companions: string[];
  antagonists: string[];
  companionNotes: string;
  // insects
  attracts: InsectId[];
  pests: InsectId[];
  repels: InsectId[];
  // safety
  toxicity: Record<ToxicityTarget, ToxicityLevel>;
  toxicityNotes: string;
  allergens: Allergen[];
  allergyNotes: string;
  // tools, goals, tips
  requiredTools: ToolId[];
  helpfulTools: ToolId[];
  goals: GardenGoal[];
  /** One tip per line. */
  careTips: string;
  harvestTips: string;
}

export type PlantFormErrors = Partial<Record<keyof CustomPlantFormValues, string>>;

export function emptyPlantForm(): CustomPlantFormValues {
  return {
    name: "",
    scientificName: "",
    emoji: "🌱",
    category: "vegetable",
    lifeCycle: "annual",
    description: "",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun"],
    indoorLight: [],
    water: "moderate",
    wateringIntervalDays: "3",
    waterNotes: "",
    humidity: "average",
    minF: 32,
    idealMinF: 60,
    idealMaxF: 80,
    maxF: 95,
    zoneMin: "3",
    zoneMax: "10",
    soilTypes: ["loam"],
    phMin: "6",
    phMax: "7",
    drainage: "well-drained",
    feeding: "moderate",
    fertilizers: ["compost"],
    feedFrequencyDays: "14",
    fertilizerNotes: "",
    spacingInches: "12",
    heightMin: "12",
    heightMax: "36",
    daysMin: "",
    daysMax: "",
    startIndoorsWeeks: "",
    transplantWeeks: "",
    directSowWeeks: "",
    fallSowWeeks: "",
    plantingNotes: "",
    containerSuitable: true,
    containerMinGallons: "3",
    containerNotes: "",
    companions: [],
    antagonists: [],
    companionNotes: "",
    attracts: [],
    pests: [],
    repels: [],
    toxicity: { cat: "non-toxic", dog: "non-toxic", horse: "non-toxic", bird: "non-toxic", rabbit: "non-toxic", human: "non-toxic" },
    toxicityNotes: "",
    allergens: [],
    allergyNotes: "",
    requiredTools: [],
    helpfulTools: [],
    goals: [],
    careTips: "",
    harvestTips: "",
  };
}
