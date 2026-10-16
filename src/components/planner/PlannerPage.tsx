"use client";

import { useState } from "react";
import { Button, Card, GardenGate, PageHeader } from "@/components/ui";
import { createBed } from "@/domain/defaults";
import type { Garden } from "@/domain/types";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { BedEditor } from "./BedEditor";
import { BedForm } from "./BedForm";
import { BedList } from "./BedList";
import { defaultBedValues } from "./plannerModel";

function Planner({ garden }: { garden: Garden }) {
  const { dispatch } = useAppData();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);

  const selected = garden.beds.find((b) => b.id === selectedId) ?? garden.beds[0];
  const showForm = creating || garden.beds.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Your beds"
        description="Beds, pots, windowsills and shelves in this garden."
        actions={
          !showForm && (
            <Button size="sm" onClick={() => setCreating(true)}>
              New bed
            </Button>
          )
        }
      >
        {garden.beds.length > 0 && <BedList beds={garden.beds} selectedId={selected?.id} onSelect={setSelectedId} />}
        {garden.beds.length === 0 && <p className="mb-3 text-sm text-muted">No beds yet — add one to start laying out your plants.</p>}
        {showForm && (
          <div className={garden.beds.length > 0 ? "mt-4 rounded-lg border border-border bg-surface-muted/50 p-4" : ""}>
            <h3 className="mb-3 font-semibold">New bed</h3>
            <BedForm
              initial={defaultBedValues(garden.profile.setting, garden.profile.sunExposure)}
              submitLabel="Create bed"
              onCancel={garden.beds.length > 0 ? () => setCreating(false) : undefined}
              onSubmit={(input) => {
                const bed = createBed(input, createId("bed"));
                dispatch({ type: "bed/add", gardenId: garden.id, bed });
                setSelectedId(bed.id);
                setCreating(false);
              }}
            />
          </div>
        )}
      </Card>

      {selected && (
        <BedEditor key={selected.id} garden={garden} bed={selected} onDeleted={() => setSelectedId(undefined)} />
      )}
    </div>
  );
}

/** /planner — lay out beds, check companion planting, and plan what goes where. */
export function PlannerPage() {
  return (
    <>
      <PageHeader
        title="Garden planner"
        description="Design your beds square by square. Cells turn green for good companions and red for conflicts."
      />
      <GardenGate>{(garden) => <Planner garden={garden} />}</GardenGate>
    </>
  );
}
