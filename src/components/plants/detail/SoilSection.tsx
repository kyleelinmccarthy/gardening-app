import Link from "next/link";
import { Card } from "@/components/ui";
import { FERTILIZERS } from "@/data/fertilizers";
import type { Plant } from "@/domain/types";
import { DRAINAGE_LABELS, FEEDING_LABELS, SOIL_LABELS } from "@/lib/labels";
import { feedingSchedule } from "../plantDetailModel";
import { Fact, Facts, range } from "./shared";

const FERTILIZER_BY_ID = new Map(FERTILIZERS.map((f) => [f.id, f]));

export function SoilSection({ plant }: { plant: Plant }) {
  const { soil, fertilizer } = plant;
  return (
    <Card title="Soil & fertilizer">
      <Facts>
        <Fact label="Soil types">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {soil.types.map((s) => (
              <Link key={s} href={`/guides#soil-${s}`} className="text-primary hover:underline">
                {SOIL_LABELS[s]}
              </Link>
            ))}
          </span>
        </Fact>
        <Fact label="pH / drainage">
          pH {range(soil.phMin, soil.phMax)}; {DRAINAGE_LABELS[soil.drainage].toLowerCase()}
        </Fact>
        <Fact label="Feeding">
          {FEEDING_LABELS[fertilizer.feeding]}; {feedingSchedule(fertilizer.frequencyDays).toLowerCase()}
        </Fact>
        <Fact label="Recommended fertilizers">
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {fertilizer.recommended.map((id) => (
              <Link key={id} href={`/guides#fertilizer-${id}`} className="text-primary hover:underline">
                {FERTILIZER_BY_ID.get(id)?.name ?? id}
              </Link>
            ))}
          </span>
        </Fact>
      </Facts>
      {fertilizer.notes && <p className="mt-3 text-sm text-muted">{fertilizer.notes}</p>}
    </Card>
  );
}
