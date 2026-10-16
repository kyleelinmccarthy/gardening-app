import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: ReactNode;
  hint?: ReactNode;
  onChange: (checked: boolean) => void;
}

/** A labelled native checkbox (the shared ui kit has no checkbox primitive). */
export function CheckboxField({ label, hint, onChange, className, ...rest }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        className={className ?? "mt-0.5 size-4 shrink-0 accent-primary"}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span>
        {label}
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}
