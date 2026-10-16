import type { ReactNode } from "react";

export function Facts({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>;
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-1.5 text-sm font-semibold text-foreground">{children}</h3>;
}

/** "3–5" or "4" when min equals max. */
export const range = (min: number, max: number, suffix = "") =>
  min === max ? `${min}${suffix}` : `${min}–${max}${suffix}`;
