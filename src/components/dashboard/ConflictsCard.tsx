"use client";

import { ButtonLink, Card } from "@/components/ui";
import type { BedConflict } from "@/domain/gardenSummary";

/** Companion conflicts in the garden's beds; renders nothing when there are none. */
export function ConflictsCard({ conflicts }: { conflicts: readonly BedConflict[] }) {
  if (conflicts.length === 0) return null;
  return (
    <Card
      title="Companion conflicts"
      description="Plants that grow poorly side by side."
      className="lg:col-span-2"
      actions={
        <ButtonLink href="/planner" size="sm" variant="secondary">
          Open planner
        </ButtonLink>
      }
    >
      <ul className="flex flex-col gap-1 text-sm">
        {conflicts.map((c) => (
          <li key={`${c.bedId}-${c.plantA}-${c.plantB}`}>
            <span aria-hidden="true">⚠️ </span>
            {c.plantA} and {c.plantB} are neighbours in {c.bedName}.
          </li>
        ))}
      </ul>
    </Card>
  );
}
