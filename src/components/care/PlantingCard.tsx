"use client";

import { useState } from "react";
import { PlantLink } from "@/components/plants/PlantLink";
import { Badge, Button, Checkbox, ConfirmButton, Field, NumberInput, Select, TextInput } from "@/components/ui";
import { lastLogDate } from "@/domain/care";
import { formatDisplayDate } from "@/domain/dates";
import { applyStatusChange } from "@/domain/plantings";
import type { CareLogEntry, Garden, Plant, Planting, PlantingStatus } from "@/domain/types";
import { PLANTING_STATUS_LABELS, toOptions } from "@/lib/labels";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { intervalLabel, plantingIntervals } from "./careModel";

const STATUS_OPTIONS = toOptions(PLANTING_STATUS_LABELS);

export interface PlantingCardProps {
  garden: Garden;
  planting: Planting;
  plant: Plant | undefined;
  today: string;
}

/** One planting: editable details, computed care cadence, and quick log buttons. */
export function PlantingCard({ garden, planting, plant, today }: PlantingCardProps) {
  const { dispatch } = useAppData();
  const name = plant?.name ?? planting.plantId.replace(/-/g, " ");
  const bed = garden.beds.find((b) => b.id === planting.bedId);

  const [quantity, setQuantity] = useState(String(planting.quantity));
  const [notes, setNotes] = useState(planting.notes ?? "");

  const update = (changes: Partial<Omit<Planting, "id">>) =>
    dispatch({ type: "planting/update", gardenId: garden.id, plantingId: planting.id, changes });

  const log = (type: CareLogEntry["type"]) =>
    dispatch({
      type: "care/log",
      gardenId: garden.id,
      entry: { id: createId("log"), plantingId: planting.id, type, date: today },
    });

  const intervals = plant ? plantingIntervals(planting, plant, garden.profile, today) : null;
  const lastWatered = lastLogDate(garden.careLog, planting.id, "water");
  const lastFed = lastLogDate(garden.careLog, planting.id, "fertilize");
  const when = (iso?: string) => (iso ? formatDisplayDate(iso, { year: true }) : "not logged yet");

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold">
            <PlantLink plantId={planting.plantId} />
          </h2>
          <p className="text-sm text-muted">{bed ? `Bed: ${bed.name}` : "Not placed in a bed"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" aria-label={`Log watering for ${name}`} onClick={() => log("water")}>
            💧 Log watering
          </Button>
          <Button size="sm" variant="secondary" aria-label={`Log feeding for ${name}`} onClick={() => log("fertilize")}>
            🧪 Log feeding
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={`Status of ${name}`}>
          <Select
            options={STATUS_OPTIONS}
            value={planting.status}
            onChange={(e) => update(applyStatusChange(planting, e.target.value as PlantingStatus, today))}
          />
        </Field>
        <Field label={`Planted date of ${name}`}>
          <TextInput
            type="date"
            value={planting.plantedOn}
            onChange={(e) => e.target.value && update({ plantedOn: e.target.value })}
          />
        </Field>
        <Field label={`Quantity of ${name}`}>
          <NumberInput
            min={1}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n >= 1) update({ quantity: n });
            }}
            onBlur={() => setQuantity(String(planting.quantity))}
          />
        </Field>
        <Checkbox
          className="self-end pb-2"
          label={`${name} is in a container`}
          checked={planting.inContainer}
          onChange={(e) => update({ inContainer: e.target.checked })}
        />
        <Field label={`Notes on ${name}`} className="sm:col-span-2 lg:col-span-4">
          <TextInput
            value={notes}
            placeholder="Variety, where you bought it, quirks…"
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (planting.notes ?? "") && update({ notes: notes.trim() || undefined })}
          />
        </Field>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {intervals && (
          <>
            <div className="flex gap-1.5">
              <dt className="text-muted">Water</dt>
              <dd>
                <Badge tone="info">{intervalLabel(intervals.waterEvery)}</Badge>
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted">Feed</dt>
              <dd>
                <Badge tone="info">{intervalLabel(intervals.feedEvery)}</Badge>
              </dd>
            </div>
          </>
        )}
        <div className="flex gap-1.5">
          <dt className="text-muted">Last watered</dt>
          <dd>{when(lastWatered)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted">Last fed</dt>
          <dd>{when(lastFed)}</dd>
        </div>
      </dl>

      <div>
        <ConfirmButton
          label="Delete"
          ariaLabel={`Delete ${name} planting`}
          prompt={`Delete this ${name} planting?`}
          onConfirm={() => dispatch({ type: "planting/delete", gardenId: garden.id, plantingId: planting.id })}
        />
      </div>
    </li>
  );
}
