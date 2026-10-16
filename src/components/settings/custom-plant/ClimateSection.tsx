"use client";

import { Field, TemperatureInput } from "@/components/ui";
import type { TemperatureUnit } from "@/domain/types";
import { FormSection, Grid, GroupError, NumField, type SectionProps } from "./fields";
import type { CustomPlantFormValues } from "./model";

const TEMPERATURE_FIELDS: readonly { key: "minF" | "idealMinF" | "idealMaxF" | "maxF"; label: string }[] = [
  { key: "minF", label: "Minimum survivable" },
  { key: "idealMinF", label: "Ideal low" },
  { key: "idealMaxF", label: "Ideal high" },
  { key: "maxF", label: "Heat stress above" },
];

export function ClimateSection({ values, errors, set, unit }: SectionProps & { unit: TemperatureUnit }) {
  const unitLabel = unit === "C" ? "°C" : "°F";
  const zone = (field: keyof CustomPlantFormValues, label: string) => (
    <NumField values={values} errors={errors} set={set} field={field} label={label} min={1} max={13} step={1} />
  );
  return (
    <FormSection title="Climate" hint={`Temperatures are entered in ${unitLabel} and stored in °F.`}>
      <Grid cols={4}>
        {TEMPERATURE_FIELDS.map(({ key, label }) => (
          <Field key={key} label={`${label} (${unitLabel})`}>
            <TemperatureInput unit={unit} value={values[key]} onChange={(v) => set(key, v)} />
          </Field>
        ))}
      </Grid>
      <GroupError>{errors.minF}</GroupError>
      <Grid>
        {zone("zoneMin", "Hardiness zone from")}
        {zone("zoneMax", "Hardiness zone to")}
      </Grid>
    </FormSection>
  );
}
