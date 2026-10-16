import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names and skips falsy ones", () => {
    expect(cn("a", false, null, undefined, "", "b", 0)).toBe("a b");
  });
  it("returns an empty string with no input", () => {
    expect(cn()).toBe("");
  });
});
