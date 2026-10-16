import { afterEach, describe, expect, it, vi } from "vitest";
import { createId } from "./id";

describe("createId", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns unique ids", () => {
    const ids = new Set(Array.from({ length: 200 }, () => createId()));
    expect(ids.size).toBe(200);
  });

  it("prefixes ids when a prefix is given", () => {
    expect(createId("bed")).toMatch(/^bed-.+/);
  });

  it("has no prefix separator when no prefix is given", () => {
    expect(createId()).not.toMatch(/^-/);
  });

  it("uses crypto.randomUUID when available", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "fixed-uuid" });
    expect(createId("x")).toBe("x-fixed-uuid");
  });

  it("falls back when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", undefined);
    const a = createId("g");
    const b = createId("g");
    expect(a).toMatch(/^g-[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });
});
