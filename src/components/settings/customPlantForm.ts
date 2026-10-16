/**
 * Pure form model for creating/editing a custom plant.
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
  Plant,
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
  // climate (°F)
  minF: number;
  idealMinF: number;
  idealMaxF: number;
  maxF: number;
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

// --- ids -------------------------------------------------------------------

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const randomSuffix = () => Math.random().toString(36).slice(2, 8).padEnd(6, "0");

/** `custom-<slug>-<suffix>`; the suffix keeps ids unique when two plants share a name. */
export function makeCustomPlantId(name: string, suffix: string = randomSuffix()): string {
  return `custom-${slugify(name) || "plant"}-${suffix}`;
}

// --- number helpers --------------------------------------------------------

const toNum = (s: string): number => (s.trim() === "" ? Number.NaN : Number(s));
const isBlank = (s: string) => s.trim() === "";
const optionalNum = (s: string): number | undefined => (isBlank(s) ? undefined : Number(s));
const str = (n: number | undefined): string => (n === undefined ? "" : String(n));
const lines = (text: string): string[] => text.split("\n").map((l) => l.trim()).filter(Boolean);
const optionalText = (s: string): string | undefined => (s.trim() === "" ? undefined : s.trim());

// --- conversion ------------------------------------------------------------

/** Builds the stored plant. Call only with values that pass `validatePlantForm`. */
export function toPlant(v: CustomPlantFormValues, id: string): Plant {
  const hasMaturity = !isBlank(v.daysMin) && !isBlank(v.daysMax);
  const fallSow = optionalNum(v.fallSowWeeks);
  const startIndoors = optionalNum(v.startIndoorsWeeks);
  const transplant = optionalNum(v.transplantWeeks);
  const directSow = optionalNum(v.directSowWeeks);
  const plantingNotes = optionalText(v.plantingNotes);
  const containerNotes = optionalText(v.containerNotes);
  const containerGallons = optionalNum(v.containerMinGallons);
  const companionNotes = optionalText(v.companionNotes);
  const toxicityNotes = optionalText(v.toxicityNotes);
  const allergyNotes = optionalText(v.allergyNotes);
  const harvestTips = optionalText(v.harvestTips);
  const indoor = v.environments.includes("indoor");

  return {
    id,
    name: v.name.trim(),
    scientificName: v.scientificName.trim(),
    emoji: v.emoji.trim() || "🌱",
    category: v.category,
    lifeCycle: v.lifeCycle,
    description: v.description.trim(),
    difficulty: v.difficulty,
    environments: v.environments,
    edible: v.edible,
    sun: v.sun,
    ...(indoor && v.indoorLight.length > 0 ? { indoorLight: v.indoorLight } : {}),
    water: v.water,
    wateringIntervalDays: Number(v.wateringIntervalDays),
    waterNotes: v.waterNotes.trim(),
    humidity: v.humidity,
    temperature: { minF: v.minF, idealMinF: v.idealMinF, idealMaxF: v.idealMaxF, maxF: v.maxF },
    hardinessZones: { min: Number(v.zoneMin), max: Number(v.zoneMax) },
    soil: { types: v.soilTypes, phMin: Number(v.phMin), phMax: Number(v.phMax), drainage: v.drainage },
    fertilizer: {
      feeding: v.feeding,
      recommended: v.fertilizers,
      frequencyDays: Number(v.feedFrequencyDays),
      notes: v.fertilizerNotes.trim(),
    },
    container: {
      suitable: v.containerSuitable,
      ...(v.containerSuitable && containerGallons !== undefined ? { minGallons: containerGallons } : {}),
      ...(containerNotes ? { notes: containerNotes } : {}),
    },
    spacingInches: Number(v.spacingInches),
    heightInches: { min: Number(v.heightMin), max: Number(v.heightMax) },
    ...(hasMaturity ? { daysToMaturity: { min: Number(v.daysMin), max: Number(v.daysMax) } } : {}),
    planting: {
      ...(startIndoors !== undefined ? { startIndoorsWeeks: startIndoors } : {}),
      ...(transplant !== undefined ? { transplantWeeks: transplant } : {}),
      ...(directSow !== undefined ? { directSowWeeks: directSow } : {}),
      ...(fallSow !== undefined ? { fallSowWeeksBeforeFirstFrost: fallSow } : {}),
      ...(plantingNotes ? { notes: plantingNotes } : {}),
    },
    companions: v.companions,
    antagonists: v.antagonists,
    ...(companionNotes ? { companionNotes } : {}),
    attracts: v.attracts,
    pests: v.pests,
    repels: v.repels,
    toxicity: { ...v.toxicity, ...(toxicityNotes ? { notes: toxicityNotes } : {}) },
    allergens: v.allergens,
    ...(allergyNotes ? { allergyNotes } : {}),
    requiredTools: v.requiredTools,
    helpfulTools: v.helpfulTools,
    goals: v.goals,
    careTips: lines(v.careTips),
    ...(harvestTips ? { harvestTips } : {}),
    custom: true,
  };
}

export function fromPlant(p: Plant): CustomPlantFormValues {
  const { notes: toxicityNotes, ...toxicity } = p.toxicity;
  return {
    name: p.name,
    scientificName: p.scientificName,
    emoji: p.emoji,
    category: p.category,
    lifeCycle: p.lifeCycle,
    description: p.description,
    difficulty: p.difficulty,
    environments: [...p.environments],
    edible: p.edible,
    sun: [...p.sun],
    indoorLight: [...(p.indoorLight ?? [])],
    water: p.water,
    wateringIntervalDays: String(p.wateringIntervalDays),
    waterNotes: p.waterNotes,
    humidity: p.humidity,
    minF: p.temperature.minF,
    idealMinF: p.temperature.idealMinF,
    idealMaxF: p.temperature.idealMaxF,
    maxF: p.temperature.maxF,
    zoneMin: String(p.hardinessZones.min),
    zoneMax: String(p.hardinessZones.max),
    soilTypes: [...p.soil.types],
    phMin: String(p.soil.phMin),
    phMax: String(p.soil.phMax),
    drainage: p.soil.drainage,
    feeding: p.fertilizer.feeding,
    fertilizers: [...p.fertilizer.recommended],
    feedFrequencyDays: String(p.fertilizer.frequencyDays),
    fertilizerNotes: p.fertilizer.notes,
    spacingInches: String(p.spacingInches),
    heightMin: String(p.heightInches.min),
    heightMax: String(p.heightInches.max),
    daysMin: str(p.daysToMaturity?.min),
    daysMax: str(p.daysToMaturity?.max),
    startIndoorsWeeks: str(p.planting.startIndoorsWeeks),
    transplantWeeks: str(p.planting.transplantWeeks),
    directSowWeeks: str(p.planting.directSowWeeks),
    fallSowWeeks: str(p.planting.fallSowWeeksBeforeFirstFrost),
    plantingNotes: p.planting.notes ?? "",
    containerSuitable: p.container.suitable,
    containerMinGallons: str(p.container.minGallons),
    containerNotes: p.container.notes ?? "",
    companions: [...p.companions],
    antagonists: [...p.antagonists],
    companionNotes: p.companionNotes ?? "",
    attracts: [...p.attracts],
    pests: [...p.pests],
    repels: [...p.repels],
    toxicity,
    toxicityNotes: toxicityNotes ?? "",
    allergens: [...p.allergens],
    allergyNotes: p.allergyNotes ?? "",
    requiredTools: [...p.requiredTools],
    helpfulTools: [...p.helpfulTools],
    goals: [...p.goals],
    careTips: p.careTips.join("\n"),
    harvestTips: p.harvestTips ?? "",
  };
}

// --- validation ------------------------------------------------------------

const MAX_ZONE = 13;

/** Field-level problems; an empty object means the form can be saved. */
export function validatePlantForm(v: CustomPlantFormValues): PlantFormErrors {
  const e: PlantFormErrors = {};
  const need = (key: keyof CustomPlantFormValues, value: string, label: string, min = 0, integer = false) => {
    const n = toNum(value);
    if (!Number.isFinite(n)) e[key] = `${label} is required.`;
    else if (n < min) e[key] = `${label} must be at least ${min}.`;
    else if (integer && !Number.isInteger(n)) e[key] = `${label} must be a whole number.`;
  };
  const optionalWeeks = (key: keyof CustomPlantFormValues, value: string, label: string) => {
    if (!isBlank(value) && !Number.isInteger(toNum(value))) e[key] = `${label} must be a whole number of weeks.`;
  };

  if (!v.name.trim()) e.name = "Name is required.";
  if (v.environments.length === 0) e.environments = "Choose at least one environment.";
  if (v.environments.includes("outdoor") && v.sun.length === 0) e.sun = "Choose at least one sun exposure.";

  need("wateringIntervalDays", v.wateringIntervalDays, "Watering interval", 1, true);

  const t = [v.minF, v.idealMinF, v.idealMaxF, v.maxF];
  if (t.some((x) => !Number.isFinite(x)) || t.some((x, i) => i > 0 && x < t[i - 1])) {
    e.minF = "Temperatures must increase: minimum, ideal low, ideal high, maximum.";
  }

  need("zoneMin", v.zoneMin, "Lowest zone", 1, true);
  need("zoneMax", v.zoneMax, "Highest zone", 1, true);
  if (!e.zoneMin && !e.zoneMax) {
    if (toNum(v.zoneMax) > MAX_ZONE) e.zoneMax = `Highest zone can't exceed ${MAX_ZONE}.`;
    else if (toNum(v.zoneMin) > toNum(v.zoneMax)) e.zoneMax = "Highest zone must be at least the lowest zone.";
  }

  need("phMin", v.phMin, "Minimum pH");
  need("phMax", v.phMax, "Maximum pH");
  if (!e.phMin && !e.phMax) {
    if (toNum(v.phMax) > 14) e.phMax = "pH can't exceed 14.";
    else if (toNum(v.phMin) > toNum(v.phMax)) e.phMax = "Maximum pH must be at least the minimum.";
  }
  if (v.soilTypes.length === 0) e.soilTypes = "Choose at least one soil type.";

  need("feedFrequencyDays", v.feedFrequencyDays, "Feeding frequency", 0, true);

  need("spacingInches", v.spacingInches, "Spacing", 1);
  need("heightMin", v.heightMin, "Minimum height");
  need("heightMax", v.heightMax, "Maximum height");
  if (!e.heightMin && !e.heightMax && toNum(v.heightMin) > toNum(v.heightMax)) {
    e.heightMax = "Maximum height must be at least the minimum.";
  }

  if (isBlank(v.daysMin) !== isBlank(v.daysMax)) {
    e.daysMax = "Enter both minimum and maximum days to maturity, or leave both blank.";
  } else if (!isBlank(v.daysMin)) {
    const [lo, hi] = [toNum(v.daysMin), toNum(v.daysMax)];
    if (!(lo >= 1) || !(hi >= 1)) e.daysMin = "Days to maturity must be at least 1.";
    else if (lo > hi) e.daysMax = "Maximum days must be at least the minimum.";
  }

  optionalWeeks("startIndoorsWeeks", v.startIndoorsWeeks, "Start indoors");
  optionalWeeks("transplantWeeks", v.transplantWeeks, "Transplant");
  optionalWeeks("directSowWeeks", v.directSowWeeks, "Direct sow");
  optionalWeeks("fallSowWeeks", v.fallSowWeeks, "Fall sow");

  if (v.containerSuitable && !isBlank(v.containerMinGallons) && !(toNum(v.containerMinGallons) > 0)) {
    e.containerMinGallons = "Container size must be greater than 0.";
  }
  if (v.companions.some((id) => v.antagonists.includes(id))) {
    e.antagonists = "A plant can't be both a companion and an antagonist.";
  }
  if (v.requiredTools.some((id) => v.helpfulTools.includes(id))) {
    e.helpfulTools = "A tool can't be both required and helpful. Pick one.";
  }
  return e;
}
