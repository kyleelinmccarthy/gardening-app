import { describe, expect, it } from "vitest";
import { getSafetyIssues, isPetSafe, toxicityRank } from "./safety";
import { makePlant } from "./test-fixtures";
import type { GardenProfile, Toxicity } from "./types";

const tox = (overrides: Partial<Toxicity>): Toxicity => ({
  cat: "non-toxic",
  dog: "non-toxic",
  horse: "non-toxic",
  bird: "non-toxic",
  rabbit: "non-toxic",
  human: "non-toxic",
  ...overrides,
});
const noOne: Pick<GardenProfile, "pets" | "allergies" | "hasChildren"> = {
  pets: [],
  allergies: [],
  hasChildren: false,
};

describe("toxicityRank", () => {
  it("orders levels from non-toxic to severe", () => {
    expect(toxicityRank("non-toxic")).toBe(0);
    expect(toxicityRank("mild")).toBeLessThan(toxicityRank("moderate"));
    expect(toxicityRank("moderate")).toBeLessThan(toxicityRank("severe"));
  });
});

describe("isPetSafe", () => {
  it("is true with no pets", () => {
    expect(isPetSafe(makePlant({ toxicity: tox({ cat: "severe" }) }), [])).toBe(true);
  });
  it("is true when every pet is non-toxic", () => {
    expect(isPetSafe(makePlant(), ["cat", "dog"])).toBe(true);
  });
  it("is false when any listed pet is affected", () => {
    const plant = makePlant({ toxicity: tox({ dog: "mild" }) });
    expect(isPetSafe(plant, ["cat", "dog"])).toBe(false);
    expect(isPetSafe(plant, ["cat"])).toBe(true);
  });
});

describe("getSafetyIssues", () => {
  it("returns nothing for a safe plant", () => {
    expect(getSafetyIssues(makePlant(), noOne)).toEqual([]);
  });

  it("blocks for severe toxicity to a pet and names the pet, severity and notes", () => {
    const plant = makePlant({ toxicity: tox({ cat: "severe", notes: "All parts: kidney failure" }) });
    const issues = getSafetyIssues(plant, { ...noOne, pets: ["cat"] });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ kind: "blocker", topic: "pets" });
    expect(issues[0].message).toMatch(/^Severely toxic to cats/);
    expect(issues[0].message).toContain("All parts: kidney failure");
  });

  it("blocks for moderate toxicity", () => {
    const plant = makePlant({ toxicity: tox({ dog: "moderate" }) });
    const [issue] = getSafetyIssues(plant, { ...noOne, pets: ["dog"] });
    expect(issue.kind).toBe("blocker");
    expect(issue.message).toMatch(/Moderately toxic to dogs/);
  });

  it("only warns for mild toxicity", () => {
    const plant = makePlant({ toxicity: tox({ bird: "mild" }) });
    const [issue] = getSafetyIssues(plant, { ...noOne, pets: ["bird"] });
    expect(issue).toMatchObject({ kind: "warning", topic: "pets" });
    expect(issue.message).toMatch(/Mildly toxic to birds/);
  });

  it("ignores pets the user does not have", () => {
    const plant = makePlant({ toxicity: tox({ cat: "severe" }) });
    expect(getSafetyIssues(plant, { ...noOne, pets: ["dog"] })).toEqual([]);
  });

  it("reports one issue per affected pet", () => {
    const plant = makePlant({ toxicity: tox({ cat: "severe", horse: "mild" }) });
    const issues = getSafetyIssues(plant, { ...noOne, pets: ["cat", "horse", "dog"] });
    expect(issues.map((i) => i.kind)).toEqual(["blocker", "warning"]);
  });

  it("omits the notes separator when there are no notes", () => {
    const plant = makePlant({ toxicity: tox({ cat: "severe" }) });
    const [issue] = getSafetyIssues(plant, { ...noOne, pets: ["cat"] });
    expect(issue.message).not.toContain("undefined");
    expect(issue.message.endsWith(" — ")).toBe(false);
  });

  it.each(["mild", "moderate", "severe"] as const)(
    "warns (never blocks) about %s human toxicity when there are children",
    (level) => {
      const plant = makePlant({ toxicity: tox({ human: level }) });
      const issues = getSafetyIssues(plant, { ...noOne, hasChildren: true });
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ kind: "warning", topic: "children" });
    },
  );

  it("names the toxic part via the notes in the child warning when notes exist", () => {
    const plant = makePlant({ toxicity: tox({ human: "mild", notes: "Leaves and green fruit: stomach upset." }) });
    const [issue] = getSafetyIssues(plant, { ...noOne, hasChildren: true });
    expect(issue.message).toBe("Parts of this plant are mildly toxic if eaten — Leaves and green fruit: stomach upset.");
  });

  it("keeps the generic child warning when there are no notes", () => {
    const plant = makePlant({ toxicity: tox({ human: "moderate" }) });
    const [issue] = getSafetyIssues(plant, { ...noOne, hasChildren: true });
    expect(issue.message).toBe("Moderately toxic if eaten — keep out of reach of children");
  });

  it("does not mention children when there are none", () => {
    const plant = makePlant({ toxicity: tox({ human: "severe" }) });
    expect(getSafetyIssues(plant, noOne)).toEqual([]);
  });

  it("warns about each shared allergen with a readable label and notes", () => {
    const plant = makePlant({
      allergens: ["pollen", "contact-dermatitis", "latex"],
      allergyNotes: "Sap irritates skin",
    });
    const issues = getSafetyIssues(plant, { ...noOne, allergies: ["pollen", "contact-dermatitis", "mold-spores"] });
    expect(issues).toHaveLength(2);
    expect(issues.every((i) => i.kind === "warning" && i.topic === "allergy")).toBe(true);
    expect(issues[0].message).toMatch(/pollen/i);
    expect(issues[1].message).toMatch(/contact dermatitis/i);
    expect(issues[1].message).not.toContain("contact-dermatitis");
    expect(issues[0].message).toContain("Sap irritates skin");
  });

  it("ignores allergens the user is not allergic to", () => {
    const plant = makePlant({ allergens: ["pollen"] });
    expect(getSafetyIssues(plant, { ...noOne, allergies: ["latex"] })).toEqual([]);
  });
});
