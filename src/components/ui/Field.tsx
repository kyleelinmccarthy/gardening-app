"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldControl {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

const FieldContext = createContext<FieldControl | null>(null);

/**
 * Props (id + aria-*) that `TextInput`, `NumberInput`, `Select` and `Textarea`
 * read automatically when rendered inside a `Field`. Returns `{}` outside one,
 * so the inputs also work standalone. Use it to wire custom controls.
 */
export function useFieldControl(): Partial<FieldControl> {
  return useContext(FieldContext) ?? {};
}

export interface FieldProps {
  label: ReactNode;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** Error message; marks the control `aria-invalid` and is announced. */
  error?: ReactNode;
  className?: string;
  /** Exactly one form control (`TextInput`, `Select`, ...). */
  children: ReactNode;
}

/**
 * Label + control + hint/error, wired together via generated ids.
 *
 * A `Field` wraps exactly ONE form control: the label's `htmlFor`, the hint and
 * the error all point at that single control's id, and every control rendered
 * inside reads the same id. For several related controls (radio/checkbox
 * groups, a min/max pair) use one `Field` per control, or a `fieldset` with a
 * `legend` for the group. A `Checkbox` brings its own label, so it goes
 * outside a `Field`.
 */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control: FieldControl = {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <FieldContext.Provider value={control}>{children}</FieldContext.Provider>
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
