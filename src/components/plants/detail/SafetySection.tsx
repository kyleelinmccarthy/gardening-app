import { Badge, Card } from "@/components/ui";
import type { GardenProfile, Plant } from "@/domain/types";
import { ALLERGEN_LABELS } from "@/lib/labels";
import { matchingAllergens } from "../plantSafety";
import { ToxicityTable } from "../ToxicityTable";
import { SubHeading } from "./shared";

export function SafetySection({ plant, profile }: { plant: Plant; profile: GardenProfile | null }) {
  const mine = profile ? matchingAllergens(plant, profile.allergies) : [];
  return (
    <Card title="Safety">
      <div className="flex flex-col gap-4">
        <ToxicityTable plant={plant} pets={profile?.pets ?? []} />
        <div>
          <SubHeading>Allergens</SubHeading>
          {plant.allergens.length === 0 ? (
            <p className="text-sm text-muted">No common allergens noted.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {plant.allergens.map((a) => (
                <li key={a}>
                  {ALLERGEN_LABELS[a]}
                  {mine.includes(a) && (
                    <Badge tone="warning" className="ml-2">
                      ⚠ You&apos;re sensitive to this
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
          {plant.allergyNotes && <p className="mt-2 text-sm text-muted">{plant.allergyNotes}</p>}
        </div>
      </div>
    </Card>
  );
}
