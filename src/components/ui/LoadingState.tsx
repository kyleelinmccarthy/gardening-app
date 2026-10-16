export interface LoadingStateProps {
  /** Text announced to assistive tech and shown above the placeholder. */
  label?: string;
}

/** Placeholder shown while saved data is still being read from the browser. */
export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div role="status" aria-busy="true" className="flex animate-pulse flex-col gap-3">
      <span className="text-sm text-muted">{label}</span>
      <div className="h-10 rounded-lg bg-surface-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 rounded-xl bg-surface-muted" />
        <div className="h-40 rounded-xl bg-surface-muted" />
        <div className="hidden h-40 rounded-xl bg-surface-muted lg:block" />
      </div>
    </div>
  );
}
