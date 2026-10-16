import { describe, expect, it } from "vitest";
import { withoutUndefined } from "./object";

describe("withoutUndefined", () => {
  it("drops undefined values only", () => {
    expect(withoutUndefined({ a: 1, b: undefined, c: null, d: 0, e: "", f: false })).toEqual({
      a: 1,
      c: null,
      d: 0,
      e: "",
      f: false,
    });
  });

  it("does not mutate the input", () => {
    const input = { a: undefined, b: 1 };
    withoutUndefined(input);
    expect(Object.keys(input)).toEqual(["a", "b"]);
  });

  it("leaves no undefined keys behind", () => {
    expect("a" in withoutUndefined({ a: undefined })).toBe(false);
  });
});
