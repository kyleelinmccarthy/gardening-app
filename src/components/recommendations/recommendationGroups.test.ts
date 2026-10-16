import { createDefaultProfile } from "@/domain/defaults";
import type { PlantCategory, Recommendation, Verdict } from "@/domain/types";
import { makePlant } from "@/test/fixtures";
import { categoryCounts, filterByCategory, greatMatchSummary, groupByVerdict } from "./recommendationGroups";

const rec = (id: string, verdict: Verdict, category: PlantCategory = "vegetable"): Recommendation => ({
  plant: makePlant({ id, name: id, category }),
  score: 50,
  verdict,
  reasons: [],
});

const recs = [
  rec("a", "good"),
  rec("b", "great", "herb"),
  rec("c", "not-recommended", "herb"),
  rec("d", "great"),
];

describe("groupByVerdict", () => {
  it("orders groups great → not-recommended, keeps item order and drops empty groups", () => {
    const groups = groupByVerdict(recs);
    expect(groups.map((g) => g.verdict)).toEqual(["great", "good", "not-recommended"]);
    expect(groups[0].items.map((r) => r.plant.id)).toEqual(["b", "d"]);
    expect(groups[0].label).toBe("Great match");
  });

  it("returns no groups for no recommendations", () => {
    expect(groupByVerdict([])).toEqual([]);
  });
});

describe("filterByCategory", () => {
  it("passes everything through for 'all' and filters otherwise", () => {
    expect(filterByCategory(recs, "all")).toHaveLength(4);
    expect(filterByCategory(recs, "herb").map((r) => r.plant.id)).toEqual(["b", "c"]);
  });
});

describe("categoryCounts", () => {
  it("counts per category, omitting empty ones", () => {
    expect(categoryCounts(recs)).toEqual({ vegetable: 2, herb: 2 });
  });
});

describe("greatMatchSummary", () => {
  const outdoor = createDefaultProfile({ climate: { ...createDefaultProfile().climate, hardinessZone: 7 } });
  it("pluralises and names the zone and setting", () => {
    expect(greatMatchSummary(recs, outdoor)).toBe("2 great matches for your Zone 7 outdoor garden");
    expect(greatMatchSummary([rec("x", "great")], outdoor)).toBe("1 great match for your Zone 7 outdoor garden");
  });

  it("omits the zone for indoor gardens", () => {
    expect(greatMatchSummary(recs, createDefaultProfile({ setting: "indoor" }))).toBe(
      "2 great matches for your indoor garden",
    );
  });

  it("is encouraging when there are no great matches", () => {
    expect(greatMatchSummary([rec("x", "good")], outdoor)).toBe("No great matches yet for your Zone 7 outdoor garden");
  });
});
