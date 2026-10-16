import { describe, expect, it } from "vitest";
import { makeBed, makeGarden, makePlant, makeProfile } from "@/test/fixtures";
import { createPlantCatalog } from "./catalog";
import {
  activePlants,
  findBedConflicts,
  findSafetyAlerts,
  summarizeGarden,
  upcomingPlantingEvents,
} from "./gardenSummary";
import type { Planting } from "./types";

const mildToxicity = { cat: "mild", dog: "mild", horse: "mild", bird: "mild", rabbit: "mild", human: "non-toxic" } as const;
const tomato = makePlant({
  id: "tomato",
  name: "Tomato",
  companions: ["basil"],
  antagonists: ["fennel"],
  planting: { transplantWeeks: 2 },
  toxicity: mildToxicity,
});
const basil = makePlant({ id: "basil", name: "Basil", companions: ["tomato"], toxicity: { ...tomato.toxicity, cat: "non-toxic", dog: "non-toxic", horse: "non-toxic", bird: "non-toxic", rabbit: "non-toxic", human: "non-toxic" } });
const fennel = makePlant({ id: "fennel", name: "Fennel", antagonists: ["tomato"] });
const lily = makePlant({
  id: "lily",
  name: "Lily",
  allergens: ["pollen"],
  planting: {},
  toxicity: { cat: "severe", dog: "mild", horse: "non-toxic", bird: "non-toxic", rabbit: "non-toxic", human: "non-toxic" },
});
const catalog = createPlantCatalog([tomato, basil, fennel, lily]);

const planting = (id: string, plantId: string, status: Planting["status"], extra: Partial<Planting> = {}): Planting => ({
  id,
  plantId,
  quantity: 1,
  plantedOn: "2026-04-01",
  status,
  inContainer: false,
  ...extra,
});

describe("activePlants", () => {
  it("lists distinct planned/growing plants known to the catalog", () => {
    const garden = makeGarden({
      plantings: [
        planting("1", "tomato", "growing"),
        planting("2", "tomato", "planned"),
        planting("3", "basil", "harvested"),
        planting("4", "ghost", "growing"),
        planting("5", "fennel", "removed"),
      ],
    });
    expect(activePlants(garden, catalog).map((p) => p.id)).toEqual(["tomato"]);
  });
});

describe("upcomingPlantingEvents", () => {
  const garden = makeGarden({ plantings: [planting("1", "tomato", "planned")] }); // last frost 04-15, transplant +2w

  it("includes windows that start within the horizon", () => {
    const events = upcomingPlantingEvents(garden, catalog, "2026-04-20");
    expect(events.map((e) => [e.plantId, e.type, e.start])).toContainEqual(["tomato", "transplant", "2026-04-29"]);
  });

  it("looks into next year when the season has passed", () => {
    const events = upcomingPlantingEvents(garden, catalog, "2026-12-28", 140);
    expect(events.some((e) => e.start.startsWith("2027"))).toBe(true);
  });

  it("includes windows that began last year and run into this one", () => {
    // Fall sow at the first frost (Dec 20) runs Dec 20 - Jan 2, built from the previous year's calendar.
    const fallSower = makePlant({ id: "kale", name: "Kale", planting: { fallSowWeeksBeforeFirstFrost: 0 } });
    const climate = { ...makeProfile().climate, firstFrost: "12-20" };
    const wintry = makeGarden({
      profile: makeProfile({ climate }),
      plantings: [planting("1", "kale", "planned")],
    });
    const events = upcomingPlantingEvents(wintry, createPlantCatalog([fallSower]), "2026-01-02", 14);
    expect(events.map((e) => [e.plantId, e.type, e.start, e.end])).toContainEqual(["kale", "fall-sow", "2025-12-20", "2026-01-02"]);
  });

  it("is empty with no active plantings or far from any window", () => {
    expect(upcomingPlantingEvents(makeGarden(), catalog, "2026-04-20")).toEqual([]);
    expect(upcomingPlantingEvents(garden, catalog, "2026-01-05")).toEqual([]);
  });
});

describe("findBedConflicts", () => {
  it("reports antagonist neighbours by bed and plant name", () => {
    const bed = makeBed({
      id: "b1",
      name: "North bed",
      placements: [
        { plantId: "tomato", x: 0, y: 0 },
        { plantId: "fennel", x: 1, y: 0 },
        { plantId: "basil", x: 0, y: 1 },
      ],
    });
    expect(findBedConflicts(makeGarden({ beds: [bed] }), catalog)).toEqual([
      { bedId: "b1", bedName: "North bed", plantA: "Fennel", plantB: "Tomato" },
    ]);
  });

  it("is empty when beds have no conflicts", () => {
    expect(findBedConflicts(makeGarden({ beds: [makeBed()] }), catalog)).toEqual([]);
  });
});

describe("findSafetyAlerts", () => {
  const profile = makeProfile({ pets: ["cat"], allergies: ["pollen"] });

  it("flags active plants that are toxic to pets or trigger allergies, severe first", () => {
    const garden = makeGarden({
      profile,
      plantings: [planting("1", "tomato", "growing"), planting("2", "lily", "planned"), planting("3", "basil", "growing")],
    });
    const alerts = findSafetyAlerts(garden, catalog);
    expect(alerts.map((a) => a.plant.id)).toEqual(["lily", "tomato"]);
    expect(alerts[0].severe).toBe(true);
    expect(alerts[0].issues.map((i) => i.topic)).toEqual(["pets", "allergy"]);
    expect(alerts[1].severe).toBe(false);
  });

  it("ignores harvested plantings and households without risks", () => {
    const garden = makeGarden({ profile, plantings: [planting("1", "lily", "harvested")] });
    expect(findSafetyAlerts(garden, catalog)).toEqual([]);
    const safe = makeGarden({ plantings: [planting("1", "basil", "growing")] });
    expect(findSafetyAlerts(safe, catalog)).toEqual([]);
  });
});

describe("summarizeGarden", () => {
  it("counts plantings and collects due tasks", () => {
    const garden = makeGarden({
      plantings: [planting("1", "tomato", "growing"), planting("2", "basil", "planned"), planting("3", "basil", "planned")],
      reminders: [{ id: "r1", title: "Buy seeds", dueDate: "2026-05-01", done: false }],
    });
    const s = summarizeGarden(garden, catalog, "2026-05-10");
    expect(s.growingCount).toBe(1);
    expect(s.plannedCount).toBe(2);
    expect(s.tasksDue.some((t) => t.title === "Buy seeds")).toBe(true);
    expect(s.tasksDue.every((t) => t.dueDate <= "2026-05-10")).toBe(true);
  });
});
