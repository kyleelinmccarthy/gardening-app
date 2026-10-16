/**
 * Pure state + validation for the garden setup wizard.
 * Temperatures are kept in °F (the storage unit); the UI converts for display.
 */
import { ZONES } from "@/data/zones";
import { climateFromZone } from "@/domain/climate";
import { createDefaultProfile } from "@/domain/defaults";
import type {
  Allergen,
  Experience,
  GardenGoal,
  GardenProfile,
  GardenSetting,
  Humidity,
  IndoorLight,
  Pet,
  PlantCategory,
  SoilType,
  SpaceSize,
  SunExposure,
  ToolId,
} from "@/domain/types";

export const MIN_ZONE = 1;
export const MAX_ZONE = 13;
/** Frost dates used when a user un-ticks "frost-free" on a zone that has none. */
const FALLBACK_LAST_FROST = "04-15";
const FALLBACK_FIRST_FROST = "10-15";

export type SetupStepId = "basics" | "climate" | "space" | "tools" | "grow" | "safety" | "review";

export interface SetupStep {
  id: SetupStepId;
  label: string;
}

export const SETUP_STEPS: readonly SetupStep[] = [
  { id: "basics", label: "Basics" },
  { id: "climate", label: "Climate" },
  { id: "space", label: "Space & soil" },
  { id: "tools", label: "Tools" },
  { id: "grow", label: "What to grow" },
  { id: "safety", label: "Household" },
  { id: "review", label: "Review" },
];

export interface SetupFormState {
  name: string;
  setting: GardenSetting;
  zone: number;
  frostFree: boolean;
  /** "MM-DD"; ignored when `frostFree`. */
  lastFrost: string;
  firstFrost: string;
  /** °F; null while the field is empty (validation blocks continuing). */
  summerHighF: number | null;
  winterLowF: number | null;
  humidity: Humidity;
  zip: string;
  indoorLight: IndoorLight;
  /** °F; null while the field is empty (only required for indoor gardens). */
  indoorTempF: number | null;
  indoorHumidity: Humidity;
  sunExposure: SunExposure;
  soilType: SoilType;
  space: SpaceSize;
  containersOnly: boolean;
  tools: ToolId[];
  interests: PlantCategory[];
  goals: GardenGoal[];
  experience: Experience;
  weeklyHours: number;
  pets: Pet[];
  allergies: Allergen[];
  hasChildren: boolean;
}

export type SetupAction =
  | { type: "patch"; changes: Partial<SetupFormState> }
  /** Picks a hardiness zone and refills frost dates, winter low and summer high from it. */
  | { type: "setZone"; zone: number }
  | { type: "setFrostFree"; frostFree: boolean }
  | { type: "reset"; state: SetupFormState };

// --- construction ----------------------------------------------------------

/** Form state for an existing garden's profile (or the defaults for a new garden). */
export function stateFromProfile(name: string, profile: GardenProfile): SetupFormState {
  const { climate, indoor } = profile;
  const frostFree = climate.lastFrost === null && climate.firstFrost === null;
  return {
    name,
    setting: profile.setting,
    zone: climate.hardinessZone,
    frostFree,
    lastFrost: climate.lastFrost ?? FALLBACK_LAST_FROST,
    firstFrost: climate.firstFrost ?? FALLBACK_FIRST_FROST,
    summerHighF: climate.summerHighF,
    winterLowF: climate.winterLowF,
    humidity: climate.humidity,
    zip: climate.zip ?? "",
    indoorLight: indoor.light,
    indoorTempF: indoor.averageTempF,
    indoorHumidity: indoor.humidity,
    sunExposure: profile.sunExposure,
    soilType: profile.soilType,
    space: profile.space,
    containersOnly: profile.containersOnly,
    tools: [...profile.tools],
    interests: [...profile.interests],
    goals: [...profile.goals],
    experience: profile.experience,
    weeklyHours: profile.weeklyHours,
    pets: [...profile.pets],
    allergies: [...profile.allergies],
    hasChildren: profile.hasChildren,
  };
}

export function initialSetupState(): SetupFormState {
  return stateFromProfile("", createDefaultProfile());
}

/**
 * Converts the form back into a profile. Indoor gardens are always container
 * gardens. Call after validation: an empty temperature (null) falls back to
 * the default for the chosen zone / room rather than producing a bad profile.
 */
export function toProfile(state: SetupFormState): GardenProfile {
  const zip = state.zip.trim();
  const indoor = state.setting === "indoor";
  const defaults = createDefaultProfile();
  const zoneClimate = climateFromZone(state.zone, ZONES);
  return {
    setting: state.setting,
    climate: {
      hardinessZone: state.zone,
      lastFrost: state.frostFree ? null : state.lastFrost,
      firstFrost: state.frostFree ? null : state.firstFrost,
      summerHighF: state.summerHighF ?? zoneClimate.summerHighF,
      winterLowF: state.winterLowF ?? zoneClimate.winterLowF,
      humidity: state.humidity,
      ...(zip ? { zip } : {}),
    },
    indoor: { light: state.indoorLight, averageTempF: state.indoorTempF ?? defaults.indoor.averageTempF, humidity: state.indoorHumidity },
    sunExposure: state.sunExposure,
    soilType: state.soilType,
    space: state.space,
    containersOnly: indoor ? true : state.containersOnly,
    tools: state.tools,
    interests: state.interests,
    goals: state.goals,
    experience: state.experience,
    pets: state.pets,
    allergies: state.allergies,
    hasChildren: state.hasChildren,
    weeklyHours: state.weeklyHours,
  };
}

/** True when the user has changed anything since `initial` (used to guard against discarding input). */
export function isSetupDirty(initial: SetupFormState, current: SetupFormState): boolean {
  // JSON comparison is enough: the state is plain data (NaN serialises as null, which only ever matches NaN here).
  return JSON.stringify(initial) !== JSON.stringify(current);
}

// --- reducer ---------------------------------------------------------------

export function setupReducer(state: SetupFormState, action: SetupAction): SetupFormState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.changes };
    case "setZone": {
      const zone = clampZone(action.zone);
      const climate = climateFromZone(zone, ZONES);
      const frostFree = climate.lastFrost === null && climate.firstFrost === null;
      return {
        ...state,
        zone,
        frostFree,
        lastFrost: climate.lastFrost ?? FALLBACK_LAST_FROST,
        firstFrost: climate.firstFrost ?? FALLBACK_FIRST_FROST,
        summerHighF: climate.summerHighF,
        winterLowF: climate.winterLowF,
      };
    }
    case "setFrostFree":
      return { ...state, frostFree: action.frostFree };
    case "reset":
      return action.state;
  }
}

function clampZone(zone: number): number {
  return Math.min(MAX_ZONE, Math.max(MIN_ZONE, Math.round(zone)));
}

// --- validation ------------------------------------------------------------

export type SetupErrors = Partial<Record<keyof SetupFormState, string>>;

/** True for "MM-DD" naming a real calendar day (Feb 29 allowed). */
export function isValidMonthDay(value: string): boolean {
  const m = /^(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= new Date(Date.UTC(2000, month, 0)).getUTCDate();
}

const isFiniteNumber = (n: number | null): n is number => typeof n === "number" && Number.isFinite(n);

/** Errors blocking progress past `step` (empty object = OK). */
export function validateStep(step: SetupStepId, state: SetupFormState): SetupErrors {
  const errors: SetupErrors = {};
  switch (step) {
    case "basics":
      if (!state.name.trim()) errors.name = "Give your garden a name.";
      break;
    case "climate":
      if (!Number.isInteger(state.zone) || state.zone < MIN_ZONE || state.zone > MAX_ZONE) {
        errors.zone = `Choose a hardiness zone from ${MIN_ZONE} to ${MAX_ZONE}.`;
      }
      if (!state.frostFree) {
        if (!isValidMonthDay(state.lastFrost)) errors.lastFrost = "Enter a valid last spring frost date.";
        if (!isValidMonthDay(state.firstFrost)) errors.firstFrost = "Enter a valid first fall frost date.";
      }
      const { summerHighF, winterLowF } = state;
      if (!isFiniteNumber(summerHighF)) errors.summerHighF = "Enter a summer high temperature.";
      if (!isFiniteNumber(winterLowF)) errors.winterLowF = "Enter a winter low temperature.";
      if (isFiniteNumber(summerHighF) && isFiniteNumber(winterLowF) && winterLowF >= summerHighF) {
        errors.winterLowF = "Winter low must be colder than the summer high.";
      }
      if (state.setting === "indoor" && !isFiniteNumber(state.indoorTempF)) {
        errors.indoorTempF = "Enter your average indoor temperature.";
      }
      break;
    case "grow":
      if (!isFiniteNumber(state.weeklyHours) || state.weeklyHours < 0 || state.weeklyHours > 168) {
        errors.weeklyHours = "Enter hours per week between 0 and 168.";
      }
      break;
    default:
      break;
  }
  return errors;
}

/** First step (before review) with an error, or null when the whole form is valid. */
export function firstInvalidStep(state: SetupFormState): SetupStepId | null {
  for (const step of SETUP_STEPS) {
    if (Object.keys(validateStep(step.id, state)).length > 0) return step.id;
  }
  return null;
}
