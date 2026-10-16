import type { CalendarEvent, ClimateProfile } from "@/domain/types";
import { makeGarden } from "@/test/fixtures";
import {
  assignLanes,
  barGeometry,
  buildTimelineRows,
  dateToPercent,
  dayOfYear,
  daysInYear,
  defaultCalendarPlantIds,
  eventDescription,
  eventRangeLabel,
  frostMarkers,
  monthColumns,
  timingLabel,
} from "./timeline";

const ev = (start: string, end: string, type: CalendarEvent["type"] = "transplant", plantId = "tomato"): CalendarEvent => ({
  plantId,
  type,
  start,
  end,
});

describe("year math", () => {
  it("knows leap years", () => {
    expect(daysInYear(2026)).toBe(365);
    expect(daysInYear(2028)).toBe(366);
  });

  it("computes day of year (1-based)", () => {
    expect(dayOfYear("2026-01-01")).toBe(1);
    expect(dayOfYear("2026-12-31")).toBe(365);
    expect(dayOfYear("2028-03-01")).toBe(61);
  });
});

describe("dateToPercent", () => {
  it("maps the start of the year to 0 and the end towards 100", () => {
    expect(dateToPercent("2026-01-01", 2026)).toBe(0);
    expect(dateToPercent("2026-07-02", 2026)).toBeCloseTo((182 / 365) * 100, 5);
  });

  it("clamps dates outside the year", () => {
    expect(dateToPercent("2025-12-31", 2026)).toBe(0);
    expect(dateToPercent("2027-01-01", 2026)).toBe(100);
  });
});

describe("barGeometry", () => {
  it("positions an event inside the year", () => {
    const g = barGeometry(ev("2026-01-01", "2026-01-31"), 2026)!;
    expect(g.left).toBe(0);
    expect(g.width).toBeCloseTo((31 / 365) * 100, 5);
  });

  it("clips events that run past the year end", () => {
    const g = barGeometry(ev("2026-12-01", "2027-02-01"), 2026)!;
    expect(g.left + g.width).toBeCloseTo(100, 5);
  });

  it("clips events that start before the year", () => {
    const g = barGeometry(ev("2025-12-20", "2026-01-10"), 2026)!;
    expect(g.left).toBe(0);
    expect(g.width).toBeCloseTo((10 / 365) * 100, 5);
  });

  it("returns null for events outside the year", () => {
    expect(barGeometry(ev("2025-03-01", "2025-03-10"), 2026)).toBeNull();
    expect(barGeometry(ev("2027-03-01", "2027-03-10"), 2026)).toBeNull();
  });
});

describe("monthColumns", () => {
  it("returns 12 contiguous columns covering the year", () => {
    const cols = monthColumns(2026);
    expect(cols).toHaveLength(12);
    expect(cols[0]).toMatchObject({ label: "Jan", left: 0 });
    const last = cols[11];
    expect(last.label).toBe("Dec");
    expect(last.left + last.width).toBeCloseTo(100, 5);
    expect(cols[1].left).toBeCloseTo((31 / 365) * 100, 5);
  });
});

describe("assignLanes", () => {
  it("stacks overlapping bars into separate lanes and reuses free lanes", () => {
    const bars = [
      { start: "2026-03-01", end: "2026-03-20" },
      { start: "2026-03-10", end: "2026-03-30" },
      { start: "2026-04-01", end: "2026-04-10" },
    ];
    expect(assignLanes(bars)).toEqual([0, 1, 0]);
  });

  it("returns lanes in input order even when unsorted", () => {
    const bars = [
      { start: "2026-05-01", end: "2026-05-10" },
      { start: "2026-03-01", end: "2026-05-05" },
    ];
    expect(assignLanes(bars)).toEqual([1, 0]);
  });
});

describe("buildTimelineRows", () => {
  it("makes one row per plant in the given order, including plants without events", () => {
    const rows = buildTimelineRows(
      ["basil", "tomato", "fern"],
      [ev("2026-05-01", "2026-05-14"), ev("2026-04-01", "2026-04-14", "direct-sow", "basil"), ev("2026-05-10", "2026-05-20", "harvest")],
      2026,
    );
    expect(rows.map((r) => r.plantId)).toEqual(["basil", "tomato", "fern"]);
    expect(rows[0].bars).toHaveLength(1);
    expect(rows[1].bars).toHaveLength(2);
    expect(rows[1].laneCount).toBe(2);
    expect(rows[2].bars).toEqual([]);
    expect(rows[2].laneCount).toBe(1);
  });
});

describe("frostMarkers", () => {
  const climate = (lastFrost: string | null, firstFrost: string | null): ClimateProfile => ({
    hardinessZone: 7,
    lastFrost,
    firstFrost,
    summerHighF: 85,
    winterLowF: 10,
    humidity: "average",
  });

  it("positions both frost dates", () => {
    const m = frostMarkers(climate("04-15", "10-15"), 2026);
    expect(m.frostFree).toBe(false);
    expect(m.lastFrost).toMatchObject({ date: "2026-04-15" });
    expect(m.lastFrost!.percent).toBeCloseTo(((dayOfYear("2026-04-15") - 1) / 365) * 100, 5);
    expect(m.firstFrost).toMatchObject({ date: "2026-10-15" });
  });

  it("flags frost-free climates", () => {
    expect(frostMarkers(climate(null, null), 2026)).toEqual({ frostFree: true });
  });
});

describe("labels", () => {
  it("formats ranges", () => {
    expect(eventRangeLabel(ev("2026-05-01", "2026-05-14"))).toBe("May 1 – May 14");
    expect(eventRangeLabel(ev("2026-12-20", "2027-01-05"))).toBe("Dec 20, 2026 – Jan 5, 2027");
  });

  it("describes events for assistive tech", () => {
    expect(eventDescription("Tomato", ev("2026-05-01", "2026-05-14"))).toBe("Tomato: Transplant, May 1 – May 14");
  });

  it("describes timing relative to today", () => {
    const today = "2026-05-10";
    expect(timingLabel(ev("2026-05-10", "2026-05-20"), today)).toBe("Starts today");
    expect(timingLabel(ev("2026-05-11", "2026-05-20"), today)).toBe("Starts tomorrow");
    expect(timingLabel(ev("2026-05-15", "2026-05-20"), today)).toBe("Starts in 5 days");
    expect(timingLabel(ev("2026-05-01", "2026-05-20"), today)).toBe("Open now, until May 20");
  });
});

describe("defaultCalendarPlantIds", () => {
  it("uses unique plants of planned/growing plantings", () => {
    const garden = makeGarden({
      plantings: [
        { id: "1", plantId: "tomato", quantity: 1, plantedOn: "2026-05-01", status: "growing", inContainer: false },
        { id: "2", plantId: "tomato", quantity: 1, plantedOn: "2026-05-01", status: "planned", inContainer: false },
        { id: "3", plantId: "basil", quantity: 1, plantedOn: "2026-05-01", status: "harvested", inContainer: false },
        { id: "4", plantId: "kale", quantity: 1, plantedOn: "2026-05-01", status: "planned", inContainer: false },
      ],
    });
    expect(defaultCalendarPlantIds(garden)).toEqual(["tomato", "kale"]);
  });
});
