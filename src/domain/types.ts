/**
 * Core domain contract for the Garden Planner.
 *
 * Every module (data, domain logic, storage, UI) depends on these types.
 * Reference-data identifiers are string-literal unions so cross references
 * between datasets are checked by the compiler.
 *
 * Conventions:
 *  - Temperatures are stored in °F (convert for display only).
 *  - Dates are ISO strings "YYYY-MM-DD"; month-day values are "MM-DD".
 *  - Distances are inches; container volumes are US gallons.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/** full-sun: 6+ h direct, partial-sun: 4–6 h, partial-shade: 2–4 h, full-shade: <2 h */
export type SunExposure = "full-sun" | "partial-sun" | "partial-shade" | "full-shade";
export const SUN_EXPOSURES: readonly SunExposure[] = [
  "full-sun",
  "partial-sun",
  "partial-shade",
  "full-shade",
] as const;

/** Indoor light levels (used for indoor gardens and houseplants). */
export type IndoorLight = "low" | "medium" | "bright-indirect" | "direct";
export const INDOOR_LIGHTS: readonly IndoorLight[] = [
  "low",
  "medium",
  "bright-indirect",
  "direct",
] as const;

export type WaterNeed = "low" | "moderate" | "high";
export const WATER_NEEDS: readonly WaterNeed[] = ["low", "moderate", "high"] as const;

export type Humidity = "low" | "average" | "high";
export const HUMIDITY_LEVELS: readonly Humidity[] = ["low", "average", "high"] as const;

export type SoilType =
  | "loam"
  | "sandy"
  | "clay"
  | "silt"
  | "peat"
  | "chalky"
  | "potting-mix"
  | "cactus-mix"
  | "orchid-bark";
export const SOIL_TYPES: readonly SoilType[] = [
  "loam",
  "sandy",
  "clay",
  "silt",
  "peat",
  "chalky",
  "potting-mix",
  "cactus-mix",
  "orchid-bark",
] as const;

export type Drainage = "well-drained" | "moist" | "wet";

export type PlantCategory = "vegetable" | "herb" | "fruit" | "flower" | "houseplant" | "succulent";
export const PLANT_CATEGORIES: readonly PlantCategory[] = [
  "vegetable",
  "herb",
  "fruit",
  "flower",
  "houseplant",
  "succulent",
] as const;

export type LifeCycle = "annual" | "biennial" | "perennial";
export type Difficulty = "easy" | "moderate" | "challenging";
export const DIFFICULTIES: readonly Difficulty[] = ["easy", "moderate", "challenging"] as const;

export type Experience = "beginner" | "intermediate" | "advanced";
export const EXPERIENCE_LEVELS: readonly Experience[] = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type FeedingLevel = "light" | "moderate" | "heavy";

export type GardenSetting = "indoor" | "outdoor";

export type Pet = "cat" | "dog" | "horse" | "bird" | "rabbit";
export const PETS: readonly Pet[] = ["cat", "dog", "horse", "bird", "rabbit"] as const;

/** Severity of toxicity if ingested (based on ASPCA / poison-control style ratings). */
export type ToxicityLevel = "non-toxic" | "mild" | "moderate" | "severe";
export const TOXICITY_LEVELS: readonly ToxicityLevel[] = [
  "non-toxic",
  "mild",
  "moderate",
  "severe",
] as const;

export type Allergen =
  | "pollen" // airborne pollen; hay-fever trigger
  | "contact-dermatitis" // sap/hairs irritate skin
  | "latex" // latex-like sap (e.g. figs, euphorbias)
  | "strong-fragrance" // scent can trigger asthma / migraines
  | "asteraceae" // daisy-family cross reactivity (ragweed allergy)
  | "nightshade" // solanaceae sensitivity
  | "mold-spores"; // damp potting media / leaf litter
export const ALLERGENS: readonly Allergen[] = [
  "pollen",
  "contact-dermatitis",
  "latex",
  "strong-fragrance",
  "asteraceae",
  "nightshade",
  "mold-spores",
] as const;

export type GardenGoal =
  | "edible"
  | "pollinators"
  | "low-maintenance"
  | "ornamental"
  | "fragrance"
  | "air-purifying"
  | "kid-friendly"
  | "fast-harvest";
export const GARDEN_GOALS: readonly GardenGoal[] = [
  "edible",
  "pollinators",
  "low-maintenance",
  "ornamental",
  "fragrance",
  "air-purifying",
  "kid-friendly",
  "fast-harvest",
] as const;

export type SpaceSize = "tiny" | "small" | "medium" | "large";
export const SPACE_SIZES: readonly SpaceSize[] = ["tiny", "small", "medium", "large"] as const;

export type TemperatureUnit = "F" | "C";

// ---------------------------------------------------------------------------
// Reference data identifiers (compile-time checked cross references)
// ---------------------------------------------------------------------------

export type ToolId =
  | "hand-trowel"
  | "pruners"
  | "garden-gloves"
  | "watering-can"
  | "garden-hose"
  | "drip-irrigation"
  | "soaker-hose"
  | "spade"
  | "garden-fork"
  | "hoe"
  | "rake"
  | "wheelbarrow"
  | "trellis"
  | "stakes"
  | "tomato-cage"
  | "raised-bed"
  | "containers"
  | "hanging-basket"
  | "grow-light"
  | "heat-mat"
  | "seed-trays"
  | "humidity-dome"
  | "humidifier"
  | "pebble-tray"
  | "greenhouse"
  | "cold-frame"
  | "row-cover"
  | "bird-netting"
  | "mulch"
  | "compost-bin"
  | "soil-test-kit"
  | "moisture-meter"
  | "spray-bottle"
  | "thermometer";

export type InsectId =
  // pests
  | "aphids"
  | "spider-mites"
  | "whiteflies"
  | "fungus-gnats"
  | "mealybugs"
  | "scale-insects"
  | "thrips"
  | "slugs-snails"
  | "cabbage-worms"
  | "tomato-hornworm"
  | "cucumber-beetles"
  | "squash-vine-borer"
  | "squash-bugs"
  | "flea-beetles"
  | "colorado-potato-beetle"
  | "japanese-beetles"
  | "carrot-rust-fly"
  | "leaf-miners"
  | "cutworms"
  | "corn-earworm"
  | "mexican-bean-beetle"
  | "onion-maggots"
  | "earwigs"
  | "deer"
  | "rabbits"
  | "birds"
  | "squirrels"
  // beneficials & pollinators
  | "honeybees"
  | "native-bees"
  | "bumblebees"
  | "butterflies"
  | "moths"
  | "hummingbirds"
  | "ladybugs"
  | "lacewings"
  | "hoverflies"
  | "parasitic-wasps"
  | "ground-beetles"
  | "praying-mantis"
  | "earthworms";

export type FertilizerId =
  | "compost"
  | "aged-manure"
  | "balanced-10-10-10"
  | "high-nitrogen"
  | "bloom-booster"
  | "fish-emulsion"
  | "bone-meal"
  | "blood-meal"
  | "kelp-seaweed"
  | "worm-castings"
  | "tomato-feed"
  | "acid-fertilizer"
  | "cactus-fertilizer"
  | "orchid-fertilizer"
  | "houseplant-liquid"
  | "slow-release-granules"
  | "epsom-salt"
  | "none";

export type InsectRole = "pest" | "beneficial" | "pollinator" | "animal-pest";

// ---------------------------------------------------------------------------
// Plants
// ---------------------------------------------------------------------------

export interface Range {
  min: number;
  max: number;
}

export interface TemperatureNeeds {
  /** Damage / death threshold in °F. */
  minF: number;
  /** Ideal growing range in °F. */
  idealMinF: number;
  idealMaxF: number;
  /** Heat stress / bolting threshold in °F. */
  maxF: number;
}

export interface SoilNeeds {
  types: SoilType[];
  phMin: number;
  phMax: number;
  drainage: Drainage;
}

export interface FertilizerNeeds {
  feeding: FeedingLevel;
  recommended: FertilizerId[];
  /** Days between feedings during the growing season (0 = do not feed). */
  frequencyDays: number;
  notes: string;
}

export interface ContainerSuitability {
  suitable: boolean;
  /** Minimum container size in US gallons when suitable. */
  minGallons?: number;
  notes?: string;
}

export interface Toxicity {
  cat: ToxicityLevel;
  dog: ToxicityLevel;
  horse: ToxicityLevel;
  bird: ToxicityLevel;
  rabbit: ToxicityLevel;
  human: ToxicityLevel;
  /** Which part is toxic and symptoms, e.g. "Leaves & stems: vomiting, drooling". */
  notes?: string;
}

/**
 * Planting windows, all relative to the average LAST spring frost
 * (negative = weeks before last frost, positive = weeks after),
 * except fallSowWeeksBeforeFirstFrost which counts back from the first fall frost.
 */
export interface PlantingWindows {
  startIndoorsWeeks?: number; // e.g. -8 => start seeds 8 weeks before last frost
  transplantWeeks?: number; // e.g. 2 => transplant 2 weeks after last frost
  directSowWeeks?: number; // e.g. -4 => direct sow 4 weeks before last frost
  fallSowWeeksBeforeFirstFrost?: number; // e.g. 10 => sow 10 weeks before first frost
  /** Free-text guidance for perennials / houseplants (e.g. "Plant bare-root in early spring"). */
  notes?: string;
}

export interface Plant {
  id: string; // kebab-case, unique
  name: string;
  scientificName: string;
  emoji: string;
  category: PlantCategory;
  lifeCycle: LifeCycle;
  description: string;
  difficulty: Difficulty;
  environments: GardenSetting[]; // where it can be grown
  edible: boolean;

  sun: SunExposure[]; // acceptable outdoor exposures
  indoorLight?: IndoorLight[]; // acceptable indoor light levels (if indoor capable)
  water: WaterNeed;
  /** Baseline days between waterings for an established outdoor in-ground plant in mild weather. */
  wateringIntervalDays: number;
  waterNotes: string;
  humidity: Humidity;

  temperature: TemperatureNeeds;
  /** USDA hardiness zones where it survives winter outdoors (perennials) or is commonly grown. */
  hardinessZones: Range;

  soil: SoilNeeds;
  fertilizer: FertilizerNeeds;
  container: ContainerSuitability;

  spacingInches: number;
  heightInches: Range;
  daysToMaturity?: Range;
  planting: PlantingWindows;

  companions: string[]; // plant ids that grow well nearby
  antagonists: string[]; // plant ids to keep apart
  companionNotes?: string;

  attracts: InsectId[]; // beneficial insects / pollinators drawn in
  pests: InsectId[]; // common pests / animal pests it attracts
  repels: InsectId[]; // pests it helps deter

  toxicity: Toxicity;
  allergens: Allergen[];
  allergyNotes?: string;

  requiredTools: ToolId[];
  helpfulTools: ToolId[];

  goals: GardenGoal[]; // which goals it serves
  careTips: string[];
  harvestTips?: string;
  /** True for user-created plants. */
  custom?: boolean;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

export interface Insect {
  id: InsectId;
  name: string;
  emoji: string;
  role: InsectRole;
  description: string;
  /** Signs of presence / damage. */
  signs: string[];
  /** Organic / integrated pest management controls (pests) or ways to attract (beneficials). */
  management: string[];
  /** Is it safe to use these controls around pets and children? Extra cautions. */
  safetyNotes?: string;
}

export interface SoilInfo {
  id: SoilType;
  name: string;
  description: string;
  drainage: Drainage;
  nutrients: "low" | "moderate" | "high";
  typicalPh: Range;
  pros: string[];
  cons: string[];
  improveWith: string[];
  identify: string; // how to identify (e.g. squeeze test)
}

export interface FertilizerInfo {
  id: FertilizerId;
  name: string;
  npk: string; // e.g. "10-10-10" or "varies"
  organic: boolean;
  description: string;
  bestFor: string[];
  howToApply: string;
  cautions: string[];
  petSafe: boolean;
}

export interface ToolInfo {
  id: ToolId;
  name: string;
  emoji: string;
  category: "hand-tool" | "watering" | "structure" | "indoor" | "protection" | "soil";
  description: string;
  costTier: "$" | "$$" | "$$$";
  /** Cheap substitutes the user may already have. */
  alternatives: string[];
}

export interface ZoneInfo {
  zone: number; // 1–13
  minTempF: number; // average annual extreme minimum (lower bound)
  maxTempF: number; // upper bound of that range
  /** Typical average last spring frost "MM-DD" (null when frost-free). */
  lastFrost: string | null;
  /** Typical average first fall frost "MM-DD" (null when frost-free). */
  firstFrost: string | null;
  description: string;
}

// ---------------------------------------------------------------------------
// User data
// ---------------------------------------------------------------------------

export interface ClimateProfile {
  hardinessZone: number; // 1–13
  lastFrost: string | null; // "MM-DD"
  firstFrost: string | null; // "MM-DD"
  summerHighF: number; // typical summer daytime high
  winterLowF: number; // typical winter night low
  humidity: Humidity;
  zip?: string;
}

export interface IndoorConditions {
  light: IndoorLight;
  averageTempF: number;
  humidity: Humidity;
}

export interface GardenProfile {
  setting: GardenSetting;
  climate: ClimateProfile;
  /** Used when setting === "indoor". */
  indoor: IndoorConditions;
  sunExposure: SunExposure; // best available outdoor exposure
  soilType: SoilType;
  space: SpaceSize;
  containersOnly: boolean; // balcony / patio / indoor pots
  tools: ToolId[];
  interests: PlantCategory[]; // empty = all
  goals: GardenGoal[];
  experience: Experience;
  pets: Pet[];
  allergies: Allergen[];
  hasChildren: boolean;
  /** Max hours per week the user wants to spend on maintenance. */
  weeklyHours: number;
}

export type BedKind = "raised-bed" | "in-ground" | "container" | "windowsill" | "shelf";

export interface Placement {
  plantId: string;
  x: number; // column, 0-based
  y: number; // row, 0-based
}

export interface Bed {
  id: string;
  name: string;
  kind: BedKind;
  columns: number;
  rows: number;
  cellSizeInches: number; // default 12 (square-foot gardening)
  sun: SunExposure;
  placements: Placement[];
}

export type PlantingStatus = "planned" | "growing" | "harvested" | "removed";

export interface Planting {
  id: string;
  plantId: string;
  bedId?: string;
  quantity: number;
  plantedOn: string; // ISO date
  status: PlantingStatus;
  inContainer: boolean;
  notes?: string;
}

export type CareType =
  | "water"
  | "fertilize"
  | "prune"
  | "harvest"
  | "inspect-pests"
  | "mulch"
  | "repot"
  | "custom";

export interface CareLogEntry {
  id: string;
  plantingId?: string;
  type: CareType;
  date: string; // ISO date
  note?: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string; // ISO date
  repeatDays?: number; // recurring when set
  done: boolean;
  plantingId?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date
  title: string;
  text: string;
  plantingId?: string;
}

export interface Garden {
  id: string;
  name: string;
  createdAt: string; // ISO date-time
  profile: GardenProfile;
  beds: Bed[];
  plantings: Planting[];
  careLog: CareLogEntry[];
  reminders: Reminder[];
  journal: JournalEntry[];
}

export interface AppSettings {
  temperatureUnit: TemperatureUnit;
}

export interface AppData {
  version: 1;
  gardens: Garden[];
  activeGardenId: string | null;
  customPlants: Plant[];
  settings: AppSettings;
}

// ---------------------------------------------------------------------------
// Domain results
// ---------------------------------------------------------------------------

export type ReasonKind = "positive" | "warning" | "blocker";

export interface Reason {
  kind: ReasonKind;
  /** Short machine-friendly topic, e.g. "sun", "pets", "zone". */
  topic:
    | "sun"
    | "light"
    | "water"
    | "temperature"
    | "zone"
    | "container"
    | "pets"
    | "children"
    | "allergy"
    | "tools"
    | "experience"
    | "goals"
    | "interest"
    | "soil"
    | "setting"
    | "humidity"
    | "time";
  message: string;
}

export type Verdict = "great" | "good" | "possible" | "not-recommended";

export interface Recommendation {
  plant: Plant;
  score: number; // 0–100
  verdict: Verdict;
  reasons: Reason[];
}

export type CompanionRelation = "companion" | "antagonist";

export interface CompanionPair {
  a: string; // plant id
  b: string; // plant id
  relation: CompanionRelation;
}

export type CalendarEventType =
  | "start-indoors"
  | "transplant"
  | "direct-sow"
  | "fall-sow"
  | "harvest";

export interface CalendarEvent {
  plantId: string;
  type: CalendarEventType;
  start: string; // ISO date
  end: string; // ISO date (inclusive)
}

export interface CareTask {
  /** Stable id: `${type}:${plantingId}` or `reminder:${id}`. */
  id: string;
  type: CareType;
  plantingId?: string;
  reminderId?: string;
  title: string;
  detail: string;
  dueDate: string; // ISO date
  overdueDays: number; // 0 when due today / in future
}

/** Read access to all plants (built-in + custom). */
export interface PlantCatalog {
  all(): Plant[];
  get(id: string): Plant | undefined;
}
