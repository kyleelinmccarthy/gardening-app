import type { Bed, CompanionPair, CompanionRelation, Plant, PlantCatalog, Placement } from "./types";

export type CellStatus = "good" | "bad" | "neutral";

export interface BedAnalysis {
  /** Every distinct neighbouring plant-id pair that has a relation (each reported once). */
  pairs: CompanionPair[];
  conflicts: CompanionPair[];
  benefits: CompanionPair[];
  /** Keyed "x,y"; contains occupied cells only. */
  cellStatus: Record<string, CellStatus>;
}

export interface PlantsPerCell {
  /** Plants that fit in one cell. */
  perCell: number;
  /** Cells one plant needs when its spacing exceeds the cell size. */
  cellsNeeded: number;
}

const NEIGHBOUR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0],           [1, 0],
  [-1, 1],  [0, 1],  [1, 1],
];

const cellKey = (x: number, y: number) => `${x},${y}`;

/** Antagonism (declared by either plant) beats companionship. Same plant => null. */
export function relationBetween(a: Plant, b: Plant): CompanionRelation | null {
  if (a.id === b.id) return null;
  if (a.antagonists.includes(b.id) || b.antagonists.includes(a.id)) return "antagonist";
  if (a.companions.includes(b.id) || b.companions.includes(a.id)) return "companion";
  return null;
}

/** Canonical pair: ids sorted so (a,b) and (b,a) are identical. */
function makePair(idA: string, idB: string, relation: CompanionRelation): CompanionPair {
  return idA < idB ? { a: idA, b: idB, relation } : { a: idB, b: idA, relation };
}

/** Plant ids in the 8 cells around (x, y), resolved to plants known to the catalog. */
function neighbourPlants(grid: ReadonlyMap<string, string>, x: number, y: number, catalog: PlantCatalog): Plant[] {
  const plants: Plant[] = [];
  for (const [dx, dy] of NEIGHBOUR_OFFSETS) {
    const id = grid.get(cellKey(x + dx, y + dy));
    const plant = id === undefined ? undefined : catalog.get(id);
    if (plant) plants.push(plant);
  }
  return plants;
}

function buildGrid(placements: readonly Placement[]): Map<string, string> {
  return new Map(placements.map((p) => [cellKey(p.x, p.y), p.plantId]));
}

/** Evaluates every neighbouring plant pair in a bed (8-connected adjacency). */
export function analyzeBed(bed: Bed, catalog: PlantCatalog): BedAnalysis {
  const grid = buildGrid(bed.placements);
  const pairsByKey = new Map<string, CompanionPair>();
  const cellStatus: Record<string, CellStatus> = {};

  for (const [key, plantId] of grid) {
    const plant = catalog.get(plantId);
    if (!plant) continue;
    const [x, y] = key.split(",").map(Number);
    let status: CellStatus = "neutral";
    for (const neighbour of neighbourPlants(grid, x, y, catalog)) {
      const relation = relationBetween(plant, neighbour);
      if (!relation) continue;
      const pair = makePair(plant.id, neighbour.id, relation);
      pairsByKey.set(`${pair.a}|${pair.b}`, pair);
      if (relation === "antagonist") status = "bad";
      else if (status === "neutral") status = "good";
    }
    cellStatus[key] = status;
  }

  const pairs = [...pairsByKey.values()].sort((p, q) => p.a.localeCompare(q.a) || p.b.localeCompare(q.b));
  return {
    pairs,
    conflicts: pairs.filter((p) => p.relation === "antagonist"),
    benefits: pairs.filter((p) => p.relation === "companion"),
    cellStatus,
  };
}

/**
 * Catalog plants that are companions of `plant` (declared by either side),
 * excluding antagonists. Mutual companions first, then by name.
 */
export function suggestCompanions(plant: Plant, catalog: PlantCatalog, limit = 8): Plant[] {
  const mutual = (other: Plant) => plant.companions.includes(other.id) && other.companions.includes(plant.id);
  return catalog
    .all()
    .filter((other) => relationBetween(plant, other) === "companion")
    .sort((a, b) => Number(mutual(b)) - Number(mutual(a)) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Square-foot-gardening density: plants are laid out on a grid, so a cell holds
 * floor(cell / spacing)² plants (3" → 16, 4" → 9, 5" → 4, 6" → 4, 8" → 1).
 * A plant spaced wider than the cell needs a square block of ceil(spacing / cell)² cells.
 */
export function plantsPerCell(plant: Plant, cellSizeInches: number): PlantsPerCell {
  const spacing = plant.spacingInches;
  if (!(spacing > 0) || !(cellSizeInches > 0)) return { perCell: 1, cellsNeeded: 1 };
  if (spacing <= cellSizeInches) {
    // Plants sit on a grid: whole plants per row, squared. (Small epsilon guards float error.)
    const perRow = Math.max(1, Math.floor(cellSizeInches / spacing + 1e-9));
    return { perCell: perRow * perRow, cellsNeeded: 1 };
  }
  const span = Math.ceil(spacing / cellSizeInches);
  return { perCell: 1, cellsNeeded: span * span };
}

/** Antagonist pairs that would form if `plantId` were placed at (x, y) in the bed. */
export function placementConflicts(
  bed: Bed,
  plantId: string,
  x: number,
  y: number,
  catalog: PlantCatalog,
): CompanionPair[] {
  const plant = catalog.get(plantId);
  if (!plant) return [];
  const grid = buildGrid(bed.placements.filter((p) => !(p.x === x && p.y === y)));
  const conflicts = new Map<string, CompanionPair>();
  for (const neighbour of neighbourPlants(grid, x, y, catalog)) {
    if (relationBetween(plant, neighbour) !== "antagonist") continue;
    const pair = makePair(plant.id, neighbour.id, "antagonist");
    conflicts.set(`${pair.a}|${pair.b}`, pair);
  }
  return [...conflicts.values()];
}
