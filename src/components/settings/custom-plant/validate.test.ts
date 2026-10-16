import { describe, expect, it } from "vitest";
import { emptyPlantForm, type CustomPlantFormValues } from "./model";
import { validatePlantForm } from "./validate";

const valid = (changes: Partial<CustomPlantFormValues> = {}): CustomPlantFormValues => ({
  ...emptyPlantForm(),
  name: "Purple Basil",
  ...changes,
});

describe("emptyPlantForm", () => {
  it("is invalid only because the name is missing", () => {
    expect(Object.keys(validatePlantForm(emptyPlantForm()))).toEqual(["name"]);
    expect(validatePlantForm(valid())).toEqual({});
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
    expect(validatePlantForm(valid({ maxF: null })).minF).toMatch(/Enter all four temperatures/);
    expect(validatePlantForm(valid({ minF: null, idealMinF: null })).minF).toMatch(/Enter all four temperatures/);
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

  it("accepts negative fall-sow weeks (after first frost, e.g. tulips) but not fractions", () => {
    expect(validatePlantForm(valid({ fallSowWeeks: "-2" }))).toEqual({});
    expect(validatePlantForm(valid({ fallSowWeeks: "-1.5" })).fallSowWeeks).toBeTruthy();
  });

  it("rejects overlapping companion/antagonist and required/helpful lists", () => {
    expect(validatePlantForm(valid({ companions: ["a"], antagonists: ["a"] })).antagonists).toBeTruthy();
    expect(validatePlantForm(valid({ requiredTools: ["trellis"], helpfulTools: ["trellis"] })).helpfulTools).toBeTruthy();
  });
});
