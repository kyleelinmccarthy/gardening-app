"use client";

import { useState } from "react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import type { Plant } from "@/domain/types";
import { CATEGORY_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { CustomPlantForm } from "./CustomPlantForm";

type Editing = { plant?: Plant } | null;

export function CustomPlantsSection() {
  const { data, dispatch, catalog } = useAppData();
  const [editing, setEditing] = useState<Editing>(null);

  function remove(plant: Plant) {
    const ok = window.confirm(`Delete the custom plant “${plant.name}”? Its plantings and bed placements will be removed from all of your gardens.`);
    if (ok) dispatch({ type: "customPlant/delete", plantId: plant.id });
  }

  if (editing) {
    return (
      <Card title={editing.plant ? `Edit ${editing.plant.name}` : "New custom plant"} description="Add a plant that isn't in the library. It will appear in recommendations, the planner and the calendar.">
        <CustomPlantForm
          initial={editing.plant}
          unit={data.settings.temperatureUnit}
          catalogPlants={catalog.all()}
          onCancel={() => setEditing(null)}
          onSave={(plant) => {
            dispatch({ type: "customPlant/upsert", plant });
            setEditing(null);
          }}
        />
      </Card>
    );
  }

  return (
    <Card
      title="Custom plants"
      description="Plants you've added yourself."
      actions={
        <Button size="sm" onClick={() => setEditing({})}>
          Add custom plant
        </Button>
      }
    >
      {data.customPlants.length === 0 ? (
        <EmptyState icon="🌱" title="No custom plants yet" description="Growing something that isn't in the library? Add it with its own care, safety and companion details." />
      ) : (
        <ul className="divide-y divide-border">
          {data.customPlants.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  <span aria-hidden="true">{p.emoji} </span>
                  {p.name}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  {p.scientificName && <em>{p.scientificName}</em>}
                  <Badge>{CATEGORY_LABELS[p.category]}</Badge>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" aria-label={`Edit ${p.name}`} onClick={() => setEditing({ plant: p })}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
