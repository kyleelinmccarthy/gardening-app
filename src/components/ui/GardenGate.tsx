"use client";

import type { ReactNode } from "react";
import type { Garden } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { ButtonLink } from "./ButtonLink";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

export interface GardenGateProps {
  /** Rendered only once data is loaded and a garden is active. */
  children: (garden: Garden) => ReactNode;
}

/**
 * Page guard for garden-scoped pages (planner, calendar, care): a loading
 * placeholder until saved data has hydrated, a prompt to set up a garden when
 * none is active, otherwise the page body for the active garden.
 */
export function GardenGate({ children }: GardenGateProps) {
  const { hydrated, activeGarden } = useAppData();
  if (!hydrated) return <LoadingState />;
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
