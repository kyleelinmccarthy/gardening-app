"use client";

import { ChipGroup, Field, Select, Textarea } from "@/components/ui";
import { FERTILIZERS } from "@/data/fertilizers";
import { SOIL_TYPES, type SoilType } from "@/domain/types";
import { DRAINAGE_LABELS, FEEDING_LABELS, SOIL_LABELS, toOptions } from "@/lib/labels";
import { MultiSelectList } from "../MultiSelectList";
import { FormSection, Grid, GroupError, NumField, textBinder, type SectionProps } from "./fields";

const SOIL_OPTIONS = toOptions(SOIL_LABELS, SOIL_TYPES);
const DRAINAGE_OPTIONS = toOptions(DRAINAGE_LABELS);
const FEEDING_OPTIONS = toOptions(FEEDING_LABELS);
const FERTILIZER_OPTIONS = FERTILIZERS.map((f) => ({ value: f.id, label: f.name }));

export function SoilFeedingSection({ values, errors, set, setList }: SectionProps) {
  const text = textBinder(values, set);
  const num = { values, errors, set };
  return (
    <FormSection title="Soil & feeding">
      <div className="flex flex-col gap-1">
        <ChipGroup<SoilType>
          multiple
          label="Soil types"
          options={SOIL_OPTIONS}
          value={values.soilTypes}
          onChange={(v) => set("soilTypes", v)}
        />
        <GroupError>{errors.soilTypes}</GroupError>
      </div>
      <Grid cols={3}>
        <NumField {...num} field="phMin" label="Minimum soil pH" min={0} max={14} step={0.1} />
        <NumField {...num} field="phMax" label="Maximum soil pH" min={0} max={14} step={0.1} />
        <Field label="Drainage">
          <Select options={DRAINAGE_OPTIONS} {...text("drainage")} />
        </Field>
        <Field label="Feeding level">
          <Select options={FEEDING_OPTIONS} {...text("feeding")} />
        </Field>
        <NumField {...num} field="feedFrequencyDays" label="Feeding frequency (days)" min={0} step={1} hint="0 means do not feed." />
      </Grid>
      <MultiSelectList
        name="fertilizers"
        label="Recommended fertilizers"
        options={FERTILIZER_OPTIONS}
        value={values.fertilizers}
        onChange={setList}
      />
      <Field label="Feeding notes">
        <Textarea {...text("fertilizerNotes")} rows={2} />
      </Field>
    </FormSection>
  );
}
