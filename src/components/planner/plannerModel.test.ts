import { createPlantCatalog } from "@/domain/catalog";
import { makeBed, makePlant } from "@/test/fixtures";
import {
  bedToFormValues,
  buildPalette,
  cellLabel,
  conflictWarning,
  defaultBedValues,
  densityHint,
  describePair,
  parseBedForm,
  shortName,
  summarizePlacements,
  sunMismatch,
  sunWarning,
} from "./plannerModel";

const tomato = makePlant({ id: "tomato", name: "Tomato", companions: ["basil"], antagonists: ["fennel"], companionNotes: "Basil repels pests." });
const basil = makePlant({ id: "basil", name: "Basil", companions: ["tomato"], sun: ["full-sun", "partial-sun"], spacingInches: 6 });
const fennel = makePlant({ id: "fennel", name: "Fennel", scientificName: "Foeniculum vulgare", antagonists: ["tomato"] });
const catalog = createPlantCatalog([tomato, basil, fennel]);

describe("buildPalette", () => {
  const input = {
    allPlants: catalog.all(),
    gardenPlantIds: ["tomato", "unknown"],
    recommended: [basil, tomato],
    query: "",
  };

  it("groups plants once each: garden, recommended, then the rest", () => {
    const sections = buildPalette(input);
    expect(sections.map((s) => s.id)).toEqual(["garden", "recommended", "all"]);
    expect(sections.map((s) => s.title)).toEqual(["In your garden", "Recommended for you", "All plants"]);
    expect(sections[0].plants.map((p) => p.id)).toEqual(["tomato"]);
    expect(sections[1].plants.map((p) => p.id)).toEqual(["basil"]);
    expect(sections[2].plants.map((p) => p.id)).toEqual(["fennel"]);
  });

  it("filters by name or scientific name (case-insensitive) and omits empty sections", () => {
    expect(buildPalette({ ...input, query: "FENN" }).map((s) => s.id)).toEqual(["all"]);
    expect(buildPalette({ ...input, query: "foeniculum" })[0].plants[0].id).toBe("fennel");
    expect(buildPalette({ ...input, query: "zzz" })).toEqual([]);
  });
});

describe("cell and plant labels", () => {
  it("cellLabel is 1-based with row first", () => {
    expect(cellLabel(2, 1, tomato)).toBe("Row 2, column 3: Tomato");
    expect(cellLabel(0, 0)).toBe("Row 1, column 1: empty");
  });

  it("shortName truncates long names", () => {
    expect(shortName("Basil")).toBe("Basil");
    expect(shortName("Cherry Tomato", 8)).toBe("Cherry …");
  });
});

describe("sun checks", () => {
  it("detects a sun mismatch", () => {
    expect(sunMismatch(makeBed({ sun: "full-sun" }), tomato)).toBe(false);
    expect(sunMismatch(makeBed({ sun: "full-shade" }), tomato)).toBe(true);
  });

  it("explains the mismatch, or returns null", () => {
    expect(sunWarning(makeBed({ sun: "full-sun" }), tomato)).toBeNull();
    expect(sunWarning(makeBed({ sun: "full-shade" }), tomato)).toMatch(/Tomato prefers full sun.*full shade/i);
  });
});

describe("conflictWarning", () => {
  it("names the neighbouring plants", () => {
    const pairs = [{ a: "fennel", b: "tomato", relation: "antagonist" as const }];
    expect(conflictWarning(pairs, fennel, catalog)).toBe("Fennel conflicts with Tomato next to it");
  });

  it("is null without conflicts", () => {
    expect(conflictWarning([], fennel, catalog)).toBeNull();
  });
});

describe("densityHint", () => {
  it("reports plants per square", () => {
    expect(densityHint(basil, 12)).toBe("4 per square");
    expect(densityHint(makePlant({ spacingInches: 12 }), 12)).toBe("1 per square");
  });

  it("reports multi-square plants", () => {
    expect(densityHint(tomato, 12)).toBe("needs 2×2 squares");
  });
});

describe("describePair", () => {
  it("returns names and the first available note", () => {
    const d = describePair({ a: "basil", b: "tomato", relation: "companion" }, catalog);
    expect(d.names).toEqual(["Basil", "Tomato"]);
    expect(d.note).toBe("Basil repels pests.");
    expect(describePair({ a: "basil", b: "fennel", relation: "antagonist" }, catalog).note).toBeUndefined();
  });
});

describe("summarizePlacements", () => {
  it("counts plants, most numerous first", () => {
    const bed = makeBed({
      placements: [
        { plantId: "basil", x: 0, y: 0 },
        { plantId: "tomato", x: 1, y: 0 },
        { plantId: "basil", x: 2, y: 0 },
        { plantId: "ghost", x: 3, y: 0 },
      ],
    });
    expect(summarizePlacements(bed, catalog).map((s) => [s.plant.id, s.count])).toEqual([
      ["basil", 2],
      ["tomato", 1],
    ]);
  });
});

describe("bed form", () => {
  it("defaults by setting", () => {
    expect(defaultBedValues("indoor", "partial-sun").kind).toBe("windowsill");
    expect(defaultBedValues("outdoor", "full-sun")).toMatchObject({ kind: "raised-bed", cellSizeInches: "12", sun: "full-sun" });
  });

  it("round-trips a bed to form values", () => {
    expect(bedToFormValues(makeBed({ name: "A", columns: 3, rows: 2, cellSizeInches: 6 }))).toMatchObject({
      name: "A",
      columns: "3",
      rows: "2",
      cellSizeInches: "6",
    });
  });

  it("parses valid values", () => {
    const result = parseBedForm({ ...defaultBedValues("outdoor", "full-sun"), name: "  Herbs " });
    expect(result).toEqual({
      ok: true,
      value: { name: "Herbs", kind: "raised-bed", columns: 4, rows: 4, cellSizeInches: 12, sun: "full-sun" },
    });
  });

  it("reports errors for bad values", () => {
    const result = parseBedForm({ ...defaultBedValues("outdoor", "full-sun"), name: " ", columns: "0", rows: "21", cellSizeInches: "-1" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["cellSizeInches", "columns", "name", "rows"]);
  });

  it("rejects non-integer columns", () => {
    const result = parseBedForm({ ...defaultBedValues("outdoor", "full-sun"), name: "x", columns: "2.5" });
    expect(result.ok).toBe(false);
  });
});
