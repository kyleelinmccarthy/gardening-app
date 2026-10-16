import Link from "next/link";
import { Card } from "@/components/ui";
import type { GardenProfile, Plant } from "@/domain/types";
import { plantingTimeline, relativeWindows } from "../plantDetailModel";

export function TimelineSection({
  plant,
  profile,
  year,
}: {
  plant: Plant;
  profile: GardenProfile | null;
  year: number;
}) {
  const rows = profile ? plantingTimeline(plant, profile.climate, year) : [];
  const relative = relativeWindows(plant.planting);
  return (
    <Card
      title="Planting timeline"
      description={profile ? `For your climate (zone ${profile.climate.hardinessZone}), ${year}` : undefined}
    >
      {rows.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm">
          {rows.map((r) => (
            <li key={r.type} className="flex flex-wrap justify-between gap-2 border-b border-border pb-1.5 last:border-0">
              <span className="font-medium">{r.label}</span>
              <span className="text-muted">{r.range}</span>
            </li>
          ))}
        </ul>
      ) : relative.length > 0 ? (
        <ul className="list-disc pl-5 text-sm">
          {relative.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
      {!profile && relative.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          <Link href="/setup" className="text-primary hover:underline">
            Set up your garden
          </Link>{" "}
          to see exact dates for your climate.
        </p>
      )}
      {plant.planting.notes && <p className="mt-2 text-sm text-muted">{plant.planting.notes}</p>}
      {rows.length === 0 && relative.length === 0 && !plant.planting.notes && (
        <p className="text-sm text-muted">Plant any time the conditions above are met.</p>
      )}
    </Card>
  );
}
