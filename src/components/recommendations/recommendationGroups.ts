/** Pure grouping / summarising helpers for the recommendations page. */
import type { GardenProfile, PlantCategory, Recommendation, Verdict } from "@/domain/types";
import { VERDICT_LABELS } from "@/lib/labels";

const VERDICT_ORDER: readonly Verdict[] = ["great", "good", "possible", "not-recommended"];

export interface VerdictGroup {
  verdict: Verdict;
  label: string;
  items: Recommendation[];
}

/** Splits recommendations into verdict groups (best first); empty groups are omitted. */
export function groupByVerdict(recs: readonly Recommendation[]): VerdictGroup[] {
  return VERDICT_ORDER.map((verdict) => ({
    verdict,
    label: VERDICT_LABELS[verdict],
    items: recs.filter((r) => r.verdict === verdict),
  })).filter((g) => g.items.length > 0);
}

export type CategoryFilter = PlantCategory | "all";

export function filterByCategory(recs: readonly Recommendation[], category: CategoryFilter): Recommendation[] {
  return category === "all" ? [...recs] : recs.filter((r) => r.plant.category === category);
}

export function categoryCounts(recs: readonly Recommendation[]): Partial<Record<PlantCategory, number>> {
  const counts: Partial<Record<PlantCategory, number>> = {};
  for (const r of recs) counts[r.plant.category] = (counts[r.plant.category] ?? 0) + 1;
  return counts;
}

/** "3 great matches for your Zone 7 outdoor garden". */
export function greatMatchSummary(recs: readonly Recommendation[], profile: GardenProfile): string {
  const great = recs.filter((r) => r.verdict === "great").length;
  const where =
    profile.setting === "outdoor" ? `Zone ${profile.climate.hardinessZone} outdoor garden` : "indoor garden";
  return great === 0
    ? `No great matches yet for your ${where}`
    : `${great} great ${great === 1 ? "match" : "matches"} for your ${where}`;
}
