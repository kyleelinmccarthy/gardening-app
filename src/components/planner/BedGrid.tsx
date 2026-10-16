"use client";

import { cn } from "@/lib/cn";
import type { CellStatus } from "@/domain/companions";
import type { Bed, PlantCatalog } from "@/domain/types";
import { cellLabel, cellStatusText, shortName } from "./plannerModel";

export interface BedGridProps {
  bed: Bed;
  catalog: PlantCatalog;
  cellStatus: Record<string, CellStatus>;
  /** Keys ("x,y") of multi-square plants with a neighbour inside their footprint. */
  crowdedCells: ReadonlySet<string>;
  onCellClick: (x: number, y: number) => void;
  /** Hover / focus tracking for live placement warnings; null when leaving. */
  onCellActive: (cell: { x: number; y: number } | null) => void;
}

const STATUS_CLASSES: Record<CellStatus | "crowded" | "empty", string> = {
  crowded: "border-warning bg-warning-soft text-warning",
  good: "border-success bg-success-soft text-success",
  bad: "border-danger bg-danger-soft text-danger",
  neutral: "border-border bg-surface-muted text-foreground",
  empty: "border-dashed border-border bg-surface text-muted hover:bg-surface-muted",
};

const STATUS_MARK: Partial<Record<CellStatus, string>> = { good: "✓", bad: "⚠" };

/** The bed as a CSS grid of square buttons (one per cell). */
export function BedGrid({ bed, catalog, cellStatus, crowdedCells, onCellClick, onCellActive }: BedGridProps) {
  const plantAt = new Map(bed.placements.map((p) => [`${p.x},${p.y}`, p.plantId]));
  const cells = [];
  for (let y = 0; y < bed.rows; y++) {
    for (let x = 0; x < bed.columns; x++) {
      const key = `${x},${y}`;
      const plantId = plantAt.get(key);
      const plant = plantId ? catalog.get(plantId) : undefined;
      const status = plant ? (cellStatus[key] ?? "neutral") : undefined;
      const crowded = plant !== undefined && crowdedCells.has(key);
      cells.push(
        <button
          key={key}
          type="button"
          aria-label={cellLabel(x, y, plant, { status, crowded })}
          title={status ? (cellStatusText(status, crowded) ?? undefined) : undefined}
          onClick={() => onCellClick(x, y)}
          onMouseEnter={() => onCellActive({ x, y })}
          onMouseLeave={() => onCellActive(null)}
          onFocus={() => onCellActive({ x, y })}
          onBlur={() => onCellActive(null)}
          className={cn(
            "relative flex aspect-square min-h-12 min-w-12 flex-col items-center justify-center rounded-lg border-2 p-0.5 text-center transition-colors",
            // A conflict (red) is more urgent than crowding (amber), which then shows as a ring.
            STATUS_CLASSES[status === "bad" ? "bad" : crowded ? "crowded" : (status ?? "empty")],
            crowded && status === "bad" && "ring-2 ring-warning",
          )}
        >
          {plant && (
            <>
              <span aria-hidden="true" className="text-xl leading-none sm:text-2xl">
                {plant.emoji}
              </span>
              <span aria-hidden="true" className="mt-0.5 max-w-full truncate text-[10px] font-medium leading-tight sm:text-xs">
                {shortName(plant.name)}
              </span>
              {crowded && (
                <span aria-hidden="true" className="absolute left-1 top-0.5 text-[10px] font-bold">
                  ↔
                </span>
              )}
              {status && STATUS_MARK[status] && (
                <span aria-hidden="true" className="absolute right-1 top-0.5 text-[10px] font-bold">
                  {STATUS_MARK[status]}
                </span>
              )}
            </>
          )}
        </button>,
      );
    }
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div
        role="group"
        aria-label={`${bed.name} layout, ${bed.columns} columns by ${bed.rows} rows`}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${bed.columns}, minmax(3rem, 1fr))`, maxWidth: `${bed.columns * 6}rem` }}
      >
        {cells}
      </div>
    </div>
  );
}
