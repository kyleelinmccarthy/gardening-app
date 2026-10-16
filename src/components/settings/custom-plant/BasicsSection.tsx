"use client";

import { Checkbox, ChipGroup, Field, Select, TextInput, Textarea } from "@/components/ui";
import { PLANT_CATEGORIES, type GardenSetting } from "@/domain/types";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, LIFE_CYCLE_LABELS, SETTING_LABELS, toOptions } from "@/lib/labels";
import { FormSection, Grid, GroupError, textBinder, type SectionProps } from "./fields";

const ENVIRONMENT_OPTIONS = toOptions(SETTING_LABELS, ["outdoor", "indoor"] satisfies GardenSetting[]);
const CATEGORY_OPTIONS = toOptions(CATEGORY_LABELS, PLANT_CATEGORIES);
const LIFE_CYCLE_OPTIONS = toOptions(LIFE_CYCLE_LABELS);
const DIFFICULTY_OPTIONS = toOptions(DIFFICULTY_LABELS);

export function BasicsSection({ values, errors, set }: SectionProps) {
  const text = textBinder(values, set);
  return (
    <FormSection title="Basics">
      <Grid>
        <Field label="Name" error={errors.name}>
          <TextInput {...text("name")} maxLength={80} autoComplete="off" />
        </Field>
        <Field label="Scientific name">
          <TextInput {...text("scientificName")} maxLength={120} autoComplete="off" />
        </Field>
        <Field label="Emoji">
          <TextInput {...text("emoji")} maxLength={8} className="max-w-24" />
        </Field>
        <Field label="Category">
          <Select options={CATEGORY_OPTIONS} {...text("category")} />
        </Field>
        <Field label="Life cycle">
          <Select options={LIFE_CYCLE_OPTIONS} {...text("lifeCycle")} />
        </Field>
        <Field label="Difficulty">
          <Select options={DIFFICULTY_OPTIONS} {...text("difficulty")} />
        </Field>
      </Grid>
      <Field label="Description">
        <Textarea {...text("description")} />
      </Field>
      <div className="flex flex-col gap-1">
        <ChipGroup<GardenSetting>
          multiple
          label="Environments"
          options={ENVIRONMENT_OPTIONS}
          value={values.environments}
          onChange={(v) => set("environments", v)}
        />
        <GroupError>{errors.environments}</GroupError>
      </div>
      <Checkbox label="Edible" checked={values.edible} onChange={(e) => set("edible", e.target.checked)} />
    </FormSection>
  );
}
