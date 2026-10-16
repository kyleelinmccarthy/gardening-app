import { describe, expect, it } from "vitest";
import { ZONES } from "@/data/zones";
import { climateFromZone } from "@/domain/climate";
import { createDefaultProfile } from "@/domain/defaults";
import {
  SETUP_STEPS,
  firstInvalidStep,
  initialSetupState,
  isSetupDirty,
  isValidMonthDay,
  setupReducer,
  stateFromProfile,
  toProfile,
  validateStep,
} from "./setupForm";

describe("stateFromProfile / toProfile", () => {
  it("round-trips a profile", () => {
    const profile = createDefaultProfile({
      pets: ["cat"],
      allergies: ["pollen"],
      hasChildren: true,
      tools: ["pruners"],
      interests: ["herb"],
    });
    expect(toProfile(stateFromProfile("Yard", profile))).toEqual(profile);
  });

  it("detects frost-free climates and writes null frost dates back", () => {
    const profile = createDefaultProfile();
    profile.climate = { ...profile.climate, hardinessZone: 11, lastFrost: null, firstFrost: null };
    const state = stateFromProfile("Tropics", profile);
    expect(state.frostFree).toBe(true);
    const out = toProfile(state);
    expect(out.climate.lastFrost).toBeNull();
    expect(out.climate.firstFrost).toBeNull();
  });

  it("forces containersOnly for indoor gardens and omits an empty zip", () => {
    const state = { ...initialSetupState(), setting: "indoor" as const, containersOnly: false, zip: "  " };
    const profile = toProfile(state);
    expect(profile.containersOnly).toBe(true);
    expect(profile.climate).not.toHaveProperty("zip");
  });

  it("keeps a trimmed zip", () => {
    expect(toProfile({ ...initialSetupState(), zip: " 02134 " }).climate.zip).toBe("02134");
  });
});

describe("setupReducer", () => {
  it("patch merges fields", () => {
    const next = setupReducer(initialSetupState(), { type: "patch", changes: { name: "Patio", pets: ["dog"] } });
    expect(next.name).toBe("Patio");
    expect(next.pets).toEqual(["dog"]);
  });

  it("setZone refills frost dates, winter low and summer high from the zone", () => {
    const next = setupReducer(initialSetupState(), { type: "setZone", zone: 5 });
    const zone5 = ZONES.find((z) => z.zone === 5)!;
    expect(next.zone).toBe(5);
    expect(next.lastFrost).toBe(zone5.lastFrost);
    expect(next.firstFrost).toBe(zone5.firstFrost);
    expect(next.winterLowF).toBe(zone5.minTempF);
    expect(next.summerHighF).toBe(climateFromZone(5, ZONES).summerHighF);
    expect(next.frostFree).toBe(false);
  });

  it("setZone to a frost-free zone ticks frostFree", () => {
    const next = setupReducer(initialSetupState(), { type: "setZone", zone: 11 });
    expect(next.frostFree).toBe(true);
    expect(toProfile(next).climate.lastFrost).toBeNull();
  });

  it("setZone keeps the user's humidity and clamps out-of-range zones", () => {
    const start = { ...initialSetupState(), humidity: "high" as const };
    expect(setupReducer(start, { type: "setZone", zone: 99 }).zone).toBe(13);
    expect(setupReducer(start, { type: "setZone", zone: 0 }).zone).toBe(1);
    expect(setupReducer(start, { type: "setZone", zone: 6 }).humidity).toBe("high");
  });

  it("setFrostFree toggles without losing the typed dates", () => {
    const start = { ...initialSetupState(), lastFrost: "03-01" };
    const on = setupReducer(start, { type: "setFrostFree", frostFree: true });
    const off = setupReducer(on, { type: "setFrostFree", frostFree: false });
    expect(off.lastFrost).toBe("03-01");
    expect(off.frostFree).toBe(false);
  });

  it("reset replaces the whole state", () => {
    const fresh = initialSetupState();
    expect(setupReducer({ ...fresh, name: "x" }, { type: "reset", state: fresh })).toBe(fresh);
  });
});

describe("isValidMonthDay", () => {
  it.each(["04-15", "02-29", "12-31"])("accepts %s", (v) => expect(isValidMonthDay(v)).toBe(true));
  it.each(["", "4-15", "13-01", "02-30", "00-10", "04-00", "04/15"])("rejects %j", (v) =>
    expect(isValidMonthDay(v)).toBe(false),
  );
});

describe("validateStep", () => {
  const valid = { ...initialSetupState(), name: "My garden" };

  it("requires a garden name on the basics step", () => {
    expect(validateStep("basics", initialSetupState()).name).toBeTruthy();
    expect(validateStep("basics", { ...valid, name: "   " }).name).toBeTruthy();
    expect(validateStep("basics", valid)).toEqual({});
  });

  it("checks zone range and frost dates on the climate step", () => {
    expect(validateStep("climate", valid)).toEqual({});
    expect(validateStep("climate", { ...valid, zone: 14 }).zone).toBeTruthy();
    expect(validateStep("climate", { ...valid, lastFrost: "02-31" }).lastFrost).toBeTruthy();
    expect(validateStep("climate", { ...valid, firstFrost: "" }).firstFrost).toBeTruthy();
  });

  it("ignores frost dates when frost-free", () => {
    expect(validateStep("climate", { ...valid, frostFree: true, lastFrost: "bad", firstFrost: "bad" })).toEqual({});
  });

  it("requires winter low below summer high", () => {
    expect(validateStep("climate", { ...valid, winterLowF: 90, summerHighF: 80 }).winterLowF).toBeTruthy();
    expect(validateStep("climate", { ...valid, summerHighF: Number.NaN }).summerHighF).toBeTruthy();
  });

  it("blocks the climate step while a temperature field is empty (null)", () => {
    expect(validateStep("climate", { ...valid, summerHighF: null }).summerHighF).toBe("Enter a summer high temperature.");
    expect(validateStep("climate", { ...valid, winterLowF: null }).winterLowF).toBe("Enter a winter low temperature.");
    expect(validateStep("climate", { ...valid, summerHighF: null, winterLowF: null })).toEqual({
      summerHighF: "Enter a summer high temperature.",
      winterLowF: "Enter a winter low temperature.",
    });
    expect(firstInvalidStep({ ...valid, winterLowF: null })).toBe("climate");
  });

  it("checks indoor temperature only for indoor gardens", () => {
    expect(validateStep("climate", { ...valid, indoorTempF: null })).toEqual({});
    expect(validateStep("climate", { ...valid, indoorTempF: Number.NaN })).toEqual({});
    expect(validateStep("climate", { ...valid, setting: "indoor", indoorTempF: null }).indoorTempF).toBe(
      "Enter your average indoor temperature.",
    );
    expect(validateStep("climate", { ...valid, setting: "indoor", indoorTempF: Number.NaN }).indoorTempF).toBeTruthy();
  });

  it("bounds weekly hours on the grow step", () => {
    expect(validateStep("grow", { ...valid, weeklyHours: -1 }).weeklyHours).toBeTruthy();
    expect(validateStep("grow", { ...valid, weeklyHours: 200 }).weeklyHours).toBeTruthy();
    expect(validateStep("grow", { ...valid, weeklyHours: 0 })).toEqual({});
  });

  it("has no blocking rules for optional steps", () => {
    for (const id of ["space", "tools", "safety", "review"] as const) expect(validateStep(id, valid)).toEqual({});
  });
});

describe("firstInvalidStep", () => {
  it("returns the earliest failing step, or null", () => {
    expect(firstInvalidStep(initialSetupState())).toBe("basics");
    expect(firstInvalidStep({ ...initialSetupState(), name: "x", weeklyHours: -2 })).toBe("grow");
    expect(firstInvalidStep({ ...initialSetupState(), name: "x" })).toBeNull();
  });

  it("steps end with review", () => {
    expect(SETUP_STEPS.at(-1)?.id).toBe("review");
  });
});

describe("isSetupDirty", () => {
  it("is false for identical state and true once anything changes", () => {
    const initial = initialSetupState();
    expect(isSetupDirty(initial, initialSetupState())).toBe(false);
    expect(isSetupDirty(initial, { ...initial, name: "x" })).toBe(true);
    expect(isSetupDirty(initial, { ...initial, pets: ["cat"] })).toBe(true);
  });

  it("treats a reverted edit as clean", () => {
    const initial = initialSetupState();
    const edited = setupReducer(initial, { type: "patch", changes: { name: "x" } });
    expect(isSetupDirty(initial, setupReducer(edited, { type: "patch", changes: { name: "" } }))).toBe(false);
  });
});
