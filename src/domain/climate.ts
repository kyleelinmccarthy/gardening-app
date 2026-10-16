import { diffDays, monthDayToIso } from "./dates";
import type { ClimateProfile, TemperatureUnit, ZoneInfo } from "./types";

/** Estimated summer high (°F) at zone 0; each zone step adds {@link SUMMER_HIGH_PER_ZONE}. */
const SUMMER_HIGH_BASE_F = 70;
const SUMMER_HIGH_PER_ZONE_F = 2.5;

/** A non-leap year, so frost-date arithmetic never depends on leap days. */
const REFERENCE_YEAR = 2025;
const DAYS_IN_YEAR = 365;

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

/** Rounds and normalises -0 to 0 so "-0°C" never appears. */
function roundDisplay(n: number): number {
  const r = Math.round(n);
  return r === 0 ? 0 : r;
}

/** Formats a °F value for display in the user's unit, e.g. "68°F" / "20°C". */
export function formatTemperature(f: number, unit: TemperatureUnit): string {
  return unit === "C" ? `${roundDisplay(fToC(f))}°C` : `${roundDisplay(f)}°F`;
}

/**
 * Days between the last spring frost and first fall frost ("MM-DD", non-leap
 * year). Returns 365 when either date is null (frost-free climate); wraps
 * around the new year if the first frost precedes the last.
 */
export function frostFreeDays(lastFrost: string | null, firstFrost: string | null): number {
  if (lastFrost === null || firstFrost === null) return DAYS_IN_YEAR;
  const diff = diffDays(monthDayToIso(lastFrost, REFERENCE_YEAR), monthDayToIso(firstFrost, REFERENCE_YEAR));
  return diff >= 0 ? diff : diff + DAYS_IN_YEAR;
}

function nearestZone(zone: number, zones: readonly ZoneInfo[]): ZoneInfo {
  if (zones.length === 0) throw new Error("No hardiness zones provided");
  return zones.reduce((best, z) => (Math.abs(z.zone - zone) < Math.abs(best.zone - zone) ? z : best));
}

/**
 * Builds a default climate for a zone. Frost dates and winter low come from the
 * zone data; summer high is a rough heuristic (70°F + 2.5°F per zone, e.g.
 * zone 6 => 85°F); humidity defaults to "average". Unknown zones use the
 * nearest known zone's data.
 */
export function climateFromZone(zone: number, zones: readonly ZoneInfo[]): ClimateProfile {
  const info = nearestZone(zone, zones);
  return {
    hardinessZone: zone,
    lastFrost: info.lastFrost,
    firstFrost: info.firstFrost,
    summerHighF: Math.round(SUMMER_HIGH_BASE_F + SUMMER_HIGH_PER_ZONE_F * zone),
    winterLowF: info.minTempF,
    humidity: "average",
  };
}
