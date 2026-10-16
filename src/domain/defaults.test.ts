import { describe, expect, it } from "vitest";
import { ZONES } from "@/data/zones";
import { climateFromZone } from "./climate";
import { createBed, createDefaultProfile, createGarden } from "./defaults";

describe("createDefaultProfile", () => {
  it("returns sensible beginner outdoor defaults", () => {
    const p = createDefaultProfile();
    expect(p.setting).toBe("outdoor");
    expect(p.climate).toEqual({
      hardinessZone: 7,
      lastFrost: "04-15",
      firstFrost: "10-25",
      summerHighF: 88,
      winterLowF: 0,
      humidity: "average",
    });
    expect(p.indoor).toEqual({ light: "bright-indirect", averageTempF: 70, humidity: "average" });
    expect(p.sunExposure).toBe("full-sun");
    expect(p.soilType).toBe("loam");
    expect(p.space).toBe("medium");
    expect(p.containersOnly).toBe(false);
    expect(p.tools).toEqual(["hand-trowel", "watering-can", "garden-gloves"]);
    expect(p.interests).toEqual([]);
    expect(p.goals).toEqual(["edible"]);
    expect(p.experience).toBe("beginner");
    expect(p.pets).toEqual([]);
    expect(p.allergies).toEqual([]);
    expect(p.hasChildren).toBe(false);
    expect(p.weeklyHours).toBe(3);
  });

  it("derives its climate from the zone data, so it matches what the setup wizard picks for zone 7", () => {
    expect(createDefaultProfile().climate).toEqual(climateFromZone(7, ZONES));
  });

  it("applies shallow overrides", () => {
    const p = createDefaultProfile({ setting: "indoor", weeklyHours: 10 });
    expect(p.setting).toBe("indoor");
    expect(p.weeklyHours).toBe(10);
    expect(p.soilType).toBe("loam");
  });

  it("returns fresh arrays each call (no shared mutable state)", () => {
    const a = createDefaultProfile();
    const b = createDefaultProfile();
    a.tools.push("hoe");
    a.climate.zip = "12345";
    expect(b.tools).toEqual(["hand-trowel", "watering-can", "garden-gloves"]);
    expect(b.climate.zip).toBeUndefined();
  });
});

describe("createGarden", () => {
  it("creates an empty garden with given name and profile", () => {
    const profile = createDefaultProfile();
    const g = createGarden("My Garden", profile, "g1", new Date("2026-03-04T05:06:07.000Z"));
    expect(g).toEqual({
      id: "g1",
      name: "My Garden",
      createdAt: "2026-03-04T05:06:07.000Z",
      profile,
      beds: [],
      plantings: [],
      careLog: [],
      reminders: [],
      journal: [],
    });
  });

  it("generates an id and timestamp by default", () => {
    const g = createGarden("A", createDefaultProfile());
    expect(g.id).toMatch(/^garden-/);
    expect(Number.isNaN(Date.parse(g.createdAt))).toBe(false);
  });
});

describe("createBed", () => {
  it("defaults cell size to 12 inches and has no placements", () => {
    const b = createBed({ name: "Herbs", kind: "raised-bed", columns: 4, rows: 2, sun: "full-sun" }, "b1");
    expect(b).toEqual({
      id: "b1",
      name: "Herbs",
      kind: "raised-bed",
      columns: 4,
      rows: 2,
      cellSizeInches: 12,
      sun: "full-sun",
      placements: [],
    });
  });

  it("respects a custom cell size and generates ids", () => {
    const b = createBed({ name: "Pot", kind: "container", columns: 1, rows: 1, sun: "partial-sun", cellSizeInches: 18 });
    expect(b.cellSizeInches).toBe(18);
    expect(b.id).toMatch(/^bed-/);
  });
});
