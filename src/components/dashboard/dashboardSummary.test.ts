import { describe, expect, it } from "vitest";
import { createPlantCatalog } from "@/domain/catalog";
import { createDefaultProfile } from "@/domain/defaults";
import type { Planting } from "@/domain/types";
import { makeBed, makeGarden, makePlant } from "@/test/fixtures";
import {
  activePlants,
  careContextFor,
  completionActions,
  findBedConflicts,
  findSafetyAlerts,
  summarizeGarden,
  upcomingPlantingEvents,
} from "./dashboardSummary";

const tomato = makePlant({ id: "tomato", name: "Tomato", companions: ["basil"], antagonists: ["fennel"] });
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

describe("careContextFor", () => {
  it("uses indoor humidity for indoor gardens and climate humidity outdoors", () => {
    const outdoor = createDefaultProfile();
    outdoor.climate.humidity = "high";
    outdoor.indoor.humidity = "low";
    expect(careContextFor(outdoor)).toEqual({ setting: "outdoor", summerHighF: 85, humidity: "high" });
    expect(careContextFor({ ...outdoor, setting: "indoor" }).humidity).toBe("low");
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
  const profile = createDefaultProfile({ pets: ["cat"], allergies: ["pollen"] });

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

describe("completionActions", () => {
  it("logs planting tasks", () => {
    const task = { id: "water:p1", type: "water" as const, plantingId: "p1", title: "Water", detail: "", dueDate: "2026-05-01", overdueDays: 1 };
    expect(completionActions("g1", task, "2026-05-02", "care-1")).toEqual([
      { type: "care/log", gardenId: "g1", entry: { id: "care-1", plantingId: "p1", type: "water", date: "2026-05-02" } },
    ]);
  });

  it("completes one-off reminders and reschedules repeating ones", () => {
    const base = { type: "custom" as const, title: "T", detail: "", dueDate: "2026-05-01", overdueDays: 0, reminderId: "r1" };
    expect(completionActions("g1", { ...base, id: "reminder:r1" }, "2026-05-01", "x")).toEqual([
      { type: "reminder/update", gardenId: "g1", reminderId: "r1", changes: { done: true } },
    ]);
    expect(completionActions("g1", { ...base, id: "reminder:r1", repeatDays: 7 }, "2026-05-01", "x")).toEqual([
      { type: "reminder/update", gardenId: "g1", reminderId: "r1", changes: { dueDate: "2026-05-08" } },
    ]);
  });
});
