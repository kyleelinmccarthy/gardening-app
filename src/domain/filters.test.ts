import { describe, expect, it } from "vitest";
import { filterPlants } from "./filters";
import { makePlant } from "./test-fixtures";

const basil = makePlant({
  id: "basil",
  name: "Basil",
  scientificName: "Ocimum basilicum",
  description: "Fragrant culinary herb",
  category: "herb",
  sun: ["full-sun"],
  water: "moderate",
  difficulty: "easy",
  environments: ["indoor", "outdoor"],
  hardinessZones: { min: 4, max: 11 },
  goals: ["edible", "fragrance"],
});
const lily = makePlant({
  id: "lily",
  name: "Peace Lily",
  scientificName: "Spathiphyllum wallisii",
  description: "Glossy houseplant with white blooms",
  category: "houseplant",
  edible: false,
  sun: ["full-shade"],
  water: "high",
  difficulty: "moderate",
  environments: ["indoor"],
  container: { suitable: true, minGallons: 2 },
  lifeCycle: "perennial",
  hardinessZones: { min: 10, max: 12 },
  allergens: ["pollen"],
  goals: ["air-purifying", "ornamental"],
  toxicity: {
    cat: "moderate",
    dog: "moderate",
    horse: "moderate",
    bird: "moderate",
    rabbit: "moderate",
    human: "mild",
  },
});
const oak = makePlant({
  id: "oak",
  name: "Oak Tree",
  scientificName: "Quercus robur",
  description: "Large shade tree",
  category: "fruit",
  edible: false,
  sun: ["full-sun", "partial-sun"],
  water: "low",
  difficulty: "challenging",
  environments: ["outdoor"],
  container: { suitable: false },
  lifeCycle: "perennial",
  hardinessZones: { min: 3, max: 8 },
  goals: ["ornamental"],
});
const all = [basil, lily, oak];
const ids = (plants: { id: string }[]) => plants.map((p) => p.id);

describe("filterPlants", () => {
  it("returns every plant for empty filters", () => {
    expect(filterPlants(all, {})).toEqual(all);
  });

  it("treats empty arrays as no filter", () => {
    const filters = {
      categories: [],
      sun: [],
      water: [],
      difficulty: [],
      petSafeFor: [],
      excludeAllergens: [],
      goals: [],
    };
    expect(filterPlants(all, filters)).toEqual(all);
  });

  it("does not mutate the input", () => {
    const input = [...all];
    filterPlants(input, { query: "basil" });
    expect(input).toEqual(all);
  });

  describe("query", () => {
    it("matches name case-insensitively", () => {
      expect(ids(filterPlants(all, { query: "BASIL" }))).toEqual(["basil"]);
    });
    it("matches scientific name", () => {
      expect(ids(filterPlants(all, { query: "spathiphyllum" }))).toEqual(["lily"]);
    });
    it("matches description", () => {
      expect(ids(filterPlants(all, { query: "shade tree" }))).toEqual(["oak"]);
    });
    it("requires all whitespace-separated terms to match, in any field", () => {
      expect(ids(filterPlants(all, { query: "lily glossy" }))).toEqual(["lily"]);
      expect(ids(filterPlants(all, { query: "lily culinary" }))).toEqual([]);
    });
    it("ignores blank and padded queries", () => {
      expect(filterPlants(all, { query: "   " })).toEqual(all);
      expect(ids(filterPlants(all, { query: "  oak  " }))).toEqual(["oak"]);
    });
  });

  it("filters by category", () => {
    expect(ids(filterPlants(all, { categories: ["herb", "fruit"] }))).toEqual(["basil", "oak"]);
  });

  it("filters by sun when the plant tolerates any selected exposure", () => {
    expect(ids(filterPlants(all, { sun: ["full-shade"] }))).toEqual(["lily"]);
    expect(ids(filterPlants(all, { sun: ["partial-sun", "full-shade"] }))).toEqual(["lily", "oak"]);
  });

  it("filters by water need", () => {
    expect(ids(filterPlants(all, { water: ["low", "high"] }))).toEqual(["lily", "oak"]);
  });

  it("filters by difficulty", () => {
    expect(ids(filterPlants(all, { difficulty: ["easy"] }))).toEqual(["basil"]);
  });

  it("filters by environment", () => {
    expect(ids(filterPlants(all, { environment: "indoor" }))).toEqual(["basil", "lily"]);
    expect(ids(filterPlants(all, { environment: "outdoor" }))).toEqual(["basil", "oak"]);
  });

  it("filters container-suitable plants only", () => {
    expect(ids(filterPlants(all, { containerOnly: true }))).toEqual(["basil", "lily"]);
    expect(filterPlants(all, { containerOnly: false })).toEqual(all);
  });

  it("filters edible plants only", () => {
    expect(ids(filterPlants(all, { edibleOnly: true }))).toEqual(["basil"]);
  });

  it("filters plants safe for all listed pets", () => {
    expect(ids(filterPlants(all, { petSafeFor: ["cat", "dog"] }))).toEqual(["basil", "oak"]);
  });

  it("excludes plants carrying any listed allergen", () => {
    expect(ids(filterPlants(all, { excludeAllergens: ["pollen"] }))).toEqual(["basil", "oak"]);
    expect(filterPlants(all, { excludeAllergens: ["latex"] })).toEqual(all);
  });

  it("filters by hardiness zone inclusively", () => {
    expect(ids(filterPlants(all, { zone: 4 }))).toEqual(["basil", "oak"]);
    expect(ids(filterPlants(all, { zone: 10 }))).toEqual(["basil", "lily"]);
    expect(ids(filterPlants(all, { zone: 8 }))).toEqual(["basil", "oak"]);
    expect(ids(filterPlants(all, { zone: 1 }))).toEqual(["basil"]);
  });

  it("never excludes annuals by zone", () => {
    expect(ids(filterPlants(all, { zone: 13 }))).toEqual(["basil"]);
    expect(ids(filterPlants(all, { zone: 2 }))).toEqual(["basil"]);
  });

  it("filters by goals when the plant serves any selected goal", () => {
    expect(ids(filterPlants(all, { goals: ["fragrance", "air-purifying"] }))).toEqual(["basil", "lily"]);
  });

  it("combines criteria with AND", () => {
    expect(ids(filterPlants(all, { environment: "indoor", edibleOnly: true, query: "herb" }))).toEqual(["basil"]);
    expect(filterPlants(all, { environment: "indoor", categories: ["fruit"] })).toEqual([]);
  });
});
