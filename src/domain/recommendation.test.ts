import { describe, expect, it } from "vitest";
import {
  evaluatePlant,
  recommendPlants,
  SCORE_CONFIG,
  DEFAULT_RULES,
  type Rule,
} from "./recommendation";
import { makePlant, makeProfile } from "./test-fixtures";
import type { IndoorLight, Reason, ToolId, Toxicity } from "./types";

const find = (reasons: Reason[], topic: Reason["topic"], kind?: Reason["kind"]) =>
  reasons.filter((r) => r.topic === topic && (kind === undefined || r.kind === kind));

const toxic = (overrides: Partial<Toxicity>): Toxicity => ({
  cat: "non-toxic",
  dog: "non-toxic",
  horse: "non-toxic",
  bird: "non-toxic",
  rabbit: "non-toxic",
  human: "non-toxic",
  ...overrides,
});

describe("evaluatePlant: setting", () => {
  it("blocks when the plant cannot be grown in the profile's setting", () => {
    const rec = evaluatePlant(makePlant({ environments: ["indoor"] }), makeProfile({ setting: "outdoor" }));
    expect(find(rec.reasons, "setting", "blocker")).toHaveLength(1);
    expect(rec.verdict).toBe("not-recommended");
  });
});

describe("evaluatePlant: outdoor sun", () => {
  it("is positive when the exposure is acceptable", () => {
    const rec = evaluatePlant(makePlant(), makeProfile());
    expect(find(rec.reasons, "sun", "positive")).toHaveLength(1);
  });
  it("warns for an adjacent exposure", () => {
    const rec = evaluatePlant(makePlant({ sun: ["full-sun"] }), makeProfile({ sunExposure: "partial-sun" }));
    expect(find(rec.reasons, "sun", "warning")).toHaveLength(1);
    expect(find(rec.reasons, "sun", "blocker")).toHaveLength(0);
  });
  it("blocks when exposure is two or more steps away", () => {
    const rec = evaluatePlant(makePlant({ sun: ["full-sun"] }), makeProfile({ sunExposure: "full-shade" }));
    expect(find(rec.reasons, "sun", "blocker")).toHaveLength(1);
  });
});

describe("evaluatePlant: indoor light", () => {
  const indoor = (light: IndoorLight, tools: ToolId[] = []) =>
    makeProfile({
      setting: "indoor",
      indoor: { light, averageTempF: 70, humidity: "average" },
      tools,
    });
  const plant = makePlant({ indoorLight: ["bright-indirect", "direct"] });

  it("is positive for acceptable light", () => {
    expect(find(evaluatePlant(plant, indoor("direct")).reasons, "light", "positive")).toHaveLength(1);
  });
  it("warns for adjacent light and suggests a grow light", () => {
    const [reason] = find(evaluatePlant(plant, indoor("medium")).reasons, "light", "warning");
    expect(reason.message).toMatch(/grow light/i);
  });
  it("blocks for insufficient light without a grow light", () => {
    expect(find(evaluatePlant(plant, indoor("low")).reasons, "light", "blocker")).toHaveLength(1);
  });
  it("downgrades insufficient light to a warning when the user has a grow light", () => {
    const rec = evaluatePlant(plant, indoor("low", ["grow-light"]));
    expect(find(rec.reasons, "light", "blocker")).toHaveLength(0);
    expect(find(rec.reasons, "light", "warning")[0].message).toMatch(/grow light/i);
  });
  it("does not evaluate light for plants with no indoorLight", () => {
    const rec = evaluatePlant(makePlant({ indoorLight: undefined }), indoor("low"));
    expect(find(rec.reasons, "light")).toHaveLength(0);
  });
  it("does not evaluate outdoor sun when indoors", () => {
    const rec = evaluatePlant(makePlant({ sun: ["full-shade"] }), indoor("direct"));
    expect(find(rec.reasons, "sun")).toHaveLength(0);
  });
});

describe("evaluatePlant: hardiness zone", () => {
  const perennial = makePlant({ lifeCycle: "perennial", hardinessZones: { min: 5, max: 9 } });

  it("is positive within the zone range", () => {
    const rec = evaluatePlant(perennial, makeProfile({ climate: { ...makeProfile().climate, hardinessZone: 6 } }));
    expect(find(rec.reasons, "zone", "positive")).toHaveLength(1);
  });
  it("warns when one zone too cold and the plant is container suitable", () => {
    const rec = evaluatePlant(perennial, makeProfile({ climate: { ...makeProfile().climate, hardinessZone: 4 } }));
    const [reason] = find(rec.reasons, "zone", "warning");
    expect(reason.message).toMatch(/annual|overwinter/i);
  });
  it("warns when too warm", () => {
    const rec = evaluatePlant(perennial, makeProfile({ climate: { ...makeProfile().climate, hardinessZone: 11 } }));
    expect(find(rec.reasons, "zone", "warning")).toHaveLength(1);
  });
  it("blocks when colder than the minimum by more than one zone", () => {
    const rec = evaluatePlant(perennial, makeProfile({ climate: { ...makeProfile().climate, hardinessZone: 3 } }));
    expect(find(rec.reasons, "zone", "blocker")).toHaveLength(1);
  });
  it("blocks when one zone too cold and the plant cannot be container grown", () => {
    const plant = makePlant({ ...perennial, container: { suitable: false } });
    const rec = evaluatePlant(plant, makeProfile({ climate: { ...makeProfile().climate, hardinessZone: 4 } }));
    expect(find(rec.reasons, "zone", "blocker")).toHaveLength(1);
  });
  it("does not evaluate zone for annuals", () => {
    const rec = evaluatePlant(
      makePlant({ lifeCycle: "annual", hardinessZones: { min: 9, max: 11 } }),
      makeProfile(),
    );
    expect(find(rec.reasons, "zone")).toHaveLength(0);
  });
  it("does not evaluate zone for biennials grown as annuals (carrot in zone 1, 2 or 12)", () => {
    const carrot = makePlant({ lifeCycle: "biennial", hardinessZones: { min: 3, max: 10 } });
    for (const hardinessZone of [1, 2, 12]) {
      const rec = evaluatePlant(carrot, makeProfile({ climate: { ...makeProfile().climate, hardinessZone } }));
      expect(find(rec.reasons, "zone", "blocker"), `zone ${hardinessZone}`).toHaveLength(0);
      expect(find(rec.reasons, "zone", "warning").filter((r) => /zone|winter/i.test(r.message))).toHaveLength(0);
      expect(rec.verdict).not.toBe("not-recommended");
    }
  });
  it("does not evaluate zone indoors", () => {
    const rec = evaluatePlant(perennial, makeProfile({ setting: "indoor" }));
    expect(find(rec.reasons, "zone")).toHaveLength(0);
  });
});

describe("evaluatePlant: annual climate", () => {
  it("warns about heat stress when summers exceed maxF by more than 5", () => {
    const profile = makeProfile({ climate: { ...makeProfile().climate, summerHighF: 105 } });
    const rec = evaluatePlant(makePlant({ temperature: { minF: 35, idealMinF: 60, idealMaxF: 80, maxF: 95 } }), profile);
    expect(find(rec.reasons, "temperature", "warning")[0].message).toMatch(/heat|bolt/i);
  });
  it("does not warn when summer high is within tolerance", () => {
    const profile = makeProfile({ climate: { ...makeProfile().climate, summerHighF: 100 } });
    expect(find(evaluatePlant(makePlant(), profile).reasons, "temperature", "warning")).toHaveLength(0);
  });
  it("warns when the frost-free season is shorter than days to maturity", () => {
    const plant = makePlant({ daysToMaturity: { min: 200, max: 220 } });
    const rec = evaluatePlant(plant, makeProfile());
    const [reason] = find(rec.reasons, "zone", "warning");
    expect(reason.message).toMatch(/start.*indoors/i);
  });
  it("suggests transplants or early varieties instead when indoor starts are already planned", () => {
    const plant = makePlant({ daysToMaturity: { min: 200, max: 220 }, planting: { startIndoorsWeeks: -8 } });
    const [reason] = find(evaluatePlant(plant, makeProfile()).reasons, "zone", "warning");
    expect(reason.message).not.toMatch(/start.*indoors/i);
    expect(reason.message).toMatch(/transplants|early varieties/i);
  });
  it("skips the season-length check for fall-sown overwintering crops like garlic", () => {
    const garlic = makePlant({
      daysToMaturity: { min: 240, max: 270 },
      planting: { fallSowWeeksBeforeFirstFrost: 4 },
    });
    expect(find(evaluatePlant(garlic, makeProfile()).reasons, "zone")).toHaveLength(0);
  });
  it("still checks the season when a fall-sowable crop also has a spring window", () => {
    const plant = makePlant({
      daysToMaturity: { min: 200, max: 220 },
      planting: { fallSowWeeksBeforeFirstFrost: 4, directSowWeeks: -2 },
    });
    expect(find(evaluatePlant(plant, makeProfile()).reasons, "zone", "warning")).toHaveLength(1);
  });
  it("skips the season-length check for perennials", () => {
    const plant = makePlant({ lifeCycle: "perennial", daysToMaturity: { min: 400, max: 500 }, hardinessZones: { min: 3, max: 9 } });
    expect(find(evaluatePlant(plant, makeProfile()).reasons, "zone", "warning")).toHaveLength(0);
  });
  it("is positive about a season that is long enough, none when no maturity data", () => {
    const rec = evaluatePlant(makePlant({ daysToMaturity: { min: 60, max: 80 } }), makeProfile());
    expect(find(rec.reasons, "zone", "warning")).toHaveLength(0);
    const none = evaluatePlant(makePlant({ daysToMaturity: undefined }), makeProfile());
    expect(find(none.reasons, "zone")).toHaveLength(0);
  });
  it("mentions the greenhouse when the user has one", () => {
    const plant = makePlant({ daysToMaturity: { min: 200, max: 220 } });
    const rec = evaluatePlant(plant, makeProfile({ tools: ["greenhouse"] }));
    expect(find(rec.reasons, "zone", "warning")).toHaveLength(0);
    expect(find(rec.reasons, "zone", "positive").some((r) => /greenhouse/i.test(r.message))).toBe(true);
  });
  it("treats frost-free climates as year-round", () => {
    const profile = makeProfile({ climate: { ...makeProfile().climate, lastFrost: null, firstFrost: null } });
    const rec = evaluatePlant(makePlant({ daysToMaturity: { min: 300, max: 330 } }), profile);
    expect(find(rec.reasons, "zone", "warning")).toHaveLength(0);
  });
});

describe("evaluatePlant: indoor temperature", () => {
  const plant = makePlant({ temperature: { minF: 50, idealMinF: 65, idealMaxF: 80, maxF: 95 } });
  const at = (averageTempF: number) =>
    makeProfile({ setting: "indoor", indoor: { light: "direct", averageTempF, humidity: "average" } });

  it("is silent or positive inside the ideal range", () => {
    expect(find(evaluatePlant(plant, at(70)).reasons, "temperature", "warning")).toHaveLength(0);
    expect(find(evaluatePlant(plant, at(70)).reasons, "temperature", "blocker")).toHaveLength(0);
  });
  it("warns outside the ideal range", () => {
    expect(find(evaluatePlant(plant, at(60)).reasons, "temperature", "warning")).toHaveLength(1);
    expect(find(evaluatePlant(plant, at(85)).reasons, "temperature", "warning")).toHaveLength(1);
  });
  it("blocks below minF", () => {
    expect(find(evaluatePlant(plant, at(45)).reasons, "temperature", "blocker")).toHaveLength(1);
  });
});

describe("evaluatePlant: humidity", () => {
  const humid = makePlant({ humidity: "high" });
  const dry = (tools: ToolId[] = []) =>
    makeProfile({
      setting: "indoor",
      indoor: { light: "direct", averageTempF: 70, humidity: "low" },
      tools,
    });

  it("warns when a humid plant meets a dry environment", () => {
    expect(find(evaluatePlant(humid, dry()).reasons, "humidity", "warning")).toHaveLength(1);
  });
  it("mitigates with a humidifier or pebble tray", () => {
    for (const tool of ["humidifier", "pebble-tray"] as const) {
      const rec = evaluatePlant(humid, dry([tool]));
      expect(find(rec.reasons, "humidity", "warning")).toHaveLength(0);
      expect(find(rec.reasons, "humidity", "positive")).toHaveLength(1);
    }
  });
  it("uses climate humidity outdoors", () => {
    const profile = makeProfile({ climate: { ...makeProfile().climate, humidity: "low" } });
    expect(find(evaluatePlant(humid, profile).reasons, "humidity", "warning")).toHaveLength(1);
  });
  it("is silent for matching humidity", () => {
    expect(find(evaluatePlant(makePlant(), dry()).reasons, "humidity")).toHaveLength(0);
  });
});

describe("evaluatePlant: containers", () => {
  it("blocks unsuitable plants when containersOnly", () => {
    const rec = evaluatePlant(makePlant({ container: { suitable: false } }), makeProfile({ containersOnly: true }));
    expect(find(rec.reasons, "container", "blocker")).toHaveLength(1);
  });
  it("blocks unsuitable plants indoors, because indoor growing is container growing", () => {
    const rec = evaluatePlant(makePlant({ container: { suitable: false } }), makeProfile({ setting: "indoor", containersOnly: false }));
    const [reason] = find(rec.reasons, "container", "blocker");
    expect(reason.message).toMatch(/indoor/i);
    expect(reason.message).toMatch(/container/i);
  });
  it("rewards container-suitable plants indoors even when containersOnly is off", () => {
    const rec = evaluatePlant(makePlant({ container: { suitable: true } }), makeProfile({ setting: "indoor", containersOnly: false }));
    expect(find(rec.reasons, "container", "positive")).toHaveLength(1);
  });
  it("is positive and mentions minimum gallons for suitable plants", () => {
    const rec = evaluatePlant(makePlant({ container: { suitable: true, minGallons: 7 } }), makeProfile({ containersOnly: true }));
    const [reason] = find(rec.reasons, "container", "positive");
    expect(reason.message).toContain("7");
  });
  it("is silent for in-ground outdoor gardens", () => {
    const rec = evaluatePlant(makePlant({ container: { suitable: false } }), makeProfile());
    expect(find(rec.reasons, "container")).toHaveLength(0);
  });
});

describe("evaluatePlant: tools", () => {
  it("warns (never blocks) about missing required tools", () => {
    const rec = evaluatePlant(makePlant({ requiredTools: ["trellis", "stakes"] }), makeProfile({ tools: ["stakes"] }));
    const [reason] = find(rec.reasons, "tools", "warning");
    expect(reason.message).toContain("trellis");
    expect(reason.message).not.toContain("stakes");
    expect(rec.verdict).not.toBe("not-recommended");
  });
  it("gives a small positive for owned helpful tools", () => {
    const rec = evaluatePlant(makePlant({ helpfulTools: ["mulch"] }), makeProfile({ tools: ["mulch"] }));
    expect(find(rec.reasons, "tools", "positive")).toHaveLength(1);
  });
});

describe("evaluatePlant: experience and time", () => {
  it("warns beginners about challenging plants", () => {
    const rec = evaluatePlant(makePlant({ difficulty: "challenging" }), makeProfile({ experience: "beginner" }));
    expect(find(rec.reasons, "experience", "warning")).toHaveLength(1);
  });
  it("praises easy plants for beginners", () => {
    const rec = evaluatePlant(makePlant({ difficulty: "easy" }), makeProfile({ experience: "beginner" }));
    expect(find(rec.reasons, "experience", "positive")).toHaveLength(1);
  });
  it("is silent for intermediate gardeners", () => {
    const rec = evaluatePlant(makePlant({ difficulty: "challenging" }), makeProfile({ experience: "intermediate" }));
    expect(find(rec.reasons, "experience")).toHaveLength(0);
  });
  it("warns busy gardeners about demanding plants", () => {
    const busy = makeProfile({ weeklyHours: 1 });
    expect(find(evaluatePlant(makePlant({ difficulty: "challenging" }), busy).reasons, "time", "warning")).toHaveLength(1);
    expect(find(evaluatePlant(makePlant({ water: "high" }), busy).reasons, "time", "warning")).toHaveLength(1);
    expect(find(evaluatePlant(makePlant(), busy).reasons, "time")).toHaveLength(0);
    expect(find(evaluatePlant(makePlant({ water: "high" }), makeProfile({ weeklyHours: 5 })).reasons, "time")).toHaveLength(0);
  });
});

describe("evaluatePlant: interests and goals", () => {
  it("penalises plants outside the user's interests with a warning", () => {
    const base = evaluatePlant(makePlant({ category: "flower" }), makeProfile());
    const rec = evaluatePlant(makePlant({ category: "flower" }), makeProfile({ interests: ["vegetable"] }));
    expect(find(rec.reasons, "interest", "warning")[0].message).toMatch(/outside your interests/i);
    expect(rec.score).toBeLessThan(base.score - 10);
  });
  it("is not penalised when the category matches or interests are empty", () => {
    const rec = evaluatePlant(makePlant(), makeProfile({ interests: ["vegetable"] }));
    expect(find(rec.reasons, "interest")).toHaveLength(0);
  });
  it("rewards matching goals, with a cap", () => {
    const plant = makePlant({ goals: ["edible", "pollinators", "fragrance", "ornamental", "fast-harvest"] });
    const none = evaluatePlant(plant, makeProfile({ goals: [] }));
    const one = evaluatePlant(plant, makeProfile({ goals: ["edible"] }));
    const many = evaluatePlant(plant, makeProfile({ goals: ["edible", "pollinators", "fragrance", "ornamental", "fast-harvest"] }));
    expect(find(one.reasons, "goals", "positive")).toHaveLength(1);
    expect(find(none.reasons, "goals")).toHaveLength(0);
    expect(one.score).toBeGreaterThan(none.score);
    expect(many.score - none.score).toBeLessThanOrEqual(SCORE_CONFIG.goalMatchCap);
  });
});

describe("evaluatePlant: soil", () => {
  it("is positive for a matching soil", () => {
    expect(find(evaluatePlant(makePlant(), makeProfile()).reasons, "soil", "positive")).toHaveLength(1);
  });
  it("warns with an amendment hint for a mismatch", () => {
    const rec = evaluatePlant(makePlant(), makeProfile({ soilType: "clay" }));
    expect(find(rec.reasons, "soil", "warning")[0].message).toMatch(/compost|amend/i);
  });
  it("is skipped for containers-only and indoor gardens", () => {
    expect(find(evaluatePlant(makePlant(), makeProfile({ soilType: "clay", containersOnly: true })).reasons, "soil")).toHaveLength(0);
    expect(find(evaluatePlant(makePlant(), makeProfile({ soilType: "clay", setting: "indoor" })).reasons, "soil")).toHaveLength(0);
  });
});

describe("evaluatePlant: safety", () => {
  it("includes safety reasons and blocks on severe pet toxicity", () => {
    const plant = makePlant({ toxicity: toxic({ cat: "severe" }) });
    const rec = evaluatePlant(plant, makeProfile({ pets: ["cat"] }));
    expect(find(rec.reasons, "pets", "blocker")).toHaveLength(1);
    expect(rec.verdict).toBe("not-recommended");
  });
  it("does not block children-related toxicity", () => {
    const plant = makePlant({ toxicity: toxic({ human: "severe" }) });
    const rec = evaluatePlant(plant, makeProfile({ hasChildren: true }));
    expect(find(rec.reasons, "children", "warning")).toHaveLength(1);
    expect(rec.verdict).not.toBe("not-recommended");
  });
});

describe("evaluatePlant: score and verdict", () => {
  it("returns the plant, an integer score in range and reasons", () => {
    const plant = makePlant();
    const rec = evaluatePlant(plant, makeProfile());
    expect(rec.plant).toBe(plant);
    expect(Number.isInteger(rec.score)).toBe(true);
    expect(rec.score).toBeGreaterThanOrEqual(0);
    expect(rec.score).toBeLessThanOrEqual(100);
    expect(rec.reasons.length).toBeGreaterThan(0);
  });
  it("gives an ideal match a great verdict", () => {
    const plant = makePlant({ goals: ["edible", "pollinators"], helpfulTools: ["mulch"] });
    const rec = evaluatePlant(plant, makeProfile({ goals: ["edible", "pollinators"], tools: ["mulch"], experience: "beginner" }));
    expect(rec.verdict).toBe("great");
    expect(rec.score).toBeGreaterThanOrEqual(80);
  });
  it("caps blocked plants at 25", () => {
    const rec = evaluatePlant(makePlant({ environments: ["indoor"] }), makeProfile());
    expect(rec.score).toBeLessThanOrEqual(25);
    expect(rec.verdict).toBe("not-recommended");
  });
  it("clamps to 0 when penalties pile up", () => {
    const plant = makePlant({
      environments: ["indoor"],
      sun: ["full-shade"],
      category: "flower",
      container: { suitable: false },
      toxicity: toxic({ cat: "severe", dog: "severe" }),
      requiredTools: ["trellis", "stakes"],
      difficulty: "challenging",
    });
    const rec = evaluatePlant(plant, makeProfile({
      interests: ["herb"],
      containersOnly: true,
      pets: ["cat", "dog"],
      experience: "beginner",
      weeklyHours: 1,
    }));
    expect(rec.score).toBe(0);
  });
  it("clamps to 100 when positives pile up", () => {
    // A rule list with an oversized bonus exercises the clamp.
    const rec = evaluatePlant(makePlant(), makeProfile(), [
      () => ({ delta: 500, reasons: [{ kind: "positive", topic: "goals", message: "huge" }] }),
    ]);
    expect(rec.score).toBe(100);
    expect(rec.verdict).toBe("great");
  });
  it("assigns good and possible verdicts by threshold", () => {
    const plant = makePlant();
    const profile = makeProfile();
    const verdictFor = (delta: number) =>
      evaluatePlant(plant, profile, [() => ({ delta: delta - SCORE_CONFIG.baseline, reasons: [] })]).verdict;
    expect(verdictFor(80)).toBe("great");
    expect(verdictFor(79)).toBe("good");
    expect(verdictFor(60)).toBe("good");
    expect(verdictFor(59)).toBe("possible");
  });
  it("accepts custom rules (open/closed) and exposes the default rule list", () => {
    const blocker: Rule = () => ({ delta: 0, reasons: [{ kind: "blocker", topic: "setting", message: "no" }] });
    const rec = evaluatePlant(makePlant(), makeProfile(), [blocker]);
    expect(rec.verdict).toBe("not-recommended");
    expect(DEFAULT_RULES.length).toBeGreaterThan(5);
  });
});

describe("recommendPlants", () => {
  const profile = makeProfile();
  const great = makePlant({ id: "a", name: "Zinnia", goals: ["edible"] });
  const alsoGreat = makePlant({ id: "b", name: "Aster", goals: ["edible"] });
  const meh = makePlant({ id: "c", name: "Meh", sun: ["partial-sun"] }); // adjacent exposure warning
  const blocked = makePlant({ id: "d", name: "Blocked", environments: ["indoor"] });
  const plants = [meh, blocked, great, alsoGreat];

  it("sorts by score desc then name, and excludes blocked plants by default", () => {
    const result = recommendPlants(plants, profile);
    expect(result.map((r) => r.plant.id)).toEqual(["b", "a", "c"]);
  });
  it("includes blocked plants (last) when asked", () => {
    const result = recommendPlants(plants, profile, { includeBlocked: true });
    expect(result.map((r) => r.plant.id)).toEqual(["b", "a", "c", "d"]);
  });
  it("applies limit after sorting and filtering", () => {
    expect(recommendPlants(plants, profile, { limit: 2 }).map((r) => r.plant.id)).toEqual(["b", "a"]);
    expect(recommendPlants(plants, profile, { limit: 0 })).toEqual([]);
  });
  it("handles an empty plant list", () => {
    expect(recommendPlants([], profile)).toEqual([]);
  });
});
