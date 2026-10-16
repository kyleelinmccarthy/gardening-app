import { createDefaultProfile } from "@/domain/defaults";
import { makePlant } from "@/test/fixtures";
import {
  countActiveFilters,
  DEFAULT_LIBRARY_STATE,
  sortPlants,
  toPlantFilters,
  type LibraryState,
} from "./libraryFilters";

const state = (changes: Partial<LibraryState>): LibraryState => ({ ...DEFAULT_LIBRARY_STATE, ...changes });
const profile = createDefaultProfile({ pets: ["cat", "dog"], allergies: ["pollen"] });

describe("toPlantFilters", () => {
  it("maps nothing for the default state", () => {
    expect(toPlantFilters(DEFAULT_LIBRARY_STATE, null)).toEqual({});
  });

  it("maps simple fields straight through", () => {
    const filters = toPlantFilters(
      state({
        query: "  tomato ",
        categories: ["herb"],
        sun: ["full-sun"],
        water: ["low"],
        difficulty: ["easy"],
        environment: "indoor",
        containerOnly: true,
        edibleOnly: true,
        zone: 6,
        goals: ["edible"],
      }),
      null,
    );
    expect(filters).toEqual({
      query: "tomato",
      categories: ["herb"],
      sun: ["full-sun"],
      water: ["low"],
      difficulty: ["easy"],
      environment: "indoor",
      containerOnly: true,
      edibleOnly: true,
      zone: 6,
      goals: ["edible"],
    });
  });

  it("uses the active garden's pets and allergies for the personal toggles", () => {
    const filters = toPlantFilters(state({ petSafe: true, excludeMyAllergens: true }), profile);
    expect(filters.petSafeFor).toEqual(["cat", "dog"]);
    expect(filters.excludeAllergens).toEqual(["pollen"]);
  });

  it("ignores the personal toggles without a garden", () => {
    const filters = toPlantFilters(state({ petSafe: true, excludeMyAllergens: true }), null);
    expect(filters.petSafeFor).toBeUndefined();
    expect(filters.excludeAllergens).toBeUndefined();
  });
});

describe("countActiveFilters", () => {
  it("counts each active criterion once and ignores sort", () => {
    expect(countActiveFilters(DEFAULT_LIBRARY_STATE)).toBe(0);
    expect(countActiveFilters(state({ sort: "difficulty" }))).toBe(0);
    expect(
      countActiveFilters(state({ query: "x", categories: ["herb", "fruit"], petSafe: true, zone: 5, environment: "indoor" })),
    ).toBe(5);
  });
});

describe("sortPlants", () => {
  const a = makePlant({ id: "a", name: "Aloe", difficulty: "challenging" });
  const b = makePlant({ id: "b", name: "Basil", difficulty: "easy" });
  const c = makePlant({ id: "c", name: "Chive", difficulty: "easy" });

  it("sorts by name", () => {
    expect(sortPlants([c, a, b], "name", () => 0).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by difficulty then name", () => {
    expect(sortPlants([a, c, b], "difficulty", () => 0).map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by match score descending, then name, without mutating the input", () => {
    const scores: Record<string, number> = { a: 40, b: 90, c: 90 };
    const input = [a, c, b];
    expect(sortPlants(input, "match", (p) => scores[p.id]).map((p) => p.id)).toEqual(["b", "c", "a"]);
    expect(input.map((p) => p.id)).toEqual(["a", "c", "b"]);
  });
});
