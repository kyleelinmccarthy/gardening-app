"use client";

import type { ReactNode } from "react";
import { ButtonLink, EmptyState } from "@/components/ui";
import type { Garden } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";

export interface GardenGateProps {
  /** Rendered only once data is loaded and a garden is active. */
  children: (garden: Garden) => ReactNode;
}

/**
 * Shared page guard: "Loading…" until saved data has hydrated, a prompt to
 * set up a garden when none is active, otherwise the page body.
 * (Shared by /planner, /calendar and /care; a candidate to hoist into `ui/`.)
 */
export function GardenGate({ children }: GardenGateProps) {
  const { hydrated, activeGarden } = useAppData();
  if (!hydrated) {
    return (
      <p role="status" className="text-muted">
        Loading…
      </p>
    );
  }
  if (!activeGarden) {
    return (
      <EmptyState
        icon="🌱"
        title="Set up your garden first"
        description="Tell us about your space and climate, then come back to plan, schedule and care for your plants."
        action={<ButtonLink href="/setup">Set up my garden</ButtonLink>}
      />
    );
  }
  return <>{children(activeGarden)}</>;
}
