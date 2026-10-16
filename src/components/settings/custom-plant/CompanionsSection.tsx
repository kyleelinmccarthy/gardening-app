"use client";

import { Field, Textarea } from "@/components/ui";
import { MultiSelectList } from "../MultiSelectList";
import { FormSection, textBinder, type SectionProps } from "./fields";

export interface CompanionsSectionProps extends SectionProps {
  /** Plants that can be picked (the plant being edited is already excluded). */
  options: readonly { value: string; label: string }[];
}

export function CompanionsSection({ values, errors, set, setList, options }: CompanionsSectionProps) {
  const text = textBinder(values, set);
  return (
    <FormSection title="Companions" hint="Plants that grow well, or poorly, next to this one.">
      <MultiSelectList name="companions" label="Companion plants" options={options} value={values.companions} onChange={setList} />
      <MultiSelectList
        name="antagonists"
        label="Antagonist plants"
        options={options}
        value={values.antagonists}
        onChange={setList}
        error={errors.antagonists}
      />
      <Field label="Companion notes">
        <Textarea {...text("companionNotes")} rows={2} />
      </Field>
    </FormSection>
  );
}
