import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui";
import { FERTILIZERS } from "@/data/fertilizers";
import { TOOLS } from "@/data/tools";
import { formatTemperature } from "@/domain/climate";
import type { GardenProfile, Plant, PlantCatalog, TemperatureUnit } from "@/domain/types";
import {
  ALLERGEN_LABELS,
  DRAINAGE_LABELS,
  FEEDING_LABELS,
  HUMIDITY_LABELS,
  INDOOR_LIGHT_LABELS,
  LIFE_CYCLE_LABELS,
  SOIL_LABELS,
  SUN_LABELS,
  WATER_LABELS,
} from "@/lib/labels";
import { InsectChips } from "./InsectChips";
import { PlantLink } from "./PlantLink";
import {
  densityHint,
  feedingSchedule,
  plantingTimeline,
  relativeWindows,
  toolStatus,
  type ToolStatus,
} from "./plantDetailModel";
import { matchingAllergens } from "./plantSafety";
import { ToxicityTable } from "./ToxicityTable";

const FERTILIZER_BY_ID = new Map(FERTILIZERS.map((f) => [f.id, f]));
const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));

function Facts({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

const SubHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-1.5 text-sm font-semibold text-foreground">{children}</h3>
);

const range = (min: number, max: number, suffix = "") => (min === max ? `${min}${suffix}` : `${min}–${max}${suffix}`);

export function ConditionsSection({
  plant,
  unit,
  profile,
}: {
  plant: Plant;
  unit: TemperatureUnit;
  profile: GardenProfile | null;
}) {
  const t = plant.temperature;
  const zone = profile?.climate.hardinessZone;
  const inZone = zone !== undefined && zone >= plant.hardinessZones.min && zone <= plant.hardinessZones.max;
  return (
    <Card title="Growing conditions">
      <Facts>
        <Fact label="Sunlight (outdoors)">{plant.sun.map((s) => SUN_LABELS[s]).join(", ")}</Fact>
        {plant.indoorLight && plant.indoorLight.length > 0 && (
          <Fact label="Light (indoors)">{plant.indoorLight.map((l) => INDOOR_LIGHT_LABELS[l]).join(", ")}</Fact>
        )}
        <Fact label="Water">
          {WATER_LABELS[plant.water]}; about every {plant.wateringIntervalDays}{" "}
          {plant.wateringIntervalDays === 1 ? "day" : "days"}
          <span className="block text-muted">{plant.waterNotes}</span>
        </Fact>
        <Fact label="Humidity">{HUMIDITY_LABELS[plant.humidity]}</Fact>
        <Fact label="Temperature">
          Ideal {formatTemperature(t.idealMinF, unit)} – {formatTemperature(t.idealMaxF, unit)}
          <span className="block text-muted">
            Damaged below {formatTemperature(t.minF, unit)}; heat stress above {formatTemperature(t.maxF, unit)}
          </span>
        </Fact>
        <Fact label="Hardiness zones">
          Zones {range(plant.hardinessZones.min, plant.hardinessZones.max)}
          {zone !== undefined && (
            <Badge tone={inZone ? "success" : "warning"} className="ml-2">
              {inZone ? `Your zone ${zone} is in range` : `Your zone ${zone} is outside this range`}
            </Badge>
          )}
        </Fact>
        <Fact label="Life cycle">{LIFE_CYCLE_LABELS[plant.lifeCycle]}</Fact>
        {plant.daysToMaturity && (
          <Fact label="Days to maturity">
            {range(plant.daysToMaturity.min, plant.daysToMaturity.max)} days
          </Fact>
        )}
        <Fact label="Size">
          {range(plant.heightInches.min, plant.heightInches.max)}&Prime; tall; space {plant.spacingInches}&Prime; apart
        </Fact>
        <Fact label="Density (square-foot gardening)">{densityHint(plant)}</Fact>
      </Facts>
    </Card>
  );
}

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

function ToolList({ title, items, showOwnership, required }: { title: string; items: ToolStatus[]; showOwnership: boolean; required: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <SubHeading>{title}</SubHeading>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map(({ id, owned }) => {
          const tool = TOOL_BY_ID.get(id);
          return (
            <li key={id} className="flex flex-wrap items-center gap-2">
              <Link href={`/guides#tool-${id}`} className="text-primary hover:underline">
                <span aria-hidden="true">{tool?.emoji}</span> {tool?.name ?? id}
              </Link>
              {showOwnership && owned && <Badge tone="success">✓ You have this</Badge>}
              {showOwnership && !owned && required && <Badge tone="warning">You&apos;ll need this</Badge>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ToolsSection({ plant, profile }: { plant: Plant; profile: GardenProfile | null }) {
  const { required, helpful } = toolStatus(plant, profile?.tools ?? []);
  const showOwnership = profile !== null;
  return (
    <Card title="Tools">
      {required.length === 0 && helpful.length === 0 ? (
        <p className="text-sm text-muted">No special tools needed.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <ToolList title="Required" items={required} showOwnership={showOwnership} required />
          <ToolList title="Helpful" items={helpful} showOwnership={showOwnership} required={false} />
        </div>
      )}
    </Card>
  );
}

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
