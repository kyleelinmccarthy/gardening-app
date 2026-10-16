"use client";

import { TOOLS } from "@/data/tools";
import { MultiSelectList } from "../MultiSelectList";
import { FormSection, type SectionProps } from "./fields";

const TOOL_OPTIONS = TOOLS.map((t) => ({ value: t.id, label: `${t.emoji} ${t.name}` }));

export function ToolsSection({ values, errors, setList }: SectionProps) {
  return (
    <FormSection title="Tools">
      <MultiSelectList name="requiredTools" label="Required tools" options={TOOL_OPTIONS} value={values.requiredTools} onChange={setList} />
      <MultiSelectList
        name="helpfulTools"
        label="Helpful tools"
        options={TOOL_OPTIONS}
        value={values.helpfulTools}
        onChange={setList}
        error={errors.helpfulTools}
      />
    </FormSection>
  );
}
