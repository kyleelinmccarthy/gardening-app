import { Badge, Card } from "@/components/ui";
import { FERTILIZERS } from "@/data/fertilizers";
import { GuideCard, GuideList } from "./GuideCard";

export function FertilizerGuide() {
  return (
    <div className="flex flex-col gap-6">
      <Card title="Reading the NPK numbers" headingLevel="h3">
        <p className="text-sm text-muted">
          The three numbers on a fertilizer label are the percentages of nitrogen (<strong>N</strong>, leafy growth),
          phosphorus (<strong>P</strong>, roots, flowers and fruit) and potassium (<strong>K</strong>, overall vigour
          and disease resistance). A 10-10-10 is balanced; a high first number suits leafy crops, a high middle number
          encourages blooms. Organic fertilizers are lower in numbers but feed the soil, release slowly and are harder
          to overdo. Always follow the label rate: more is not better.
        </p>
      </Card>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {FERTILIZERS.map((f) => (
          <GuideCard
            key={f.id}
            id={`fertilizer-${f.id}`}
            title={f.name}
            badges={
              <>
                <Badge>NPK {f.npk}</Badge>
                <Badge tone={f.organic ? "success" : "neutral"}>{f.organic ? "Organic" : "Synthetic"}</Badge>
                <Badge tone={f.petSafe ? "success" : "warning"}>{f.petSafe ? "Pet-safe" : "Keep pets away"}</Badge>
              </>
            }
          >
            <p>{f.description}</p>
            <GuideList title="Best for" items={f.bestFor} />
            <p>
              <strong>How to apply: </strong>
              {f.howToApply}
            </p>
            <GuideList title="Cautions" items={f.cautions} />
          </GuideCard>
        ))}
      </div>
    </div>
  );
}
