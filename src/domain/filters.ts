import { isPetSafe } from "./safety";
import { zoneSupports } from "./zones";
import type {
  Allergen,
  Difficulty,
  GardenGoal,
  GardenSetting,
  Pet,
  Plant,
  PlantCategory,
  SunExposure,
  WaterNeed,
} from "./types";

export interface PlantFilters {
  /** Free text; every whitespace-separated term must appear in name, scientific name or description. */
  query?: string;
  categories?: PlantCategory[];
  sun?: SunExposure[];
  water?: WaterNeed[];
  difficulty?: Difficulty[];
  environment?: GardenSetting;
  containerOnly?: boolean;
  edibleOnly?: boolean;
  petSafeFor?: Pet[];
  excludeAllergens?: Allergen[];
  /** USDA hardiness zone; only perennials are excluded by it (see `zoneSupports`). */
  zone?: number;
  goals?: GardenGoal[];
}

type Predicate = (plant: Plant) => boolean;

/** An undefined or empty list means "no restriction". */
const isActive = <T>(list: readonly T[] | undefined): list is readonly T[] => !!list && list.length > 0;

function matchesQuery(query: string): Predicate {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (plant) => {
    const haystack = `${plant.name} ${plant.scientificName} ${plant.description}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  };
}

/** Builds the predicates for every criterion that is actually set. */
function buildPredicates(f: PlantFilters): Predicate[] {
  const predicates: Predicate[] = [];
  if (f.query?.trim()) predicates.push(matchesQuery(f.query));
  if (isActive(f.categories)) predicates.push((p) => f.categories!.includes(p.category));
  if (isActive(f.sun)) predicates.push((p) => p.sun.some((s) => f.sun!.includes(s)));
  if (isActive(f.water)) predicates.push((p) => f.water!.includes(p.water));
  if (isActive(f.difficulty)) predicates.push((p) => f.difficulty!.includes(p.difficulty));
  if (f.environment) predicates.push((p) => p.environments.includes(f.environment!));
  if (f.containerOnly) predicates.push((p) => p.container.suitable);
  if (f.edibleOnly) predicates.push((p) => p.edible);
  if (isActive(f.petSafeFor)) predicates.push((p) => isPetSafe(p, f.petSafeFor!));
  if (isActive(f.excludeAllergens)) predicates.push((p) => !p.allergens.some((a) => f.excludeAllergens!.includes(a)));
  if (f.zone !== undefined) predicates.push((p) => zoneSupports(p, f.zone!));
  if (isActive(f.goals)) predicates.push((p) => p.goals.some((g) => f.goals!.includes(g)));
  return predicates;
}

/** Returns the plants matching every active criterion, preserving input order. */
export function filterPlants(plants: Plant[], filters: PlantFilters): Plant[] {
  const predicates = buildPredicates(filters);
  return plants.filter((plant) => predicates.every((matches) => matches(plant)));
}
