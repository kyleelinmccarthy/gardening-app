import type { Reason } from "@/domain/types";
import { makePlant } from "@/test/fixtures";
import { plantBadges, sunSummary, topReasons } from "./plantCardModel";

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

describe("plantBadges", () => {
  it("lists the shared facts in display order", () => {
    const plant = makePlant({ category: "herb", sun: ["full-sun"], difficulty: "easy", environments: ["outdoor"], container: { suitable: false } });
    expect(plantBadges(plant)).toEqual([
      { key: "category", label: "Herbs" },
      { key: "sun", label: "☀️ Full sun" },
      { key: "difficulty", label: "Easy", tone: "success" },
    ]);
  });

  it("adds custom, container-friendly and indoor-capable badges when they apply", () => {
    const plant = makePlant({ custom: true, environments: ["indoor", "outdoor"], container: { suitable: true } });
    expect(plantBadges(plant).map((b) => b.key)).toEqual(["category", "custom", "sun", "difficulty", "container", "indoor"]);
    expect(plantBadges(plant).find((b) => b.key === "custom")).toMatchObject({ label: "Custom", tone: "info" });
  });
});
