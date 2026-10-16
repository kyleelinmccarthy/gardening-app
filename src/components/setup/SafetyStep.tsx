"use client";

import { Checkbox, ChipGroup } from "@/components/ui";
import { ALLERGENS, PETS, type Allergen, type Pet } from "@/domain/types";
import { ALLERGEN_LABELS, PET_EMOJI, PET_LABELS } from "@/lib/labels";
import type { StepProps } from "./step-props";

const PET_OPTIONS = PETS.map((value) => ({ value, label: PET_LABELS[value], icon: PET_EMOJI[value] }));
const ALLERGEN_OPTIONS = ALLERGENS.map((value) => ({ value, label: ALLERGEN_LABELS[value] }));

export function SafetyStep({ state, dispatch }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-lg bg-info-soft p-3 text-sm text-info">
        Toxic plants are flagged and ranked lower for your household. Nothing is hidden, so you stay in control.
      </p>
      <ChipGroup<Pet>
        multiple
        label="Pets that can reach the garden"
        options={PET_OPTIONS}
        value={state.pets}
        onChange={(pets) => dispatch({ type: "patch", changes: { pets } })}
      />
      <ChipGroup<Allergen>
        multiple
        label="Allergies or sensitivities"
        options={ALLERGEN_OPTIONS}
        value={state.allergies}
        onChange={(allergies) => dispatch({ type: "patch", changes: { allergies } })}
      />
      <Checkbox
        label="Young children in the household"
        hint="Plants that are harmful if eaten get a warning."
        checked={state.hasChildren}
        onChange={(e) => dispatch({ type: "patch", changes: { hasChildren: e.target.checked } })}
      />
    </div>
  );
}
