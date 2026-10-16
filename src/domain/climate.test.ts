import { describe, expect, it } from "vitest";
import { cToF, climateFromZone, fToC, formatTemperature, frostFreeDays, fromDisplayTemp, toDisplayTemp } from "./climate";
import type { ZoneInfo } from "./types";

const zones: ZoneInfo[] = [
  { zone: 3, minTempF: -40, maxTempF: -30, lastFrost: "05-20", firstFrost: "09-15", description: "" },
  { zone: 6, minTempF: -10, maxTempF: 0, lastFrost: "04-30", firstFrost: "10-15", description: "" },
  { zone: 7, minTempF: 0, maxTempF: 10, lastFrost: "04-15", firstFrost: "10-25", description: "" },
  { zone: 11, minTempF: 40, maxTempF: 50, lastFrost: null, firstFrost: null, description: "" },
];

describe("temperature conversion", () => {
  it("converts F to C", () => {
    expect(fToC(32)).toBeCloseTo(0);
    expect(fToC(212)).toBeCloseTo(100);
    expect(fToC(-40)).toBeCloseTo(-40);
  });

  it("converts C to F", () => {
    expect(cToF(0)).toBeCloseTo(32);
    expect(cToF(100)).toBeCloseTo(212);
  });

  it("round-trips", () => {
    expect(cToF(fToC(77.5))).toBeCloseTo(77.5);
  });
});

describe("formatTemperature", () => {
  it("formats Fahrenheit rounded", () => {
    expect(formatTemperature(68, "F")).toBe("68°F");
    expect(formatTemperature(67.6, "F")).toBe("68°F");
  });

  it("converts and rounds for Celsius", () => {
    expect(formatTemperature(68, "C")).toBe("20°C");
    expect(formatTemperature(32, "C")).toBe("0°C");
    expect(formatTemperature(-40, "C")).toBe("-40°C");
  });

  it("never renders negative zero", () => {
    expect(formatTemperature(31.9, "C")).toBe("0°C");
    expect(formatTemperature(-0.2, "F")).toBe("0°F");
  });
});

describe("frostFreeDays", () => {
  it("returns 365 when either frost date is null", () => {
    expect(frostFreeDays(null, "10-15")).toBe(365);
    expect(frostFreeDays("04-30", null)).toBe(365);
    expect(frostFreeDays(null, null)).toBe(365);
  });
  it("counts days between last and first frost (non-leap)", () => {
    expect(frostFreeDays("01-01", "01-31")).toBe(30);
    expect(frostFreeDays("04-30", "10-15")).toBe(168);
    expect(frostFreeDays("02-28", "03-01")).toBe(1);
  });
  it("wraps around the year if first frost precedes last frost", () => {
    expect(frostFreeDays("12-01", "01-01")).toBe(31);
  });
});

describe("climateFromZone", () => {
  it("takes frost dates and winter low from the zone", () => {
    const c = climateFromZone(6, zones);
    expect(c).toMatchObject({
      hardinessZone: 6,
      lastFrost: "04-30",
      firstFrost: "10-15",
      winterLowF: -10,
      humidity: "average",
    });
  });

  it("estimates a hotter summer for warmer zones", () => {
    expect(climateFromZone(7, zones).summerHighF).toBeGreaterThan(climateFromZone(3, zones).summerHighF);
  });

  it("supports frost-free zones", () => {
    const c = climateFromZone(11, zones);
    expect(c.lastFrost).toBeNull();
    expect(c.firstFrost).toBeNull();
  });

  it("falls back to the nearest known zone for unknown zones", () => {
    const c = climateFromZone(5, zones);
    expect(c.hardinessZone).toBe(5);
    expect(c.lastFrost).toBe("04-30");
  });

  it("throws with no zones", () => {
    expect(() => climateFromZone(6, [])).toThrow();
  });
});

describe("display temperature helpers", () => {
  it("round-trips whole degrees", () => {
    for (let c = -40; c <= 45; c++) expect(toDisplayTemp(fromDisplayTemp(c, "C"), "C")).toBe(c);
  });

  it("is the identity in °F", () => {
    expect(toDisplayTemp(72, "F")).toBe(72);
    expect(fromDisplayTemp(72, "F")).toBe(72);
  });

  it("converts to and from whole °C", () => {
    expect(toDisplayTemp(68, "C")).toBe(20);
    expect(fromDisplayTemp(25, "C")).toBe(77);
  });

  it("never shows negative zero", () => {
    expect(Object.is(toDisplayTemp(32, "C"), 0)).toBe(true);
    expect(Object.is(toDisplayTemp(31.9, "C"), 0)).toBe(true);
  });
});
