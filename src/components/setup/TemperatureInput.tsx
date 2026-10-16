"use client";

import { useState } from "react";
import { cToF, fToC } from "@/domain/climate";
import type { TemperatureUnit } from "@/domain/types";
import { NumberInput } from "@/components/ui";

export const toDisplayTemp = (f: number, unit: TemperatureUnit): number => {
  const v = Math.round(unit === "C" ? fToC(f) : f);
  return v === 0 ? 0 : v;
};

/** Whole degrees in the user's unit → whole °F (the storage unit). */
export const fromDisplayTemp = (value: number, unit: TemperatureUnit): number =>
  Math.round(unit === "C" ? cToF(value) : value);

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
  const [text, setText] = useState<string | null>(null);
  const typed = text === null || text.trim() === "" ? Number.NaN : Number(text);
  const inSync = Number.isFinite(typed) && fromDisplayTemp(typed, unit) === value;
  const shown = inSync ? (text as string) : String(toDisplayTemp(value, unit));

  return (
    <NumberInput
      value={shown}
      disabled={disabled}
      step={1}
      onChange={(e) => {
        const next = e.target.value;
        setText(next);
        const n = Number(next);
        if (next.trim() !== "" && Number.isFinite(n)) onChange(fromDisplayTemp(n, unit));
      }}
    />
  );
}
