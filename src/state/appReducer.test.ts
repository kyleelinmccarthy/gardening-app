import { describe, expect, it } from "vitest";
import { createDefaultProfile } from "@/domain/defaults";
import type { AppData, Garden } from "@/domain/types";
import { createEmptyAppData } from "@/storage/schema";
import { makeAppData, makeBed, makeGarden, makePlant } from "@/test/fixtures";
import { appReducer, type AppAction } from "./appReducer";

/** Freezes recursively so any accidental mutation throws in strict mode. */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

function run(state: AppData, action: AppAction): AppData {
  return appReducer(deepFreeze(structuredClone(state)), action);
}

const gardenOf = (state: AppData, id = "garden-1"): Garden => state.gardens.find((g) => g.id === id)!;

const planting = (over: Partial<Garden["plantings"][number]> = {}): Garden["plantings"][number] => ({
  id: "pl-1",
  plantId: "test-tomato",
  bedId: "bed-1",
  quantity: 1,
  plantedOn: "2026-04-20",
  status: "growing",
  inContainer: false,
  ...over,
});

describe("garden actions", () => {
  it("garden/create adds and activates the garden", () => {
    const g = makeGarden({ id: "new", name: "New" });
    const next = run(makeAppData(), { type: "garden/create", garden: g });
    expect(next.gardens.map((x) => x.id)).toEqual(["garden-1", "new"]);
    expect(next.activeGardenId).toBe("new");
  });

  it("garden/create works from empty state", () => {
    const g = makeGarden();
    const next = run(createEmptyAppData(), { type: "garden/create", garden: g });
    expect(next.gardens).toEqual([g]);
    expect(next.activeGardenId).toBe("garden-1");
  });

  it("garden/update renames the garden", () => {
    const next = run(makeAppData(), { type: "garden/update", gardenId: "garden-1", name: "Front yard" });
    expect(gardenOf(next).name).toBe("Front yard");
  });

  it("garden/update merges a partial profile", () => {
    const next = run(makeAppData(), {
      type: "garden/update",
      gardenId: "garden-1",
      profile: { weeklyHours: 9, pets: ["cat"] },
    });
    expect(gardenOf(next).profile.weeklyHours).toBe(9);
    expect(gardenOf(next).profile.pets).toEqual(["cat"]);
    expect(gardenOf(next).profile.soilType).toBe("loam");
    expect(gardenOf(next).name).toBe("Backyard");
  });

  it("garden/update leaves other gardens untouched", () => {
    const state = makeAppData([makeGarden(), makeGarden({ id: "garden-2", name: "Other" })]);
    const next = run(state, { type: "garden/update", gardenId: "garden-1", name: "X" });
    expect(gardenOf(next, "garden-2")).toEqual(gardenOf(state, "garden-2"));
  });

  it("garden/delete removes the garden and keeps a different active garden", () => {
    const state = makeAppData([makeGarden(), makeGarden({ id: "garden-2" })], { activeGardenId: "garden-2" });
    const next = run(state, { type: "garden/delete", gardenId: "garden-1" });
    expect(next.gardens.map((g) => g.id)).toEqual(["garden-2"]);
    expect(next.activeGardenId).toBe("garden-2");
  });

  it("garden/delete of the active garden falls back to the first remaining", () => {
    const state = makeAppData([makeGarden(), makeGarden({ id: "garden-2" }), makeGarden({ id: "garden-3" })]);
    const next = run(state, { type: "garden/delete", gardenId: "garden-1" });
    expect(next.activeGardenId).toBe("garden-2");
  });

  it("garden/delete of the last garden clears the active id", () => {
    const next = run(makeAppData(), { type: "garden/delete", gardenId: "garden-1" });
    expect(next.gardens).toEqual([]);
    expect(next.activeGardenId).toBeNull();
  });

  it("garden/delete of an unknown id is a no-op", () => {
    const state = makeAppData();
    expect(appReducer(state, { type: "garden/delete", gardenId: "nope" })).toBe(state);
  });

  it("garden/setActive switches the active garden", () => {
    const state = makeAppData([makeGarden(), makeGarden({ id: "garden-2" })]);
    expect(run(state, { type: "garden/setActive", gardenId: "garden-2" }).activeGardenId).toBe("garden-2");
  });

  it("garden/setActive ignores unknown gardens", () => {
    const state = makeAppData();
    expect(appReducer(state, { type: "garden/setActive", gardenId: "nope" })).toBe(state);
  });
});

describe("unknown garden ids", () => {
  const state = makeAppData();
  const actions: AppAction[] = [
    { type: "garden/update", gardenId: "nope", name: "x" },
    { type: "bed/add", gardenId: "nope", bed: makeBed() },
    { type: "bed/update", gardenId: "nope", bedId: "bed-1", changes: { name: "x" } },
    { type: "bed/delete", gardenId: "nope", bedId: "bed-1" },
    { type: "bed/place", gardenId: "nope", bedId: "bed-1", plantId: "p", x: 0, y: 0 },
    { type: "bed/clearCell", gardenId: "nope", bedId: "bed-1", x: 0, y: 0 },
    { type: "bed/clearAll", gardenId: "nope", bedId: "bed-1" },
    { type: "planting/add", gardenId: "nope", planting: planting() },
    { type: "planting/update", gardenId: "nope", plantingId: "pl-1", changes: { quantity: 2 } },
    { type: "planting/delete", gardenId: "nope", plantingId: "pl-1" },
    { type: "care/log", gardenId: "nope", entry: { id: "c", type: "water", date: "2026-01-01" } },
    { type: "care/deleteLog", gardenId: "nope", entryId: "c" },
    { type: "reminder/add", gardenId: "nope", reminder: { id: "r", title: "t", dueDate: "2026-01-01", done: false } },
    { type: "reminder/update", gardenId: "nope", reminderId: "r", changes: { done: true } },
    { type: "reminder/delete", gardenId: "nope", reminderId: "r" },
    { type: "journal/add", gardenId: "nope", entry: { id: "j", date: "2026-01-01", title: "t", text: "x" } },
    { type: "journal/update", gardenId: "nope", entryId: "j", changes: { title: "y" } },
    { type: "journal/delete", gardenId: "nope", entryId: "j" },
  ];
  it.each(actions.map((a) => [a.type, a] as const))("%s returns the same state", (_t, action) => {
    expect(appReducer(state, action)).toBe(state);
  });
});

describe("bed actions", () => {
  it("bed/add appends a bed", () => {
    const next = run(makeAppData(), { type: "bed/add", gardenId: "garden-1", bed: makeBed({ id: "b9" }) });
    expect(gardenOf(next).beds.map((b) => b.id)).toEqual(["b9"]);
  });

  it("bed/update patches fields but never the id or placements", () => {
    const state = makeAppData([
      makeGarden({ beds: [makeBed({ placements: [{ plantId: "a", x: 0, y: 0 }] })] }),
    ]);
    const next = run(state, {
      type: "bed/update",
      gardenId: "garden-1",
      bedId: "bed-1",
      changes: { name: "Renamed", sun: "partial-shade" },
    });
    const bed = gardenOf(next).beds[0];
    expect(bed).toMatchObject({ id: "bed-1", name: "Renamed", sun: "partial-shade" });
    expect(bed.placements).toHaveLength(1);
  });

  it("bed/update drops placements that fall outside a shrunken grid", () => {
    const state = makeAppData([
      makeGarden({
        beds: [
          makeBed({
            columns: 4,
            rows: 4,
            placements: [
              { plantId: "a", x: 0, y: 0 },
              { plantId: "b", x: 3, y: 0 },
              { plantId: "c", x: 1, y: 3 },
            ],
          }),
        ],
      }),
    ]);
    const next = run(state, {
      type: "bed/update",
      gardenId: "garden-1",
      bedId: "bed-1",
      changes: { columns: 2, rows: 2 },
    });
    expect(gardenOf(next).beds[0].placements).toEqual([{ plantId: "a", x: 0, y: 0 }]);
  });

  it("bed/update of an unknown bed is a no-op", () => {
    const state = makeAppData();
    expect(appReducer(state, { type: "bed/update", gardenId: "garden-1", bedId: "x", changes: { name: "y" } })).toBe(state);
  });

  it("bed/delete removes the bed and clears planting.bedId references only", () => {
    const state = makeAppData([
      makeGarden({
        beds: [makeBed(), makeBed({ id: "bed-2" })],
        plantings: [planting(), planting({ id: "pl-2", bedId: "bed-2" }), planting({ id: "pl-3", bedId: undefined })],
        careLog: [{ id: "c1", plantingId: "pl-1", type: "water", date: "2026-05-01" }],
      }),
    ]);
    const next = run(state, { type: "bed/delete", gardenId: "garden-1", bedId: "bed-1" });
    const g = gardenOf(next);
    expect(g.beds.map((b) => b.id)).toEqual(["bed-2"]);
    expect(g.plantings).toHaveLength(3);
    expect(g.plantings[0].bedId).toBeUndefined();
    expect("bedId" in g.plantings[0]).toBe(false);
    expect(g.plantings[1].bedId).toBe("bed-2");
    expect(g.careLog).toHaveLength(1);
  });

  describe("bed/place", () => {
    const base = () => makeAppData([makeGarden({ beds: [makeBed()] })]);
    const place = (state: AppData, over: Partial<Extract<AppAction, { type: "bed/place" }>> = {}) =>
      run(state, {
        type: "bed/place",
        gardenId: "garden-1",
        bedId: "bed-1",
        plantId: "test-tomato",
        x: 1,
        y: 2,
        plantingId: "pl-auto",
        plantedOn: "2026-05-05",
        ...over,
      });

    it("adds a placement", () => {
      expect(gardenOf(place(base())).beds[0].placements).toEqual([{ plantId: "test-tomato", x: 1, y: 2 }]);
    });

    it("replaces the existing occupant of the cell", () => {
      const once = place(base(), { plantId: "a" });
      const twice = place(once, { plantId: "b" });
      expect(gardenOf(twice).beds[0].placements).toEqual([{ plantId: "b", x: 1, y: 2 }]);
    });

    it("keeps placements in other cells", () => {
      const once = place(base(), { plantId: "a", x: 0, y: 0 });
      const twice = place(once, { plantId: "b" });
      expect(gardenOf(twice).beds[0].placements).toHaveLength(2);
    });

    it("creates a planned planting (quantity 1) when none exists", () => {
      const g = gardenOf(place(base()));
      expect(g.plantings).toEqual([
        {
          id: "pl-auto",
          plantId: "test-tomato",
          bedId: "bed-1",
          quantity: 1,
          plantedOn: "2026-05-05",
          status: "planned",
          inContainer: false,
        },
      ]);
    });

    it("generates an id and date when not provided", () => {
      const g = gardenOf(place(base(), { plantingId: undefined, plantedOn: undefined }));
      expect(g.plantings[0].id).toMatch(/^planting-/);
      expect(g.plantings[0].plantedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it.each(["container", "windowsill", "shelf"] as const)("marks plantings in a %s bed as inContainer", (kind) => {
      const state = makeAppData([makeGarden({ beds: [makeBed({ kind })] })]);
      expect(gardenOf(place(state)).plantings[0].inContainer).toBe(true);
    });

    it.each(["raised-bed", "in-ground"] as const)("marks plantings in a %s bed as not inContainer", (kind) => {
      const state = makeAppData([makeGarden({ beds: [makeBed({ kind })] })]);
      expect(gardenOf(place(state)).plantings[0].inContainer).toBe(false);
    });

    it.each(["planned", "growing"] as const)("reuses an existing %s planting for that plant+bed", (status) => {
      const state = makeAppData([
        makeGarden({ beds: [makeBed()], plantings: [planting({ status })] }),
      ]);
      const g = gardenOf(place(state));
      expect(g.plantings).toHaveLength(1);
      expect(g.plantings[0].status).toBe(status);
    });

    it.each(["harvested", "removed"] as const)("creates a new planting when the only match is %s", (status) => {
      const state = makeAppData([
        makeGarden({ beds: [makeBed()], plantings: [planting({ status })] }),
      ]);
      expect(gardenOf(place(state)).plantings).toHaveLength(2);
    });

    it("creates a planting when the same plant is only in another bed", () => {
      const state = makeAppData([
        makeGarden({ beds: [makeBed(), makeBed({ id: "bed-2" })], plantings: [planting({ bedId: "bed-2" })] }),
      ]);
      expect(gardenOf(place(state)).plantings).toHaveLength(2);
    });

    it("does not duplicate plantings when placing the same plant in several cells", () => {
      const once = place(base(), { x: 0, y: 0 });
      const twice = place(once, { x: 1, y: 0 });
      expect(gardenOf(twice).plantings).toHaveLength(1);
      expect(gardenOf(twice).beds[0].placements).toHaveLength(2);
    });

    it("ignores out-of-bounds cells", () => {
      const state = base();
      expect(appReducer(state, { type: "bed/place", gardenId: "garden-1", bedId: "bed-1", plantId: "p", x: 4, y: 0 })).toBe(state);
      expect(appReducer(state, { type: "bed/place", gardenId: "garden-1", bedId: "bed-1", plantId: "p", x: 0, y: -1 })).toBe(state);
    });

    it("ignores unknown beds", () => {
      const state = base();
      expect(appReducer(state, { type: "bed/place", gardenId: "garden-1", bedId: "zzz", plantId: "p", x: 0, y: 0 })).toBe(state);
    });
  });

  it("bed/clearCell removes only the targeted placement", () => {
    const state = makeAppData([
      makeGarden({
        beds: [makeBed({ placements: [{ plantId: "a", x: 0, y: 0 }, { plantId: "b", x: 1, y: 0 }] })],
        plantings: [planting({ plantId: "a" })],
      }),
    ]);
    const next = run(state, { type: "bed/clearCell", gardenId: "garden-1", bedId: "bed-1", x: 0, y: 0 });
    expect(gardenOf(next).beds[0].placements).toEqual([{ plantId: "b", x: 1, y: 0 }]);
    expect(gardenOf(next).plantings).toHaveLength(1);
  });

  it("bed/clearAll removes every placement from the bed only", () => {
    const state = makeAppData([
      makeGarden({
        beds: [
          makeBed({ placements: [{ plantId: "a", x: 0, y: 0 }, { plantId: "b", x: 1, y: 0 }] }),
          makeBed({ id: "bed-2", placements: [{ plantId: "c", x: 0, y: 0 }] }),
        ],
      }),
    ]);
    const next = run(state, { type: "bed/clearAll", gardenId: "garden-1", bedId: "bed-1" });
    expect(gardenOf(next).beds[0].placements).toEqual([]);
    expect(gardenOf(next).beds[1].placements).toHaveLength(1);
  });
});

describe("planting actions", () => {
  it("planting/add appends", () => {
    const next = run(makeAppData(), { type: "planting/add", gardenId: "garden-1", planting: planting() });
    expect(gardenOf(next).plantings).toEqual([planting()]);
  });

  it("planting/update patches fields but keeps the id", () => {
    const state = makeAppData([makeGarden({ plantings: [planting()] })]);
    const next = run(state, {
      type: "planting/update",
      gardenId: "garden-1",
      plantingId: "pl-1",
      changes: { quantity: 5, status: "harvested", notes: "yum" },
    });
    expect(gardenOf(next).plantings[0]).toEqual(planting({ quantity: 5, status: "harvested", notes: "yum" }));
  });

  it("planting/update of an unknown planting is a no-op", () => {
    const state = makeAppData([makeGarden({ plantings: [planting()] })]);
    expect(appReducer(state, { type: "planting/update", gardenId: "garden-1", plantingId: "x", changes: { quantity: 2 } })).toBe(state);
  });

  it("planting/delete removes it, keeps care history and drops reminder refs", () => {
    const state = makeAppData([
      makeGarden({
        plantings: [planting(), planting({ id: "pl-2" })],
        careLog: [{ id: "c1", plantingId: "pl-1", type: "water", date: "2026-05-01" }],
        reminders: [
          { id: "r1", title: "Feed", dueDate: "2026-05-02", done: false, plantingId: "pl-1" },
          { id: "r2", title: "Other", dueDate: "2026-05-02", done: false, plantingId: "pl-2" },
        ],
      }),
    ]);
    const g = gardenOf(run(state, { type: "planting/delete", gardenId: "garden-1", plantingId: "pl-1" }));
    expect(g.plantings.map((p) => p.id)).toEqual(["pl-2"]);
    expect(g.careLog).toEqual(state.gardens[0].careLog);
    expect("plantingId" in g.reminders[0]).toBe(false);
    expect(g.reminders[0].title).toBe("Feed");
    expect(g.reminders[1].plantingId).toBe("pl-2");
  });
});

describe("care log actions", () => {
  it("care/log adds an entry", () => {
    const entry = { id: "c1", plantingId: "pl-1", type: "water" as const, date: "2026-05-01", note: "deep" };
    const next = run(makeAppData(), { type: "care/log", gardenId: "garden-1", entry });
    expect(gardenOf(next).careLog).toEqual([entry]);
  });

  it("care/deleteLog removes only that entry", () => {
    const state = makeAppData([
      makeGarden({
        careLog: [
          { id: "c1", type: "water", date: "2026-05-01" },
          { id: "c2", type: "mulch", date: "2026-05-02" },
        ],
      }),
    ]);
    const next = run(state, { type: "care/deleteLog", gardenId: "garden-1", entryId: "c1" });
    expect(gardenOf(next).careLog.map((e) => e.id)).toEqual(["c2"]);
  });
});

describe("reminder actions", () => {
  const reminder = { id: "r1", title: "Water", dueDate: "2026-05-01", done: false };

  it("reminder/add appends", () => {
    const next = run(makeAppData(), { type: "reminder/add", gardenId: "garden-1", reminder });
    expect(gardenOf(next).reminders).toEqual([reminder]);
  });

  it("reminder/update patches", () => {
    const state = makeAppData([makeGarden({ reminders: [reminder] })]);
    const next = run(state, { type: "reminder/update", gardenId: "garden-1", reminderId: "r1", changes: { done: true, dueDate: "2026-05-08" } });
    expect(gardenOf(next).reminders[0]).toEqual({ ...reminder, done: true, dueDate: "2026-05-08" });
  });

  it("reminder/delete removes", () => {
    const state = makeAppData([makeGarden({ reminders: [reminder] })]);
    expect(gardenOf(run(state, { type: "reminder/delete", gardenId: "garden-1", reminderId: "r1" })).reminders).toEqual([]);
  });
});

describe("journal actions", () => {
  const entry = { id: "j1", date: "2026-05-01", title: "Planted", text: "Tomatoes in." };

  it("journal/add appends", () => {
    const next = run(makeAppData(), { type: "journal/add", gardenId: "garden-1", entry });
    expect(gardenOf(next).journal).toEqual([entry]);
  });

  it("journal/update patches", () => {
    const state = makeAppData([makeGarden({ journal: [entry] })]);
    const next = run(state, { type: "journal/update", gardenId: "garden-1", entryId: "j1", changes: { text: "Edited" } });
    expect(gardenOf(next).journal[0]).toEqual({ ...entry, text: "Edited" });
  });

  it("journal/delete removes", () => {
    const state = makeAppData([makeGarden({ journal: [entry] })]);
    expect(gardenOf(run(state, { type: "journal/delete", gardenId: "garden-1", entryId: "j1" })).journal).toEqual([]);
  });
});

describe("custom plants", () => {
  it("customPlant/upsert adds a plant flagged custom", () => {
    const next = run(makeAppData(), { type: "customPlant/upsert", plant: makePlant({ id: "mine" }) });
    expect(next.customPlants).toHaveLength(1);
    expect(next.customPlants[0]).toMatchObject({ id: "mine", custom: true });
  });

  it("customPlant/upsert replaces a plant with the same id", () => {
    const state = makeAppData([makeGarden()], { customPlants: [makePlant({ id: "mine", name: "Old" })] });
    const next = run(state, { type: "customPlant/upsert", plant: makePlant({ id: "mine", name: "New" }) });
    expect(next.customPlants).toHaveLength(1);
    expect(next.customPlants[0].name).toBe("New");
  });

  it("customPlant/delete removes by id", () => {
    const state = makeAppData([makeGarden()], { customPlants: [makePlant({ id: "a" }), makePlant({ id: "b" })] });
    const next = run(state, { type: "customPlant/delete", plantId: "a" });
    expect(next.customPlants.map((p) => p.id)).toEqual(["b"]);
  });
});

describe("settings and data", () => {
  it("settings/update merges", () => {
    const next = run(makeAppData(), { type: "settings/update", changes: { temperatureUnit: "C" } });
    expect(next.settings.temperatureUnit).toBe("C");
  });

  it("data/replace swaps the whole document", () => {
    const incoming = makeAppData([makeGarden({ id: "imported", profile: createDefaultProfile() })]);
    expect(run(makeAppData(), { type: "data/replace", data: incoming })).toEqual(incoming);
  });
});

describe("immutability", () => {
  it("returns new references for changed branches and keeps untouched ones", () => {
    const state = makeAppData([makeGarden(), makeGarden({ id: "garden-2" })]);
    const next = appReducer(state, { type: "journal/add", gardenId: "garden-1", entry: { id: "j", date: "2026-01-01", title: "t", text: "x" } });
    expect(next).not.toBe(state);
    expect(next.gardens[0]).not.toBe(state.gardens[0]);
    expect(next.gardens[1]).toBe(state.gardens[1]);
    expect(state.gardens[0].journal).toHaveLength(0);
  });
});
