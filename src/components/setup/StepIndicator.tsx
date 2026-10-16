import { cn } from "@/lib/cn";
import type { SetupStep } from "./setupForm";

export interface StepIndicatorProps {
  steps: readonly SetupStep[];
  /** Index of the current step. */
  current: number;
  onSelect?: (index: number) => void;
  /** Highest step index the user may jump to. */
  maxReachable: number;
}

/** Numbered progress list; reached steps are buttons so users can jump back. */
export function StepIndicator({ steps, current, onSelect, maxReachable }: StepIndicatorProps) {
  return (
    <nav aria-label="Setup progress" className="mb-6">
      <p className="mb-2 text-sm text-muted" aria-live="polite">
        Step {current + 1} of {steps.length}: <span className="font-medium text-foreground">{steps[current].label}</span>
      </p>
      <div
        role="progressbar"
        aria-label="Setup completion"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
      <ol className="hidden flex-wrap gap-2 sm:flex">
        {steps.map((step, i) => {
          const reachable = i <= maxReachable;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable}
                aria-current={i === current ? "step" : undefined}
                onClick={() => onSelect?.(i)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  i === current
                    ? "border-primary bg-primary text-primary-foreground"
                    : i < current
                      ? "border-primary text-primary hover:bg-surface-muted"
                      : "border-border text-muted",
                  !reachable && "cursor-not-allowed opacity-60",
                )}
              >
                <span aria-hidden="true" className="font-semibold">
                  {i < current ? "✓" : i + 1}
                </span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
