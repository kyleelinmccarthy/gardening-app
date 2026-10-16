import { INSECTS } from "@/data/insects";
import { TOOLS } from "@/data/tools";
import type { Insect } from "@/domain/types";
import { makePlant } from "@/test/fixtures";
import {
  companionLists,
  groupToolsByCategory,
  insectsInGroup,
  plantsAffectedBy,
  plantsAttracting,
  plantsRepelling,
  resolveHash,
  searchInsects,
} from "./guideLookups";

const tomato = makePlant({ id: "tomato", name: "Tomato", pests: ["aphids", "tomato-hornworm"], attracts: ["honeybees"], companions: ["basil"], antagonists: ["fennel"] });
const basil = makePlant({ id: "basil", name: "Basil", pests: ["aphids"], repels: ["aphids"], attracts: ["honeybees", "native-bees"] });
const fennel = makePlant({ id: "fennel", name: "Fennel", companions: [], antagonists: [] });
const dill = makePlant({ id: "dill", name: "Dill", companions: ["tomato"] }); // one-sided companion
const plants = [tomato, basil, fennel, dill];

describe("reverse plant lookups", () => {
  it("finds plants affected by a pest, sorted by name", () => {
    expect(plantsAffectedBy("aphids", plants).map((p) => p.id)).toEqual(["basil", "tomato"]);
    expect(plantsAffectedBy("deer", plants)).toEqual([]);
  });

  it("finds plants that attract a pollinator", () => {
    expect(plantsAttracting("native-bees", plants).map((p) => p.id)).toEqual(["basil"]);
    expect(plantsAttracting("honeybees", plants).map((p) => p.id)).toEqual(["basil", "tomato"]);
  });

  it("finds plants that repel a pest", () => {
    expect(plantsRepelling("aphids", plants).map((p) => p.id)).toEqual(["basil"]);
  });
});

describe("companionLists", () => {
  it("includes relations declared by either plant", () => {
    const lists = companionLists(tomato, plants);
    expect(lists.companions.map((p) => p.id)).toEqual(["basil", "dill"]);
    expect(lists.antagonists.map((p) => p.id)).toEqual(["fennel"]);
  });

  it("never lists the plant itself", () => {
    expect(companionLists(basil, plants).companions.map((p) => p.id)).not.toContain("basil");
  });
});

describe("insects", () => {
  it("splits the real dataset into pests and beneficials", () => {
    const pests = insectsInGroup(INSECTS, "pests");
    const good = insectsInGroup(INSECTS, "beneficials");
    expect(pests.length + good.length).toBe(INSECTS.length);
    expect(pests.every((i) => i.role === "pest" || i.role === "animal-pest")).toBe(true);
    expect(good.every((i) => i.role === "beneficial" || i.role === "pollinator")).toBe(true);
    expect(pests.map((i) => i.id)).toContain("deer");
  });

  it("searches names, descriptions and signs", () => {
    const list = [
      { id: "aphids", name: "Aphids", description: "Sap suckers", signs: ["Sticky honeydew"] },
      { id: "slugs-snails", name: "Slugs", description: "Slimy", signs: ["Ragged holes"] },
    ] as Insect[];
    expect(searchInsects(list, "aph").map((i) => i.id)).toEqual(["aphids"]);
    expect(searchInsects(list, "ragged holes").map((i) => i.id)).toEqual(["slugs-snails"]);
    expect(searchInsects(list, "  ")).toHaveLength(2);
    expect(searchInsects(list, "nothing")).toEqual([]);
  });
});

describe("groupToolsByCategory", () => {
  it("covers every tool exactly once", () => {
    const groups = groupToolsByCategory(TOOLS);
    expect(groups.flatMap((g) => g.tools)).toHaveLength(TOOLS.length);
    expect(groups[0].label).toBe("Hand tools");
  });
});

describe("resolveHash", () => {
  it("resolves tab names", () => {
    expect(resolveHash("#zones", INSECTS)).toEqual({ tab: "zones", anchor: null });
  });

  it("sends pests and beneficials to their tabs", () => {
    expect(resolveHash("#insect-aphids", INSECTS)).toEqual({ tab: "pests", anchor: "insect-aphids" });
    expect(resolveHash("#insect-honeybees", INSECTS)).toEqual({ tab: "beneficials", anchor: "insect-honeybees" });
    expect(resolveHash("#insect-nonexistent", INSECTS)).toBeNull();
  });

  it("resolves soil, fertilizer and tool anchors", () => {
    expect(resolveHash("#soil-clay", INSECTS)).toEqual({ tab: "soil", anchor: "soil-clay" });
    expect(resolveHash("#fertilizer-compost", INSECTS)).toEqual({ tab: "fertilizers", anchor: "fertilizer-compost" });
    expect(resolveHash("#tool-hand-trowel", INSECTS)).toEqual({ tab: "tools", anchor: "tool-hand-trowel" });
  });

  it("ignores empty or unknown hashes", () => {
    expect(resolveHash("", INSECTS)).toBeNull();
    expect(resolveHash("#", INSECTS)).toBeNull();
    expect(resolveHash("#whatever", INSECTS)).toBeNull();
  });
});
