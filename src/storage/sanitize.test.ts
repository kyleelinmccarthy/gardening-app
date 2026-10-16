import { describe, expect, it } from "vitest";
import { makeAppData, makeBed, makeGarden } from "@/test/fixtures";
import { isCellInBed, sanitizeAppData } from "./sanitize";

describe("isCellInBed", () => {
  it("accepts cells inside the grid and rejects the rest", () => {
    const bed = { columns: 2, rows: 3 };
    expect(isCellInBed(bed, 1, 2)).toBe(true);
    expect(isCellInBed(bed, 2, 0)).toBe(false);
    expect(isCellInBed(bed, 0, 3)).toBe(false);
    expect(isCellInBed(bed, -1, 0)).toBe(false);
    expect(isCellInBed(bed, 0.5, 0)).toBe(false);
  });
});

describe("sanitizeAppData", () => {
  it("returns the same object when nothing needs fixing", () => {
    const data = makeAppData([makeGarden({ beds: [makeBed({ placements: [{ plantId: "p", x: 0, y: 0 }] })] })]);
    expect(sanitizeAppData(data)).toBe(data);
  });

  it("drops placements outside the bed grid", () => {
    const bed = makeBed({
      columns: 2,
      rows: 2,
      placements: [
        { plantId: "in", x: 1, y: 1 },
        { plantId: "out-x", x: 2, y: 0 },
        { plantId: "out-y", x: 0, y: 5 },
      ],
    });
    const fixed = sanitizeAppData(makeAppData([makeGarden({ beds: [bed] })]));
    expect(fixed.gardens[0].beds[0].placements.map((p) => p.plantId)).toEqual(["in"]);
  });

  it("points a dangling activeGardenId at the first garden", () => {
    const data = makeAppData([makeGarden({ id: "a" }), makeGarden({ id: "b" })], { activeGardenId: "gone" });
    expect(sanitizeAppData(data).activeGardenId).toBe("a");
  });

  it("clears a dangling activeGardenId when there are no gardens", () => {
    expect(sanitizeAppData(makeAppData([], { activeGardenId: "gone" })).activeGardenId).toBeNull();
  });

  it("keeps a null activeGardenId", () => {
    const data = makeAppData([makeGarden()], { activeGardenId: null });
    expect(sanitizeAppData(data)).toBe(data);
  });
});
