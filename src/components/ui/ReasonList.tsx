import type { Reason, ReasonKind } from "@/domain/types";
import { cn } from "@/lib/cn";

export interface ReasonListProps {
  reasons: readonly Reason[];
  className?: string;
}

const kinds: Record<ReasonKind, { icon: string; text: string; sr: string }> = {
  positive: { icon: "✅", text: "text-success", sr: "Good: " },
  warning: { icon: "⚠️", text: "text-warning", sr: "Warning: " },
  blocker: { icon: "⛔", text: "text-danger", sr: "Blocker: " },
};

/** Recommendation reasons as a list with ✅ / ⚠️ / ⛔ icons and matching colours. */
export function ReasonList({ reasons, className }: ReasonListProps) {
  if (reasons.length === 0) return null;
  return (
    <ul className={cn("flex flex-col gap-1.5 text-sm", className)}>
      {reasons.map((r, i) => {
        const k = kinds[r.kind];
        return (
          <li key={`${r.topic}-${i}`} data-kind={r.kind} className={cn("flex gap-2", k.text)}>
            <span aria-hidden="true">{k.icon}</span>
            <span>
              <span className="sr-only">{k.sr}</span>
              {r.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
