import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Emoji or small node, decorative. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Call to action, typically a `Button` or `ButtonLink`. */
  action?: ReactNode;
}

/** Friendly placeholder for lists/pages without content yet. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-10 text-center">
      {icon && (
        <div aria-hidden="true" className="text-4xl">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
