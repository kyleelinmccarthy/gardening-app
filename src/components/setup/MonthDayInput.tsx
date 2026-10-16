"use client";

import { useId } from "react";
import { Select } from "@/components/ui";
import { MONTH_NAMES } from "./month-names";

export interface MonthDayInputProps {
  label: string;
  /** "MM-DD" */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1).padStart(2, "0"), label: String(i + 1) }));
const MONTHS = MONTH_NAMES.map((label, i) => ({ value: String(i + 1).padStart(2, "0"), label }));

/** Month + day pair of selects for a year-less date such as a frost date. */
export function MonthDayInput({ label, value, onChange, error, disabled }: MonthDayInputProps) {
  const errorId = useId();
  const [month = "01", day = "01"] = value.split("-");
  const describedBy = error ? errorId : undefined;
  return (
    <fieldset className="flex flex-col gap-1.5" disabled={disabled}>
      <legend className="mb-1.5 text-sm font-medium text-foreground">{label}</legend>
      <div className="flex gap-2">
        <Select
          aria-label={`${label} month`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          options={MONTHS}
          value={month}
          onChange={(e) => onChange(`${e.target.value}-${day}`)}
        />
        <Select
          aria-label={`${label} day`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="max-w-24"
          options={DAYS}
          value={day}
          onChange={(e) => onChange(`${month}-${e.target.value}`)}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
