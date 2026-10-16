import { describe, expect, it } from "vitest";
import { humanizeId } from "./text";

describe("humanizeId", () => {
  it("replaces every hyphen with a space", () => {
    expect(humanizeId("bright-indirect")).toBe("bright indirect");
    expect(humanizeId("cabbage-white-butterfly")).toBe("cabbage white butterfly");
  });

  it("leaves ids without hyphens untouched", () => {
    expect(humanizeId("tomato")).toBe("tomato");
    expect(humanizeId("")).toBe("");
  });
});
