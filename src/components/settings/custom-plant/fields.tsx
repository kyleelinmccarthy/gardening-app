"use client";

import type { ChangeEvent, ReactNode } from "react";
import { Field, NumberInput } from "@/components/ui";
import type { CustomPlantFormValues as Values, PlantFormErrors } from "./model";

export type SetValue = <K extends keyof Values>(key: K, value: Values[K]) => void;
/** Stable list setter shared by every (memoised) `MultiSelectList`. */
export type SetList = (name: string, value: string[]) => void;

/** Props every form section receives. */
export interface SectionProps {
  values: Values;
  errors: PlantFormErrors;
  set: SetValue;
  setList: SetList;
}

/** `value` + `onChange` for a control bound to a string form value. */
export function bindText(values: Values, set: SetValue, key: keyof Values) {
  return {
    value: values[key] as string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(key, e.target.value as never),
  };
}

/** `bindText` pre-applied to a section's values: `const text = textBinder(values, set); <TextInput {...text("name")} />`. */
export const textBinder = (values: Values, set: SetValue) => (key: keyof Values) => bindText(values, set, key);

/** A labelled fieldset card. */
export function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <legend className="px-2 text-base font-semibold text-foreground">{title}</legend>
      {hint && <p className="-mt-2 text-sm text-muted">{hint}</p>}
      {children}
    </fieldset>
  );
}

const GRID_COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: keyof typeof GRID_COLUMNS }) {
  return <div className={`grid gap-4 ${GRID_COLUMNS[cols]}`}>{children}</div>;
}

/** Inline error for a group of controls that has no `Field` of its own. */
export function GroupError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-xs font-medium text-danger">
      {children}
    </p>
  );
}

export interface NumFieldProps extends Pick<SectionProps, "values" | "errors" | "set"> {
  field: keyof Values;
  label: string;
  min?: number;
  max?: number;
  step?: number | string;
  hint?: string;
}

/** A numeric text field bound to a string form value. */
export function NumField({ values, errors, set, field, label, hint, ...inputProps }: NumFieldProps) {
  return (
    <Field label={label} hint={hint} error={errors[field]}>
      <NumberInput {...inputProps} {...bindText(values, set, field)} />
    </Field>
  );
}
