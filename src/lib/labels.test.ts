import {
  ALLERGENS,
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
} from "@/domain/types";
import * as labels from "./labels";

function expectCovers(record: Record<string, string>, keys: readonly string[]) {
  expect(Object.keys(record).sort()).toEqual([...keys].sort());
  for (const key of keys) expect(record[key].trim()).not.toBe("");
}

describe("labels", () => {
  it("covers every member of each exported const array", () => {
    expectCovers(labels.SUN_LABELS, SUN_EXPOSURES);
    expectCovers(labels.INDOOR_LIGHT_LABELS, INDOOR_LIGHTS);
    expectCovers(labels.WATER_LABELS, WATER_NEEDS);
    expectCovers(labels.HUMIDITY_LABELS, HUMIDITY_LEVELS);
    expectCovers(labels.SOIL_LABELS, SOIL_TYPES);
    expectCovers(labels.CATEGORY_LABELS, PLANT_CATEGORIES);
    expectCovers(labels.CATEGORY_EMOJI, PLANT_CATEGORIES);
    expectCovers(labels.DIFFICULTY_LABELS, DIFFICULTIES);
    expectCovers(labels.EXPERIENCE_LABELS, EXPERIENCE_LEVELS);
    expectCovers(labels.PET_LABELS, PETS);
    expectCovers(labels.PET_EMOJI, PETS);
    expectCovers(labels.TOXICITY_LABELS, TOXICITY_LEVELS);
    expectCovers(labels.ALLERGEN_LABELS, ALLERGENS);
    expectCovers(labels.GOAL_LABELS, GARDEN_GOALS);
    expectCovers(labels.SPACE_LABELS, SPACE_SIZES);
  });

  it("covers unions that have no exported const array", () => {
    expectCovers(labels.DRAINAGE_LABELS, ["well-drained", "moist", "wet"]);
    expectCovers(labels.LIFE_CYCLE_LABELS, ["annual", "biennial", "perennial"]);
    expectCovers(labels.FEEDING_LABELS, ["light", "moderate", "heavy"]);
    expectCovers(labels.SETTING_LABELS, ["indoor", "outdoor"]);
    expectCovers(labels.BED_KIND_LABELS, [
      "raised-bed",
      "in-ground",
      "container",
      "windowsill",
      "shelf",
    ]);
    expectCovers(labels.PLANTING_STATUS_LABELS, ["planned", "growing", "harvested", "removed"]);
    const care = ["water", "fertilize", "prune", "harvest", "inspect-pests", "mulch", "repot", "custom"];
    expectCovers(labels.CARE_LABELS, care);
    expectCovers(labels.CARE_EMOJI, care);
    expectCovers(labels.CALENDAR_EVENT_LABELS, [
      "start-indoors",
      "transplant",
      "direct-sow",
      "fall-sow",
      "harvest",
    ]);
    expectCovers(labels.VERDICT_LABELS, ["great", "good", "possible", "not-recommended"]);
  });

  it("mentions hours in sun labels", () => {
    expect(labels.SUN_LABELS["full-sun"]).toBe("Full sun (6+ h)");
  });
});

describe("toOptions", () => {
  it("maps a record to value/label pairs", () => {
    expect(labels.toOptions({ a: "A", b: "B" })).toEqual([
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ]);
  });
  it("respects an explicit order/subset", () => {
    expect(labels.toOptions(labels.WATER_LABELS, ["high", "low"]).map((o) => o.value)).toEqual([
      "high",
      "low",
    ]);
  });
});
