"use client";

import { Badge, Card } from "@/components/ui";
import { SOILS } from "@/data/soils";
import { DRAINAGE_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { GuideCard, GuideList } from "./GuideCard";

export function SoilGuide() {
  const { activeGarden } = useAppData();
  const mySoil = activeGarden?.profile.soilType;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Understanding pH" headingLevel="h3">
          <p className="text-sm text-muted">
            pH measures how acidic (below 7) or alkaline (above 7) your soil is. Most vegetables, herbs and flowers
            prefer a slightly acidic to neutral 6.0–7.0, where nutrients are easiest for roots to absorb. Blueberries
            want it more acidic; lavender and many succulents tolerate more alkaline soil. Lime raises pH slowly;
            elemental sulfur or peat lowers it.
          </p>
        </Card>
        <Card title="Test your soil" headingLevel="h3">
          <p className="text-sm text-muted">
            A cheap test kit (or your local extension service) tells you pH and major nutrients. Test in early spring
            before adding amendments, sampling a few spots about 6 inches deep, and retest every two to three years.
            Try the squeeze test too: a damp handful that holds a ball but crumbles when poked is close to loam.
          </p>
        </Card>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {SOILS.map((soil) => (
          <GuideCard
            key={soil.id}
            id={`soil-${soil.id}`}
            title={soil.name}
            badges={
              <>
                {mySoil === soil.id && <Badge tone="info">Your soil</Badge>}
                <Badge>{DRAINAGE_LABELS[soil.drainage]}</Badge>
                <Badge>Nutrients: {soil.nutrients}</Badge>
                <Badge>
                  pH {soil.typicalPh.min}–{soil.typicalPh.max}
                </Badge>
              </>
            }
          >
            <p>{soil.description}</p>
            <p>
              <strong>How to identify: </strong>
              {soil.identify}
            </p>
            <GuideList title="Pros" items={soil.pros} />
            <GuideList title="Cons" items={soil.cons} />
            <GuideList title="Improve it with" items={soil.improveWith} />
          </GuideCard>
        ))}
      </div>
    </div>
  );
}
