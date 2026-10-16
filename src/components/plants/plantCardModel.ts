/** Pure presentation helpers shared by PlantCard, PlantDetail and the recommendations page. */
import type { BadgeTone } from "@/components/ui";
import type { Difficulty, Reason, SunExposure, Verdict } from "@/domain/types";
import { shortLabel, SUN_LABELS } from "@/lib/labels";

export const VERDICT_TONES: Record<Verdict, BadgeTone> = {
  great: "success",
  good: "info",
  possible: "warning",
  "not-recommended": "danger",
};

export const DIFFICULTY_TONES: Record<Difficulty, BadgeTone> = {
  easy: "success",
  moderate: "neutral",
  challenging: "warning",
};

const REASON_PRIORITY: Record<Reason["kind"], number> = { blocker: 0, warning: 1, positive: 2 };

/** The `count` most important reasons: blockers first, then warnings, then positives (stable within a kind). */
export function topReasons(reasons: readonly Reason[], count = 2): Reason[] {
  return reasons
    .map((reason, index) => ({ reason, index }))
    .sort((a, b) => REASON_PRIORITY[a.reason.kind] - REASON_PRIORITY[b.reason.kind] || a.index - b.index)
    .slice(0, count)
    .map((entry) => entry.reason);
}

/** "Full sun / Partial sun" — labels without the hour hints. */
export function sunSummary(sun: readonly SunExposure[]): string {
  return sun.map((s) => shortLabel(SUN_LABELS[s])).join(" / ");
}
