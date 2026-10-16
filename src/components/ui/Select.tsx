"use client";

import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlClasses } from "./field-styles";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly { value: string; label: string }[];
  /** Adds a leading empty option with this text (value `""`). */
  placeholder?: string;
}

/** Native `<select>` built from an options array (see `toOptions` in `@/lib/labels`). */
export function Select({ options, placeholder, className, ...rest }: SelectProps) {
  return (
    <select {...useFieldControl()} className={cn(controlClasses, className)} {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
