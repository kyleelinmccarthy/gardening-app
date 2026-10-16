import { describe, expect, it } from "vitest";
import { PLANT_CATEGORIES } from "@/domain/types";
import { BUILTIN_PLANTS } from "@/data/plants";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ids = new Set(BUILTIN_PLANTS.map((p) => p.id));

/** Run `check` for each plant; collect "<id>: <problem>" for readable failures. */
function problems(check: (p: (typeof BUILTIN_PLANTS)[number]) => string | null): string[] {
  return BUILTIN_PLANTS.flatMap((p) => {
    const msg = check(p);
    return msg ? [`${p.id}: ${msg}`] : [];
  });
}

describe("BUILTIN_PLANTS integrity", () => {
  it("has at least 100 plants", () => {
    expect(BUILTIN_PLANTS.length).toBeGreaterThanOrEqual(100);
  });

  it("represents every category", () => {
    const present = new Set(BUILTIN_PLANTS.map((p) => p.category));
    for (const c of PLANT_CATEGORIES) expect(present.has(c), `category ${c}`).toBe(true);
  });

  it("has unique ids", () => {
    const seen = new Set<string>();
    const dupes = BUILTIN_PLANTS.filter((p) => seen.size === seen.add(p.id).size).map((p) => p.id);
    expect(dupes).toEqual([]);
  });

  it("uses kebab-case ids", () => {
    expect(problems((p) => (KEBAB.test(p.id) ? null : "id is not kebab-case"))).toEqual([]);
  });

  it("only references existing companion/antagonist ids", () => {
    expect(
      problems((p) => {
        const missing = [...p.companions, ...p.antagonists].filter((id) => !ids.has(id));
        return missing.length ? `unknown references: ${missing.join(", ")}` : null;
      }),
    ).toEqual([]);
  });

  it("never lists a plant as both companion and antagonist", () => {
    expect(
      problems((p) => {
        const both = p.companions.filter((id) => p.antagonists.includes(id));
        return both.length ? `both companion and antagonist: ${both.join(", ")}` : null;
      }),
    ).toEqual([]);
  });

  it("never lists itself as companion or antagonist", () => {
    expect(
      problems((p) =>
        p.companions.includes(p.id) || p.antagonists.includes(p.id) ? "references itself" : null,
      ),
    ).toEqual([]);
  });

  it("has ordered temperature thresholds (minF <= idealMinF <= idealMaxF <= maxF)", () => {
    expect(
      problems((p) => {
        const t = p.temperature;
        return t.minF <= t.idealMinF && t.idealMinF <= t.idealMaxF && t.idealMaxF <= t.maxF
          ? null
          : `temperature out of order ${JSON.stringify(t)}`;
      }),
    ).toEqual([]);
  });

  it("has a sensible soil pH range within 3.5-9", () => {
    expect(
      problems(({ soil }) =>
        soil.phMin < soil.phMax && soil.phMin >= 3.5 && soil.phMax <= 9
          ? null
          : `bad pH range ${soil.phMin}-${soil.phMax}`,
      ),
    ).toEqual([]);
  });

  it("has soil types listed", () => {
    expect(problems((p) => (p.soil.types.length > 0 ? null : "no soil types"))).toEqual([]);
  });

  it("has hardiness zones within 1-13 and min <= max", () => {
    expect(
      problems(({ hardinessZones: z }) =>
        z.min >= 1 && z.max <= 13 && z.min <= z.max ? null : `bad zones ${z.min}-${z.max}`,
      ),
    ).toEqual([]);
  });

  it("has a positive wateringIntervalDays", () => {
    expect(
      problems((p) => (p.wateringIntervalDays > 0 ? null : `wateringIntervalDays=${p.wateringIntervalDays}`)),
    ).toEqual([]);
  });

  it("gives indoor-capable plants indoorLight", () => {
    expect(
      problems((p) =>
        p.environments.includes("indoor") && !(p.indoorLight && p.indoorLight.length > 0)
          ? "indoor plant without indoorLight"
          : null,
      ),
    ).toEqual([]);
  });

  it("has at least one environment and sun exposure", () => {
    expect(
      problems((p) => (p.environments.length > 0 && p.sun.length > 0 ? null : "missing environments or sun")),
    ).toEqual([]);
  });

  it("gives suitable containers a positive minGallons", () => {
    expect(
      problems((p) =>
        p.container.suitable && !((p.container.minGallons ?? 0) > 0)
          ? "container.suitable without minGallons > 0"
          : null,
      ),
    ).toEqual([]);
  });

  it("has non-empty description and careTips", () => {
    expect(
      problems((p) =>
        p.description.trim() === "" || p.careTips.length === 0 ? "missing description or careTips" : null,
      ),
    ).toEqual([]);
  });

  // Note: companion/antagonist symmetry is intentionally NOT required in the data;
  // createPlantCatalog normalizes the relations for consumers.
});

describe("BUILTIN_PLANTS toxicity calibration", () => {
  const get = (id: string) => BUILTIN_PLANTS.find((p) => p.id === id)!;
  const PET_SPECIES = ["cat", "dog", "bird", "rabbit"] as const;

  it("rates calcium-oxalate aroids mild for small pets (irritating, self-limiting: a warning, not a blocker)", () => {
    for (const id of ["pothos", "peace-lily", "monstera", "zz-plant", "heartleaf-philodendron", "chinese-evergreen"]) {
      for (const pet of PET_SPECIES) expect(get(id).toxicity[pet], `${id} ${pet}`).toBe("mild");
      expect(get(id).toxicity.notes, id).toMatch(/out of reach/i);
    }
  });

  it("rates dracaena mild for cats and dogs (ASPCA: vomiting, dilated pupils)", () => {
    expect(get("dracaena").toxicity.cat).toBe("mild");
    expect(get("dracaena").toxicity.dog).toBe("mild");
  });

  it("keeps english ivy moderate (saponins: vomiting, diarrhea, hypersalivation)", () => {
    expect(get("english-ivy").toxicity.cat).toBe("moderate");
  });

  it("rates edible crops by the part people handle and eat, not the toxic foliage", () => {
    const edible = ["tomato", "cherry-tomato", "eggplant", "hot-pepper", "potato", "bush-bean", "pole-bean", "asparagus", "dwarf-apple", "fig"];
    for (const id of edible) expect(["non-toxic", "mild"], id).toContain(get(id).toxicity.human);
    expect(get("rhubarb").toxicity.human).toBe("moderate");
    expect(get("borage").toxicity.human).toBe("mild");
  });

  it("rates every allium moderate for cats and dogs, noting cats are more sensitive", () => {
    const alliums = BUILTIN_PLANTS.filter((p) => p.scientificName.startsWith("Allium"));
    expect(alliums.map((p) => p.id).sort()).toEqual(["chives", "garlic", "leek", "onion"]);
    for (const p of alliums) {
      expect(p.toxicity.cat, p.id).toBe("moderate");
      expect(p.toxicity.dog, p.id).toBe("moderate");
      expect(p.toxicity.notes, p.id).toMatch(/cats/i);
    }
  });
});
