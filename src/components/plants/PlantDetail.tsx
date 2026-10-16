"use client";

import Link from "next/link";
import { Badge, ButtonLink, Card, EmptyState, LoadingState, ReasonList } from "@/components/ui";
import { todayIso } from "@/domain/dates";
import { evaluatePlant } from "@/domain/recommendation";
import { LIFE_CYCLE_LABELS, VERDICT_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { AddToGardenButton } from "./AddToGardenButton";
import { PlantBadges } from "./PlantBadges";
import { VERDICT_TONES } from "./plantCardModel";
import {
  CompanionsSection,
  ConditionsSection,
  ContainerSection,
  SafetySection,
  SoilSection,
  TimelineSection,
  TipsSection,
  ToolsSection,
  WildlifeSection,
} from "./detail";
import { petSafetyBadge } from "./plantSafety";

/** Full plant profile. Looks the plant up client-side so custom plants (stored in the browser) work too. */
export function PlantDetail({ id }: { id: string }) {
  const { catalog, activeGarden, data, hydrated } = useAppData();
  if (!hydrated) return <LoadingState />;

  const plant = catalog.get(id);
  if (!plant) {
    return (
      <EmptyState
        icon="🥀"
        headingLevel="h1"
        title="Plant not found"
        description="We could not find that plant. It may have been a custom plant that was deleted."
        action={<ButtonLink href="/plants">Back to the plant library</ButtonLink>}
      />
    );
  }

  const profile = activeGarden?.profile ?? null;
  const unit = data.settings.temperatureUnit;
  const recommendation = profile ? evaluatePlant(plant, profile) : null;
  const safety = profile ? petSafetyBadge(plant, profile.pets) : null;
  const year = Number(todayIso().slice(0, 4));

  return (
    <div className="flex flex-col gap-5">
      <Link href="/plants" className="text-sm text-primary hover:underline">
        ← Plant library
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span aria-hidden="true">{plant.emoji}</span> {plant.name}
          </h1>
          <p className="italic text-muted">{plant.scientificName}</p>
          <p className="mt-3 text-foreground">{plant.description}</p>
          <PlantBadges plant={plant} className="mt-3">
            <Badge>{LIFE_CYCLE_LABELS[plant.lifeCycle]}</Badge>
            {plant.edible && <Badge tone="success">🍽️ Edible</Badge>}
            {safety && <Badge tone={safety.tone}>{safety.label}</Badge>}
          </PlantBadges>
          {plant.custom && (
            <p className="mt-2 text-sm">
              <Link href="/settings" className="text-primary hover:underline">
                Edit in Settings
              </Link>
            </p>
          )}
        </div>
        <AddToGardenButton plantId={plant.id} size="md" />
      </header>

      <Card title="Fit for your garden">
        {recommendation ? (
          <div className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <Badge tone={VERDICT_TONES[recommendation.verdict]}>{VERDICT_LABELS[recommendation.verdict]}</Badge>
              <span className="text-muted">
                Score <strong className="text-foreground">{recommendation.score}</strong>/100 for{" "}
                {activeGarden?.name}
              </span>
            </p>
            <ReasonList reasons={recommendation.reasons} />
          </div>
        ) : (
          <p className="text-sm text-muted">
            Tell us about your space, climate, pets and goals to see how well this plant suits you.{" "}
            <Link href="/setup" className="font-medium text-primary hover:underline">
              Set up your garden
            </Link>
          </p>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <ConditionsSection plant={plant} unit={unit} profile={profile} />
        <SoilSection plant={plant} />
        <ContainerSection plant={plant} />
        <TimelineSection plant={plant} profile={profile} year={year} />
        <CompanionsSection plant={plant} catalog={catalog} />
        <WildlifeSection plant={plant} />
        <SafetySection plant={plant} profile={profile} />
        <ToolsSection plant={plant} profile={profile} />
      </div>
      <TipsSection plant={plant} />
    </div>
  );
}
