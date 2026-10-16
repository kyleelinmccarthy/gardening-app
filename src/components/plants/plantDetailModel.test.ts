import { createDefaultProfile } from "@/domain/defaults";
import { makePlant } from "@/test/fixtures";
import { densityHint, feedingSchedule, plantingTimeline, relativeWindows, toolStatus } from "./plantDetailModel";

const { climate } = createDefaultProfile(); // last frost 04-15, first frost 10-15

describe("plantingTimeline", () => {
  it("turns planting windows into dated rows", () => {
    const plant = makePlant({ planting: { transplantWeeks: 2 }, daysToMaturity: undefined });
    expect(plantingTimeline(plant, climate, 2026)).toEqual([
      { type: "transplant", label: "Transplant", range: "Apr 29 – May 12" },
    ]);
  });

  it("includes the expected harvest window", () => {
    const plant = makePlant({ planting: { directSowWeeks: 0 }, daysToMaturity: { min: 30, max: 40 } });
    const rows = plantingTimeline(plant, climate, 2026);
    expect(rows.map((r) => r.type)).toEqual(["direct-sow", "harvest"]);
  });

  it("is empty for plants with only free-text notes", () => {
    expect(plantingTimeline(makePlant({ planting: { notes: "Any time" } }), climate, 2026)).toEqual([]);
  });
});

describe("relativeWindows", () => {
  it("describes each window relative to frost dates", () => {
    expect(
      relativeWindows({ startIndoorsWeeks: -6, directSowWeeks: 0, transplantWeeks: 1, fallSowWeeksBeforeFirstFrost: 10 }),
    ).toEqual([
      "Start seeds indoors 6 weeks before last spring frost",
      "Direct sow at last spring frost",
      "Transplant 1 week after last spring frost",
      "Fall sowing 10 weeks before first fall frost",
    ]);
  });
});

describe("toolStatus", () => {
  it("flags owned tools", () => {
    const plant = makePlant({ requiredTools: ["trellis", "stakes"], helpfulTools: ["mulch"] });
    expect(toolStatus(plant, ["stakes", "mulch"])).toEqual({
      required: [
        { id: "trellis", owned: false },
        { id: "stakes", owned: true },
      ],
      helpful: [{ id: "mulch", owned: true }],
    });
  });
});

describe("densityHint", () => {
  it("handles dense, single and large plants", () => {
    expect(densityHint(makePlant({ spacingInches: 4 }))).toBe('Up to 9 plants per 12" square');
    expect(densityHint(makePlant({ spacingInches: 12 }))).toBe('1 plant per 12" square');
    expect(densityHint(makePlant({ spacingInches: 24 }))).toBe('Needs a 2 × 2 block of 12" squares');
  });
});

describe("feedingSchedule", () => {
  it("describes the frequency", () => {
    expect(feedingSchedule(0)).toBe("No regular feeding needed");
    expect(feedingSchedule(14)).toBe("Every 14 days in the growing season");
  });
});
