"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, ConfirmButton } from "@/components/ui";
import { analyzeBed, placementConflicts, suggestCompanions } from "@/domain/companions";
import { todayIso } from "@/domain/dates";
import { recommendPlants } from "@/domain/recommendation";
import type { Bed, Garden } from "@/domain/types";
import { createId } from "@/lib/id";
import { BED_KIND_LABELS, SUN_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { AnalysisPanel } from "./AnalysisPanel";
import { BedForm } from "./BedForm";
import { BedGrid } from "./BedGrid";
import { PlantPalette, type PlannerTool } from "./PlantPalette";
import {
  bedToFormValues,
  buildPalette,
  conflictWarning,
  densityHint,
  sunWarning,
} from "./plannerModel";

const RECOMMENDED_LIMIT = 12;
const COMPANION_LIMIT = 8;

export interface BedEditorProps {
  garden: Garden;
  bed: Bed;
  onDeleted: () => void;
}

/** Grid + palette + analysis for one bed, plus rename/resize/delete. */
export function BedEditor({ garden, bed, onDeleted }: BedEditorProps) {
  const { dispatch, catalog } = useAppData();
  const [tool, setTool] = useState<PlannerTool>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<{ x: number; y: number } | null>(null);
  const [editing, setEditing] = useState(false);

  const allPlants = catalog.all();
  const gardenPlantIds = useMemo(
    () => [...new Set(garden.plantings.filter((p) => p.status === "planned" || p.status === "growing").map((p) => p.plantId))],
    [garden.plantings],
  );
  const recommended = useMemo(
    () => recommendPlants(catalog.all(), garden.profile, { limit: RECOMMENDED_LIMIT }).map((r) => r.plant),
    [catalog, garden.profile],
  );
  const sections = useMemo(
    () => buildPalette({ allPlants, gardenPlantIds, recommended, query }),
    [allPlants, gardenPlantIds, recommended, query],
  );
  const analysis = useMemo(() => analyzeBed(bed, catalog), [bed, catalog]);

  const selectedPlant = tool?.kind === "plant" ? catalog.get(tool.plantId) : undefined;
  const suggestions = useMemo(
    () => (selectedPlant ? suggestCompanions(selectedPlant, catalog, COMPANION_LIMIT) : []),
    [selectedPlant, catalog],
  );

  const sunNote = selectedPlant ? sunWarning(bed, selectedPlant) : null;
  const liveConflict =
    selectedPlant && active
      ? conflictWarning(placementConflicts(bed, selectedPlant.id, active.x, active.y, catalog), selectedPlant, catalog)
      : null;

  function handleCellClick(x: number, y: number) {
    if (tool?.kind === "plant") {
      dispatch({
        type: "bed/place",
        gardenId: garden.id,
        bedId: bed.id,
        plantId: tool.plantId,
        x,
        y,
        plantingId: createId("planting"),
        plantedOn: todayIso(),
      });
    } else if (tool?.kind === "eraser") {
      dispatch({ type: "bed/clearCell", gardenId: garden.id, bedId: bed.id, x, y });
    }
  }

  return (
    <Card
      title={bed.name}
      description={`${BED_KIND_LABELS[bed.kind]} · ${bed.columns}×${bed.rows} cells of ${bed.cellSizeInches}″ · ${SUN_LABELS[bed.sun]}`}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
            Edit bed
          </Button>
          <ConfirmButton
            label="Delete bed"
            prompt={`Delete ${bed.name}?`}
            onConfirm={() => {
              dispatch({ type: "bed/delete", gardenId: garden.id, bedId: bed.id });
              onDeleted();
            }}
          />
        </>
      }
      className="flex flex-col gap-4"
    >
      {editing && (
        <div className="mb-4 rounded-lg border border-border bg-surface-muted/50 p-4">
          <BedForm
            initial={bedToFormValues(bed)}
            submitLabel="Save bed"
            sizeHint="Shrinking the bed removes plants outside the new size."
            onCancel={() => setEditing(false)}
            onSubmit={(value) => {
              dispatch({ type: "bed/update", gardenId: garden.id, bedId: bed.id, changes: value });
              setEditing(false);
            }}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <div aria-live="polite" className="flex min-h-6 flex-col gap-1.5">
            {tool?.kind === "eraser" && <p className="text-sm text-muted">Eraser: click a cell to clear it.</p>}
            {!tool && <p className="text-sm text-muted">Pick a plant (or the eraser) from the palette, then click cells.</p>}
            {selectedPlant && (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span aria-hidden="true" className="text-lg">{selectedPlant.emoji}</span>
                <strong>{selectedPlant.name}</strong>
                <Badge tone="info">{densityHint(selectedPlant, bed.cellSizeInches)}</Badge>
              </p>
            )}
            {sunNote && <p role="status" className="rounded-md bg-warning-soft px-2 py-1 text-sm text-warning">☀ {sunNote}</p>}
            {liveConflict && <p role="alert" className="rounded-md bg-danger-soft px-2 py-1 text-sm text-danger">⚠ {liveConflict}</p>}
          </div>

          <BedGrid
            bed={bed}
            catalog={catalog}
            cellStatus={analysis.cellStatus}
            onCellClick={handleCellClick}
            onCellActive={setActive}
          />

          <div>
            <ConfirmButton
              label="Clear bed"
              prompt="Remove every plant from this bed?"
              confirmLabel="Yes, clear"
              onConfirm={() => dispatch({ type: "bed/clearAll", gardenId: garden.id, bedId: bed.id })}
            />
          </div>

          <AnalysisPanel
            bed={bed}
            analysis={analysis}
            catalog={catalog}
            suggestions={suggestions}
            selectedPlant={selectedPlant}
            onPickSuggestion={(plantId) => setTool({ kind: "plant", plantId })}
          />
        </div>

        <aside aria-label="Plant palette">
          <PlantPalette
            sections={sections}
            tool={tool}
            query={query}
            onQueryChange={setQuery}
            onSelectPlant={(plantId) =>
              setTool((t) => (t?.kind === "plant" && t.plantId === plantId ? null : { kind: "plant", plantId }))
            }
            onToggleEraser={() => setTool((t) => (t?.kind === "eraser" ? null : { kind: "eraser" }))}
          />
        </aside>
      </div>
    </Card>
  );
}
