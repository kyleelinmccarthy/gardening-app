"use client";

import { ChipGroup, Field, Textarea } from "@/components/ui";
import { GARDEN_GOALS, type GardenGoal } from "@/domain/types";
import { GOAL_LABELS, toOptions } from "@/lib/labels";
import { FormSection, textBinder, type SectionProps } from "./fields";

const GOAL_OPTIONS = toOptions(GOAL_LABELS, GARDEN_GOALS);

export function GoalsTipsSection({ values, set }: SectionProps) {
  const text = textBinder(values, set);
  return (
    <FormSection title="Goals & tips">
      <ChipGroup<GardenGoal> multiple label="Goals this plant serves" options={GOAL_OPTIONS} value={values.goals} onChange={(v) => set("goals", v)} />
      <Field label="Care tips" hint="One tip per line.">
        <Textarea {...text("careTips")} rows={4} />
      </Field>
      <Field label="Harvest tips">
        <Textarea {...text("harvestTips")} rows={2} />
      </Field>
    </FormSection>
  );
}
