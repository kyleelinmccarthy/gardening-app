"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, NumberInput, Select, TextInput } from "@/components/ui";
import type { BedKind, SunExposure } from "@/domain/types";
import { SUN_EXPOSURES } from "@/domain/types";
import { BED_KIND_LABELS, SUN_LABELS, toOptions } from "@/lib/labels";
import {
  MAX_BED_DIMENSION,
  MIN_BED_DIMENSION,
  parseBedForm,
  type BedFormErrors,
  type BedFormValues,
} from "./plannerModel";
import type { NewBedInput } from "@/domain/defaults";

const KIND_OPTIONS = toOptions(BED_KIND_LABELS);
const SUN_OPTIONS = toOptions(SUN_LABELS, SUN_EXPOSURES);

export interface BedFormProps {
  initial: BedFormValues;
  submitLabel: string;
  /** Extra hint under the size fields (e.g. shrinking warning). */
  sizeHint?: string;
  onSubmit: (value: NewBedInput) => void;
  onCancel?: () => void;
}

/** Name / kind / size / sun form shared by "New bed" and "Edit bed". */
export function BedForm({ initial, submitLabel, sizeHint, onSubmit, onCancel }: BedFormProps) {
  const [values, setValues] = useState<BedFormValues>(initial);
  const [errors, setErrors] = useState<BedFormErrors>({});

  const set = <K extends keyof BedFormValues>(key: K, value: BedFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = parseBedForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.value);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2">
      <Field label="Bed name" error={errors.name} className="sm:col-span-2">
        <TextInput value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Herb box" />
      </Field>
      <Field label="Kind">
        <Select options={KIND_OPTIONS} value={values.kind} onChange={(e) => set("kind", e.target.value as BedKind)} />
      </Field>
      <Field label="Sun exposure">
        <Select options={SUN_OPTIONS} value={values.sun} onChange={(e) => set("sun", e.target.value as SunExposure)} />
      </Field>
      <Field label="Columns" error={errors.columns}>
        <NumberInput
          min={MIN_BED_DIMENSION}
          max={MAX_BED_DIMENSION}
          value={values.columns}
          onChange={(e) => set("columns", e.target.value)}
        />
      </Field>
      <Field label="Rows" error={errors.rows}>
        <NumberInput
          min={MIN_BED_DIMENSION}
          max={MAX_BED_DIMENSION}
          value={values.rows}
          onChange={(e) => set("rows", e.target.value)}
        />
      </Field>
      <Field label="Cell size (inches)" error={errors.cellSizeInches} hint={sizeHint ?? "12 inches = one square foot."}>
        <NumberInput min={1} value={values.cellSizeInches} onChange={(e) => set("cellSizeInches", e.target.value)} />
      </Field>
      <div className="flex items-end gap-2 sm:col-span-2">
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
