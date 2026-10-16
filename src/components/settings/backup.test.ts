import { afterEach, describe, expect, it, vi } from "vitest";
import { exportAppData } from "@/storage/repository";
import { makeAppData, makeGarden, makePlant } from "@/test/fixtures";
import { MAX_BACKUP_BYTES, backupFileName, describeBackup, downloadTextFile, readBackupFile } from "./backup";

afterEach(() => vi.restoreAllMocks());

describe("backupFileName", () => {
  it("uses the given ISO date", () => {
    expect(backupFileName("2026-03-09")).toBe("garden-planner-backup-2026-03-09.json");
  });
  it("defaults to today", () => {
    expect(backupFileName()).toMatch(/^garden-planner-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("downloadTextFile", () => {
  it("clicks a temporary download link and revokes the object URL", () => {
    const create = vi.fn(() => "blob:fake");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const clicked: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });

    downloadTextFile("a.json", '{"x":1}');

    expect(create).toHaveBeenCalledTimes(1);
    const blob = (create.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("application/json");
    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe("a.json");
    expect(clicked[0].getAttribute("href")).toBe("blob:fake");
    expect(revoke).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});

describe("readBackupFile", () => {
  const file = (text: string) => new File([text], "backup.json", { type: "application/json" });

  it("parses a valid export", async () => {
    const data = makeAppData([makeGarden()], { customPlants: [makePlant({ id: "custom-x-1", custom: true })] });
    const result = await readBackupFile(file(exportAppData(data)));
    expect(result).toEqual({ ok: true, data });
  });

  it("returns an error for invalid JSON or the wrong shape", async () => {
    expect(await readBackupFile(file("not json"))).toMatchObject({ ok: false });
    expect(await readBackupFile(file('{"version":2}'))).toMatchObject({ ok: false });
  });

  it("rejects files over 5 MB without reading them", async () => {
    const text = vi.fn();
    const huge = { size: MAX_BACKUP_BYTES + 1, text } as unknown as Blob;
    const result = await readBackupFile(huge);
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toMatch(/too large.*5 MB/i);
    expect(text).not.toHaveBeenCalled();
  });

  it("never throws when the file can't be read", async () => {
    const broken = { text: () => Promise.reject(new Error("nope")) } as unknown as Blob;
    expect(await readBackupFile(broken)).toEqual({ ok: false, error: "That file couldn't be read." });
  });
});

describe("describeBackup", () => {
  it("pluralises counts", () => {
    expect(describeBackup(makeAppData([makeGarden()]))).toBe("1 garden and 0 custom plants");
    expect(describeBackup(makeAppData([makeGarden(), makeGarden({ id: "2" })], { customPlants: [makePlant()] }))).toBe(
      "2 gardens and 1 custom plant",
    );
  });
});
