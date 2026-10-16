"use client";

import { useState } from "react";
import type { TemperatureUnit } from "@/domain/types";
import { NumberInput } from "@/components/ui";
import { fromDisplayTemp, toDisplayTemp } from "./temperature";

export interface TemperatureInputProps {
  /** Stored value in °F. */
  value: number;
  /** Receives whole °F whenever the typed text is a valid number. */
  onChange: (valueF: number) => void;
  unit: TemperatureUnit;
  disabled?: boolean;
}

/**
 * Number input that shows/edits a °F-stored temperature in the user's unit.
 * Keeps the raw typed text locally so partial input ("-", "") never fights the user.
 */
export function TemperatureInput({ value, onChange, unit, disabled }: TemperatureInputProps) {
  // The typed text is only shown while it still describes the current value
  // (and unit); external changes (e.g. picking a zone) replace it.
  const [draft, setDraft] = useState<{ text: string; forValue: number; forUnit: TemperatureUnit } | null>(null);
  const shown =
    draft && draft.forValue === value && draft.forUnit === unit ? draft.text : String(toDisplayTemp(value, unit));

  return (
    <NumberInput
      value={shown}
      disabled={disabled}
      step={1}
      onChange={(e) => {
        const text = e.target.value;
        const n = Number(text);
        const valid = text.trim() !== "" && Number.isFinite(n);
        const next = valid ? fromDisplayTemp(n, unit) : value;
        setDraft({ text, forValue: next, forUnit: unit });
        if (valid) onChange(next);
      }}
    />
  );
}
