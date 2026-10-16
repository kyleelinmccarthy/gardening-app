import type { Plant } from "./types";

type ZoneAware = Pick<Plant, "lifeCycle" | "hardinessZones">;

/**
 * Only perennials must survive winter outdoors. Annuals and biennials are
 * grown as one-season crops (carrots, kale…), so winter hardiness is moot.
 */
export function needsWinterHardiness(plant: Pick<Plant, "lifeCycle">): boolean {
  return plant.lifeCycle === "perennial";
}

/**
 * Whether a plant can be grown outdoors in a USDA hardiness zone: always true
 * for non-perennials, and for perennials only inside their hardiness range.
 * Shared by the library filter and the recommendation rules so they agree.
 */
export function zoneSupports(plant: ZoneAware, zone: number): boolean {
  if (!needsWinterHardiness(plant)) return true;
  return zone >= plant.hardinessZones.min && zone <= plant.hardinessZones.max;
}
