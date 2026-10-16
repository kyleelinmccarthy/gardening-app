import { describe, expect, it } from "vitest";
import {
  addDays,
  addWeeks,
  diffDays,
  formatDisplayDate,
  isValidIsoDate,
  monthDayToIso,
  parseIsoDate,
  toIsoDate,
  todayIso,
} from "./dates";

describe("toIsoDate / parseIsoDate", () => {
  it("round-trips an ISO date", () => {
    expect(toIsoDate(parseIsoDate("2025-03-09"))).toBe("2025-03-09");
  });

  it("parses to UTC midnight", () => {
    expect(parseIsoDate("2025-03-09").toISOString()).toBe("2025-03-09T00:00:00.000Z");
  });

  it("formats using UTC fields", () => {
    expect(toIsoDate(new Date(Date.UTC(2024, 11, 31, 23, 59, 59)))).toBe("2024-12-31");
  });

  it("throws on an invalid date string", () => {
    expect(() => parseIsoDate("2025-02-30")).toThrow();
    expect(() => parseIsoDate("nope")).toThrow();
  });
});

describe("isValidIsoDate", () => {
  it("accepts real dates including leap days", () => {
    expect(isValidIsoDate("2024-02-29")).toBe(true);
    expect(isValidIsoDate("2025-12-31")).toBe(true);
  });

  it("rejects malformed and impossible dates", () => {
    expect(isValidIsoDate("2025-02-29")).toBe(false);
    expect(isValidIsoDate("2025-13-01")).toBe(false);
    expect(isValidIsoDate("2025-1-1")).toBe(false);
    expect(isValidIsoDate("")).toBe(false);
    expect(isValidIsoDate("2025-04-31")).toBe(false);
  });
});

describe("addDays / addWeeks", () => {
  it("adds across month and year boundaries", () => {
    expect(addDays("2025-01-31", 1)).toBe("2025-02-01");
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
  });

  it("subtracts days", () => {
    expect(addDays("2025-03-01", -1)).toBe("2025-02-28");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
  });

  it("is not affected by DST transitions", () => {
    // US DST begins 2025-03-09 and ends 2025-11-02.
    expect(addDays("2025-03-08", 1)).toBe("2025-03-09");
    expect(addDays("2025-03-09", 1)).toBe("2025-03-10");
    expect(addDays("2025-11-01", 2)).toBe("2025-11-03");
  });

  it("adds weeks, including negative", () => {
    expect(addWeeks("2025-04-30", 2)).toBe("2025-05-14");
    expect(addWeeks("2025-04-30", -8)).toBe("2025-03-05");
  });
});

describe("diffDays", () => {
  it("returns b - a in whole days", () => {
    expect(diffDays("2025-01-01", "2025-01-11")).toBe(10);
    expect(diffDays("2025-01-11", "2025-01-01")).toBe(-10);
    expect(diffDays("2025-01-01", "2025-01-01")).toBe(0);
  });

  it("counts leap days", () => {
    expect(diffDays("2024-02-28", "2024-03-01")).toBe(2);
    expect(diffDays("2025-02-28", "2025-03-01")).toBe(1);
  });

  it("is exact across DST boundaries", () => {
    expect(diffDays("2025-03-08", "2025-03-10")).toBe(2);
    expect(diffDays("2025-10-31", "2025-11-03")).toBe(3);
  });
});

describe("todayIso", () => {
  it("uses the local calendar date, not the UTC date", () => {
    const local = new Date(2025, 5, 15, 23, 30); // local 11:30pm
    expect(todayIso(local)).toBe("2025-06-15");
    const earlyLocal = new Date(2025, 0, 1, 0, 5);
    expect(todayIso(earlyLocal)).toBe("2025-01-01");
  });

  it("defaults to now and returns a valid date", () => {
    expect(isValidIsoDate(todayIso())).toBe(true);
  });
});

describe("monthDayToIso", () => {
  it("combines a year with MM-DD", () => {
    expect(monthDayToIso("04-30", 2025)).toBe("2025-04-30");
  });

  it("clamps 02-29 to 02-28 in non-leap years", () => {
    expect(monthDayToIso("02-29", 2025)).toBe("2025-02-28");
    expect(monthDayToIso("02-29", 2024)).toBe("2024-02-29");
  });

  it("throws on invalid month-day", () => {
    expect(() => monthDayToIso("13-01", 2025)).toThrow();
    expect(() => monthDayToIso("4-3", 2025)).toThrow();
    expect(() => monthDayToIso("00-10", 2025)).toThrow();
    expect(() => monthDayToIso("04-00", 2025)).toThrow();
  });

  it("throws on days beyond the month length", () => {
    expect(() => monthDayToIso("04-31", 2025)).toThrow();
    expect(() => monthDayToIso("06-31", 2025)).toThrow();
    expect(() => monthDayToIso("02-30", 2025)).toThrow();
    expect(() => monthDayToIso("02-30", 2024)).toThrow();
    expect(monthDayToIso("01-31", 2025)).toBe("2025-01-31");
  });
});

describe("formatDisplayDate", () => {
  it("formats as short month and day", () => {
    expect(formatDisplayDate("2025-04-12")).toBe("Apr 12");
    expect(formatDisplayDate("2025-01-01")).toBe("Jan 1");
  });

  it("can include the year", () => {
    expect(formatDisplayDate("2025-04-12", { year: true })).toBe("Apr 12, 2025");
  });

  it("can use long month names", () => {
    expect(formatDisplayDate("2025-09-05", { month: "long" })).toBe("September 5");
  });
});
