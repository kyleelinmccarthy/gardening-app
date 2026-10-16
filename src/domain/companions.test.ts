import { describe, expect, it } from "vitest";
import { analyzeBed, crowdingIssues, footprintSpan, placementConflicts, plantsPerCell, relationBetween, suggestCompanions } from "./companions";
import { createPlantCatalog } from "./catalog";
import { makeBed, makePlant } from "@/test/fixtures";

const tomato = makePlant({ id: "tomato", name: "Tomato", companions: ["basil", "carrot"], antagonists: ["fennel"] });
const basil = makePlant({ id: "basil", name: "Basil", companions: ["tomato"] });
const carrot = makePlant({ id: "carrot", name: "Carrot" }); // listed by tomato only (one-directional)
const fennel = makePlant({ id: "fennel", name: "Fennel", antagonists: ["tomato"] });
const marigold = makePlant({ id: "marigold", name: "Marigold", companions: ["tomato"] });
const lettuce = makePlant({ id: "lettuce", name: "Lettuce" });
const catalog = createPlantCatalog([tomato, basil, carrot, fennel, marigold, lettuce]);

describe("relationBetween", () => {
  it("returns companion when either side lists the other", () => {
    expect(relationBetween(tomato, basil)).toBe("companion");
    expect(relationBetween(carrot, tomato)).toBe("companion"); // only tomato lists carrot
  });

  it("returns antagonist when either side lists the other", () => {
    expect(relationBetween(tomato, fennel)).toBe("antagonist");
    expect(relationBetween(fennel, tomato)).toBe("antagonist");
    const oneWay = makePlant({ id: "x", antagonists: ["lettuce"] });
    expect(relationBetween(lettuce, oneWay)).toBe("antagonist");
  });

  it("gives antagonist precedence over companion", () => {
    const a = makePlant({ id: "a", companions: ["b"] });
    const b = makePlant({ id: "b", antagonists: ["a"] });
    expect(relationBetween(a, b)).toBe("antagonist");
    expect(relationBetween(b, a)).toBe("antagonist");
  });

  it("returns null for unrelated plants and for a plant with itself", () => {
    expect(relationBetween(tomato, lettuce)).toBeNull();
    expect(relationBetween(tomato, tomato)).toBeNull();
  });
});

describe("analyzeBed", () => {
  it("returns empty results for an empty bed", () => {
    expect(analyzeBed(makeBed(), catalog)).toEqual({ pairs: [], conflicts: [], benefits: [], cellStatus: {} });
  });

  it("detects benefits between horizontally, vertically and diagonally adjacent plants", () => {
    for (const [bx, by] of [[1, 0], [0, 1], [1, 1]]) {
      const bed = makeBed({
        placements: [
          { plantId: "tomato", x: 0, y: 0 },
          { plantId: "basil", x: bx, y: by },
        ],
      });
      const result = analyzeBed(bed, catalog);
      expect(result.benefits).toEqual([{ a: "basil", b: "tomato", relation: "companion" }]);
      expect(result.cellStatus).toEqual({ "0,0": "good", [`${bx},${by}`]: "good" });
    }
  });

  it("ignores plants that are not adjacent", () => {
    const bed = makeBed({
      placements: [
        { plantId: "tomato", x: 0, y: 0 },
        { plantId: "basil", x: 2, y: 0 },
      ],
    });
    const result = analyzeBed(bed, catalog);
    expect(result.pairs).toEqual([]);
    expect(result.cellStatus).toEqual({ "0,0": "neutral", "2,0": "neutral" });
  });

  it("detects conflicts and marks both cells bad", () => {
    const bed = makeBed({
      placements: [
        { plantId: "tomato", x: 1, y: 1 },
        { plantId: "fennel", x: 2, y: 2 },
      ],
    });
    const result = analyzeBed(bed, catalog);
    expect(result.conflicts).toEqual([{ a: "fennel", b: "tomato", relation: "antagonist" }]);
    expect(result.benefits).toEqual([]);
    expect(result.cellStatus).toEqual({ "1,1": "bad", "2,2": "bad" });
  });

  it("reports each unordered pair once even with many adjacent cells", () => {
    const bed = makeBed({
      placements: [
        { plantId: "tomato", x: 0, y: 0 },
        { plantId: "tomato", x: 0, y: 1 },
        { plantId: "basil", x: 1, y: 0 },
        { plantId: "basil", x: 1, y: 1 },
      ],
    });
    const result = analyzeBed(bed, catalog);
    expect(result.pairs).toEqual([{ a: "basil", b: "tomato", relation: "companion" }]);
  });

  it("prefers bad over good when a cell has both kinds of neighbour", () => {
    const bed = makeBed({
      placements: [
        { plantId: "tomato", x: 1, y: 1 },
        { plantId: "basil", x: 0, y: 1 },
        { plantId: "fennel", x: 2, y: 1 },
      ],
    });
    const result = analyzeBed(bed, catalog);
    expect(result.cellStatus["1,1"]).toBe("bad");
    expect(result.cellStatus["0,1"]).toBe("good");
    expect(result.cellStatus["2,1"]).toBe("bad");
    expect(result.pairs).toHaveLength(2);
  });

  it("marks unrelated neighbours neutral and skips plants missing from the catalog", () => {
    const bed = makeBed({
      placements: [
        { plantId: "tomato", x: 0, y: 0 },
        { plantId: "lettuce", x: 1, y: 0 },
        { plantId: "ghost", x: 0, y: 1 },
      ],
    });
    const result = analyzeBed(bed, catalog);
    expect(result.pairs).toEqual([]);
    expect(result.cellStatus["0,0"]).toBe("neutral");
    expect(result.cellStatus["1,0"]).toBe("neutral");
  });

  it("does not treat two cells of the same plant as a pair", () => {
    const bed = makeBed({
      placements: [
        { plantId: "tomato", x: 0, y: 0 },
        { plantId: "tomato", x: 1, y: 0 },
      ],
    });
    expect(analyzeBed(bed, catalog).pairs).toEqual([]);
  });
});

describe("suggestCompanions", () => {
  it("lists companions in either direction and excludes antagonists and the plant itself", () => {
    const ids = suggestCompanions(tomato, catalog).map((p) => p.id);
    expect([...ids].sort()).toEqual(["basil", "carrot", "marigold"]);
  });

  it("puts mutual companions first, then sorts by name", () => {
    expect(suggestCompanions(tomato, catalog).map((p) => p.id)).toEqual(["basil", "carrot", "marigold"]);
  });

  it("excludes plants that are both companion and antagonist", () => {
    const a = makePlant({ id: "a", companions: ["b"] });
    const b = makePlant({ id: "b", antagonists: ["a"] });
    expect(suggestCompanions(a, createPlantCatalog([a, b]))).toEqual([]);
  });

  it("respects the limit", () => {
    expect(suggestCompanions(tomato, catalog, 2)).toHaveLength(2);
  });
});

describe("plantsPerCell", () => {
  const cell = 12;
  it("fits several small plants per square-foot cell", () => {
    expect(plantsPerCell(makePlant({ spacingInches: 3 }), cell)).toEqual({ perCell: 16, cellsNeeded: 1 });
    expect(plantsPerCell(makePlant({ spacingInches: 4 }), cell)).toEqual({ perCell: 9, cellsNeeded: 1 });
    expect(plantsPerCell(makePlant({ spacingInches: 6 }), cell)).toEqual({ perCell: 4, cellsNeeded: 1 });
  });

  it("lays plants out on a grid, so non-integer ratios do not overcount", () => {
    expect(plantsPerCell(makePlant({ spacingInches: 5 }), cell)).toEqual({ perCell: 4, cellsNeeded: 1 }); // 2 per row, not 5.76
    expect(plantsPerCell(makePlant({ spacingInches: 8 }), cell)).toEqual({ perCell: 1, cellsNeeded: 1 }); // 1 per row, not 2.25
    expect(plantsPerCell(makePlant({ spacingInches: 7 }), cell)).toEqual({ perCell: 1, cellsNeeded: 1 });
  });

  it("gives one plant per cell when spacing equals the cell", () => {
    expect(plantsPerCell(makePlant({ spacingInches: 12 }), cell)).toEqual({ perCell: 1, cellsNeeded: 1 });
  });

  it("needs several cells for widely spaced plants", () => {
    expect(plantsPerCell(makePlant({ spacingInches: 18 }), cell)).toEqual({ perCell: 1, cellsNeeded: 4 });
    expect(plantsPerCell(makePlant({ spacingInches: 36 }), cell)).toEqual({ perCell: 1, cellsNeeded: 9 });
  });

  it("scales with the cell size", () => {
    expect(plantsPerCell(makePlant({ spacingInches: 6 }), 6)).toEqual({ perCell: 1, cellsNeeded: 1 });
    expect(plantsPerCell(makePlant({ spacingInches: 6 }), 24)).toEqual({ perCell: 16, cellsNeeded: 1 });
  });

  it("tolerates invalid spacing", () => {
    expect(plantsPerCell(makePlant({ spacingInches: 0 }), cell)).toEqual({ perCell: 1, cellsNeeded: 1 });
  });
});

describe("placementConflicts", () => {
  const bed = makeBed({
    placements: [
      { plantId: "fennel", x: 1, y: 1 },
      { plantId: "basil", x: 3, y: 3 },
    ],
  });

  it("reports antagonists that would neighbour the new plant", () => {
    expect(placementConflicts(bed, "tomato", 0, 0, catalog)).toEqual([
      { a: "fennel", b: "tomato", relation: "antagonist" },
    ]);
    expect(placementConflicts(bed, "tomato", 2, 2, catalog)).toHaveLength(1);
  });

  it("returns nothing when no antagonist is adjacent", () => {
    expect(placementConflicts(bed, "tomato", 3, 2, catalog)).toEqual([]);
    expect(placementConflicts(bed, "tomato", 3, 0, catalog)).toEqual([]);
  });

  it("ignores companions", () => {
    expect(placementConflicts(bed, "tomato", 2, 3, catalog)).toEqual([]);
  });

  it("ignores whatever currently occupies the target cell", () => {
    expect(placementConflicts(bed, "tomato", 1, 1, catalog)).toEqual([]);
  });

  it("returns nothing for an unknown plant", () => {
    expect(placementConflicts(bed, "ghost", 0, 0, catalog)).toEqual([]);
  });

  it("deduplicates repeated neighbours of the same species", () => {
    const crowded = makeBed({
      placements: [
        { plantId: "fennel", x: 0, y: 0 },
        { plantId: "fennel", x: 0, y: 1 },
      ],
    });
    expect(placementConflicts(crowded, "tomato", 1, 0, catalog)).toHaveLength(1);
  });
});

describe("footprintSpan", () => {
  it("is the side, in cells, of the square block a plant needs", () => {
    expect(footprintSpan(makePlant({ spacingInches: 6 }), 12)).toBe(1);
    expect(footprintSpan(makePlant({ spacingInches: 12 }), 12)).toBe(1);
    expect(footprintSpan(makePlant({ spacingInches: 24 }), 12)).toBe(2);
    expect(footprintSpan(makePlant({ spacingInches: 30 }), 12)).toBe(3);
  });
});

describe("crowdingIssues", () => {
  const big = makePlant({ id: "squash", name: "Squash", spacingInches: 24 }); // needs 2x2 in 12" cells
  const huge = makePlant({ id: "pumpkin", name: "Pumpkin", spacingInches: 36 }); // needs 3x3
  const small = makePlant({ id: "radish", name: "Radish", spacingInches: 3 });
  const cat = createPlantCatalog([big, huge, small]);
  const bedWith = (...placements: [string, number, number][]) =>
    makeBed({ columns: 6, rows: 6, placements: placements.map(([plantId, x, y]) => ({ plantId, x, y })) });

  it("reports nothing for an empty bed or a lone large plant", () => {
    expect(crowdingIssues(makeBed(), cat)).toEqual([]);
    expect(crowdingIssues(bedWith(["squash", 1, 1]), cat)).toEqual([]);
  });

  it("flags a 2x2 plant with any other plant in an adjacent square", () => {
    const issues = crowdingIssues(bedWith(["squash", 1, 1], ["radish", 2, 2]), cat);
    expect(issues).toEqual([{ plantId: "squash", x: 1, y: 1, neighbours: [{ plantId: "radish", x: 2, y: 2 }] }]);
  });

  it("does not flag the small plant itself (it needs only one square)", () => {
    const issues = crowdingIssues(bedWith(["squash", 1, 1], ["radish", 2, 1]), cat);
    expect(issues.map((i) => i.plantId)).toEqual(["squash"]);
  });

  it("allows neighbours exactly the footprint away", () => {
    expect(crowdingIssues(bedWith(["squash", 0, 0], ["radish", 2, 0]), cat)).toEqual([]);
    expect(crowdingIssues(bedWith(["squash", 0, 0], ["radish", 2, 2]), cat)).toEqual([]);
  });

  it("reaches (n-1) cells for larger footprints", () => {
    expect(crowdingIssues(bedWith(["pumpkin", 0, 0], ["radish", 2, 0]), cat)).toHaveLength(1);
    expect(crowdingIssues(bedWith(["pumpkin", 0, 0], ["radish", 3, 0]), cat)).toEqual([]);
  });

  it("flags two large plants side by side and lists neighbours in reading order", () => {
    const issues = crowdingIssues(bedWith(["squash", 1, 1], ["squash", 2, 1], ["radish", 0, 0], ["radish", 1, 0]), cat);
    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({ plantId: "squash", x: 1, y: 1 });
    expect(issues[0].neighbours).toEqual([
      { plantId: "radish", x: 0, y: 0 },
      { plantId: "radish", x: 1, y: 0 },
      { plantId: "squash", x: 2, y: 1 },
    ]);
  });

  it("ignores plants missing from the catalog as the crowded plant", () => {
    expect(crowdingIssues(bedWith(["mystery", 0, 0], ["radish", 1, 0]), cat)).toEqual([]);
  });
});
