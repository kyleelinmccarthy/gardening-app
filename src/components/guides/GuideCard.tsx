"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useIsTargeted } from "./useLocationHash";

export interface GuideCardProps {
  /** Anchor id, e.g. `insect-aphids`; also the deep-link target. */
  id: string;
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  /** Heading level of the title (default `h3`, directly under a panel's `h2`). */
  headingLevel?: "h3" | "h4";
  children: ReactNode;
}

/** A guide entry with an anchor id; highlighted when the URL hash points at it. */
export function GuideCard({ id, title, description, badges, headingLevel = "h3", children }: GuideCardProps) {
  const targeted = useIsTargeted(id);
  return (
    <div
      id={id}
      tabIndex={-1}
      data-targeted={targeted || undefined}
      className={cn("scroll-mt-24 rounded-xl outline-none", targeted && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
    >
      <Card headingLevel={headingLevel} title={title} description={description} className="h-full">
        {badges && <div className="-mt-2 mb-3 flex flex-wrap gap-1.5">{badges}</div>}
        <div className="flex flex-col gap-3 text-sm">{children}</div>
      </Card>
    </div>
  );
}

export interface GuideListProps {
  title: string;
  items: readonly string[];
  ordered?: boolean;
  /** Heading level of the title (default `h4`, inside an `h3` card). */
  headingLevel?: "h4" | "h5";
}

export function GuideList({ title, items, ordered = false, headingLevel: Heading = "h4" }: GuideListProps) {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <div>
      <Heading className="mb-1 font-semibold text-foreground">{title}</Heading>
      <List className={cn("flex flex-col gap-1 pl-5 text-foreground", ordered ? "list-decimal" : "list-disc")}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </div>
  );
}
