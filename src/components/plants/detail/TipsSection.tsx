import { Card } from "@/components/ui";
import type { Plant } from "@/domain/types";

export function TipsSection({ plant }: { plant: Plant }) {
  if (plant.careTips.length === 0 && !plant.harvestTips) return null;
  return (
    <Card title="Care & harvest tips">
      {plant.careTips.length > 0 && (
        <ul className="list-disc pl-5 text-sm">
          {plant.careTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
      {plant.harvestTips && (
        <p className="mt-3 text-sm">
          <strong>Harvest:</strong> {plant.harvestTips}
        </p>
      )}
    </Card>
  );
}
