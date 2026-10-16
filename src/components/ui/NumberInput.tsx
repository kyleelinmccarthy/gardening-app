"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlClasses } from "./field-styles";

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** `<input type="number">`; pass `min`, `max`, `step` natively. */
export function NumberInput({ className, ...rest }: NumberInputProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      {...useFieldControl()}
      className={cn(controlClasses, className)}
      {...rest}
    />
  );
}
