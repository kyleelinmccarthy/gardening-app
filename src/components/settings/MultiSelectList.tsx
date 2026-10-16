"use client";

import { memo, useId, useState } from "react";
import { Checkbox } from "@/components/setup/Checkbox";
import { Button, TextInput } from "@/components/ui";

export interface MultiSelectListProps<T extends string> {
  /** Passed back to `onChange` so one stable handler can serve many lists (keeps `memo` effective). */
  name: string;
  label: string;
  options: readonly { value: T; label: string }[];
  value: readonly T[];
  onChange: (name: string, value: T[]) => void;
  hint?: string;
  error?: string;
}

/**
 * Collapsed summary of the current picks with a filterable checkbox list that
 * opens on demand. Suited to long option sets (plants, insects, tools).
 */
function MultiSelectListImpl<T extends string>({ name, label, options, value, onChange, hint, error }: MultiSelectListProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelId = useId();
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label);

  function toggle(v: T, checked: boolean) {
    onChange(name, checked ? [...value, v] : value.filter((x) => x !== v));
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-sm text-muted">{selectedLabels.length > 0 ? selectedLabels.join(", ") : "None selected"}</p>
        <Button
          size="sm"
          variant="secondary"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Close" : "Choose"} ${label}`}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Done" : `Choose (${value.length})`}
        </Button>
      </div>
      {open && (
        <div id={panelId} className="flex flex-col gap-2">
          <TextInput
            type="search"
            aria-label={`Filter ${label}`}
            placeholder="Filter…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
          <ul className="grid max-h-48 gap-1.5 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-2">
            {visible.length === 0 && <li className="text-sm text-muted">No matches.</li>}
            {visible.map((o) => (
              <li key={o.value}>
                <Checkbox label={o.label} checked={value.includes(o.value)} onChange={(c) => toggle(o.value, c)} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export const MultiSelectList = memo(MultiSelectListImpl) as typeof MultiSelectListImpl;
