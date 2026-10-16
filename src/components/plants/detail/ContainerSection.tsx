import { Badge, Card } from "@/components/ui";
import type { Plant } from "@/domain/types";

export function ContainerSection({ plant }: { plant: Plant }) {
  const { container } = plant;
  return (
    <Card title="Containers">
      <p className="text-sm">
        {container.suitable ? (
          <>
            <Badge tone="success">Container-friendly</Badge>{" "}
            {container.minGallons ? `Use a pot of at least ${container.minGallons} gallons.` : "Grows well in pots."}
          </>
        ) : (
          <Badge tone="warning">Not suited to containers</Badge>
        )}
      </p>
      {container.notes && <p className="mt-2 text-sm text-muted">{container.notes}</p>}
    </Card>
  );
}
