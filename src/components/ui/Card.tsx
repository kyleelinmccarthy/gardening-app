import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  /** Optional heading; when present the card is labelled by it. */
  title?: ReactNode;
  /** Small supporting text under the title. */
  description?: ReactNode;
  /** Right-aligned header content, e.g. a `Button`. */
  actions?: ReactNode;
  /** Heading level for the title (default `h2`). */
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
  children?: ReactNode;
}

/** Surface container with an optional header (title, description, actions). */
export function Card({
  title,
  description,
  actions,
  headingLevel: Heading = "h2",
  className,
  children,
}: CardProps) {
  const titleId = useId();
  const hasHeader = title || description || actions;
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn("rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5", className)}
    >
      {hasHeader && (
        <header className={cn("flex flex-wrap items-start justify-between gap-3", Boolean(children) && "mb-4")}>
          <div className="min-w-0">
            {title && (
              <Heading id={titleId} className="text-lg font-semibold text-foreground">
                {title}
              </Heading>
            )}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
