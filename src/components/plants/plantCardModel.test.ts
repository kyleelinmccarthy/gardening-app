import type { Reason } from "@/domain/types";
import { sunSummary, topReasons } from "./plantCardModel";

const r = (kind: Reason["kind"], message: string): Reason => ({ kind, topic: "sun", message });

describe("topReasons", () => {
  it("puts blockers before warnings before positives and keeps order within a kind", () => {
    const reasons = [r("positive", "p1"), r("warning", "w1"), r("positive", "p2"), r("blocker", "b1"), r("warning", "w2")];
    expect(topReasons(reasons, 3).map((x) => x.message)).toEqual(["b1", "w1", "w2"]);
  });

  it("defaults to two and copes with short lists", () => {
    expect(topReasons([r("positive", "a"), r("positive", "b"), r("positive", "c")])).toHaveLength(2);
    expect(topReasons([])).toEqual([]);
  });
});

describe("sunSummary", () => {
  it("drops the hour hints", () => {
    expect(sunSummary(["full-sun", "partial-sun"])).toBe("Full sun / Partial sun");
  });
});
