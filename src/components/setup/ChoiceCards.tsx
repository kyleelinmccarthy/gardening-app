"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export interface ChoiceCardOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

export interface ChoiceCardsProps<T extends string> {
  legend: string;
  options: readonly ChoiceCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Tailwind grid-cols classes for the option grid. */
  columnsClassName?: string;
}

/** Radio group rendered as selectable cards (native radios: keyboard + screen reader friendly). */
export function ChoiceCards<T extends string>({
  legend,
  options,
  value,
  onChange,
  columnsClassName = "sm:grid-cols-2",
}: ChoiceCardsProps<T>) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-foreground">{legend}</legend>
      <div className={cn("grid gap-3", columnsClassName)}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors hover:bg-surface-muted",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              value === o.value ? "border-primary bg-surface-muted ring-1 ring-primary" : "border-border bg-surface",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-1 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block font-medium text-foreground">
                {o.icon && (
                  <span aria-hidden="true" className="mr-1.5">
                    {o.icon}
                  </span>
                )}
                {o.label}
              </span>
              {o.description && <span className="mt-0.5 block text-sm text-muted">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
