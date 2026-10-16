"use client";

import { ChipGroup, Field, Select, Textarea } from "@/components/ui";
import { ALLERGENS, TOXICITY_LEVELS, type Allergen } from "@/domain/types";
import { ALLERGEN_LABELS, PET_LABELS, TOXICITY_LABELS, toOptions } from "@/lib/labels";
import { FormSection, Grid, textBinder, type SectionProps } from "./fields";
import { TOXICITY_TARGETS, type CustomPlantFormValues } from "./model";

const TOXICITY_OPTIONS = toOptions(TOXICITY_LABELS, TOXICITY_LEVELS);
const ALLERGEN_OPTIONS = toOptions(ALLERGEN_LABELS, ALLERGENS);

export function SafetySection({ values, set }: SectionProps) {
  const text = textBinder(values, set);
  return (
    <FormSection title="Safety">
      <Grid cols={3}>
        {TOXICITY_TARGETS.map((target) => (
          <Field key={target} label={`Toxicity to ${target === "human" ? "humans" : `${PET_LABELS[target].toLowerCase()}s`}`}>
            <Select
              options={TOXICITY_OPTIONS}
              value={values.toxicity[target]}
              onChange={(e) =>
                set("toxicity", { ...values.toxicity, [target]: e.target.value as CustomPlantFormValues["toxicity"][typeof target] })
              }
            />
          </Field>
        ))}
      </Grid>
      <Field label="Toxicity notes" hint="Which parts are toxic and what symptoms to expect.">
        <Textarea {...text("toxicityNotes")} rows={2} />
      </Field>
      <ChipGroup<Allergen> multiple label="Allergens" options={ALLERGEN_OPTIONS} value={values.allergens} onChange={(v) => set("allergens", v)} />
      <Field label="Allergy notes">
        <Textarea {...text("allergyNotes")} rows={2} />
      </Field>
    </FormSection>
  );
}
