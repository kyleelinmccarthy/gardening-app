import { getSafetyIssues } from "./safety";
import type { GardenProfile, Plant, Reason, Recommendation, ToolId, Verdict } from "./types";
import { INDOOR_LIGHTS, SUN_EXPOSURES } from "./types";

// ---------------------------------------------------------------------------
// Tunable weights — the single place to adjust scoring.
// ---------------------------------------------------------------------------

export const SCORE_CONFIG = {
  baseline: 60,
  greatMin: 80,
  goodMin: 60,
  /** Highest score a plant with any blocker can reach. */
  blockedCap: 25,
  /** Points per matching goal, and the most goals can add. */
  goalMatch: 4,
  goalMatchCap: 12,
  /** A heat spike this many °F above maxF counts as heat stress. */
  heatTolerance: 5,
  weights: {
    blocker: -30,
    warning: -6,
    sunMatch: 10,
    sunAdjacent: -8,
    lightMatch: 10,
    lightAdjacent: -8,
    lightMitigated: -8,
    zoneMatch: 8,
    zoneStretch: -12,
    heatStress: -8,
    shortSeason: -8,
    tempMatch: 4,
    tempOff: -8,
    humidityMismatch: -6,
    containerFit: 4,
    missingTools: -5,
    helpfulTools: 3,
    beginnerChallenging: -12,
    beginnerEasy: 8,
    outsideInterests: -35,
    timeStrain: -8,
    soilMatch: 6,
    soilMismatch: -6,
  },
} as const;

const W = SCORE_CONFIG.weights;

/** Days of the year that each month starts after (non-leap). */
const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const DAYS_IN_YEAR = 365;

function dayOfYear(monthDay: string): number {
  const [month, day] = monthDay.split("-").map(Number);
  return DAYS_BEFORE_MONTH[month - 1] + day;
}

/**
 * Days between the last spring frost and first fall frost ("MM-DD", non-leap).
 * Returns 365 when either date is null (frost-free climate).
 */
export function frostFreeDays(lastFrost: string | null, firstFrost: string | null): number {
  if (lastFrost === null || firstFrost === null) return DAYS_IN_YEAR;
  const diff = dayOfYear(firstFrost) - dayOfYear(lastFrost);
  return diff >= 0 ? diff : diff + DAYS_IN_YEAR;
}

// ---------------------------------------------------------------------------
// Rule plumbing
// ---------------------------------------------------------------------------

export interface RuleResult {
  /** Score adjustment applied to the baseline. */
  delta: number;
  reasons: Reason[];
}

/** A scoring factor. Add new rules to the list passed to evaluatePlant; the engine never changes. */
export type Rule = (plant: Plant, profile: GardenProfile) => RuleResult;

const NOTHING: RuleResult = { delta: 0, reasons: [] };

const outcome = (delta: number, kind: Reason["kind"], topic: Reason["topic"], message: string): RuleResult => ({
  delta,
  reasons: [{ kind, topic, message }],
});
const positive = (delta: number, topic: Reason["topic"], message: string) => outcome(delta, "positive", topic, message);
const warning = (delta: number, topic: Reason["topic"], message: string) => outcome(delta, "warning", topic, message);
const blocker = (topic: Reason["topic"], message: string) => outcome(W.blocker, "blocker", topic, message);

const hasTool = (profile: GardenProfile, ...tools: ToolId[]) => tools.some((t) => profile.tools.includes(t));
const humanList = (items: string[]) => items.map((i) => i.replace(/-/g, " ")).join(", ");
const isOutdoor = (profile: GardenProfile) => profile.setting === "outdoor";

/** Smallest number of steps between `value` and any accepted value on an ordered scale. */
function nearestStep<T>(order: readonly T[], value: T, accepted: readonly T[]): { distance: number; below: boolean } {
  const at = order.indexOf(value);
  let best = { distance: Infinity, below: false };
  for (const option of accepted) {
    const distance = Math.abs(order.indexOf(option) - at);
    if (distance < best.distance) best = { distance, below: at < order.indexOf(option) };
  }
  return best;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const settingRule: Rule = (plant, profile) =>
  plant.environments.includes(profile.setting)
    ? NOTHING
    : blocker("setting", `Not suited to ${profile.setting} growing`);

const sunRule: Rule = (plant, profile) => {
  if (!isOutdoor(profile)) return NOTHING;
  const { distance } = nearestStep(SUN_EXPOSURES, profile.sunExposure, plant.sun);
  const label = profile.sunExposure.replace(/-/g, " ");
  if (distance === 0) return positive(W.sunMatch, "sun", `Thrives in ${label}`);
  if (distance === 1) return warning(W.sunAdjacent, "sun", `Prefers ${humanList(plant.sun)}; your ${label} is close but not ideal`);
  return blocker("sun", `Needs ${humanList(plant.sun)}, but your garden gets ${label}`);
};

const lightRule: Rule = (plant, profile) => {
  if (isOutdoor(profile) || !plant.indoorLight?.length) return NOTHING;
  const { distance, below } = nearestStep(INDOOR_LIGHTS, profile.indoor.light, plant.indoorLight);
  const label = profile.indoor.light.replace(/-/g, " ");
  if (distance === 0) return positive(W.lightMatch, "light", `Your ${label} light suits it`);
  const growLight = hasTool(profile, "grow-light");
  if (distance === 1) {
    return warning(
      W.lightAdjacent,
      "light",
      below
        ? `Your ${label} light is a bit dim; a grow light would help`
        : `Your ${label} light is a bit strong; filter it with a sheer curtain`,
    );
  }
  if (below && growLight) {
    return warning(W.lightMitigated, "light", `Your ${label} light is too dim, but your grow light can make up for it`);
  }
  return blocker(
    "light",
    below
      ? `Needs ${humanList(plant.indoorLight)} light; ${label} is too dim (a grow light could fix this)`
      : `Needs ${humanList(plant.indoorLight)} light; ${label} is too strong`,
  );
};

/** Perennials and biennials must survive the winter outdoors. */
const hardinessRule: Rule = (plant, profile) => {
  if (!isOutdoor(profile) || plant.lifeCycle === "annual") return NOTHING;
  const zone = profile.climate.hardinessZone;
  const { min, max } = plant.hardinessZones;
  if (zone >= min && zone <= max) return positive(W.zoneMatch, "zone", `Hardy in your zone ${zone}`);
  if (zone > max) {
    return warning(W.zoneStretch, "zone", `Zone ${zone} is warmer than its range (${min}–${max}); it may struggle without winter chill`);
  }
  if (min - zone === 1 && plant.container.suitable) {
    return warning(
      W.zoneStretch,
      "zone",
      `Marginally hardy in zone ${zone}: grow as an annual or overwinter the pot indoors`,
    );
  }
  return blocker("zone", `Won't survive winter in zone ${zone} (hardy to zone ${min})`);
};

const heatRule: Rule = (plant, profile) => {
  if (!isOutdoor(profile) || plant.lifeCycle !== "annual") return NOTHING;
  const { summerHighF } = profile.climate;
  const limit = plant.temperature.maxF + SCORE_CONFIG.heatTolerance;
  return summerHighF > limit
    ? warning(W.heatStress, "temperature", `Summer highs near ${summerHighF}°F risk heat stress and bolting`)
    : NOTHING;
};

const seasonRule: Rule = (plant, profile) => {
  if (!isOutdoor(profile) || plant.lifeCycle !== "annual" || !plant.daysToMaturity) return NOTHING;
  const season = frostFreeDays(profile.climate.lastFrost, profile.climate.firstFrost);
  const needed = plant.daysToMaturity.min;
  if (needed <= season) return NOTHING;
  const summary = `needs ${needed}+ days to mature but your frost-free season is about ${season}`;
  if (hasTool(profile, "greenhouse")) return positive(0, "zone", `Your greenhouse extends the season (${summary})`);
  if (hasTool(profile, "cold-frame")) return positive(0, "zone", `Your cold frame extends the season (${summary})`);
  return warning(W.shortSeason, "zone", `Short season: ${summary}; start seeds indoors or use a greenhouse`);
};

const indoorTemperatureRule: Rule = (plant, profile) => {
  if (isOutdoor(profile)) return NOTHING;
  const temp = profile.indoor.averageTempF;
  const { minF, idealMinF, idealMaxF } = plant.temperature;
  if (temp < minF) return blocker("temperature", `Your ${temp}°F home is below its ${minF}°F survival limit`);
  if (temp < idealMinF || temp > idealMaxF) {
    return warning(W.tempOff, "temperature", `Prefers ${idealMinF}–${idealMaxF}°F; your home averages ${temp}°F`);
  }
  return positive(W.tempMatch, "temperature", `Your ${temp}°F home is in its ideal range`);
};

const humidityRule: Rule = (plant, profile) => {
  const ambient = isOutdoor(profile) ? profile.climate.humidity : profile.indoor.humidity;
  if (plant.humidity !== "high" || ambient !== "low") return NOTHING;
  if (hasTool(profile, "humidifier", "pebble-tray")) {
    return positive(0, "humidity", "Loves humidity; your humidifier or pebble tray can supply it");
  }
  return warning(W.humidityMismatch, "humidity", "Loves humidity but your air is dry; consider a humidifier or pebble tray");
};

const containerRule: Rule = (plant, profile) => {
  if (!profile.containersOnly && isOutdoor(profile)) return NOTHING;
  if (!plant.container.suitable) return blocker("container", "Not suited to container growing");
  const gallons = plant.container.minGallons;
  return positive(
    W.containerFit,
    "container",
    gallons ? `Grows well in containers (at least ${gallons} gallons)` : "Grows well in containers",
  );
};

const toolsRule: Rule = (plant, profile) => {
  const missing = plant.requiredTools.filter((t) => !profile.tools.includes(t));
  if (missing.length > 0) return warning(W.missingTools, "tools", `You'll need: ${humanList(missing)}`);
  const owned = plant.helpfulTools.filter((t) => profile.tools.includes(t));
  return owned.length > 0 ? positive(W.helpfulTools, "tools", `Your ${humanList(owned)} will come in handy`) : NOTHING;
};

const experienceRule: Rule = (plant, profile) => {
  if (profile.experience !== "beginner") return NOTHING;
  if (plant.difficulty === "challenging") {
    return warning(W.beginnerChallenging, "experience", "Challenging for a beginner");
  }
  return plant.difficulty === "easy" ? positive(W.beginnerEasy, "experience", "Easy and forgiving for beginners") : NOTHING;
};

const interestRule: Rule = (plant, profile) =>
  profile.interests.length > 0 && !profile.interests.includes(plant.category)
    ? warning(W.outsideInterests, "interest", `A ${plant.category}, which is outside your interests`)
    : NOTHING;

const goalRule: Rule = (plant, profile) => {
  const matches = plant.goals.filter((g) => profile.goals.includes(g));
  if (matches.length === 0) return NOTHING;
  const delta = Math.min(matches.length * SCORE_CONFIG.goalMatch, SCORE_CONFIG.goalMatchCap);
  return positive(delta, "goals", `Supports your goals: ${humanList(matches)}`);
};

const timeRule: Rule = (plant, profile) => {
  const demanding = plant.difficulty === "challenging" || plant.water === "high";
  return profile.weeklyHours <= 1 && demanding
    ? warning(W.timeStrain, "time", "Needs more attention than your time budget allows")
    : NOTHING;
};

const soilRule: Rule = (plant, profile) => {
  if (!isOutdoor(profile) || profile.containersOnly) return NOTHING;
  if (plant.soil.types.includes(profile.soilType)) {
    return positive(W.soilMatch, "soil", `Your ${profile.soilType} soil suits it`);
  }
  return warning(
    W.soilMismatch,
    "soil",
    `Prefers ${humanList(plant.soil.types)} soil; amend your ${profile.soilType} soil with compost`,
  );
};

const safetyRule: Rule = (plant, profile) => {
  const reasons = getSafetyIssues(plant, profile);
  const delta = reasons.reduce((sum, r) => sum + (r.kind === "blocker" ? W.blocker : W.warning), 0);
  return { delta, reasons };
};

export const DEFAULT_RULES: readonly Rule[] = [
  settingRule,
  sunRule,
  lightRule,
  hardinessRule,
  heatRule,
  seasonRule,
  indoorTemperatureRule,
  humidityRule,
  containerRule,
  toolsRule,
  experienceRule,
  interestRule,
  goalRule,
  timeRule,
  soilRule,
  safetyRule,
];

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function verdictFor(score: number, blocked: boolean): Verdict {
  if (blocked) return "not-recommended";
  if (score >= SCORE_CONFIG.greatMin) return "great";
  if (score >= SCORE_CONFIG.goodMin) return "good";
  return "possible";
}

/** Scores how well a plant fits a garden profile (0–100) with the reasons behind it. */
export function evaluatePlant(
  plant: Plant,
  profile: GardenProfile,
  rules: readonly Rule[] = DEFAULT_RULES,
): Recommendation {
  const results = rules.map((rule) => rule(plant, profile));
  const reasons = results.flatMap((r) => r.reasons);
  const blocked = reasons.some((r) => r.kind === "blocker");
  const raw = SCORE_CONFIG.baseline + results.reduce((sum, r) => sum + r.delta, 0);
  const capped = blocked ? Math.min(raw, SCORE_CONFIG.blockedCap) : raw;
  const score = clamp(Math.round(capped), 0, 100);
  return { plant, score, verdict: verdictFor(score, blocked), reasons };
}

export interface RecommendOptions {
  includeBlocked?: boolean;
  limit?: number;
}

/** Evaluates every plant; best first (score desc, then name). Blocked plants are dropped unless requested. */
export function recommendPlants(
  plants: Plant[],
  profile: GardenProfile,
  opts: RecommendOptions = {},
): Recommendation[] {
  const ranked = plants
    .map((plant) => evaluatePlant(plant, profile))
    .filter((rec) => opts.includeBlocked || rec.verdict !== "not-recommended")
    .sort((a, b) => b.score - a.score || a.plant.name.localeCompare(b.plant.name));
  return opts.limit === undefined ? ranked : ranked.slice(0, opts.limit);
}
