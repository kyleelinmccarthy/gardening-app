import type { GardenProfile, Planting, PlantingStatus } from "./types";

/** A new "planned" planting of one plant, dated `today`; it goes in a container for indoor or containers-only gardens. */
export function defaultPlanting(plantId: string, profile: GardenProfile, today: string, id: string): Planting {
  return {
    id,
    plantId,
    quantity: 1,
    plantedOn: today,
    status: "planned",
    inContainer: profile.containersOnly || profile.setting === "indoor",
  };
}

/**
 * The fields to change when a planting moves to `nextStatus`. Starting to grow
 * a planned planting also stamps `today` as its planting date.
 */
export function applyStatusChange(
  planting: Pick<Planting, "status">,
  nextStatus: PlantingStatus,
  today: string,
): Partial<Pick<Planting, "status" | "plantedOn">> {
  return planting.status === "planned" && nextStatus === "growing"
    ? { status: nextStatus, plantedOn: today }
    : { status: nextStatus };
}
