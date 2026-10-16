import type { Plant, PlantCatalog } from "./types";

/**
 * Combines built-in and user-created plants into one read-only catalog.
 * Custom plants override built-ins that share an id.
 */
export function createPlantCatalog(builtin: readonly Plant[], custom: readonly Plant[] = []): PlantCatalog {
  const byId = new Map<string, Plant>();
  for (const plant of builtin) byId.set(plant.id, plant);
  for (const plant of custom) byId.set(plant.id, { ...plant, custom: true });
  const plants = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));

  return {
    all: () => plants,
    get: (id) => byId.get(id),
  };
}
