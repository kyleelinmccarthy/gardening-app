"use client";

import { useState } from "react";
import { fromDisplayTemp, toDisplayTemp } from "@/domain/climate";
import type { TemperatureUnit } from "@/domain/types";
import { NumberInput } from "./NumberInput";

export interface TemperatureInputProps {
  /** Stored value in °F, or null while the field is empty. */
  value: number | null;
  /** Receives whole °F when the typed text is a valid number, or null when it is empty or invalid. */
  onChange: (valueF: number | null) => void;
  unit: TemperatureUnit;
  disabled?: boolean;
}

/**
 * Number input that shows/edits a °F-stored temperature in the user's unit.
 * Clearing the field reports `null` so the owner never keeps a stale value
 * the user can no longer see. Keeps the raw typed text locally so partial
 * input ("-", "") never fights the user.
 */
export function TemperatureInput({ value, onChange, unit, disabled }: TemperatureInputProps) {
  // The typed text is only shown while it still describes the current value
  // (and unit); external changes (e.g. picking a zone) replace it.
  const [draft, setDraft] = useState<{ text: string; forValue: number | null; forUnit: TemperatureUnit } | null>(null);
  const shown =
    draft && draft.forValue === value && draft.forUnit === unit
      ? draft.text
      : value === null
        ? ""
        : String(toDisplayTemp(value, unit));

  return (
    <NumberInput
      value={shown}
      disabled={disabled}
      step={1}
      onChange={(e) => {
        const text = e.target.value;
        const n = Number(text);
        const next = text.trim() !== "" && Number.isFinite(n) ? fromDisplayTemp(n, unit) : null;
        setDraft({ text, forValue: next, forUnit: unit });
        onChange(next);
      }}
    />
  );
}
