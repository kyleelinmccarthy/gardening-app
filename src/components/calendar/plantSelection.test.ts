import { applyChipChange, resolveSelection } from "./plantSelection";

describe("resolveSelection", () => {
  const pool = ["a", "b", "c"];

  it("uses defaults when there are no overrides", () => {
    expect(resolveSelection(pool, new Set(["a", "c"]), {})).toEqual(["a", "c"]);
  });

  it("lets overrides win over defaults", () => {
    expect(resolveSelection(pool, new Set(["a"]), { a: false, b: true })).toEqual(["b"]);
  });
});

describe("applyChipChange", () => {
  it("records only the chips that were toggled", () => {
    expect(applyChipChange({}, ["a", "b"], ["b", "c"])).toEqual({ a: false, c: true });
  });

  it("keeps earlier overrides", () => {
    expect(applyChipChange({ z: true }, ["a"], ["a", "b"])).toEqual({ z: true, b: true });
  });
});
