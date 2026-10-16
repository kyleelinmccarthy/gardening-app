"use client";

import { useId, useState } from "react";
import { Checkbox } from "@/components/setup/Checkbox";
import { TextInput } from "@/components/ui";

export interface MultiSelectListProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  hint?: string;
  error?: string;
}

/** Filterable checkbox list for long option sets (plants, insects, tools). */
export function MultiSelectList<T extends string>({ label, options, value, onChange, hint, error }: MultiSelectListProps<T>) {
  const [query, setQuery] = useState("");
  const hintId = useId();
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  function toggle(v: T, checked: boolean) {
    onChange(checked ? [...value, v] : value.filter((x) => x !== v));
  }

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={hint ? hintId : undefined}>
      <legend className="text-sm font-medium text-foreground">
        {label} <span className="font-normal text-muted">({value.length} selected)</span>
      </legend>
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
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
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
