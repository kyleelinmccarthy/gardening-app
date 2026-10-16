"use client";

import { useState, type FormEvent } from "react";
import { ConfirmButton } from "@/components/planner/ConfirmButton";
import { PlantLink } from "@/components/plants/PlantLink";
import { Badge, Button, Card, Field, Select, TextInput, Textarea } from "@/components/ui";
import { formatDisplayDate, todayIso } from "@/domain/dates";
import type { Garden, JournalEntry } from "@/domain/types";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { plantingOptions, sortJournal } from "./careModel";
import { parseJournalForm, type JournalFields, type JournalFormValues } from "./formModel";

interface JournalFormProps {
  garden: Garden;
  initial: JournalFormValues;
  submitLabel: string;
  onSubmit: (value: JournalFields) => void;
  onCancel?: () => void;
}

function JournalForm({ garden, initial, submitLabel, onSubmit, onCancel }: JournalFormProps) {
  const { catalog } = useAppData();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const set = (key: keyof JournalFormValues, value: string) => setValues((v) => ({ ...v, [key]: value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = parseJournalForm(values);
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    onSubmit(result.value);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2">
      <Field label="Entry title" error={errors.title}>
        <TextInput value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. First tomatoes!" />
      </Field>
      <Field label="Entry date" error={errors.date}>
        <TextInput type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
      </Field>
      <Field label="Entry text" className="sm:col-span-2">
        <Textarea rows={4} value={values.text} onChange={(e) => set("text", e.target.value)} />
      </Field>
      <Field label="Plant (optional)" className="sm:col-span-2">
        <Select
          placeholder="Not about a specific plant"
          options={plantingOptions(garden, catalog)}
          value={values.plantingId}
          onChange={(e) => set("plantingId", e.target.value)}
        />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function JournalItem({ garden, entry }: { garden: Garden; entry: JournalEntry }) {
  const { dispatch } = useAppData();
  const [editing, setEditing] = useState(false);
  const planting = garden.plantings.find((p) => p.id === entry.plantingId);

  if (editing) {
    return (
      <li className="rounded-lg border border-border bg-surface-muted/50 p-4">
        <JournalForm
          garden={garden}
          initial={{ date: entry.date, title: entry.title, text: entry.text, plantingId: entry.plantingId ?? "" }}
          submitLabel="Save entry"
          onCancel={() => setEditing(false)}
          onSubmit={(changes) => {
            dispatch({ type: "journal/update", gardenId: garden.id, entryId: entry.id, changes });
            setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">{entry.title}</h4>
        <div className="flex items-center gap-2">
          <Badge>{formatDisplayDate(entry.date, { year: true })}</Badge>
          <Button size="sm" variant="secondary" aria-label={`Edit ${entry.title}`} onClick={() => setEditing(true)}>
            Edit
          </Button>
          <ConfirmButton
            label="Delete"
            ariaLabel={`Delete ${entry.title}`}
            prompt="Delete this entry?"
            onConfirm={() => dispatch({ type: "journal/delete", gardenId: garden.id, entryId: entry.id })}
          />
        </div>
      </div>
      {planting && (
        <p className="text-sm">
          <PlantLink plantId={planting.plantId} />
        </p>
      )}
      {entry.text && <p className="whitespace-pre-wrap text-sm text-foreground">{entry.text}</p>}
    </li>
  );
}

/** Journal tab: dated notes, newest first, optionally tied to a planting. */
export function JournalTab({ garden }: { garden: Garden }) {
  const { dispatch } = useAppData();
  const [formKey, setFormKey] = useState(0);
  const entries = sortJournal(garden.journal);

  return (
    <div className="flex flex-col gap-6">
      <Card title="New journal entry" headingLevel="h3">
        <JournalForm
          key={formKey}
          garden={garden}
          initial={{ date: todayIso(), title: "", text: "", plantingId: "" }}
          submitLabel="Add entry"
          onSubmit={(fields) => {
            dispatch({ type: "journal/add", gardenId: garden.id, entry: { id: createId("journal"), ...fields } });
            setFormKey((k) => k + 1);
          }}
        />
      </Card>
      <Card title="Journal" headingLevel="h3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted">No journal entries yet. Jot down what you notice in the garden.</p>
        ) : (
          <ul className="divide-y divide-border" aria-label="Journal entries">
            {entries.map((entry) => (
              <JournalItem key={entry.id} garden={garden} entry={entry} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
