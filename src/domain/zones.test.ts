import { describe, expect, it } from "vitest";
import { needsWinterHardiness, zoneSupports } from "./zones";
import { makePlant } from "@/test/fixtures";

describe("zoneSupports", () => {
  const hardiness = { min: 5, max: 9 };

  it("is true for any zone for annuals and biennials", () => {
    for (const lifeCycle of ["annual", "biennial"] as const) {
      const plant = makePlant({ lifeCycle, hardinessZones: hardiness });
      for (const zone of [1, 2, 5, 12, 13]) expect(zoneSupports(plant, zone)).toBe(true);
    }
  });

  it("checks the hardiness range inclusively for perennials", () => {
    const plant = makePlant({ lifeCycle: "perennial", hardinessZones: hardiness });
    expect(zoneSupports(plant, 4)).toBe(false);
    expect(zoneSupports(plant, 5)).toBe(true);
    expect(zoneSupports(plant, 9)).toBe(true);
    expect(zoneSupports(plant, 10)).toBe(false);
  });
});

describe("needsWinterHardiness", () => {
  it("applies to perennials only", () => {
    expect(needsWinterHardiness({ lifeCycle: "perennial" })).toBe(true);
    expect(needsWinterHardiness({ lifeCycle: "biennial" })).toBe(false);
    expect(needsWinterHardiness({ lifeCycle: "annual" })).toBe(false);
  });
});
