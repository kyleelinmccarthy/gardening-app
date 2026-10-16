/**
 * Pure helpers for the planting-calendar timeline: date → percent geometry,
 * lane packing, per-plant grouping and the text used for tooltips.
 */
import { diffDays, formatDisplayDate, MONTH_NAMES_SHORT, parseIsoDate } from "@/domain/dates";
import type { CalendarEvent, ClimateProfile, Garden } from "@/domain/types";
import { CALENDAR_EVENT_LABELS } from "@/lib/labels";

export function daysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

/** 1-based day of the year for an ISO date. */
export function dayOfYear(iso: string): number {
  const year = parseIsoDate(iso).getUTCFullYear();
  return diffDays(`${String(year).padStart(4, "0")}-01-01`, iso) + 1;
}

const yearOf = (iso: string) => Number(iso.slice(0, 4));

/** Position of the start of `iso` across `year` (0–100); dates outside the year clamp. */
export function dateToPercent(iso: string, year: number): number {
  const y = yearOf(iso);
  if (y < year) return 0;
  if (y > year) return 100;
  return ((dayOfYear(iso) - 1) / daysInYear(year)) * 100;
}

export interface BarGeometry {
  /** Percent from the left edge of the year. */
  left: number;
  width: number;
}

/** Geometry of an event clipped to `year`, or null when it does not touch the year. */
export function barGeometry(event: Pick<CalendarEvent, "start" | "end">, year: number): BarGeometry | null {
  if (yearOf(event.end) < year || yearOf(event.start) > year) return null;
  const total = daysInYear(year);
  const startDay = yearOf(event.start) < year ? 1 : dayOfYear(event.start);
  const endDay = yearOf(event.end) > year ? total : dayOfYear(event.end);
  const left = ((startDay - 1) / total) * 100;
  return { left, width: (endDay / total) * 100 - left };
}

export interface MonthColumn {
  index: number;
  label: string;
  left: number;
  width: number;
}

export function monthColumns(year: number): MonthColumn[] {
  const total = daysInYear(year);
  return MONTH_NAMES_SHORT.map((label, index) => {
    const first = Date.UTC(year, index, 1);
    const next = Date.UTC(year, index + 1, 1);
    const startDay = Math.round((first - Date.UTC(year, 0, 1)) / 86_400_000);
    const length = Math.round((next - first) / 86_400_000);
    return { index, label, left: (startDay / total) * 100, width: (length / total) * 100 };
  });
}

/** Greedy lane packing: overlapping ranges get different lanes. Result is in input order. */
export function assignLanes(ranges: readonly { start: string; end: string }[]): number[] {
  const order = ranges.map((_, i) => i).sort((a, b) => ranges[a].start.localeCompare(ranges[b].start) || a - b);
  const laneEnds: string[] = [];
  const lanes: number[] = new Array(ranges.length);
  for (const i of order) {
    let lane = laneEnds.findIndex((end) => end < ranges[i].start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(ranges[i].end);
    } else {
      laneEnds[lane] = ranges[i].end;
    }
    lanes[i] = lane;
  }
  return lanes;
}

export interface TimelineBar extends BarGeometry {
  event: CalendarEvent;
  lane: number;
}

export interface TimelineRow {
  plantId: string;
  bars: TimelineBar[];
  laneCount: number;
}

/** One row per plant (in `plantIds` order); plants without events get an empty row. */
export function buildTimelineRows(plantIds: readonly string[], events: readonly CalendarEvent[], year: number): TimelineRow[] {
  return plantIds.map((plantId) => {
    const own = events
      .filter((e) => e.plantId === plantId)
      .map((event) => ({ event, geometry: barGeometry(event, year) }))
      .filter((x): x is { event: CalendarEvent; geometry: BarGeometry } => x.geometry !== null);
    const lanes = assignLanes(own.map((x) => x.event));
    const bars = own.map((x, i) => ({ event: x.event, ...x.geometry, lane: lanes[i] }));
    return { plantId, bars, laneCount: Math.max(1, ...lanes.map((l) => l + 1)) };
  });
}

export interface FrostMarker {
  date: string;
  percent: number;
}

export interface FrostMarkers {
  /** True when the climate has no frost dates at all. */
  frostFree: boolean;
  lastFrost?: FrostMarker;
  firstFrost?: FrostMarker;
}

export function frostMarkers(climate: Pick<ClimateProfile, "lastFrost" | "firstFrost">, year: number): FrostMarkers {
  if (climate.lastFrost === null && climate.firstFrost === null) return { frostFree: true };
  const marker = (md: string | null): FrostMarker | undefined => {
    if (md === null) return undefined;
    const date = `${String(year).padStart(4, "0")}-${md}`;
    return { date, percent: dateToPercent(date, year) };
  };
  return { frostFree: false, lastFrost: marker(climate.lastFrost), firstFrost: marker(climate.firstFrost) };
}

// --- text ------------------------------------------------------------------

/** "May 1 – May 14" (years added when the range crosses a year boundary). */
export function eventRangeLabel(event: Pick<CalendarEvent, "start" | "end">): string {
  const crossesYear = yearOf(event.start) !== yearOf(event.end);
  return `${formatDisplayDate(event.start, { year: crossesYear })} – ${formatDisplayDate(event.end, { year: crossesYear })}`;
}

export function eventDescription(plantName: string, event: CalendarEvent): string {
  return `${plantName}: ${CALENDAR_EVENT_LABELS[event.type]}, ${eventRangeLabel(event)}`;
}

/** "Starts in 5 days" / "Open now, until May 20". */
export function timingLabel(event: Pick<CalendarEvent, "start" | "end">, today: string): string {
  if (event.start < today) return `Open now, until ${formatDisplayDate(event.end)}`;
  const until = diffDays(today, event.start);
  if (until === 0) return "Starts today";
  if (until === 1) return "Starts tomorrow";
  return `Starts in ${until} days`;
}

/** Plant ids with a planned or growing planting, unique, in planting order. */
export function defaultCalendarPlantIds(garden: Pick<Garden, "plantings">): string[] {
  const ids = garden.plantings
    .filter((p) => p.status === "planned" || p.status === "growing")
    .map((p) => p.plantId);
  return [...new Set(ids)];
}
