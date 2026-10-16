import { TOOLS } from "@/data/tools";
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

  it("covers tool categories, cost tiers and insect roles", () => {
    expectCovers(labels.TOOL_CATEGORY_LABELS, ["hand-tool", "watering", "structure", "indoor", "protection", "soil"]);
    expectCovers(labels.COST_LABELS, ["$", "$$", "$$$"]);
    expectCovers(labels.INSECT_ROLE_LABELS, ["pest", "animal-pest", "beneficial", "pollinator"]);
  });

  it("has a label for every tool category and cost tier used by the tool data", () => {
    for (const tool of TOOLS) {
      expect(labels.TOOL_CATEGORY_LABELS[tool.category]).toBeTruthy();
      expect(labels.COST_LABELS[tool.costTier]).toBeTruthy();
    }
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

describe("shortLabel", () => {
  it("drops a trailing parenthetical hint", () => {
    expect(labels.shortLabel(labels.SUN_LABELS["full-sun"])).toBe("Full sun");
    expect(labels.shortLabel(labels.SUN_LABELS["partial-shade"])).toBe("Partial shade");
  });
  it("leaves labels without a hint unchanged", () => {
    expect(labels.shortLabel("Direct sun")).toBe("Direct sun");
  });
  it("shortens every sun label to a non-empty hint-free string", () => {
    for (const label of Object.values(labels.SUN_LABELS)) {
      const short = labels.shortLabel(label);
      expect(short).not.toBe("");
      expect(short).not.toContain("(");
    }
  });
});
