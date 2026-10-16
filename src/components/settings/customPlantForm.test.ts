import { describe, expect, it } from "vitest";
import { makePlant } from "@/test/fixtures";
import {
  emptyPlantForm,
  fromPlant,
  makeCustomPlantId,
  slugify,
  toPlant,
  validatePlantForm,
  type CustomPlantFormValues,
} from "./customPlantForm";
import { appDataSchema } from "@/storage/schema";
import { createEmptyAppData } from "@/storage/schema";

const valid = (changes: Partial<CustomPlantFormValues> = {}): CustomPlantFormValues => ({
  ...emptyPlantForm(),
  name: "Purple Basil",
  ...changes,
});

describe("slugify / makeCustomPlantId", () => {
  it("slugifies names, dropping accents and symbols", () => {
    expect(slugify("  Café Mint!! ")).toBe("cafe-mint");
    expect(slugify("Tomato 'Black Krim'")).toBe("tomato-black-krim");
  });

  it("builds custom-<slug>-<suffix> ids", () => {
    expect(makeCustomPlantId("Purple Basil", "ab12cd")).toBe("custom-purple-basil-ab12cd");
    expect(makeCustomPlantId("!!!", "x")).toBe("custom-plant-x");
  });

  it("generates different suffixes", () => {
    const ids = new Set(Array.from({ length: 20 }, () => makeCustomPlantId("Mint")));
    expect(ids.size).toBeGreaterThan(15);
    for (const id of ids) expect(id).toMatch(/^custom-mint-[a-z0-9]{6}$/);
  });
});

describe("emptyPlantForm", () => {
  it("is invalid only because the name is missing", () => {
    expect(Object.keys(validatePlantForm(emptyPlantForm()))).toEqual(["name"]);
    expect(validatePlantForm(valid())).toEqual({});
  });
});

describe("toPlant", () => {
  it("builds a custom plant that the app schema accepts", () => {
    const plant = toPlant(valid({ careTips: "Pinch flowers\n\n  Water at the base  " }), "custom-purple-basil-abc123");
    expect(plant).toMatchObject({
      id: "custom-purple-basil-abc123",
      name: "Purple Basil",
      custom: true,
      careTips: ["Pinch flowers", "Water at the base"],
      wateringIntervalDays: 3,
      hardinessZones: { min: 3, max: 10 },
      soil: { phMin: 6, phMax: 7 },
      temperature: { minF: 32, idealMinF: 60, idealMaxF: 80, maxF: 95 },
    });
    const result = appDataSchema.safeParse({ ...createEmptyAppData(), customPlants: [plant] });
    expect(result.success).toBe(true);
  });

  it("omits optional fields that are blank", () => {
    const plant = toPlant(valid(), "x");
    expect(plant.daysToMaturity).toBeUndefined();
    expect(plant.planting).toEqual({});
    expect(plant.indoorLight).toBeUndefined();
    expect(plant.harvestTips).toBeUndefined();
    expect(plant.toxicity).not.toHaveProperty("notes");
  });

  it("maps optional numbers, notes and indoor light", () => {
    const plant = toPlant(
      valid({
        environments: ["indoor", "outdoor"],
        indoorLight: ["medium"],
        daysMin: "50",
        daysMax: "70",
        startIndoorsWeeks: "-6",
        transplantWeeks: "2",
        directSowWeeks: "0",
        fallSowWeeks: "10",
        plantingNotes: " Harden off first ",
        harvestTips: " Cut often ",
        toxicityNotes: "Leaves upset stomachs",
        toxicity: { ...emptyPlantForm().toxicity, cat: "mild" },
        containerNotes: "Any pot",
      }),
      "x",
    );
    expect(plant.indoorLight).toEqual(["medium"]);
    expect(plant.daysToMaturity).toEqual({ min: 50, max: 70 });
    expect(plant.planting).toEqual({
      startIndoorsWeeks: -6,
      transplantWeeks: 2,
      directSowWeeks: 0,
      fallSowWeeksBeforeFirstFrost: 10,
      notes: "Harden off first",
    });
    expect(plant.harvestTips).toBe("Cut often");
    expect(plant.toxicity).toMatchObject({ cat: "mild", notes: "Leaves upset stomachs" });
    expect(plant.container).toEqual({ suitable: true, minGallons: 3, notes: "Any pot" });
  });

  it("drops indoor light when the plant is outdoor-only and gallons when not container-suitable", () => {
    const plant = toPlant(valid({ indoorLight: ["low"], containerSuitable: false }), "x");
    expect(plant.indoorLight).toBeUndefined();
    expect(plant.container).toEqual({ suitable: false });
  });

  it("falls back to a default emoji", () => {
    expect(toPlant(valid({ emoji: "  " }), "x").emoji).toBe("🌱");
  });
});

describe("fromPlant", () => {
  it("round-trips a full plant through the form", () => {
    const original = makePlant({
      id: "custom-x-1",
      custom: true,
      indoorLight: ["medium", "low"],
      environments: ["indoor", "outdoor"],
      daysToMaturity: { min: 60, max: 90 },
      planting: { startIndoorsWeeks: -8, transplantWeeks: 2, directSowWeeks: -2, fallSowWeeksBeforeFirstFrost: 10, notes: "n" },
      companions: ["basil"],
      antagonists: ["fennel"],
      companionNotes: "cn",
      attracts: ["honeybees"],
      pests: ["aphids"],
      repels: ["whiteflies"],
      toxicity: { cat: "mild", dog: "severe", horse: "non-toxic", bird: "moderate", rabbit: "non-toxic", human: "mild", notes: "tn" },
      allergens: ["pollen"],
      allergyNotes: "an",
      requiredTools: ["trellis"],
      helpfulTools: ["stakes"],
      goals: ["edible", "pollinators"],
      careTips: ["One", "Two"],
      harvestTips: "Pick ripe",
      container: { suitable: true, minGallons: 5, notes: "big pot" },
    });
    expect(toPlant(fromPlant(original), original.id)).toEqual(original);
  });

  it("represents missing optionals as empty strings", () => {
    const values = fromPlant(makePlant({ daysToMaturity: undefined, planting: {} }));
    expect(values.daysMin).toBe("");
    expect(values.startIndoorsWeeks).toBe("");
    expect(values.toxicityNotes).toBe("");
  });
});

describe("validatePlantForm", () => {
  it("requires a name and at least one environment", () => {
    expect(validatePlantForm(valid({ name: "  " })).name).toBeTruthy();
    expect(validatePlantForm(valid({ environments: [] })).environments).toBeTruthy();
  });

  it("requires a sun exposure for outdoor plants only", () => {
    expect(validatePlantForm(valid({ sun: [] })).sun).toBeTruthy();
    expect(validatePlantForm(valid({ sun: [], environments: ["indoor"] })).sun).toBeUndefined();
  });

  it("requires a positive whole-number watering interval", () => {
    expect(validatePlantForm(valid({ wateringIntervalDays: "" })).wateringIntervalDays).toBeTruthy();
    expect(validatePlantForm(valid({ wateringIntervalDays: "0" })).wateringIntervalDays).toBeTruthy();
    expect(validatePlantForm(valid({ wateringIntervalDays: "2.5" })).wateringIntervalDays).toBeTruthy();
    expect(validatePlantForm(valid({ wateringIntervalDays: "7" })).wateringIntervalDays).toBeUndefined();
  });

  it("requires temperatures in increasing order", () => {
    expect(validatePlantForm(valid({ minF: 70, idealMinF: 60 })).minF).toBeTruthy();
    expect(validatePlantForm(valid({ idealMaxF: 100 })).minF).toBeTruthy();
    expect(validatePlantForm(valid({ maxF: Number.NaN })).minF).toBeTruthy();
    expect(validatePlantForm(valid({ minF: 60, idealMinF: 60, idealMaxF: 60, maxF: 60 })).minF).toBeUndefined();
  });

  it("validates the hardiness zone range", () => {
    expect(validatePlantForm(valid({ zoneMin: "8", zoneMax: "4" })).zoneMax).toBeTruthy();
    expect(validatePlantForm(valid({ zoneMax: "14" })).zoneMax).toBeTruthy();
    expect(validatePlantForm(valid({ zoneMin: "0" })).zoneMin).toBeTruthy();
    expect(validatePlantForm(valid({ zoneMin: "" })).zoneMin).toBeTruthy();
  });

  it("validates the pH range and soil types", () => {
    expect(validatePlantForm(valid({ phMin: "7", phMax: "6" })).phMax).toBeTruthy();
    expect(validatePlantForm(valid({ phMax: "15" })).phMax).toBeTruthy();
    expect(validatePlantForm(valid({ soilTypes: [] })).soilTypes).toBeTruthy();
  });

  it("allows 0 days between feedings (no feeding) but not negatives", () => {
    expect(validatePlantForm(valid({ feedFrequencyDays: "0" })).feedFrequencyDays).toBeUndefined();
    expect(validatePlantForm(valid({ feedFrequencyDays: "-1" })).feedFrequencyDays).toBeTruthy();
  });

  it("validates spacing and height", () => {
    expect(validatePlantForm(valid({ spacingInches: "0" })).spacingInches).toBeTruthy();
    expect(validatePlantForm(valid({ heightMin: "40", heightMax: "10" })).heightMax).toBeTruthy();
  });

  it("requires both days-to-maturity values or neither", () => {
    expect(validatePlantForm(valid({ daysMin: "30" })).daysMax).toBeTruthy();
    expect(validatePlantForm(valid({ daysMin: "90", daysMax: "30" })).daysMax).toBeTruthy();
    expect(validatePlantForm(valid({ daysMin: "30", daysMax: "60" }))).toEqual({});
  });

  it("requires whole-number planting weeks (negatives allowed)", () => {
    expect(validatePlantForm(valid({ startIndoorsWeeks: "-6" }))).toEqual({});
    expect(validatePlantForm(valid({ transplantWeeks: "1.5" })).transplantWeeks).toBeTruthy();
  });

  it("rejects overlapping companion/antagonist and required/helpful lists", () => {
    expect(validatePlantForm(valid({ companions: ["a"], antagonists: ["a"] })).antagonists).toBeTruthy();
    expect(validatePlantForm(valid({ requiredTools: ["trellis"], helpfulTools: ["trellis"] })).helpfulTools).toBeTruthy();
  });
});
