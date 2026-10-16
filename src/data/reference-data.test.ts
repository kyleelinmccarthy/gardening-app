import { describe, expect, it } from "vitest";
import type { FertilizerId, InsectId, SoilType, ToolId } from "@/domain/types";
import { SOIL_TYPES } from "@/domain/types";
import { FERTILIZERS } from "@/data/fertilizers";
import { INSECTS, getInsect } from "@/data/insects";
import { SOILS } from "@/data/soils";
import { TOOLS } from "@/data/tools";
import { ZONES } from "@/data/zones";

// Exhaustive records: adding a union member without updating these is a compile error.
const INSECT_IDS = {
  aphids: true,
  "spider-mites": true,
  whiteflies: true,
  "fungus-gnats": true,
  mealybugs: true,
  "scale-insects": true,
  thrips: true,
  "slugs-snails": true,
  "cabbage-worms": true,
  "tomato-hornworm": true,
  "cucumber-beetles": true,
  "squash-vine-borer": true,
  "squash-bugs": true,
  "flea-beetles": true,
  "colorado-potato-beetle": true,
  "japanese-beetles": true,
  "carrot-rust-fly": true,
  "leaf-miners": true,
  cutworms: true,
  "corn-earworm": true,
  "mexican-bean-beetle": true,
  "onion-maggots": true,
  earwigs: true,
  deer: true,
  rabbits: true,
  birds: true,
  squirrels: true,
  honeybees: true,
  "native-bees": true,
  bumblebees: true,
  butterflies: true,
  moths: true,
  hummingbirds: true,
  ladybugs: true,
  lacewings: true,
  hoverflies: true,
  "parasitic-wasps": true,
  "ground-beetles": true,
  "praying-mantis": true,
  earthworms: true,
} satisfies Record<InsectId, true>;

const SOIL_IDS = {
  loam: true,
  sandy: true,
  clay: true,
  silt: true,
  peat: true,
  chalky: true,
  "potting-mix": true,
  "cactus-mix": true,
  "orchid-bark": true,
} satisfies Record<SoilType, true>;

const FERTILIZER_IDS = {
  compost: true,
  "aged-manure": true,
  "balanced-10-10-10": true,
  "high-nitrogen": true,
  "bloom-booster": true,
  "fish-emulsion": true,
  "bone-meal": true,
  "blood-meal": true,
  "kelp-seaweed": true,
  "worm-castings": true,
  "tomato-feed": true,
  "acid-fertilizer": true,
  "cactus-fertilizer": true,
  "orchid-fertilizer": true,
  "houseplant-liquid": true,
  "slow-release-granules": true,
  "epsom-salt": true,
  none: true,
} satisfies Record<FertilizerId, true>;

const TOOL_IDS = {
  "hand-trowel": true,
  pruners: true,
  "garden-gloves": true,
  "watering-can": true,
  "garden-hose": true,
  "drip-irrigation": true,
  "soaker-hose": true,
  spade: true,
  "garden-fork": true,
  hoe: true,
  rake: true,
  wheelbarrow: true,
  trellis: true,
  stakes: true,
  "tomato-cage": true,
  "raised-bed": true,
  containers: true,
  "hanging-basket": true,
  "grow-light": true,
  "heat-mat": true,
  "seed-trays": true,
  "humidity-dome": true,
  humidifier: true,
  "pebble-tray": true,
  greenhouse: true,
  "cold-frame": true,
  "row-cover": true,
  "bird-netting": true,
  mulch: true,
  "compost-bin": true,
  "soil-test-kit": true,
  "moisture-meter": true,
  "spray-bottle": true,
  thermometer: true,
} satisfies Record<ToolId, true>;

const sorted = (xs: string[]) => [...xs].sort();
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function expectExactlyOnePerId(actual: string[], expected: string[]) {
  expect(sorted(actual)).toEqual(sorted(expected));
  expect(new Set(actual).size).toBe(actual.length);
}

describe("INSECTS", () => {
  it("has exactly one entry per InsectId", () => {
    expectExactlyOnePerId(
      INSECTS.map((i) => i.id),
      Object.keys(INSECT_IDS),
    );
  });

  it("has complete content for every entry", () => {
    for (const i of INSECTS) {
      expect(i.name.trim(), i.id).not.toBe("");
      expect(i.emoji.trim(), i.id).not.toBe("");
      expect(i.description.trim(), i.id).not.toBe("");
      expect(i.signs.length, `${i.id} signs`).toBeGreaterThan(0);
      expect(i.management.length, `${i.id} management`).toBeGreaterThan(0);
    }
  });

  it("covers every role", () => {
    const roles = new Set(INSECTS.map((i) => i.role));
    expect(roles).toEqual(new Set(["pest", "beneficial", "pollinator", "animal-pest"]));
  });

  it("classifies the animal pests", () => {
    for (const id of ["deer", "rabbits", "birds", "squirrels"] as const) {
      expect(getInsect(id).role).toBe("animal-pest");
    }
  });

  it("getInsect returns the matching entry and throws for unknown ids", () => {
    expect(getInsect("aphids").id).toBe("aphids");
    expect(() => getInsect("nope" as InsectId)).toThrow();
  });
});

describe("SOILS", () => {
  it("has exactly one entry per SoilType", () => {
    expectExactlyOnePerId(
      SOILS.map((s) => s.id),
      Object.keys(SOIL_IDS),
    );
    expect(sorted(SOILS.map((s) => s.id))).toEqual(sorted([...SOIL_TYPES]));
  });

  it("has complete content and sane pH ranges", () => {
    for (const s of SOILS) {
      expect(s.name.trim(), s.id).not.toBe("");
      expect(s.description.trim(), s.id).not.toBe("");
      expect(s.identify.trim(), s.id).not.toBe("");
      expect(s.pros.length, `${s.id} pros`).toBeGreaterThan(0);
      expect(s.cons.length, `${s.id} cons`).toBeGreaterThan(0);
      expect(s.improveWith.length, `${s.id} improveWith`).toBeGreaterThan(0);
      expect(s.typicalPh.min, s.id).toBeLessThan(s.typicalPh.max);
      expect(s.typicalPh.min, s.id).toBeGreaterThanOrEqual(3.5);
      expect(s.typicalPh.max, s.id).toBeLessThanOrEqual(9);
    }
  });
});

describe("FERTILIZERS", () => {
  it("has exactly one entry per FertilizerId", () => {
    expectExactlyOnePerId(
      FERTILIZERS.map((f) => f.id),
      Object.keys(FERTILIZER_IDS),
    );
  });

  it("has complete content for every entry", () => {
    for (const f of FERTILIZERS) {
      expect(f.name.trim(), f.id).not.toBe("");
      expect(f.npk.trim(), f.id).not.toBe("");
      expect(f.description.trim(), f.id).not.toBe("");
      expect(f.howToApply.trim(), f.id).not.toBe("");
      if (f.id !== "none") {
        expect(f.bestFor.length, `${f.id} bestFor`).toBeGreaterThan(0);
        expect(f.cautions.length, `${f.id} cautions`).toBeGreaterThan(0);
      }
    }
  });

  it("flags bone meal and blood meal as not pet safe", () => {
    const byId = new Map(FERTILIZERS.map((f) => [f.id, f]));
    expect(byId.get("bone-meal")?.petSafe).toBe(false);
    expect(byId.get("blood-meal")?.petSafe).toBe(false);
  });

  it('describes "none" as no feeding needed', () => {
    const none = FERTILIZERS.find((f) => f.id === "none");
    expect(none?.description).toContain("No feeding needed");
    expect(none?.petSafe).toBe(true);
  });
});

describe("TOOLS", () => {
  it("has exactly one entry per ToolId", () => {
    expectExactlyOnePerId(
      TOOLS.map((t) => t.id),
      Object.keys(TOOL_IDS),
    );
  });

  it("has complete content for every entry", () => {
    for (const t of TOOLS) {
      expect(t.name.trim(), t.id).not.toBe("");
      expect(t.emoji.trim(), t.id).not.toBe("");
      expect(t.description.trim(), t.id).not.toBe("");
      expect(["$", "$$", "$$$"], t.id).toContain(t.costTier);
      expect(
        ["hand-tool", "watering", "structure", "indoor", "protection", "soil"],
        t.id,
      ).toContain(t.category);
    }
  });

  it("offers practical alternatives for key tools", () => {
    for (const id of ["stakes", "pebble-tray", "seed-trays", "containers", "drip-irrigation"] as const) {
      expect(TOOLS.find((t) => t.id === id)?.alternatives.length, id).toBeGreaterThan(0);
    }
  });
});

describe("ZONES", () => {
  it("names Boston and New York as zone 7 examples (2023 USDA map)", () => {
    const zone7 = ZONES.find((z) => z.zone === 7)!;
    expect(zone7.description).toMatch(/Boston/);
    expect(zone7.description).toMatch(/New York/);
    for (const z of ZONES.filter((x) => x.zone !== 7)) expect(z.description, `zone ${z.zone}`).not.toMatch(/Boston|New York/);
  });

  it("covers USDA zones 1..13 contiguously, in order", () => {
    expect(ZONES.map((z) => z.zone)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
  });

  it("has temperature bounds following the 10°F-per-zone rule", () => {
    for (const z of ZONES) {
      const lower = -60 + (z.zone - 1) * 10;
      expect(z.minTempF, `zone ${z.zone}`).toBe(lower);
      expect(z.maxTempF, `zone ${z.zone}`).toBe(lower + 10);
    }
  });

  it("has valid MM-DD frost dates (or null) and descriptions", () => {
    for (const z of ZONES) {
      expect(z.description.trim(), `zone ${z.zone}`).not.toBe("");
      for (const d of [z.lastFrost, z.firstFrost]) {
        if (d !== null) expect(d, `zone ${z.zone}`).toMatch(MMDD);
      }
      expect(z.lastFrost === null, `zone ${z.zone} null pairing`).toBe(z.firstFrost === null);
    }
  });

  it("has frost-free zones 11-13 and last frost earlier than first frost elsewhere", () => {
    for (const z of ZONES) {
      if (z.zone >= 11) {
        expect(z.lastFrost).toBeNull();
        expect(z.firstFrost).toBeNull();
      } else if (z.lastFrost && z.firstFrost) {
        expect(z.lastFrost < z.firstFrost, `zone ${z.zone}`).toBe(true);
      }
    }
  });

  it("gets warmer: later zones never have later last frosts than earlier ones", () => {
    const withFrost = ZONES.filter((z) => z.lastFrost && z.firstFrost);
    for (let i = 1; i < withFrost.length; i++) {
      expect(withFrost[i].lastFrost! <= withFrost[i - 1].lastFrost!).toBe(true);
      expect(withFrost[i].firstFrost! >= withFrost[i - 1].firstFrost!).toBe(true);
    }
  });
});
