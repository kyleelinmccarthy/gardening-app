"use client";

import { useId } from "react";
import { Button } from "@/components/ui";
import { todayIso } from "@/domain/dates";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";

export interface AddToGardenButtonProps {
  plantId: string;
  size?: "sm" | "md";
}

/** Adds a "planned" planting to the active garden; shows "✓ In your garden" once one is planned or growing. */
export function AddToGardenButton({ plantId, size = "sm" }: AddToGardenButtonProps) {
  const { activeGarden, dispatch, hydrated } = useAppData();
  const hintId = useId();

  if (!hydrated) {
    return (
      <Button size={size} variant="secondary" disabled>
        Add to my garden
      </Button>
    );
  }

  if (!activeGarden) {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <Button size={size} variant="secondary" disabled aria-describedby={hintId}>
          Add to my garden
        </Button>
        <span id={hintId} className="text-xs text-muted">
          Set up a garden first
        </span>
      </span>
    );
  }

  const inGarden = activeGarden.plantings.some(
    (p) => p.plantId === plantId && (p.status === "planned" || p.status === "growing"),
  );
  if (inGarden) {
    return (
      <span className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-success-soft px-3 py-1 text-sm font-medium text-success">
        <span aria-hidden="true">✓</span> In your garden
      </span>
    );
  }

  const { profile } = activeGarden;
  function add() {
    if (!activeGarden) return;
    dispatch({
      type: "planting/add",
      gardenId: activeGarden.id,
      planting: {
        id: createId("planting"),
        plantId,
        quantity: 1,
        plantedOn: todayIso(),
        status: "planned",
        inContainer: profile.containersOnly || profile.setting === "indoor",
      },
    });
  }

  return (
    <Button size={size} variant="secondary" onClick={add}>
      <span aria-hidden="true">＋</span> Add to my garden
    </Button>
  );
}
