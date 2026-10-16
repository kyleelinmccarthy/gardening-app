/** Conversion between the custom-plant form values and a stored `Plant`, plus id helpers. */
import type { Plant } from "@/domain/types";
import type { CustomPlantFormValues } from "./model";
import { isBlank, optionalNum, str } from "./numbers";

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

/** A temperature that validation has already proven present. */
function requireTemp(n: number | null, label: string): number {
  if (n === null || !Number.isFinite(n)) throw new Error(`${label} is required; validate the form before building a plant.`);
  return n;
}
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
    temperature: {
      minF: requireTemp(v.minF, "Minimum temperature"),
      idealMinF: requireTemp(v.idealMinF, "Ideal low temperature"),
      idealMaxF: requireTemp(v.idealMaxF, "Ideal high temperature"),
      maxF: requireTemp(v.maxF, "Maximum temperature"),
    },
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
