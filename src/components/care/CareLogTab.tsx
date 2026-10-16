"use client";

import { useState, type FormEvent } from "react";
import { ConfirmButton } from "@/components/planner/ConfirmButton";
import { Badge, Button, Card, Field, Select, TextInput } from "@/components/ui";
import { formatDisplayDate, todayIso } from "@/domain/dates";
import type { CareType, Garden } from "@/domain/types";
import { CARE_EMOJI, CARE_LABELS, toOptions } from "@/lib/labels";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { filterCareLog, plantingLabel, plantingOptions } from "./careModel";
import { parseLogForm } from "./formModel";

const TYPE_OPTIONS = toOptions(CARE_LABELS);

function AddLogForm({ garden }: { garden: Garden }) {
  const { catalog, dispatch } = useAppData();
  const [type, setType] = useState<CareType>("water");
  const [plantingId, setPlantingId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = parseLogForm({ type, date, plantingId, note });
    if (!result.ok) return setError(result.errors.date);
    setError(undefined);
    dispatch({ type: "care/log", gardenId: garden.id, entry: { id: createId("log"), ...result.value } });
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Care type">
        <Select options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value as CareType)} />
      </Field>
      <Field label="Plant (optional)">
        <Select
          placeholder="Whole garden"
          options={plantingOptions(garden, catalog)}
          value={plantingId}
          onChange={(e) => setPlantingId(e.target.value)}
        />
      </Field>
      <Field label="Date" error={error}>
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="Note (optional)">
        <TextInput value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit">Add log entry</Button>
      </div>
    </form>
  );
}

/** Care log tab: manual entries plus a filterable history, newest first. */
export function CareLogTab({ garden }: { garden: Garden }) {
  const { catalog, dispatch } = useAppData();
  const [plantingFilter, setPlantingFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const entries = filterCareLog(garden.careLog, {
    plantingId: plantingFilter || undefined,
    type: (typeFilter || undefined) as CareType | undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card title="Add a log entry" description="Record care you did outside of the task list." headingLevel="h3">
        <AddLogForm garden={garden} />
      </Card>

      <Card title="History" headingLevel="h3">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Field label="Filter by plant">
            <Select
              placeholder="All plants"
              options={plantingOptions(garden, catalog)}
              value={plantingFilter}
              onChange={(e) => setPlantingFilter(e.target.value)}
            />
          </Field>
          <Field label="Filter by type">
            <Select placeholder="All types" options={TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
          </Field>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">{garden.careLog.length === 0 ? "No care logged yet." : "No entries match these filters."}</p>
        ) : (
          <ul className="divide-y divide-border" aria-label="Care log">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 text-sm">
                  <p className="font-medium">
                    <span aria-hidden="true">{CARE_EMOJI[entry.type]}</span> {CARE_LABELS[entry.type]}
                    {entry.plantingId && <span className="font-normal text-muted"> · {plantingLabel(garden, catalog, entry.plantingId)}</span>}
                  </p>
                  {entry.note && <p className="text-muted">{entry.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{formatDisplayDate(entry.date, { year: true })}</Badge>
                  <ConfirmButton
                    label="Delete"
                    ariaLabel={`Delete ${CARE_LABELS[entry.type]} entry from ${formatDisplayDate(entry.date, { year: true })}`}
                    prompt="Delete this entry?"
                    onConfirm={() => dispatch({ type: "care/deleteLog", gardenId: garden.id, entryId: entry.id })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
