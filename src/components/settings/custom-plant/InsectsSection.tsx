"use client";

import { INSECTS } from "@/data/insects";
import { MultiSelectList } from "../MultiSelectList";
import { FormSection, type SectionProps } from "./fields";

const insectOptions = (roles: readonly string[]) =>
  INSECTS.filter((i) => roles.includes(i.role)).map((i) => ({ value: i.id, label: `${i.emoji} ${i.name}` }));
const BENEFICIAL_OPTIONS = insectOptions(["beneficial", "pollinator"]);
const PEST_OPTIONS = insectOptions(["pest", "animal-pest"]);

export function InsectsSection({ values, setList }: SectionProps) {
  return (
    <FormSection title="Insects">
      <MultiSelectList name="attracts" label="Attracts" options={BENEFICIAL_OPTIONS} value={values.attracts} onChange={setList} />
      <MultiSelectList name="pests" label="Common pests" options={PEST_OPTIONS} value={values.pests} onChange={setList} />
      <MultiSelectList name="repels" label="Repels" options={PEST_OPTIONS} value={values.repels} onChange={setList} />
    </FormSection>
  );
}
