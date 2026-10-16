import { describe, expect, it } from "vitest";
import { careContextFor, completeTask, fertilizeIntervalDays, getCareTasks, lastLogDate, wateringIntervalDays } from "./care";
import { createPlantCatalog } from "./catalog";
import { makeBed, makeGarden, makePlant, makePlanting, makeProfile } from "@/test/fixtures";
import type { CareLogEntry, CareTask, Plant } from "./types";

const outdoor = { setting: "outdoor" as const, inContainer: false };

describe("wateringIntervalDays", () => {
  const plant = makePlant({ wateringIntervalDays: 4 });

  it("returns the baseline for an in-ground outdoor plant in mild weather", () => {
    expect(wateringIntervalDays(plant, { ...outdoor, month: 4 })).toBe(4);
  });

  it("waters containers more often", () => {
    const inGround = wateringIntervalDays(plant, outdoor);
    const potted = wateringIntervalDays(plant, { setting: "outdoor", inContainer: true });
    expect(potted).toBeLessThan(inGround);
    expect(potted).toBe(2); // round(4 * 0.6)
  });

  it("waters more often in a hot summer outdoors", () => {
    expect(wateringIntervalDays(plant, { ...outdoor, summerHighF: 95, month: 7 })).toBe(3); // round(2.8)
  });

  it("does not apply the heat factor outside summer months or below 90F", () => {
    expect(wateringIntervalDays(plant, { ...outdoor, summerHighF: 95, month: 4 })).toBe(4);
    expect(wateringIntervalDays(plant, { ...outdoor, summerHighF: 85, month: 7 })).toBe(4);
  });

  it("does not apply the heat factor indoors", () => {
    expect(wateringIntervalDays(plant, { setting: "indoor", inContainer: false, summerHighF: 100, month: 7 })).toBe(4);
  });

  it("adjusts for humidity", () => {
    const base = makePlant({ wateringIntervalDays: 10 });
    expect(wateringIntervalDays(base, { ...outdoor, humidity: "low" })).toBe(9); // 8.5 -> 9
    expect(wateringIntervalDays(base, { ...outdoor, humidity: "high" })).toBe(12); // 11.5 -> 12
    expect(wateringIntervalDays(base, { ...outdoor, humidity: "average" })).toBe(10);
  });

  it("waters indoor plants less often in winter", () => {
    const indoor = { setting: "indoor" as const, inContainer: true };
    const summer = wateringIntervalDays(makePlant({ wateringIntervalDays: 10 }), { ...indoor, month: 7 });
    for (const month of [11, 12, 1, 2]) {
      expect(wateringIntervalDays(makePlant({ wateringIntervalDays: 10 }), { ...indoor, month })).toBeGreaterThan(summer);
    }
    expect(wateringIntervalDays(makePlant({ wateringIntervalDays: 10 }), { ...indoor, month: 3 })).toBe(summer);
  });

  it("does not apply the winter slowdown outdoors", () => {
    expect(wateringIntervalDays(plant, { ...outdoor, month: 12 })).toBe(4);
  });

  it("never returns less than one day", () => {
    const thirsty = makePlant({ wateringIntervalDays: 1 });
    expect(wateringIntervalDays(thirsty, { setting: "outdoor", inContainer: true, humidity: "low", summerHighF: 100, month: 7 })).toBe(1);
  });
});

describe("fertilizeIntervalDays", () => {
  it("returns the plant's frequency", () => {
    expect(fertilizeIntervalDays(makePlant(), { setting: "outdoor", month: 6 })).toBe(14);
  });

  it("returns null for plants that should not be fed", () => {
    const p = makePlant({ fertilizer: { ...makePlant().fertilizer, frequencyDays: 0 } });
    expect(fertilizeIntervalDays(p, { setting: "outdoor" })).toBeNull();
  });

  it("pauses feeding for indoor houseplants and succulents in winter", () => {
    for (const category of ["houseplant", "succulent"] as const) {
      const p = makePlant({ category });
      expect(fertilizeIntervalDays(p, { setting: "indoor", month: 12 })).toBeNull();
      expect(fertilizeIntervalDays(p, { setting: "indoor", month: 3 })).toBe(14);
      expect(fertilizeIntervalDays(p, { setting: "indoor", month: 5 })).toBe(14);
    }
  });

  it("keeps feeding other indoor categories in winter, and outdoor houseplants", () => {
    expect(fertilizeIntervalDays(makePlant({ category: "herb" }), { setting: "indoor", month: 12 })).toBe(14);
    expect(fertilizeIntervalDays(makePlant({ category: "houseplant" }), { setting: "outdoor", month: 12 })).toBe(14);
  });
});

describe("getCareTasks", () => {
  const ctx = { setting: "outdoor" as const, summerHighF: 80, humidity: "average" as const };
  const tomato = makePlant({
    id: "tomato",
    name: "Tomato",
    wateringIntervalDays: 3,
    waterNotes: "Water at the base.",
    fertilizer: { feeding: "heavy", recommended: ["tomato-feed"], frequencyDays: 14, notes: "Use tomato feed." },
    pests: ["aphids", "tomato-hornworm", "whiteflies", "spider-mites"],
    daysToMaturity: { min: 60, max: 80 },
  });
  const catalog = (...plants: Plant[]) => createPlantCatalog(plants);
  const bed = makeBed({ id: "bed-1", name: "Raised Bed 1" });
  const planting = makePlanting({ id: "p1", plantId: "tomato", bedId: "bed-1", plantedOn: "2025-05-01" });
  const garden = (overrides = {}) => makeGarden({ beds: [bed], plantings: [planting], ...overrides });
  const byId = (tasks: CareTask[], id: string) => tasks.find((t) => t.id === id);

  it("schedules watering from the planting date", () => {
    const tasks = getCareTasks(garden(), catalog(tomato), "2025-05-04", ctx);
    const water = byId(tasks, "water:p1")!;
    expect(water.dueDate).toBe("2025-05-04");
    expect(water.type).toBe("water");
    expect(water.plantingId).toBe("p1");
    expect(water.title).toBe("Water Tomato (bed: Raised Bed 1)");
    expect(water.detail).toContain("Water at the base.");
    expect(water.overdueDays).toBe(0);
  });

  it("does not list tasks that are not yet due", () => {
    const tasks = getCareTasks(garden(), catalog(tomato), "2025-05-03", ctx);
    expect(byId(tasks, "water:p1")).toBeUndefined();
  });

  it("reports overdue days", () => {
    const tasks = getCareTasks(garden(), catalog(tomato), "2025-05-10", ctx);
    expect(byId(tasks, "water:p1")!.overdueDays).toBe(6);
  });

  it("measures from the most recent matching care log", () => {
    const g = garden({
      careLog: [
        { id: "l1", plantingId: "p1", type: "water", date: "2025-05-05" },
        { id: "l2", plantingId: "p1", type: "water", date: "2025-05-08" },
        { id: "l3", plantingId: "other", type: "water", date: "2025-05-09" },
        { id: "l4", plantingId: "p1", type: "fertilize", date: "2025-05-09" },
      ],
    });
    const tasks = getCareTasks(g, catalog(tomato), "2025-05-12", ctx, 14);
    expect(byId(tasks, "water:p1")!.dueDate).toBe("2025-05-11");
    expect(byId(tasks, "fertilize:p1")!.dueDate).toBe("2025-05-23");
  });

  it("includes upcoming tasks within the horizon", () => {
    const tasks = getCareTasks(garden(), catalog(tomato), "2025-05-01", ctx, 3);
    expect(byId(tasks, "water:p1")).toBeDefined();
    expect(byId(tasks, "inspect-pests:p1")).toBeUndefined(); // due May 8
    const wider = getCareTasks(garden(), catalog(tomato), "2025-05-01", ctx, 7);
    expect(byId(wider, "inspect-pests:p1")).toBeDefined();
  });

  it("waters container plantings more often", () => {
    const potted = makePlanting({ id: "p2", plantId: "tomato", inContainer: true, plantedOn: "2025-05-01" });
    const g = garden({ plantings: [potted] });
    const tasks = getCareTasks(g, catalog(tomato), "2025-05-10", ctx);
    expect(byId(tasks, "water:p2")!.dueDate).toBe("2025-05-03"); // round(3 * 0.6) = 2
  });

  it("schedules fertilizing with fertilizer notes, and skips plants that are not fed", () => {
    const tasks = getCareTasks(garden(), catalog(tomato), "2025-05-15", ctx);
    const feed = byId(tasks, "fertilize:p1")!;
    expect(feed.dueDate).toBe("2025-05-15");
    expect(feed.detail).toContain("Use tomato feed.");
    expect(feed.title).toBe("Fertilize Tomato (bed: Raised Bed 1)");

    const noFeed = makePlant({ ...tomato, fertilizer: { ...tomato.fertilizer, frequencyDays: 0 } });
    expect(byId(getCareTasks(garden(), catalog(noFeed), "2025-06-15", ctx), "fertilize:p1")).toBeUndefined();
  });

  it("adds a weekly pest inspection naming the top pests", () => {
    const tasks = getCareTasks(garden(), catalog(tomato), "2025-05-08", ctx);
    const inspect = byId(tasks, "inspect-pests:p1")!;
    expect(inspect.dueDate).toBe("2025-05-08");
    expect(inspect.detail).toMatch(/aphids/i);
    expect(inspect.detail).toMatch(/tomato hornworm/i);
    expect(inspect.detail).not.toMatch(/spider/i); // only the top three
  });

  it("restarts the pest inspection interval from the last inspection", () => {
    const g = garden({ careLog: [{ id: "l1", plantingId: "p1", type: "inspect-pests", date: "2025-05-09" }] });
    expect(byId(getCareTasks(g, catalog(tomato), "2025-05-12", ctx), "inspect-pests:p1")).toBeUndefined();
    expect(byId(getCareTasks(g, catalog(tomato), "2025-05-16", ctx), "inspect-pests:p1")!.dueDate).toBe("2025-05-16");
  });

  it("creates a harvest task once the minimum days to maturity have passed", () => {
    expect(byId(getCareTasks(garden(), catalog(tomato), "2025-06-29", ctx), "harvest:p1")).toBeUndefined();
    const task = byId(getCareTasks(garden(), catalog(tomato), "2025-06-30", ctx), "harvest:p1")!;
    expect(task.dueDate).toBe("2025-06-30");
    expect(task.type).toBe("harvest");
  });

  it("does not repeat the harvest task right after harvesting", () => {
    const g = garden({ careLog: [{ id: "l1", plantingId: "p1", type: "harvest", date: "2025-07-01" }] });
    expect(byId(getCareTasks(g, catalog(tomato), "2025-07-02", ctx), "harvest:p1")).toBeUndefined();
    expect(byId(getCareTasks(g, catalog(tomato), "2025-07-08", ctx), "harvest:p1")).toBeDefined();
  });

  it("skips harvest for non-edible plants or plants with no maturity data", () => {
    const flower = makePlant({ ...tomato, edible: false });
    expect(byId(getCareTasks(garden(), catalog(flower), "2025-08-01", ctx), "harvest:p1")).toBeUndefined();
    const noMaturity = makePlant({ ...tomato, daysToMaturity: undefined });
    expect(byId(getCareTasks(garden(), catalog(noMaturity), "2025-08-01", ctx), "harvest:p1")).toBeUndefined();
  });

  it("ignores plantings that are not growing or whose plant is unknown", () => {
    const g = garden({
      plantings: [
        makePlanting({ id: "a", status: "planned", plantId: "tomato" }),
        makePlanting({ id: "b", status: "harvested", plantId: "tomato" }),
        makePlanting({ id: "c", status: "removed", plantId: "tomato" }),
        makePlanting({ id: "d", status: "growing", plantId: "ghost" }),
      ],
    });
    expect(getCareTasks(g, catalog(tomato), "2026-01-01", ctx)).toEqual([]);
  });

  it("omits the bed suffix for plantings without a bed", () => {
    const g = garden({ plantings: [makePlanting({ id: "p3", plantId: "tomato", bedId: undefined })] });
    const tasks = getCareTasks(g, catalog(tomato), "2025-05-10", ctx);
    expect(byId(tasks, "water:p3")!.title).toBe("Water Tomato");
  });

  describe("reminders", () => {
    it("includes pending reminders as custom tasks", () => {
      const g = garden({
        plantings: [],
        reminders: [
          { id: "r1", title: "Buy mulch", dueDate: "2025-05-01", done: false },
          { id: "r2", title: "Done thing", dueDate: "2025-05-01", done: true },
          { id: "r3", title: "Later", dueDate: "2025-06-01", done: false },
        ],
      });
      const tasks = getCareTasks(g, catalog(tomato), "2025-05-03", ctx);
      expect(tasks.map((t) => t.id)).toEqual(["reminder:r1"]);
      expect(tasks[0]).toMatchObject({ type: "custom", reminderId: "r1", title: "Buy mulch", overdueDays: 2 });
    });
  });

  it("sorts by due date, then title", () => {
    const g = garden({
      plantings: [],
      reminders: [
        { id: "r1", title: "Zebra", dueDate: "2025-05-02", done: false },
        { id: "r2", title: "Apple", dueDate: "2025-05-02", done: false },
        { id: "r3", title: "Early", dueDate: "2025-05-01", done: false },
      ],
    });
    const titles = getCareTasks(g, catalog(tomato), "2025-05-05", ctx).map((t) => t.title);
    expect(titles).toEqual(["Early", "Apple", "Zebra"]);
  });
});

describe("completeTask", () => {
  const base: CareTask = {
    id: "water:p1",
    type: "water",
    plantingId: "p1",
    title: "Water Tomato",
    detail: "",
    dueDate: "2025-05-04",
    overdueDays: 0,
  };

  it("creates a care log entry for planting tasks", () => {
    expect(completeTask(base, "2025-05-05", "log-1")).toEqual({
      log: { id: "log-1", plantingId: "p1", type: "water", date: "2025-05-05" },
    });
  });

  it("marks a non-repeating reminder done", () => {
    const task: CareTask = { ...base, id: "reminder:r1", type: "custom", reminderId: "r1", plantingId: undefined };
    expect(completeTask(task, "2025-05-05", "x")).toEqual({ reminderUpdate: { id: "r1", done: true } });
  });

  it("moves a repeating reminder forward by its interval", () => {
    const task = { ...base, id: "reminder:r1", type: "custom" as const, reminderId: "r1", dueDate: "2025-05-04", repeatDays: 7 };
    expect(completeTask(task, "2025-05-04", "x").reminderUpdate).toEqual({ id: "r1", dueDate: "2025-05-11" });
  });

  it("rolls a late repeating reminder forward past the completion date", () => {
    const task = { ...base, id: "reminder:r1", type: "custom" as const, reminderId: "r1", dueDate: "2025-05-04", repeatDays: 7 };
    expect(completeTask(task, "2025-05-20", "x").reminderUpdate).toEqual({ id: "r1", dueDate: "2025-05-25" });
    // landing exactly on the completion date still rolls to the next occurrence
    expect(completeTask(task, "2025-05-11", "x").reminderUpdate).toEqual({ id: "r1", dueDate: "2025-05-18" });
  });

  it("does not create a log for reminders", () => {
    const task: CareTask = { ...base, id: "reminder:r1", type: "custom", reminderId: "r1" };
    expect(completeTask(task, "2025-05-05", "x").log).toBeUndefined();
  });
});

describe("lastLogDate", () => {
  const entry = (id: string, date: string, overrides: Partial<CareLogEntry> = {}): CareLogEntry => ({
    id,
    type: "water",
    date,
    plantingId: "p1",
    ...overrides,
  });
  const entries = [
    entry("1", "2026-05-01"),
    entry("2", "2026-05-08"),
    entry("3", "2026-05-09", { type: "fertilize" }),
    entry("4", "2026-05-10", { plantingId: "p2" }),
  ];

  it("finds the newest matching entry", () => {
    expect(lastLogDate(entries, "p1", "water")).toBe("2026-05-08");
    expect(lastLogDate(entries, "p1", "fertilize")).toBe("2026-05-09");
  });

  it("is undefined without a match", () => {
    expect(lastLogDate(entries, "p1", "prune")).toBeUndefined();
    expect(lastLogDate([], "p1", "water")).toBeUndefined();
  });
});

describe("careContextFor", () => {
  it("uses outdoor climate humidity outdoors and indoor humidity indoors", () => {
    const outdoor = makeProfile();
    outdoor.climate.humidity = "high";
    outdoor.indoor.humidity = "low";
    expect(careContextFor(outdoor)).toEqual({ setting: "outdoor", summerHighF: outdoor.climate.summerHighF, humidity: "high" });
    expect(careContextFor({ ...outdoor, setting: "indoor" })).toMatchObject({ setting: "indoor", humidity: "low" });
  });
});
