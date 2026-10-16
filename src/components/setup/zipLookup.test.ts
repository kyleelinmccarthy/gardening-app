import { describe, expect, it, vi } from "vitest";
import { lookupZoneByZip, type FetchLike } from "./zipLookup";

const respond = (body: unknown, init: { ok?: boolean; status?: number } = {}): FetchLike =>
  vi.fn(async () => ({ ok: init.ok ?? true, status: init.status ?? 200, json: async () => body }));

describe("lookupZoneByZip", () => {
  it("requests the phzmapi URL and parses '7b' to zone 7", async () => {
    const fake = respond({ zone: "7b", coordinates: {} });
    const result = await lookupZoneByZip("02134", fake);
    expect(fake).toHaveBeenCalledWith("https://phzmapi.org/02134.json");
    expect(result).toEqual({ ok: true, zone: 7, label: "7b" });
  });

  it("accepts numeric zones and trims whitespace", async () => {
    expect(await lookupZoneByZip(" 90210 ", respond({ zone: 10 }))).toEqual({ ok: true, zone: 10, label: "10" });
  });

  it("rejects malformed ZIP codes without calling fetch", async () => {
    const fake = respond({ zone: "7a" });
    const result = await lookupZoneByZip("1234", fake);
    expect(result.ok).toBe(false);
    expect(fake).not.toHaveBeenCalled();
  });

  it("reports an unknown ZIP on 404", async () => {
    const result = await lookupZoneByZip("00000", respond({}, { ok: false, status: 404 }));
    expect(result).toMatchObject({ ok: false, error: expect.stringMatching(/couldn't find/i) });
  });

  it("reports other HTTP failures gracefully", async () => {
    const result = await lookupZoneByZip("12345", respond({}, { ok: false, status: 500 }));
    expect(result.ok).toBe(false);
  });

  it("fails on unusable bodies and out-of-range zones", async () => {
    expect((await lookupZoneByZip("12345", respond({}))).ok).toBe(false);
    expect((await lookupZoneByZip("12345", respond(null))).ok).toBe(false);
    expect((await lookupZoneByZip("12345", respond({ zone: "20a" }))).ok).toBe(false);
    expect((await lookupZoneByZip("12345", respond({ zone: "abc" }))).ok).toBe(false);
  });

  it("never throws on network errors", async () => {
    const failing: FetchLike = async () => {
      throw new TypeError("offline");
    };
    const result = await lookupZoneByZip("12345", failing);
    expect(result).toMatchObject({ ok: false });
  });
});
