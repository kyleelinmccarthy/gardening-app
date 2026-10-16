import { Badge, Card } from "@/components/ui";
import { formatTemperature } from "@/domain/climate";
import type { GardenProfile, Plant, TemperatureUnit } from "@/domain/types";
import { HUMIDITY_LABELS, INDOOR_LIGHT_LABELS, LIFE_CYCLE_LABELS, SUN_LABELS, WATER_LABELS } from "@/lib/labels";
import { densityHint } from "../plantDetailModel";
import { Fact, Facts, range } from "./shared";

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
