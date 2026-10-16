/** Pure mapping from the plant library's UI state to `PlantFilters`, plus sorting. */
import type { PlantFilters } from "@/domain/filters";
import type {
  Difficulty,
  GardenGoal,
  GardenProfile,
  GardenSetting,
  Plant,
  PlantCategory,
  SunExposure,
  WaterNeed,
} from "@/domain/types";
import { DIFFICULTIES } from "@/domain/types";

export type LibrarySort = "name" | "difficulty" | "match";

export interface LibraryState {
  query: string;
  categories: PlantCategory[];
  sun: SunExposure[];
  water: WaterNeed[];
  difficulty: Difficulty[];
  environment: GardenSetting | "";
  containerOnly: boolean;
  edibleOnly: boolean;
  /** Only plants that are non-toxic to the active garden's pets. */
  petSafe: boolean;
  /** Hide plants containing allergens the active garden's household reacts to. */
  excludeMyAllergens: boolean;
  zone: number | null;
  goals: GardenGoal[];
  sort: LibrarySort;
}

export const DEFAULT_LIBRARY_STATE: LibraryState = {
  query: "",
  categories: [],
  sun: [],
  water: [],
  difficulty: [],
  environment: "",
  containerOnly: false,
  edibleOnly: false,
  petSafe: false,
  excludeMyAllergens: false,
  zone: null,
  goals: [],
  sort: "name",
};

/** Builds `PlantFilters`; the personal toggles need a garden profile and are ignored without one. */
export function toPlantFilters(state: LibraryState, profile: GardenProfile | null): PlantFilters {
  const filters: PlantFilters = {};
  const query = state.query.trim();
  if (query) filters.query = query;
  if (state.categories.length) filters.categories = state.categories;
  if (state.sun.length) filters.sun = state.sun;
  if (state.water.length) filters.water = state.water;
  if (state.difficulty.length) filters.difficulty = state.difficulty;
  if (state.environment) filters.environment = state.environment;
  if (state.containerOnly) filters.containerOnly = true;
  if (state.edibleOnly) filters.edibleOnly = true;
  if (state.petSafe && profile?.pets.length) filters.petSafeFor = profile.pets;
  if (state.excludeMyAllergens && profile?.allergies.length) filters.excludeAllergens = profile.allergies;
  if (state.zone !== null) filters.zone = state.zone;
  if (state.goals.length) filters.goals = state.goals;
  return filters;
}

/** Number of filter criteria in use (sorting excluded) — for the "Clear filters" affordance. */
export function countActiveFilters(state: LibraryState): number {
  return Object.entries(state).filter(
    ([key, v]) => key !== "sort" && (Array.isArray(v) ? v.length > 0 : v !== "" && v !== false && v !== null),
  ).length;
}

/** Returns a sorted copy. `scoreOf` is only consulted for the "match" sort. */
export function sortPlants(plants: readonly Plant[], sort: LibrarySort, scoreOf: (plant: Plant) => number): Plant[] {
  const byName = (a: Plant, b: Plant) => a.name.localeCompare(b.name);
  const sorted = [...plants];
  switch (sort) {
    case "difficulty":
      return sorted.sort(
        (a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty) || byName(a, b),
      );
    case "match": {
      const scores = new Map(sorted.map((p) => [p.id, scoreOf(p)]));
      return sorted.sort((a, b) => scores.get(b.id)! - scores.get(a.id)! || byName(a, b));
    }
    default:
      return sorted.sort(byName);
  }
}
