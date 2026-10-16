"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  /** Helper text shown under the label and announced with the control. */
  hint?: ReactNode;
}

/**
 * A native checkbox with its own label (and optional hint). It is a complete
 * field on its own, so render it outside a `Field`.
 */
export function Checkbox({ label, hint, className, id, "aria-describedby": describedBy, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const described = [describedBy, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex items-start gap-2 text-sm text-foreground", className)}>
      <input
        {...rest}
        id={inputId}
        type="checkbox"
        aria-describedby={described}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div>
        <label htmlFor={inputId} className="cursor-pointer">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
