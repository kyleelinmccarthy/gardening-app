"use client";

import { ChipGroup, Field, Select, Textarea } from "@/components/ui";
import { INDOOR_LIGHTS, SUN_EXPOSURES, type IndoorLight, type SunExposure } from "@/domain/types";
import { HUMIDITY_LABELS, INDOOR_LIGHT_LABELS, SUN_LABELS, WATER_LABELS, toOptions } from "@/lib/labels";
import { FormSection, Grid, GroupError, NumField, textBinder, type SectionProps } from "./fields";

const SUN_OPTIONS = toOptions(SUN_LABELS, SUN_EXPOSURES);
const INDOOR_LIGHT_OPTIONS = toOptions(INDOOR_LIGHT_LABELS, INDOOR_LIGHTS);
const WATER_OPTIONS = toOptions(WATER_LABELS);
const HUMIDITY_OPTIONS = toOptions(HUMIDITY_LABELS);

export function LightWaterSection({ values, errors, set }: SectionProps) {
  const text = textBinder(values, set);
  return (
    <FormSection title="Light & water">
      <div className="flex flex-col gap-1">
        <ChipGroup<SunExposure>
          multiple
          label="Outdoor sun exposures"
          options={SUN_OPTIONS}
          value={values.sun}
          onChange={(v) => set("sun", v)}
        />
        <GroupError>{errors.sun}</GroupError>
      </div>
      {values.environments.includes("indoor") && (
        <ChipGroup<IndoorLight>
          multiple
          label="Indoor light levels"
          options={INDOOR_LIGHT_OPTIONS}
          value={values.indoorLight}
          onChange={(v) => set("indoorLight", v)}
        />
      )}
      <Grid>
        <Field label="Water need">
          <Select options={WATER_OPTIONS} {...text("water")} />
        </Field>
        <NumField
          values={values}
          errors={errors}
          set={set}
          field="wateringIntervalDays"
          label="Watering interval (days)"
          min={1}
          step={1}
          hint="Days between waterings in mild weather."
        />
        <Field label="Humidity">
          <Select options={HUMIDITY_OPTIONS} {...text("humidity")} />
        </Field>
      </Grid>
      <Field label="Water notes">
        <Textarea {...text("waterNotes")} rows={2} />
      </Field>
    </FormSection>
  );
}
