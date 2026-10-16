"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Card, ReasonList } from "@/components/ui";
import type { Plant, Recommendation } from "@/domain/types";
import { ALLERGEN_LABELS, shortLabel, VERDICT_LABELS, WATER_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { topReasons, VERDICT_TONES } from "./plantCardModel";
import { PlantBadges } from "./PlantBadges";
import { matchingAllergens, petSafetyBadge } from "./plantSafety";

export interface PlantCardProps {
  plant: Plant;
  /** When given, shows the verdict, score and the top reasons. */
  recommendation?: Recommendation;
  /** Let the user expand the full reason list (only with `recommendation`). */
  expandable?: boolean;
  /** Footer slot, e.g. `<AddToGardenButton />`. */
  actions?: ReactNode;
}

/** Summary card used by the plant library and the recommendations page. */
export function PlantCard({ plant, recommendation, expandable = false, actions }: PlantCardProps) {
  const { activeGarden } = useAppData();
  const pets = activeGarden?.profile.pets ?? [];
  const allergies = activeGarden?.profile.allergies ?? [];
  const safety = petSafetyBadge(plant, pets);
  const allergenHits = matchingAllergens(plant, allergies);

  return (
    <Card
      headingLevel="h3"
      className="flex h-full flex-col"
      title={
        <Link href={`/plants/${plant.id}`} className="hover:underline">
          <span aria-hidden="true">{plant.emoji}</span> {plant.name}
        </Link>
      }
      description={<span className="italic">{plant.scientificName}</span>}
    >
      <div className="flex flex-1 flex-col gap-3">
        <PlantBadges plant={plant}>
          <Badge>💧 {WATER_LABELS[plant.water]}</Badge>
        </PlantBadges>

        {(safety || allergenHits.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {safety && <Badge tone={safety.tone}>{safety.label}</Badge>}
            {allergenHits.length > 0 && (
              <Badge tone="warning">
                ⚠ Allergen: {allergenHits.map((a) => shortLabel(ALLERGEN_LABELS[a])).join(", ")}
              </Badge>
            )}
          </div>
        )}

        {recommendation && (
          <div className="flex flex-col gap-2 rounded-lg bg-surface-muted/60 p-3">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <Badge tone={VERDICT_TONES[recommendation.verdict]}>{VERDICT_LABELS[recommendation.verdict]}</Badge>
              <span className="text-muted">
                Score <strong className="text-foreground">{recommendation.score}</strong>/100
              </span>
            </p>
            <ReasonList reasons={topReasons(recommendation.reasons, 2)} />
            {expandable && recommendation.reasons.length > 2 && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-primary">
                  All {recommendation.reasons.length} reasons
                </summary>
                <ReasonList reasons={recommendation.reasons} className="mt-2" />
              </details>
            )}
          </div>
        )}

        {!recommendation && <p className="line-clamp-2 text-sm text-muted">{plant.description}</p>}
      </div>
      {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
    </Card>
  );
}
