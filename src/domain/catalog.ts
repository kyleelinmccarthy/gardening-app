import type { Plant, PlantCatalog } from "./types";

type RelationKey = "companions" | "antagonists";

/** An id -> related-ids map seeded from each plant's own list, in declaration order. */
function collectRelations(plants: readonly Plant[], key: RelationKey, known: ReadonlySet<string>) {
  const related = new Map<string, Set<string>>(plants.map((p) => [p.id, new Set<string>()]));
  const own = (plant: Plant) => plant[key].filter((id) => known.has(id) && id !== plant.id);
  for (const plant of plants) for (const id of own(plant)) related.get(plant.id)!.add(id);
  // Mirror every relation so both sides agree.
  for (const plant of plants) for (const id of own(plant)) related.get(id)!.add(plant.id);
  return related;
}

/**
 * Makes companion/antagonist lists symmetric: if A lists B, B lists A. A pair
 * declared both ways is an antagonist pair (antagonism wins). Ids that are not
 * in the catalog and self references are dropped. Returns new plant objects.
 */
function normalizeRelations(plants: readonly Plant[]): Plant[] {
  const known = new Set(plants.map((p) => p.id));
  const antagonists = collectRelations(plants, "antagonists", known);
  const companions = collectRelations(plants, "companions", known);
  return plants.map((plant) => {
    const foes = antagonists.get(plant.id)!;
    return {
      ...plant,
      antagonists: [...foes],
      companions: [...companions.get(plant.id)!].filter((id) => !foes.has(id)),
    };
  });
}

/**
 * Combines built-in and user-created plants into one read-only catalog.
 * Custom plants override built-ins that share an id. Companion and antagonist
 * relations are normalized to be symmetric across the catalog (the source data
 * may declare them one-way).
 */
export function createPlantCatalog(builtin: readonly Plant[], custom: readonly Plant[] = []): PlantCatalog {
  const byId = new Map<string, Plant>();
  for (const plant of builtin) byId.set(plant.id, plant);
  for (const plant of custom) byId.set(plant.id, { ...plant, custom: true });
  const normalized = normalizeRelations([...byId.values()]);
  const plants = [...normalized].sort((a, b) => a.name.localeCompare(b.name));
  const normalizedById = new Map(normalized.map((p) => [p.id, p]));

  return {
    all: () => plants,
    get: (id) => normalizedById.get(id),
  };
}
