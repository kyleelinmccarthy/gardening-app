import { describe, expect, it } from "vitest";
import { formatMonthDay } from "@/domain/dates";
import { formatTemperature } from "@/domain/climate";
import { createDefaultProfile } from "@/domain/defaults";
import { makeGarden } from "@/test/fixtures";
import { profileChips } from "./profileChips";

const labels = (g: ReturnType<typeof makeGarden>, unit: "F" | "C" = "F") => profileChips(g, unit).map((c) => c.label);

describe("profileChips", () => {
  it("summarises an outdoor garden", () => {
    const { climate } = makeGarden().profile;
    expect(labels(makeGarden())).toEqual([
      "Outdoor",
      `Zone ${climate.hardinessZone}`,
      `Frost ${formatMonthDay(climate.lastFrost!)} to ${formatMonthDay(climate.firstFrost!)}`,
      `Winter low ${formatTemperature(climate.winterLowF, "F")}`,
      "Full sun (6+ h)",
    ]);
  });

  it("uses the temperature unit, indoor light and frost-free wording", () => {
    const profile = createDefaultProfile({ setting: "indoor" });
    profile.climate = { ...profile.climate, lastFrost: null, firstFrost: null, winterLowF: 32 };
    const chips = labels(makeGarden({ profile }), "C");
    expect(chips).toContain("Frost-free");
    expect(chips).toContain("Winter low 0°C");
    expect(chips).toContain("Bright, indirect light");
  });

  it("adds household flags", () => {
    const g = makeGarden({
      profile: createDefaultProfile({ pets: ["cat"], allergies: ["latex"], hasChildren: true, containersOnly: true }),
    });
    const chips = profileChips(g, "F");
    expect(chips.map((c) => c.key)).toEqual(
      expect.arrayContaining(["containers", "pet-cat", "allergy-latex", "children"]),
    );
    expect(chips.find((c) => c.key === "pet-cat")?.tone).toBe("warning");
  });
});
