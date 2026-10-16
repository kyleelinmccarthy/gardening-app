import type { AppData, Bed, Garden } from "@/domain/types";

/** True when the grid cell (x, y) exists in the bed. */
export function isCellInBed(bed: Pick<Bed, "columns" | "rows">, x: number, y: number): boolean {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < bed.columns && y < bed.rows;
}

function sanitizeBed(bed: Bed): Bed {
  const placements = bed.placements.filter((p) => isCellInBed(bed, p.x, p.y));
  return placements.length === bed.placements.length ? bed : { ...bed, placements };
}

function sanitizeGarden(garden: Garden): Garden {
  const beds = garden.beds.map(sanitizeBed);
  return beds.every((bed, i) => bed === garden.beds[i]) ? garden : { ...garden, beds };
}

/**
 * Repairs structurally valid data whose cross references are broken, rather
 * than rejecting the whole document: drops placements outside their bed's grid
 * and points `activeGardenId` at an existing garden (or null). Returns the same
 * object when nothing needs fixing.
 */
export function sanitizeAppData(data: AppData): AppData {
  const gardens = data.gardens.map(sanitizeGarden);
  const gardensChanged = gardens.some((g, i) => g !== data.gardens[i]);
  const activeOk = data.activeGardenId === null || gardens.some((g) => g.id === data.activeGardenId);
  if (!gardensChanged && activeOk) return data;
  return {
    ...data,
    gardens: gardensChanged ? gardens : data.gardens,
    activeGardenId: activeOk ? data.activeGardenId : (gardens[0]?.id ?? null),
  };
}
