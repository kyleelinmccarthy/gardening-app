"use client";

import { Field, Textarea } from "@/components/ui";
import { FormSection, Grid, NumField, textBinder, type SectionProps } from "./fields";

export const FALL_SOW_HINT = "Negative = weeks after first frost (e.g. spring bulbs).";

export function SizeTimingSection({ values, errors, set }: SectionProps) {
  const text = textBinder(values, set);
  const num = { values, errors, set };
  return (
    <FormSection title="Size & timing" hint="Planting windows are in weeks relative to the last spring frost (negative = before).">
      <Grid cols={3}>
        <NumField {...num} field="spacingInches" label="Spacing (inches)" min={1} step={1} />
        <NumField {...num} field="heightMin" label="Minimum height (inches)" min={0} step={1} />
        <NumField {...num} field="heightMax" label="Maximum height (inches)" min={0} step={1} />
        <NumField {...num} field="daysMin" label="Days to maturity (min)" min={1} step={1} hint="Leave both blank if not applicable." />
        <NumField {...num} field="daysMax" label="Days to maturity (max)" min={1} step={1} />
      </Grid>
      <Grid cols={4}>
        <NumField {...num} field="startIndoorsWeeks" label="Start indoors (weeks)" step={1} />
        <NumField {...num} field="directSowWeeks" label="Direct sow (weeks)" step={1} />
        <NumField {...num} field="transplantWeeks" label="Transplant (weeks)" step={1} />
        <NumField {...num} field="fallSowWeeks" label="Fall sow (weeks before first frost)" step={1} hint={FALL_SOW_HINT} />
      </Grid>
      <Field label="Planting notes">
        <Textarea {...text("plantingNotes")} rows={2} />
      </Field>
    </FormSection>
  );
}
