"use client";

import { useMemo, useState } from "react";
import { AddToGardenButton } from "@/components/plants/AddToGardenButton";
import { PlantCard } from "@/components/plants/PlantCard";
import { ButtonLink, Card, Checkbox, ChipGroup, EmptyState, LoadingState } from "@/components/ui";
import { recommendPlants } from "@/domain/recommendation";
import { PLANT_CATEGORIES } from "@/domain/types";
import { CATEGORY_EMOJI, CATEGORY_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { HowWeScore } from "./HowWeScore";
import {
  categoryCounts,
  filterByCategory,
  greatMatchSummary,
  groupByVerdict,
  type CategoryFilter,
} from "./recommendationGroups";

/** Ranked plant suggestions for the active garden, grouped by how well they fit. */
export function Recommendations() {
  const { activeGarden, catalog, hydrated } = useAppData();
  const [showAll, setShowAll] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const profile = activeGarden?.profile ?? null;

  const recs = useMemo(
    () => (profile ? recommendPlants(catalog.all(), profile, { includeBlocked: showAll }) : []),
    [catalog, profile, showAll],
  );

  if (!hydrated) return <LoadingState />;

  if (!activeGarden || !profile) {
    return (
      <EmptyState
        icon="🧭"
        title="Set up your garden first"
        description="Recommendations are matched to your space, climate, tools, pets and goals. Answer a few questions and we will do the rest."
        action={<ButtonLink href="/setup">Set up my garden</ButtonLink>}
      />
    );
  }

  const counts = categoryCounts(recs);
  const categoryOptions = [
    { value: "all", label: `All (${recs.length})` },
    ...PLANT_CATEGORIES.filter((c) => counts[c]).map((c) => ({
      value: c,
      label: `${CATEGORY_LABELS[c]} (${counts[c]})`,
      icon: CATEGORY_EMOJI[c],
    })),
  ];
  // The selected category can vanish when the "not a good fit" toggle changes.
  const activeCategory: CategoryFilter = category === "all" || counts[category] ? category : "all";
  const groups = groupByVerdict(filterByCategory(recs, activeCategory));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium text-foreground">{greatMatchSummary(recs, profile)}</p>

      <Card>
        <div className="flex flex-col gap-4">
          <ChipGroup
            label="Category"
            options={categoryOptions}
            value={[activeCategory]}
            onChange={(v) => setCategory((v[0] as CategoryFilter | undefined) ?? "all")}
          />
          <Checkbox
            label="Show plants that aren't a good fit (with reasons)"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
        </div>
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No plants to show"
          description="Nothing in this category fits your garden. Try another category or show plants that aren't a good fit."
        />
      ) : (
        groups.map((group) => (
          <section key={group.verdict} aria-labelledby={`verdict-${group.verdict}`} className="flex flex-col gap-3">
            <h2 id={`verdict-${group.verdict}`} className="text-xl font-semibold">
              {group.label} <span className="text-base font-normal text-muted">({group.items.length})</span>
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((rec) => (
                <li key={rec.plant.id}>
                  <PlantCard
                    plant={rec.plant}
                    recommendation={rec}
                    expandable
                    actions={<AddToGardenButton plantId={rec.plant.id} />}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <HowWeScore />
    </div>
  );
}
