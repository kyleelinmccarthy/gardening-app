"use client";

import { Checkbox, Field, TextInput } from "@/components/ui";
import { FormSection, Grid, NumField, textBinder, type SectionProps } from "./fields";

export function ContainersSection({ values, errors, set }: SectionProps) {
  const text = textBinder(values, set);
  return (
    <FormSection title="Containers">
      <Checkbox label="Suitable for containers" checked={values.containerSuitable} onChange={(e) => set("containerSuitable", e.target.checked)} />
      {values.containerSuitable && (
        <Grid>
          <NumField
            values={values}
            errors={errors}
            set={set}
            field="containerMinGallons"
            label="Minimum container size (gallons)"
            min={0}
            step={0.5}
          />
          <Field label="Container notes">
            <TextInput {...text("containerNotes")} />
          </Field>
        </Grid>
      )}
    </FormSection>
  );
}
