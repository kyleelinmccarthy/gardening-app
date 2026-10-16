import { describe, expect, it, vi } from "vitest";
import { makeAppData, makeBed, makeGarden } from "@/test/fixtures";
import { createEmptyAppData } from "./schema";
import {
  MAX_IMPORT_CHARS,
  createLocalRepository,
  createUnavailableRepository,
  exportAppData,
  importAppData,
} from "./repository";
import { createMemoryStorage, type KeyValueStorage } from "./storage";

const KEY = "garden-planner:v1";

/** Backed-up payloads, oldest first. */
function backups(storage: KeyValueStorage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length!; i++) {
    const k = storage.key!(i)!;
    if (k.startsWith(`${KEY}:corrupt-backup:`)) keys.push(k);
  }
  return keys.sort().map((k) => storage.getItem(k)!);
}

describe("createLocalRepository", () => {
  it("loads empty data when nothing is stored", () => {
    const repo = createLocalRepository(createMemoryStorage());
    expect(repo.load()).toEqual(createEmptyAppData());
  });

  it("round-trips saved data", () => {
    const repo = createLocalRepository(createMemoryStorage());
    const data = makeAppData([makeGarden({ beds: [makeBed()] })]);
    repo.save(data);
    expect(repo.load()).toEqual(data);
  });

  it("uses the default key and serialises JSON", () => {
    const storage = createMemoryStorage();
    const data = makeAppData();
    createLocalRepository(storage).save(data);
    expect(JSON.parse(storage.getItem(KEY)!)).toEqual(data);
  });

  it("supports a custom key", () => {
    const storage = createMemoryStorage();
    createLocalRepository(storage, "other").save(makeAppData());
    expect(storage.getItem("other")).not.toBeNull();
    expect(storage.getItem(KEY)).toBeNull();
  });

  it("clear removes the stored data", () => {
    const storage = createMemoryStorage();
    const repo = createLocalRepository(storage);
    repo.save(makeAppData());
    repo.clear();
    expect(storage.getItem(KEY)).toBeNull();
    expect(repo.load()).toEqual(createEmptyAppData());
  });

  it("returns empty data and backs up corrupt JSON under a timestamped key", () => {
    const storage = createMemoryStorage();
    storage.setItem(KEY, "{not json");
    const repo = createLocalRepository(storage, KEY, { now: () => new Date("2026-03-01T10:00:00.000Z") });
    expect(repo.load()).toEqual(createEmptyAppData());
    expect(storage.getItem(`${KEY}:corrupt-backup:2026-03-01T10:00:00.000Z`)).toBe("{not json");
  });

  it("returns empty data and backs up schema-invalid data", () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({ version: 1, gardens: "nope" });
    storage.setItem(KEY, raw);
    const repo = createLocalRepository(storage, KEY, { now: () => new Date("2026-03-01T10:00:00.000Z") });
    expect(repo.load()).toEqual(createEmptyAppData());
    expect(storage.getItem(`${KEY}:corrupt-backup:2026-03-01T10:00:00.000Z`)).toBe(raw);
  });

  it("keeps only the newest 3 distinct backups", () => {
    const storage = createMemoryStorage();
    let day = 1;
    const repo = createLocalRepository(storage, KEY, {
      now: () => new Date(`2026-03-0${day}T00:00:00.000Z`),
    });
    for (const bad of ["bad1", "bad2", "bad3", "bad4", "bad5"]) {
      storage.setItem(KEY, bad);
      repo.load();
      day++;
    }
    expect(backups(storage)).toEqual(["bad3", "bad4", "bad5"]);
  });

  it("does not duplicate a backup when the same corrupt payload is loaded again", () => {
    const storage = createMemoryStorage();
    let day = 1;
    const repo = createLocalRepository(storage, KEY, {
      now: () => new Date(`2026-03-0${day}T00:00:00.000Z`),
    });
    storage.setItem(KEY, "bad1");
    repo.load();
    day++;
    storage.setItem(KEY, "bad2");
    repo.load();
    for (let i = 0; i < 5; i++) {
      day++;
      repo.load();
    }
    expect(backups(storage)).toEqual(["bad1", "bad2"]);
  });

  it("never throws when storage getItem throws", () => {
    const storage: KeyValueStorage = {
      getItem: () => {
        throw new Error("boom");
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(createLocalRepository(storage).load()).toEqual(createEmptyAppData());
  });

  it("never throws when the backup write fails", () => {
    const storage: KeyValueStorage = {
      getItem: () => "garbage",
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(createLocalRepository(storage).load()).toEqual(createEmptyAppData());
  });

  it("save swallows storage failures (quota exceeded)", () => {
    const storage: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(() => createLocalRepository(storage).save(makeAppData())).not.toThrow();
  });
});

describe("loadWithStatus", () => {
  it("reports empty when nothing is stored", () => {
    const { data, status } = createLocalRepository(createMemoryStorage()).loadWithStatus();
    expect(status).toBe("empty");
    expect(data).toEqual(createEmptyAppData());
  });

  it("reports ok for valid saved data", () => {
    const repo = createLocalRepository(createMemoryStorage());
    const saved = makeAppData([makeGarden({ name: "Saved" })]);
    repo.save(saved);
    expect(repo.loadWithStatus()).toEqual({ data: saved, status: "ok" });
  });

  it("reports corrupt for unreadable data", () => {
    const storage = createMemoryStorage();
    storage.setItem(KEY, "{nope");
    expect(createLocalRepository(storage).loadWithStatus().status).toBe("corrupt");
  });

  it("reports corrupt when a date is not a real calendar date", () => {
    const storage = createMemoryStorage();
    const bad = makeAppData([
      makeGarden({ journal: [{ id: "j", date: "2026-02-31", title: "t", text: "x" }] }),
    ]);
    storage.setItem(KEY, JSON.stringify(bad));
    expect(createLocalRepository(storage).loadWithStatus().status).toBe("corrupt");
  });

  it("reports unavailable when reading throws, without touching storage", () => {
    const setItem = vi.fn();
    const storage: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem,
      removeItem: () => {},
    };
    const { data, status } = createLocalRepository(storage).loadWithStatus();
    expect(status).toBe("unavailable");
    expect(data).toEqual(createEmptyAppData());
    expect(setItem).not.toHaveBeenCalled();
  });

  it("repairs dangling references on load (out-of-bounds placements, unknown active garden)", () => {
    const storage = createMemoryStorage();
    const bed = makeBed({ columns: 2, rows: 2, placements: [{ plantId: "a", x: 0, y: 0 }, { plantId: "b", x: 9, y: 9 }] });
    const dirty = makeAppData([makeGarden({ id: "g", beds: [bed] })], { activeGardenId: "missing" });
    storage.setItem(KEY, JSON.stringify(dirty));
    const { data, status } = createLocalRepository(storage).loadWithStatus();
    expect(status).toBe("ok");
    expect(data.activeGardenId).toBe("g");
    expect(data.gardens[0].beds[0].placements).toHaveLength(1);
  });

  it("load() delegates to loadWithStatus()", () => {
    const repo = createLocalRepository(createMemoryStorage());
    expect(repo.load()).toEqual(repo.loadWithStatus().data);
  });
});

describe("createUnavailableRepository", () => {
  it("loads empty data, reports unavailable and persists nothing", () => {
    const repo = createUnavailableRepository();
    repo.save(makeAppData());
    expect(repo.loadWithStatus()).toEqual({ data: createEmptyAppData(), status: "unavailable" });
    expect(() => repo.clear()).not.toThrow();
  });
});

describe("exportAppData / importAppData", () => {
  it("exports pretty JSON", () => {
    const json = exportAppData(createEmptyAppData());
    expect(json).toContain("\n");
    expect(JSON.parse(json)).toEqual(createEmptyAppData());
  });

  it("imports what was exported", () => {
    const data = makeAppData([makeGarden({ beds: [makeBed()] })]);
    expect(importAppData(exportAppData(data))).toEqual({ ok: true, data });
  });

  it("reports invalid JSON without throwing", () => {
    const r = importAppData("{oops");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/json/i);
  });

  it("reports schema errors", () => {
    const r = importAppData(JSON.stringify({ version: 3 }));
    expect(r.ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(importAppData("").ok).toBe(false);
  });

  it("rejects oversized input before parsing it", () => {
    const spy = vi.spyOn(JSON, "parse");
    const r = importAppData(" ".repeat(MAX_IMPORT_CHARS + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/too large/i);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("accepts input exactly at the limit", () => {
    const json = exportAppData(createEmptyAppData());
    const r = importAppData(json + " ".repeat(MAX_IMPORT_CHARS - json.length));
    expect(r.ok).toBe(true);
  });
});
