import { Card } from "@/components/ui";
import type { Plant, PlantCatalog } from "@/domain/types";
import { PlantLink } from "../PlantLink";
import { SubHeading } from "./shared";

export function CompanionsSection({ plant, catalog }: { plant: Plant; catalog: PlantCatalog }) {
  const known = (ids: readonly string[]) => ids.filter((id) => catalog.get(id));
  const good = known(plant.companions);
  const bad = known(plant.antagonists);
  const list = (ids: string[], empty: string) =>
    ids.length === 0 ? (
      <p className="text-sm text-muted">{empty}</p>
    ) : (
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {ids.map((id) => (
          <li key={id}>
            <PlantLink plantId={id} />
          </li>
        ))}
      </ul>
    );
  return (
    <Card title="Companions">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <SubHeading>Good neighbours</SubHeading>
          {list(good, "No particular companions noted.")}
        </div>
        <div>
          <SubHeading>Keep apart</SubHeading>
          {list(bad, "Nothing to avoid.")}
        </div>
      </div>
      {plant.companionNotes && <p className="mt-3 text-sm text-muted">{plant.companionNotes}</p>}
    </Card>
  );
}
