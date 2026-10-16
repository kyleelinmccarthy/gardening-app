import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryStorage, getBrowserStorage } from "./storage";

describe("createMemoryStorage", () => {
  it("returns null for missing keys", () => {
    expect(createMemoryStorage().getItem("a")).toBeNull();
  });

  it("stores and retrieves values", () => {
    const s = createMemoryStorage();
    s.setItem("a", "1");
    expect(s.getItem("a")).toBe("1");
  });

  it("overwrites and removes values", () => {
    const s = createMemoryStorage();
    s.setItem("a", "1");
    s.setItem("a", "2");
    expect(s.getItem("a")).toBe("2");
    s.removeItem("a");
    expect(s.getItem("a")).toBeNull();
  });

  it("instances are isolated", () => {
    const a = createMemoryStorage();
    const b = createMemoryStorage();
    a.setItem("k", "v");
    expect(b.getItem("k")).toBeNull();
  });
});

describe("getBrowserStorage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a working storage in the browser (jsdom)", () => {
    const s = getBrowserStorage();
    expect(s).not.toBeNull();
    s!.setItem("probe", "1");
    expect(window.localStorage.getItem("probe")).toBe("1");
    s!.removeItem("probe");
  });

  it("returns null when window is undefined (server)", () => {
    vi.stubGlobal("window", undefined);
    expect(getBrowserStorage()).toBeNull();
  });

  it("returns null when accessing localStorage throws (Safari private mode)", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("SecurityError");
      },
    });
    expect(getBrowserStorage()).toBeNull();
  });

  it("returns null when writing throws (quota / disabled)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        removeItem: () => {},
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      },
    });
    expect(getBrowserStorage()).toBeNull();
  });
});
