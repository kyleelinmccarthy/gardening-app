"use client";

import { useState, type FormEvent } from "react";
import { PlantLink } from "@/components/plants/PlantLink";
import { Badge, Button, Card, Checkbox, ConfirmButton, Field, NumberInput, Select, TextInput } from "@/components/ui";
import { formatDisplayDate, todayIso } from "@/domain/dates";
import type { Garden, Reminder } from "@/domain/types";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { plantingOptions, sortReminders } from "./careModel";
import { parseReminderForm, type ReminderFields, type ReminderFormValues } from "./formModel";

interface ReminderFormProps {
  garden: Garden;
  initial: ReminderFormValues;
  submitLabel: string;
  onSubmit: (value: ReminderFields) => void;
  onCancel?: () => void;
}
function ReminderForm({ garden, initial, submitLabel, onSubmit, onCancel }: ReminderFormProps) {
  const { catalog } = useAppData();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const set = (key: keyof ReminderFormValues, value: string) => setValues((v) => ({ ...v, [key]: value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = parseReminderForm(values);
    if (!result.ok) return setErrors(result.errors);
    setErrors({});
    onSubmit(result.value);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2">
      <Field label="Title" error={errors.title} className="sm:col-span-2">
        <TextInput value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Prune the roses" />
      </Field>
      <Field label="Due date" error={errors.dueDate}>
        <TextInput type="date" value={values.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
      </Field>
      <Field label="Repeat every (days)" error={errors.repeatDays} hint="Leave empty for a one-off reminder.">
        <NumberInput min={1} value={values.repeatDays} onChange={(e) => set("repeatDays", e.target.value)} />
      </Field>
      <Field label="Plant (optional)" className="sm:col-span-2">
        <Select
          placeholder="Not tied to a plant"
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

function ReminderItem({ garden, reminder, today }: { garden: Garden; reminder: Reminder; today: string }) {
  const { dispatch } = useAppData();
  const [editing, setEditing] = useState(false);
  const planting = garden.plantings.find((p) => p.id === reminder.plantingId);
  const overdue = !reminder.done && reminder.dueDate < today;

  if (editing) {
    return (
      <li className="rounded-lg border border-border bg-surface-muted/50 p-4">
        <ReminderForm
          garden={garden}
          initial={{
            title: reminder.title,
            dueDate: reminder.dueDate,
            repeatDays: reminder.repeatDays ? String(reminder.repeatDays) : "",
            plantingId: reminder.plantingId ?? "",
          }}
          submitLabel="Save reminder"
          onCancel={() => setEditing(false)}
          onSubmit={(changes) => {
            dispatch({ type: "reminder/update", gardenId: garden.id, reminderId: reminder.id, changes });
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <Checkbox
        className="min-w-0 gap-3"
        checked={reminder.done}
        aria-label={`Done: ${reminder.title}`}
        label={<span className={reminder.done ? "text-muted line-through" : "font-medium"}>{reminder.title}</span>}
        hint={
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span>Due {formatDisplayDate(reminder.dueDate, { year: true })}</span>
            {overdue && <Badge tone="danger">Overdue</Badge>}
            {reminder.repeatDays && <Badge>Repeats every {reminder.repeatDays} days</Badge>}
            {planting && <PlantLink plantId={planting.plantId} />}
          </span>
        }
        onChange={(e) =>
          dispatch({ type: "reminder/update", gardenId: garden.id, reminderId: reminder.id, changes: { done: e.target.checked } })
        }
      />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" aria-label={`Edit ${reminder.title}`} onClick={() => setEditing(true)}>
          Edit
        </Button>
        <ConfirmButton
          label="Delete"
          ariaLabel={`Delete ${reminder.title}`}
          prompt="Delete this reminder?"
          onConfirm={() => dispatch({ type: "reminder/delete", gardenId: garden.id, reminderId: reminder.id })}
        />
      </div>
    </li>
  );
}

/** Reminders tab: create, complete, edit and delete custom reminders. */
export function RemindersTab({ garden }: { garden: Garden }) {
  const { dispatch } = useAppData();
  const today = todayIso();
  const [formKey, setFormKey] = useState(0);
  const reminders = sortReminders(garden.reminders);

  return (
    <div className="flex flex-col gap-6">
      <Card title="New reminder" headingLevel="h3">
        <ReminderForm
          key={formKey}
          garden={garden}
          initial={{ title: "", dueDate: today, repeatDays: "", plantingId: "" }}
          submitLabel="Add reminder"
          onSubmit={(fields) => {
            dispatch({
              type: "reminder/add",
              gardenId: garden.id,
              reminder: { id: createId("reminder"), done: false, ...fields },
            });
            setFormKey((k) => k + 1);
          }}
        />
      </Card>
      <Card title="Your reminders" headingLevel="h3">
        {reminders.length === 0 ? (
          <p className="text-sm text-muted">No reminders yet.</p>
        ) : (
          <ul className="divide-y divide-border" aria-label="Reminders">
            {reminders.map((r) => (
              <ReminderItem key={r.id} garden={garden} reminder={r} today={today} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
