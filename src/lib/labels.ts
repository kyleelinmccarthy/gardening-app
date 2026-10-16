/**
 * Human-readable labels for every domain enum — the single source of truth
 * for UI text. Each map is a `Record<Union, string>`, so adding a union
 * member without a label is a compile error.
 */
import type {
  Allergen,
  BedKind,
  CalendarEventType,
  CareType,
  Difficulty,
  Drainage,
  Experience,
  FeedingLevel,
  GardenGoal,
  GardenSetting,
  Humidity,
  IndoorLight,
  InsectRole,
  LifeCycle,
  Pet,
  PlantCategory,
  PlantingStatus,
  SoilType,
  SpaceSize,
  SunExposure,
  ToolInfo,
  ToxicityLevel,
  Verdict,
  WaterNeed,
} from "@/domain/types";

export const SUN_LABELS: Record<SunExposure, string> = {
  "full-sun": "Full sun (6+ h)",
  "partial-sun": "Partial sun (4–6 h)",
  "partial-shade": "Partial shade (2–4 h)",
  "full-shade": "Full shade (<2 h)",
};

export const INDOOR_LIGHT_LABELS: Record<IndoorLight, string> = {
  low: "Low light",
  medium: "Medium light",
  "bright-indirect": "Bright, indirect light",
  direct: "Direct sun",
};

export const WATER_LABELS: Record<WaterNeed, string> = {
  low: "Low water",
  moderate: "Moderate water",
  high: "High water",
};

export const HUMIDITY_LABELS: Record<Humidity, string> = {
  low: "Dry air",
  average: "Average humidity",
  high: "Humid air",
};

export const SOIL_LABELS: Record<SoilType, string> = {
  loam: "Loam",
  sandy: "Sandy",
  clay: "Clay",
  silt: "Silt",
  peat: "Peat",
  chalky: "Chalky",
  "potting-mix": "Potting mix",
  "cactus-mix": "Cactus mix",
  "orchid-bark": "Orchid bark",
};

export const DRAINAGE_LABELS: Record<Drainage, string> = {
  "well-drained": "Well-drained",
  moist: "Moist",
  wet: "Wet / boggy",
};

export const CATEGORY_LABELS: Record<PlantCategory, string> = {
  vegetable: "Vegetables",
  herb: "Herbs",
  fruit: "Fruit",
  flower: "Flowers",
  houseplant: "Houseplants",
  succulent: "Succulents",
};

export const CATEGORY_EMOJI: Record<PlantCategory, string> = {
  vegetable: "🥕",
  herb: "🌿",
  fruit: "🍓",
  flower: "🌸",
  houseplant: "🪴",
  succulent: "🌵",
};

export const LIFE_CYCLE_LABELS: Record<LifeCycle, string> = {
  annual: "Annual",
  biennial: "Biennial",
  perennial: "Perennial",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const SETTING_LABELS: Record<GardenSetting, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
};

export const PET_LABELS: Record<Pet, string> = {
  cat: "Cat",
  dog: "Dog",
  horse: "Horse",
  bird: "Bird",
  rabbit: "Rabbit",
};

export const PET_EMOJI: Record<Pet, string> = {
  cat: "🐱",
  dog: "🐶",
  horse: "🐴",
  bird: "🐦",
  rabbit: "🐰",
};

export const TOXICITY_LABELS: Record<ToxicityLevel, string> = {
  "non-toxic": "Non-toxic",
  mild: "Mildly toxic",
  moderate: "Moderately toxic",
  severe: "Severely toxic",
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  pollen: "Pollen (hay fever)",
  "contact-dermatitis": "Skin irritation (sap or hairs)",
  latex: "Latex-like sap",
  "strong-fragrance": "Strong fragrance (asthma / migraine)",
  asteraceae: "Daisy family (ragweed cross-reactivity)",
  nightshade: "Nightshade family",
  "mold-spores": "Mold spores (damp soil)",
};

export const GOAL_LABELS: Record<GardenGoal, string> = {
  edible: "Grow food",
  pollinators: "Attract pollinators",
  "low-maintenance": "Low maintenance",
  ornamental: "Beautiful blooms & foliage",
  fragrance: "Fragrance",
  "air-purifying": "Air-purifying",
  "kid-friendly": "Kid-friendly",
  "fast-harvest": "Fast harvest",
};

export const SPACE_LABELS: Record<SpaceSize, string> = {
  tiny: "Tiny (windowsill / a few pots)",
  small: "Small (balcony or small bed)",
  medium: "Medium (patio or several beds)",
  large: "Large (yard or allotment)",
};

export const BED_KIND_LABELS: Record<BedKind, string> = {
  "raised-bed": "Raised bed",
  "in-ground": "In-ground bed",
  container: "Container",
  windowsill: "Windowsill",
  shelf: "Shelf / grow rack",
};

export const PLANTING_STATUS_LABELS: Record<PlantingStatus, string> = {
  planned: "Planned",
  growing: "Growing",
  harvested: "Harvested",
  removed: "Removed",
};

export const CARE_LABELS: Record<CareType, string> = {
  water: "Water",
  fertilize: "Fertilize",
  prune: "Prune",
  harvest: "Harvest",
  "inspect-pests": "Inspect for pests",
  mulch: "Mulch",
  repot: "Repot",
  custom: "Custom task",
};

export const CARE_EMOJI: Record<CareType, string> = {
  water: "💧",
  fertilize: "🧪",
  prune: "✂️",
  harvest: "🧺",
  "inspect-pests": "🔍",
  mulch: "🍂",
  repot: "🪴",
  custom: "📝",
};

export const CALENDAR_EVENT_LABELS: Record<CalendarEventType, string> = {
  "start-indoors": "Start seeds indoors",
  transplant: "Transplant",
  "direct-sow": "Direct sow",
  "fall-sow": "Fall sowing",
  harvest: "Harvest",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  great: "Great match",
  good: "Good match",
  possible: "Possible",
  "not-recommended": "Not recommended",
};

export const FEEDING_LABELS: Record<FeedingLevel, string> = {
  light: "Light feeder",
  moderate: "Moderate feeder",
  heavy: "Heavy feeder",
};

export const TOOL_CATEGORY_LABELS: Record<ToolInfo["category"], string> = {
  "hand-tool": "Hand tools",
  watering: "Watering",
  structure: "Structures & supports",
  indoor: "Indoor growing",
  protection: "Protection & mulch",
  soil: "Soil & compost",
};

export const COST_LABELS: Record<ToolInfo["costTier"], string> = {
  $: "Budget",
  $$: "Mid-range",
  $$$: "Investment",
};

export const INSECT_ROLE_LABELS: Record<InsectRole, string> = {
  pest: "Pest",
  "animal-pest": "Wildlife pest",
  beneficial: "Beneficial",
  pollinator: "Pollinator",
};

/** A label without its trailing parenthetical hint: "Full sun (6+ h)" → "Full sun". */
export function shortLabel(label: string): string {
  return label.replace(/\s*\(.*\)$/, "");
}

export interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * Turn a label record into `{ value, label }[]` for `Select` / `ChipGroup`.
 * Order follows the record's key order; pass `order` to pick a subset or
 * a specific order (e.g. one of the `*_EXPOSURES` const arrays).
 */
export function toOptions<T extends string>(
  record: Record<T, string>,
  order?: readonly T[],
): Option<T>[] {
  const keys = order ?? (Object.keys(record) as T[]);
  return keys.map((value) => ({ value, label: record[value] }));
}
