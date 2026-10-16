import type { ClimateProfile, TemperatureUnit, ZoneInfo } from "./types";

/** Estimated summer high (°F) at zone 0; each zone step adds {@link SUMMER_HIGH_PER_ZONE}. */
const SUMMER_HIGH_BASE_F = 70;
const SUMMER_HIGH_PER_ZONE_F = 2.5;

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
 * Maps an average annual extreme minimum (°F) to a hardiness zone: the warmest
 * zone whose lower bound is at or below the temperature (coldest zone if none).
 */
export function zoneForMinTemp(minTempF: number, zones: readonly ZoneInfo[]): number {
  if (zones.length === 0) throw new Error("No hardiness zones provided");
  const sorted = [...zones].sort((a, b) => a.minTempF - b.minTempF);
  let match = sorted[0];
  for (const z of sorted) if (z.minTempF <= minTempF) match = z;
  return match.zone;
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
