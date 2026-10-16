import type { ReactNode } from "react";

export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

/** Compact "big number + label" tile for dashboards. */
export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
