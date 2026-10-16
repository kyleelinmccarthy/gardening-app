/** Pure lookups behind the guides: reverse plant lookups, hash routing, grouping, searching. */
import { relationBetween } from "@/domain/companions";
import type { Insect, InsectId, Plant, ToolInfo } from "@/domain/types";

// --- reverse plant lookups ---------------------------------------------------

const byName = (a: Plant, b: Plant) => a.name.localeCompare(b.name);

/** Plants that commonly suffer from this pest or animal pest. */
export function plantsAffectedBy(insectId: InsectId, plants: readonly Plant[]): Plant[] {
  return plants.filter((p) => p.pests.includes(insectId)).sort(byName);
}

/** Plants that draw in this beneficial insect or pollinator. */
export function plantsAttracting(insectId: InsectId, plants: readonly Plant[]): Plant[] {
  return plants.filter((p) => p.attracts.includes(insectId)).sort(byName);
}

/** Plants that help deter this pest. */
export function plantsRepelling(insectId: InsectId, plants: readonly Plant[]): Plant[] {
  return plants.filter((p) => p.repels.includes(insectId)).sort(byName);
}

export interface CompanionLists {
  companions: Plant[];
  antagonists: Plant[];
}

/** Every catalog plant that is a companion / antagonist of `plant`, declared by either side. */
export function companionLists(plant: Plant, plants: readonly Plant[]): CompanionLists {
  const lists: CompanionLists = { companions: [], antagonists: [] };
  for (const other of plants) {
    const relation = relationBetween(plant, other);
    if (relation === "companion") lists.companions.push(other);
    else if (relation === "antagonist") lists.antagonists.push(other);
  }
  lists.companions.sort(byName);
  lists.antagonists.sort(byName);
  return lists;
}

// --- insects -----------------------------------------------------------------

export type InsectGroup = "pests" | "beneficials";

const PEST_ROLES: readonly Insect["role"][] = ["pest", "animal-pest"];

export function insectsInGroup(insects: readonly Insect[], group: InsectGroup): Insect[] {
  return insects.filter((i) => PEST_ROLES.includes(i.role) === (group === "pests"));
}

/** Case-insensitive match on name, description and signs; every word must match. */
export function searchInsects(insects: readonly Insect[], query: string): Insect[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...insects];
  return insects.filter((i) => {
    const haystack = `${i.name} ${i.description} ${i.signs.join(" ")}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

// --- tools -------------------------------------------------------------------

export const TOOL_CATEGORY_LABELS: Record<ToolInfo["category"], string> = {
  "hand-tool": "Hand tools",
  watering: "Watering",
  structure: "Structures & supports",
  indoor: "Indoor growing",
  protection: "Protection",
  soil: "Soil care",
};

export interface ToolGroup {
  category: ToolInfo["category"];
  label: string;
  tools: ToolInfo[];
}

/** Tools grouped by category in the order of `TOOL_CATEGORY_LABELS`; empty groups are dropped. */
export function groupToolsByCategory(tools: readonly ToolInfo[]): ToolGroup[] {
  return (Object.keys(TOOL_CATEGORY_LABELS) as ToolInfo["category"][])
    .map((category) => ({
      category,
      label: TOOL_CATEGORY_LABELS[category],
      tools: tools.filter((t) => t.category === category),
    }))
    .filter((g) => g.tools.length > 0);
}

// --- tabs & location hash -----------------------------------------------------

export const GUIDE_TABS = ["pests", "beneficials", "soil", "fertilizers", "tools", "companions", "zones"] as const;
export type GuideTab = (typeof GUIDE_TABS)[number];

export interface HashTarget {
  tab: GuideTab;
  /** Element id to scroll to, when the hash points at an item rather than a tab. */
  anchor: string | null;
}

const PREFIX_TABS: Record<string, GuideTab> = {
  soil: "soil",
  fertilizer: "fertilizers",
  tool: "tools",
};

/** Maps `#tab`, `#insect-<id>`, `#soil-<id>`, `#fertilizer-<id>` or `#tool-<id>` to a tab (+ anchor). */
export function resolveHash(hash: string, insects: readonly Insect[]): HashTarget | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;
  if ((GUIDE_TABS as readonly string[]).includes(id)) return { tab: id as GuideTab, anchor: null };
  if (id.startsWith("insect-")) {
    const insect = insects.find((i) => i.id === id.slice("insect-".length));
    if (!insect) return null;
    return { tab: PEST_ROLES.includes(insect.role) ? "pests" : "beneficials", anchor: id };
  }
  const prefix = id.slice(0, id.indexOf("-"));
  const tab = PREFIX_TABS[prefix];
  return tab ? { tab, anchor: id } : null;
}
