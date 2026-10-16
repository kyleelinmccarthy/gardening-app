import { Card } from "@/components/ui";
import type { Plant } from "@/domain/types";
import { InsectChips } from "../InsectChips";
import { SubHeading } from "./shared";

export function WildlifeSection({ plant }: { plant: Plant }) {
  return (
    <Card title="Insects & wildlife">
      <div className="flex flex-col gap-4">
        <div>
          <SubHeading>Attracts (beneficials &amp; pollinators)</SubHeading>
          <InsectChips ids={plant.attracts} emptyText="None noted." />
        </div>
        <div>
          <SubHeading>Common pests</SubHeading>
          <InsectChips ids={plant.pests} emptyText="No common pests noted." />
        </div>
        <div>
          <SubHeading>Helps repel</SubHeading>
          <InsectChips ids={plant.repels} emptyText="None noted." />
        </div>
      </div>
    </Card>
  );
}
