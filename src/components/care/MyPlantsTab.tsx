"use client";

import { ButtonLink, Card } from "@/components/ui";
import { todayIso } from "@/domain/dates";
import type { Garden, PlantingStatus } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { PlantingCard } from "./PlantingCard";

const STATUS_RANK: Record<PlantingStatus, number> = { growing: 0, planned: 1, harvested: 2, removed: 3 };

/** My plants tab: every planting with editable details and care cadence. */
export function MyPlantsTab({ garden }: { garden: Garden }) {
  const { catalog } = useAppData();
  const today = todayIso();
  const plantings = [...garden.plantings].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

  if (plantings.length === 0) {
    return (
      <Card title="No plants yet" description="Add plants from the library or place them in a bed in the planner.">
        <div className="flex gap-2">
          <ButtonLink href="/plants">Browse plants</ButtonLink>
          <ButtonLink href="/planner" variant="secondary">
            Open planner
          </ButtonLink>
        </div>
      </Card>
    );
  }
  return (
    <ul className="flex flex-col gap-3" aria-label="Your plantings">
      {plantings.map((planting) => (
        <PlantingCard key={planting.id} garden={garden} planting={planting} plant={catalog.get(planting.plantId)} today={today} />
      ))}
    </ul>
  );
}
