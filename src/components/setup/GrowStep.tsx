"use client";

import { ChipGroup, Field, NumberInput } from "@/components/ui";
import {
  EXPERIENCE_LEVELS,
  GARDEN_GOALS,
  PLANT_CATEGORIES,
  type Experience,
  type GardenGoal,
  type PlantCategory,
} from "@/domain/types";
import { CATEGORY_EMOJI, CATEGORY_LABELS, EXPERIENCE_LABELS, GOAL_LABELS, toOptions } from "@/lib/labels";
import { ChoiceCards } from "./ChoiceCards";
import type { StepProps } from "./step-props";

const CATEGORY_OPTIONS = PLANT_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
  icon: CATEGORY_EMOJI[value],
}));
const GOAL_OPTIONS = toOptions(GOAL_LABELS, GARDEN_GOALS);

const EXPERIENCE_HINTS: Record<Experience, string> = {
  beginner: "New to growing. Prefer forgiving, easy plants.",
  intermediate: "A few seasons in. Comfortable with some care.",
  advanced: "Happy with demanding plants and techniques.",
};
const EXPERIENCE_OPTIONS = EXPERIENCE_LEVELS.map((value) => ({
  value,
  label: EXPERIENCE_LABELS[value],
  description: EXPERIENCE_HINTS[value],
}));

export function GrowStep({ state, errors, dispatch }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <ChipGroup<PlantCategory>
          multiple
          label="What do you want to grow?"
          options={CATEGORY_OPTIONS}
          value={state.interests}
          onChange={(interests) => dispatch({ type: "patch", changes: { interests } })}
        />
        <p className="text-xs text-muted">Leave empty to see every kind of plant.</p>
      </div>
      <ChipGroup<GardenGoal>
        multiple
        label="Your goals"
        options={GOAL_OPTIONS}
        value={state.goals}
        onChange={(goals) => dispatch({ type: "patch", changes: { goals } })}
      />
      <ChoiceCards<Experience>
        legend="Gardening experience"
        options={EXPERIENCE_OPTIONS}
        value={state.experience}
        columnsClassName="sm:grid-cols-3"
        onChange={(experience) => dispatch({ type: "patch", changes: { experience } })}
      />
      <Field
        label="Hours per week you can spend"
        hint="Used to favour low-maintenance plants when your time is short."
        error={errors.weeklyHours}
        className="max-w-xs"
      >
        <NumberInput
          min={0}
          max={168}
          step={0.5}
          value={Number.isFinite(state.weeklyHours) ? state.weeklyHours : ""}
          onChange={(e) =>
            dispatch({
              type: "patch",
              changes: { weeklyHours: e.target.value === "" ? Number.NaN : Number(e.target.value) },
            })
          }
        />
      </Field>
    </div>
  );
}
