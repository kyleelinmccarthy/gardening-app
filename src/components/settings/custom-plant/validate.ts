/** Validation for the custom-plant form. */
import type { CustomPlantFormValues, PlantFormErrors } from "./model";
import { isBlank, toNum } from "./numbers";

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

  const temps = [v.minF, v.idealMinF, v.idealMaxF, v.maxF];
  const filled = temps.filter((x): x is number => x !== null && Number.isFinite(x));
  if (filled.length < temps.length) {
    e.minF = "Enter all four temperatures: minimum, ideal low, ideal high, maximum.";
  } else if (filled.some((x, i) => i > 0 && x < filled[i - 1])) {
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
