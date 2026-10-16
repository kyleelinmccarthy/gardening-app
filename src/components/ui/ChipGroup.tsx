"use client";

import { cn } from "@/lib/cn";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  /** Optional emoji shown before the label. */
  icon?: string;
}

export interface ChipGroupProps<T extends string> {
  /** Accessible name of the group (also rendered as a visible legend). */
  label: string;
  options: readonly ChipOption<T>[];
  /** Currently selected values (controlled). Single mode: zero or one item. */
  value: readonly T[];
  onChange: (value: T[]) => void;
  /** Multi-select when true; otherwise picking a chip replaces the selection. */
  multiple?: boolean;
  /** Hide the visible label (it stays available to assistive tech). */
  hideLabel?: boolean;
}

/**
 * Toggle chips. Rendered as `role="group"` with `aria-pressed` buttons.
 * Single mode: clicking the selected chip clears it.
 */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple = false,
  hideLabel = false,
}: ChipGroupProps<T>) {
  function toggle(v: T) {
    const selected = value.includes(v);
    if (multiple) onChange(selected ? value.filter((x) => x !== v) : [...value, v]);
    else onChange(selected ? [] : [v]);
  }

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5">
      <span className={cn("text-sm font-medium text-foreground", hideLabel && "sr-only")}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const pressed = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggle(o.value)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                pressed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              {o.icon && <span aria-hidden="true">{o.icon}</span>}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
