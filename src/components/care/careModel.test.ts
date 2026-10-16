import { createPlantCatalog } from "@/domain/catalog";
import type { CareTaskItem } from "@/domain/care";
import type { CareLogEntry, JournalEntry, Planting, Reminder } from "@/domain/types";
import { makeGarden, makePlant } from "@/test/fixtures";
import {
  careContext,
  completionActions,
  dueLabel,
  filterCareLog,
  groupTasksByType,
  intervalLabel,
  lastLogDate,
  partitionTasks,
  plantingIntervals,
  plantingOptions,
  plantingLabel,
  sortJournal,
  sortReminders,
  statusChanges,
} from "./careModel";

const task = (overrides: Partial<CareTaskItem>): CareTaskItem => ({
  id: "water:p1",
  type: "water",
  title: "Water Tomato",
  detail: "",
  dueDate: "2026-05-10",
  overdueDays: 0,
  ...overrides,
});

const log = (id: string, date: string, overrides: Partial<CareLogEntry> = {}): CareLogEntry => ({
  id,
  type: "water",
  date,
  plantingId: "p1",
  ...overrides,
});

describe("careContext", () => {
  it("uses outdoor climate humidity outdoors and indoor humidity indoors", () => {
    const outdoor = makeGarden().profile;
    expect(careContext(outdoor)).toEqual({ setting: "outdoor", summerHighF: 85, humidity: "average" });
    const indoor = {
      ...outdoor,
      setting: "indoor" as const,
      indoor: { light: "medium" as const, averageTempF: 68, humidity: "low" as const },
    };
    expect(careContext(indoor)).toMatchObject({ setting: "indoor", humidity: "low" });
  });
});

describe("lastLogDate", () => {
  const entries = [log("1", "2026-05-01"), log("2", "2026-05-08"), log("3", "2026-05-09", { type: "fertilize" }), log("4", "2026-05-10", { plantingId: "p2" })];

  it("finds the newest matching entry", () => {
    expect(lastLogDate(entries, "p1", "water")).toBe("2026-05-08");
    expect(lastLogDate(entries, "p1", "fertilize")).toBe("2026-05-09");
  });

  it("is undefined without a match", () => {
    expect(lastLogDate(entries, "p1", "prune")).toBeUndefined();
  });
});

describe("task grouping", () => {
  it("partitions into due (today or overdue) and upcoming", () => {
    const tasks = [task({ id: "a", dueDate: "2026-05-08" }), task({ id: "b", dueDate: "2026-05-10" }), task({ id: "c", dueDate: "2026-05-12" })];
    const { due, upcoming } = partitionTasks(tasks, "2026-05-10");
    expect(due.map((t) => t.id)).toEqual(["a", "b"]);
    expect(upcoming.map((t) => t.id)).toEqual(["c"]);
  });

  it("groups by care type in a stable order, skipping empty types", () => {
    const groups = groupTasksByType([
      task({ id: "1", type: "harvest" }),
      task({ id: "2", type: "water" }),
      task({ id: "3", type: "custom" }),
      task({ id: "4", type: "water" }),
    ]);
    expect(groups.map((g) => g.type)).toEqual(["water", "harvest", "custom"]);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(["2", "4"]);
  });
});

describe("dueLabel", () => {
  it("describes overdue, today and future tasks", () => {
    expect(dueLabel(task({ dueDate: "2026-05-07", overdueDays: 3 }), "2026-05-10")).toBe("3 days overdue");
    expect(dueLabel(task({ dueDate: "2026-05-09", overdueDays: 1 }), "2026-05-10")).toBe("1 day overdue");
    expect(dueLabel(task({ dueDate: "2026-05-10" }), "2026-05-10")).toBe("Due today");
    expect(dueLabel(task({ dueDate: "2026-05-12" }), "2026-05-10")).toBe("Due May 12");
  });
});

describe("completionActions", () => {
  it("turns a log completion into care/log", () => {
    const entry = log("l1", "2026-05-10");
    expect(completionActions("g1", { log: entry })).toEqual([{ type: "care/log", gardenId: "g1", entry }]);
  });

  it("turns a reminder update into reminder/update", () => {
    expect(completionActions("g1", { reminderUpdate: { id: "r1", done: true } })).toEqual([
      { type: "reminder/update", gardenId: "g1", reminderId: "r1", changes: { done: true } },
    ]);
  });
});

describe("statusChanges", () => {
  const planting = { status: "planned", plantedOn: "2026-01-01" } as Planting;

  it("sets plantedOn to today when a planned planting starts growing", () => {
    expect(statusChanges(planting, "growing", "2026-05-10")).toEqual({ status: "growing", plantedOn: "2026-05-10" });
  });

  it("only changes status otherwise", () => {
    expect(statusChanges({ ...planting, status: "growing" }, "harvested", "2026-05-10")).toEqual({ status: "harvested" });
  });
});

describe("intervalLabel", () => {
  it("formats day counts", () => {
    expect(intervalLabel(1)).toBe("every day");
    expect(intervalLabel(3)).toBe("every 3 days");
    expect(intervalLabel(null)).toBe("not needed right now");
  });
});

describe("filterCareLog", () => {
  const entries = [
    log("1", "2026-05-01"),
    log("2", "2026-05-08", { plantingId: "p2" }),
    log("3", "2026-05-08", { type: "prune" }),
    log("4", "2026-04-01", { plantingId: undefined }),
  ];

  it("sorts newest first, later entries first on ties", () => {
    expect(filterCareLog(entries, {}).map((e) => e.id)).toEqual(["3", "2", "1", "4"]);
  });

  it("filters by planting and type", () => {
    expect(filterCareLog(entries, { plantingId: "p2" }).map((e) => e.id)).toEqual(["2"]);
    expect(filterCareLog(entries, { type: "prune" }).map((e) => e.id)).toEqual(["3"]);
    expect(filterCareLog(entries, { plantingId: "p1", type: "water" }).map((e) => e.id)).toEqual(["1"]);
  });
});

describe("sorting", () => {
  it("sorts journal entries newest first", () => {
    const entries: JournalEntry[] = [
      { id: "a", date: "2026-05-01", title: "A", text: "" },
      { id: "b", date: "2026-05-09", title: "B", text: "" },
      { id: "c", date: "2026-05-09", title: "C", text: "" },
    ];
    expect(sortJournal(entries).map((e) => e.id)).toEqual(["c", "b", "a"]);
  });

  it("sorts open reminders by due date before done ones", () => {
    const reminders: Reminder[] = [
      { id: "done", title: "d", dueDate: "2026-05-01", done: true },
      { id: "late", title: "l", dueDate: "2026-05-20", done: false },
      { id: "soon", title: "s", dueDate: "2026-05-05", done: false },
    ];
    expect(sortReminders(reminders).map((r) => r.id)).toEqual(["soon", "late", "done"]);
  });
});

describe("plantingLabel", () => {
  const catalog = createPlantCatalog([makePlant({ id: "tomato", name: "Tomato" })]);
  const garden = makeGarden({
    beds: [{ id: "b1", name: "Main", kind: "raised-bed", columns: 1, rows: 1, cellSizeInches: 12, sun: "full-sun", placements: [] }],
    plantings: [
      { id: "p1", plantId: "tomato", bedId: "b1", quantity: 1, plantedOn: "2026-05-01", status: "growing", inContainer: false },
      { id: "p2", plantId: "tomato", quantity: 1, plantedOn: "2026-05-01", status: "growing", inContainer: false },
    ],
  });

  it("includes the bed when there is one", () => {
    expect(plantingLabel(garden, catalog, "p1")).toBe("Tomato (Main)");
    expect(plantingLabel(garden, catalog, "p2")).toBe("Tomato");
  });

  it("copes with removed plantings", () => {
    expect(plantingLabel(garden, catalog, "gone")).toBe("Removed planting");
  });
});

describe("plantingIntervals", () => {
  const plant = makePlant({ wateringIntervalDays: 4, fertilizer: { feeding: "moderate", recommended: [], frequencyDays: 14, notes: "" } });
  const profile = makeGarden().profile;

  it("shortens watering for containers", () => {
    expect(plantingIntervals({ inContainer: false }, plant, profile, "2026-05-10").waterEvery).toBe(4);
    expect(plantingIntervals({ inContainer: true }, plant, profile, "2026-05-10").waterEvery).toBe(2);
  });

  it("reports the feeding interval, or null for unfed plants", () => {
    expect(plantingIntervals({ inContainer: false }, plant, profile, "2026-05-10").feedEvery).toBe(14);
    const unfed = makePlant({ fertilizer: { feeding: "light", recommended: [], frequencyDays: 0, notes: "" } });
    expect(plantingIntervals({ inContainer: false }, unfed, profile, "2026-05-10").feedEvery).toBeNull();
  });
});

describe("plantingOptions", () => {
  it("labels every planting", () => {
    const catalog = createPlantCatalog([makePlant({ id: "tomato", name: "Tomato" })]);
    const garden = makeGarden({
      plantings: [{ id: "p1", plantId: "tomato", quantity: 1, plantedOn: "2026-05-01", status: "growing", inContainer: false }],
    });
    expect(plantingOptions(garden, catalog)).toEqual([{ value: "p1", label: "Tomato" }]);
  });
});
