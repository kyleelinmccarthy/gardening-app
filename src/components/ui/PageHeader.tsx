import type { ReactNode } from "react";

export interface PageHeaderProps {
  /** Rendered as the page's single `<h1>`. */
  title: ReactNode;
  description?: ReactNode;
  /** Buttons / links aligned to the right (wraps below on mobile). */
  actions?: ReactNode;
}

/** Standard page title block. Use exactly once per route. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
