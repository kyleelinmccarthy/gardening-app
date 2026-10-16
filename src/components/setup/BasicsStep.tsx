"use client";

import { Field, TextInput } from "@/components/ui";
import type { GardenSetting } from "@/domain/types";
import { ChoiceCards } from "./ChoiceCards";
import type { StepProps } from "./step-props";

const SETTING_OPTIONS = [
  {
    value: "outdoor" as const,
    icon: "🌳",
    label: "Outdoor garden",
    description: "Yard, raised beds, allotment, balcony or patio. Your local climate and frost dates matter most.",
  },
  {
    value: "indoor" as const,
    icon: "🪴",
    label: "Indoor garden",
    description: "Windowsills, shelves and grow lights. Light, room temperature and humidity matter most.",
  },
];

export function BasicsStep({ state, errors, dispatch }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Garden name" hint="For example “Backyard beds” or “Kitchen windowsill”." error={errors.name}>
        <TextInput
          value={state.name}
          maxLength={60}
          autoComplete="off"
          onChange={(e) => dispatch({ type: "patch", changes: { name: e.target.value } })}
        />
      </Field>
      <ChoiceCards<GardenSetting>
        legend="Where will you be growing?"
        options={SETTING_OPTIONS}
        value={state.setting}
        onChange={(setting) => dispatch({ type: "patch", changes: { setting } })}
      />
    </div>
  );
}
