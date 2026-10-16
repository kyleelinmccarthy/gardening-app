import { describe, expect, it } from "vitest";
import { makeAppData, makeBed, makeGarden } from "@/test/fixtures";
import { createEmptyAppData } from "./schema";
import { createLocalRepository, exportAppData, importAppData } from "./repository";
import { createMemoryStorage, type KeyValueStorage } from "./storage";

const KEY = "garden-planner:v1";

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

  it("returns empty data and backs up corrupt JSON", () => {
    const storage = createMemoryStorage();
    storage.setItem(KEY, "{not json");
    const repo = createLocalRepository(storage);
    expect(repo.load()).toEqual(createEmptyAppData());
    expect(storage.getItem(`${KEY}:corrupt-backup`)).toBe("{not json");
  });

  it("returns empty data and backs up schema-invalid data", () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({ version: 1, gardens: "nope" });
    storage.setItem(KEY, raw);
    const repo = createLocalRepository(storage);
    expect(repo.load()).toEqual(createEmptyAppData());
    expect(storage.getItem(`${KEY}:corrupt-backup`)).toBe(raw);
  });

  it("keeps the most recent corrupt value as the backup", () => {
    const storage = createMemoryStorage();
    const repo = createLocalRepository(storage);
    storage.setItem(KEY, "bad1");
    repo.load();
    storage.setItem(KEY, "bad2");
    repo.load();
    expect(storage.getItem(`${KEY}:corrupt-backup`)).toBe("bad2");
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
});
