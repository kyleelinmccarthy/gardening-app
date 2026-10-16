import { describe, expect, it } from "vitest";
import { makeAppData, makeBed, makeGarden, makePlant } from "@/test/fixtures";
import { createEmptyAppData, parseAppData } from "./schema";

describe("createEmptyAppData", () => {
  it("returns a version 1 empty document", () => {
    expect(createEmptyAppData()).toEqual({
      version: 1,
      gardens: [],
      activeGardenId: null,
      customPlants: [],
      settings: { temperatureUnit: "F" },
    });
  });

  it("returns a fresh object every time", () => {
    expect(createEmptyAppData()).not.toBe(createEmptyAppData());
  });

  it("is itself valid", () => {
    expect(parseAppData(createEmptyAppData()).ok).toBe(true);
  });
});

describe("parseAppData", () => {
  it("accepts a fully populated document and round-trips it", () => {
    const garden = makeGarden({
      beds: [makeBed({ placements: [{ plantId: "test-tomato", x: 0, y: 1 }] })],
      plantings: [
        { id: "p1", plantId: "test-tomato", bedId: "bed-1", quantity: 2, plantedOn: "2026-04-20", status: "growing", inContainer: false, notes: "n" },
      ],
      careLog: [{ id: "c1", plantingId: "p1", type: "water", date: "2026-04-21", note: "x" }],
      reminders: [{ id: "r1", title: "Feed", dueDate: "2026-05-01", repeatDays: 14, done: false, plantingId: "p1" }],
      journal: [{ id: "j1", date: "2026-04-22", title: "Day", text: "Sunny", plantingId: "p1" }],
    });
    const data = makeAppData([garden], { customPlants: [makePlant({ custom: true })] });
    const result = parseAppData(JSON.parse(JSON.stringify(data)));
    expect(result).toEqual({ ok: true, data });
  });

  it("rejects non-objects", () => {
    for (const input of [null, undefined, 42, "x", []]) {
      const r = parseAppData(input);
      expect(r.ok).toBe(false);
    }
  });

  it("rejects an unsupported version with a friendly message", () => {
    const r = parseAppData({ ...createEmptyAppData(), version: 2 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/version/i);
  });

  it("rejects invalid enum values and names the offending path", () => {
    const data = makeAppData();
    const bad = JSON.parse(JSON.stringify(data));
    bad.gardens[0].profile.sunExposure = "moonlight";
    const r = parseAppData(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain("gardens.0.profile.sunExposure");
    }
  });

  it("rejects missing required fields", () => {
    const r = parseAppData({ version: 1, gardens: [] });
    expect(r.ok).toBe(false);
  });

  it("rejects wrongly typed nested values", () => {
    const bad = JSON.parse(JSON.stringify(makeAppData([makeGarden({ beds: [makeBed()] })])));
    bad.gardens[0].beds[0].columns = "four";
    const r = parseAppData(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("gardens.0.beds.0.columns");
  });

  it("validates custom plants", () => {
    const bad = JSON.parse(JSON.stringify(makeAppData([], { customPlants: [makePlant()] })));
    bad.customPlants[0].category = "mineral";
    expect(parseAppData(bad).ok).toBe(false);
  });

  it("allows optional fields to be absent", () => {
    const garden = makeGarden({
      plantings: [{ id: "p", plantId: "x", quantity: 1, plantedOn: "2026-01-01", status: "planned", inContainer: false }],
    });
    expect(parseAppData(makeAppData([garden])).ok).toBe(true);
  });

  it("reports a bounded number of issues", () => {
    const r = parseAppData({ version: 1, gardens: [{}, {}, {}, {}, {}], activeGardenId: 1, customPlants: 3, settings: 2 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.split("\n").length).toBeLessThanOrEqual(7);
  });
});
