"use client";

import { Badge, Button } from "@/components/ui";
import type { Bed } from "@/domain/types";
import { BED_KIND_LABELS, SUN_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";

export interface BedListProps {
  beds: readonly Bed[];
  selectedId: string | undefined;
  onSelect: (bedId: string) => void;
}

/** Card per bed; the selected bed is the one open in the editor. */
export function BedList({ beds, selectedId, onSelect }: BedListProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Your beds">
      {beds.map((bed) => {
        const selected = bed.id === selectedId;
        return (
          <li
            key={bed.id}
            className={cn(
              "flex flex-col gap-2 rounded-xl border bg-surface p-4",
              selected ? "border-primary ring-1 ring-primary" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{bed.name}</h3>
              <Badge tone="neutral">{BED_KIND_LABELS[bed.kind]}</Badge>
            </div>
            <p className="text-sm text-muted">
              {bed.columns}×{bed.rows} cells · {bed.cellSizeInches}″ · {SUN_LABELS[bed.sun]}
            </p>
            <p className="text-sm text-muted">
              {bed.placements.length} {bed.placements.length === 1 ? "plant" : "plants"} placed
            </p>
            <Button
              size="sm"
              variant={selected ? "primary" : "secondary"}
              aria-pressed={selected}
              aria-label={`${selected ? "Editing" : "Edit layout of"} ${bed.name}`}
              onClick={() => onSelect(bed.id)}
              className="mt-auto self-start"
            >
              {selected ? "Editing" : "Edit layout"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
