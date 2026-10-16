import { describe, expect, it } from "vitest";
import {
  buildPlantingCalendar,
  CALENDAR_EVENT_LABELS,
  eventsInMonth,
  upcomingEvents,
} from "./calendar";
import { makePlant } from "./test-fixtures";
import type { CalendarEvent, ClimateProfile } from "./types";

const climate = (overrides: Partial<ClimateProfile> = {}): ClimateProfile => ({
  hardinessZone: 6,
  lastFrost: "04-30",
  firstFrost: "10-15",
  summerHighF: 85,
  winterLowF: 0,
  humidity: "average",
  ...overrides,
});

const find = (events: CalendarEvent[], type: CalendarEvent["type"]) => events.find((e) => e.type === type);

describe("buildPlantingCalendar", () => {
  it("creates a start-indoors event relative to last frost with a 2-week window", () => {
    const p = makePlant({ id: "tomato", planting: { startIndoorsWeeks: -6 }, daysToMaturity: undefined });
    const events = buildPlantingCalendar([p], climate(), 2025);
    expect(events).toEqual([
      { plantId: "tomato", type: "start-indoors", start: "2025-03-19", end: "2025-04-01" },
    ]);
  });

  it("creates direct-sow with a 3-week window", () => {
    const p = makePlant({ planting: { directSowWeeks: -4 }, daysToMaturity: undefined });
    const e = find(buildPlantingCalendar([p], climate(), 2025), "direct-sow")!;
    expect(e.start).toBe("2025-04-02");
    expect(e.end).toBe("2025-04-22");
  });

  it("creates transplant with a 2-week window", () => {
    const p = makePlant({ planting: { transplantWeeks: 1 }, daysToMaturity: undefined });
    const e = find(buildPlantingCalendar([p], climate(), 2025), "transplant")!;
    expect(e.start).toBe("2025-05-07");
    expect(e.end).toBe("2025-05-20");
  });

  it("counts fall-sow back from the first frost", () => {
    const p = makePlant({ planting: { fallSowWeeksBeforeFirstFrost: 10 }, daysToMaturity: undefined });
    const e = find(buildPlantingCalendar([p], climate(), 2025), "fall-sow")!;
    expect(e.start).toBe("2025-08-06");
    expect(e.end).toBe("2025-08-19");
  });

  it("treats a window of zero weeks as defined", () => {
    const p = makePlant({ planting: { transplantWeeks: 0 }, daysToMaturity: undefined });
    expect(find(buildPlantingCalendar([p], climate(), 2025), "transplant")!.start).toBe("2025-04-30");
  });

  it("produces no events for plants without windows", () => {
    const p = makePlant({ planting: { notes: "Plant any time." } });
    expect(buildPlantingCalendar([p], climate(), 2025)).toEqual([]);
  });

  describe("harvest", () => {
    it("starts at the earliest of transplant/direct-sow plus days to maturity", () => {
      const p = makePlant({
        planting: { directSowWeeks: 0, transplantWeeks: 2 },
        daysToMaturity: { min: 50, max: 70 },
      });
      const h = find(buildPlantingCalendar([p], climate(), 2025), "harvest")!;
      expect(h.start).toBe("2025-06-19"); // Apr 30 + 50
      expect(h.end).toBe("2025-07-09"); // Apr 30 + 70
    });

    it("uses transplant when only start-indoors and transplant exist", () => {
      const p = makePlant({
        planting: { startIndoorsWeeks: -6, transplantWeeks: 1 },
        daysToMaturity: { min: 60, max: 80 },
      });
      const h = find(buildPlantingCalendar([p], climate(), 2025), "harvest")!;
      expect(h.start).toBe("2025-07-06"); // May 7 + 60
    });

    it("falls back to the start-indoors date when nothing else is defined", () => {
      const p = makePlant({ planting: { startIndoorsWeeks: -6 }, daysToMaturity: { min: 10, max: 20 } });
      const h = find(buildPlantingCalendar([p], climate(), 2025), "harvest")!;
      expect(h.start).toBe("2025-03-29");
    });

    it("harvests a fall-sown crop from its fall sowing", () => {
      const p = makePlant({
        planting: { fallSowWeeksBeforeFirstFrost: 8 },
        daysToMaturity: { min: 30, max: 40 },
      });
      const h = find(buildPlantingCalendar([p], climate(), 2025), "harvest")!;
      expect(h.start).toBe("2025-09-19"); // Aug 20 + 30
    });

    it("is skipped without daysToMaturity", () => {
      const p = makePlant({ planting: { directSowWeeks: 0 }, daysToMaturity: undefined });
      expect(find(buildPlantingCalendar([p], climate(), 2025), "harvest")).toBeUndefined();
    });
  });

  describe("frost-free climates", () => {
    const frostFree = climate({ lastFrost: null, firstFrost: null, hardinessZone: 11 });

    it("approximates last frost as Feb 1 and first frost as Dec 1", () => {
      const p = makePlant({
        planting: { directSowWeeks: 0, fallSowWeeksBeforeFirstFrost: 4 },
        daysToMaturity: undefined,
      });
      const events = buildPlantingCalendar([p], frostFree, 2025);
      expect(find(events, "direct-sow")!.start).toBe("2025-02-01");
      expect(find(events, "fall-sow")!.start).toBe("2025-11-03");
    });
  });

  it("is independent of leap years", () => {
    const p = makePlant({ planting: { directSowWeeks: 0 }, daysToMaturity: undefined });
    const c = climate({ lastFrost: "02-29" });
    expect(find(buildPlantingCalendar([p], c, 2025), "direct-sow")!.start).toBe("2025-02-28");
    expect(find(buildPlantingCalendar([p], c, 2024), "direct-sow")!.start).toBe("2024-02-29");
  });

  it("sorts events by start date across plants", () => {
    const early = makePlant({ id: "pea", planting: { directSowWeeks: -6 }, daysToMaturity: undefined });
    const late = makePlant({ id: "bean", planting: { directSowWeeks: 2 }, daysToMaturity: undefined });
    const events = buildPlantingCalendar([late, early], climate(), 2025);
    expect(events.map((e) => e.plantId)).toEqual(["pea", "bean"]);
  });
});

describe("eventsInMonth", () => {
  const events: CalendarEvent[] = [
    { plantId: "a", type: "direct-sow", start: "2025-03-25", end: "2025-04-14" },
    { plantId: "b", type: "transplant", start: "2025-05-01", end: "2025-05-14" },
    { plantId: "c", type: "harvest", start: "2025-06-01", end: "2025-06-30" },
  ];

  it("includes events that overlap the month, even if they start earlier", () => {
    expect(eventsInMonth(events, 2025, 3).map((e) => e.plantId)).toEqual(["a"]);
    expect(eventsInMonth(events, 2025, 2).map((e) => e.plantId)).toEqual(["a"]);
  });

  it("uses a 0-based month index and includes boundary days", () => {
    expect(eventsInMonth(events, 2025, 4).map((e) => e.plantId)).toEqual(["b"]);
    expect(eventsInMonth(events, 2025, 5).map((e) => e.plantId)).toEqual(["c"]);
  });

  it("returns an empty list when nothing overlaps", () => {
    expect(eventsInMonth(events, 2025, 0)).toEqual([]);
  });

  it("handles leap-year February", () => {
    const e: CalendarEvent[] = [{ plantId: "a", type: "harvest", start: "2024-02-29", end: "2024-02-29" }];
    expect(eventsInMonth(e, 2024, 1)).toHaveLength(1);
  });
});

describe("upcomingEvents", () => {
  const events: CalendarEvent[] = [
    { plantId: "past", type: "direct-sow", start: "2025-03-01", end: "2025-03-21" },
    { plantId: "ongoing", type: "direct-sow", start: "2025-04-10", end: "2025-04-30" },
    { plantId: "soon", type: "transplant", start: "2025-05-05", end: "2025-05-18" },
    { plantId: "edge", type: "harvest", start: "2025-05-10", end: "2025-05-20" },
    { plantId: "later", type: "harvest", start: "2025-05-11", end: "2025-05-20" },
  ];

  it("returns ongoing and starting-soon events within the default 30 days", () => {
    const ids = upcomingEvents(events, "2025-04-10").map((e) => e.plantId);
    expect(ids).toEqual(["ongoing", "soon", "edge"]);
  });

  it("respects a custom horizon", () => {
    expect(upcomingEvents(events, "2025-04-10", 7).map((e) => e.plantId)).toEqual(["ongoing"]);
  });

  it("excludes events that already ended", () => {
    expect(upcomingEvents(events, "2025-04-10").map((e) => e.plantId)).not.toContain("past");
  });
});

describe("CALENDAR_EVENT_LABELS", () => {
  it("has a label for every event type", () => {
    expect(Object.keys(CALENDAR_EVENT_LABELS).sort()).toEqual(
      ["direct-sow", "fall-sow", "harvest", "start-indoors", "transplant"].sort(),
    );
    expect(CALENDAR_EVENT_LABELS["start-indoors"]).toBe("Start indoors");
  });
});
