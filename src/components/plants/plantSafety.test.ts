import { makePlant } from "@/test/fixtures";
import { matchingAllergens, petSafetyBadge, toxicPets } from "./plantSafety";

const safe = { cat: "non-toxic", dog: "non-toxic", horse: "non-toxic", bird: "non-toxic", rabbit: "non-toxic", human: "non-toxic" } as const;

describe("petSafetyBadge", () => {
  it("returns null without pets", () => {
    expect(petSafetyBadge(makePlant(), [])).toBeNull();
  });

  it("reports safe plants with pet emoji", () => {
    expect(petSafetyBadge(makePlant({ toxicity: { ...safe } }), ["cat", "dog"])).toEqual({
      tone: "success",
      label: "Safe for 🐱🐶",
    });
  });

  it("warns for mild toxicity and flags danger for moderate or worse", () => {
    const mild = makePlant({ toxicity: { ...safe, cat: "mild" } });
    expect(petSafetyBadge(mild, ["cat", "dog"])).toEqual({ tone: "warning", label: "⚠ Toxic to cats" });
    const severe = makePlant({ toxicity: { ...safe, cat: "mild", dog: "severe" } });
    expect(petSafetyBadge(severe, ["cat", "dog"])).toEqual({ tone: "danger", label: "⚠ Toxic to cats, dogs" });
  });

  it("ignores pets the household does not have", () => {
    const horseOnly = makePlant({ toxicity: { ...safe, horse: "severe" } });
    expect(petSafetyBadge(horseOnly, ["cat"])?.tone).toBe("success");
  });
});

describe("matchingAllergens / toxicPets", () => {
  it("intersects plant allergens with the user's allergies", () => {
    const plant = makePlant({ allergens: ["pollen", "latex"] });
    expect(matchingAllergens(plant, ["latex", "nightshade"])).toEqual(["latex"]);
    expect(matchingAllergens(plant, [])).toEqual([]);
  });

  it("lists pets with any toxicity", () => {
    const plant = makePlant({ toxicity: { ...safe, dog: "mild" } });
    expect(toxicPets(plant, ["cat", "dog"])).toEqual(["dog"]);
  });
});
