"use client";

import { ChipGroup } from "@/components/ui";
import { TOOLS } from "@/data/tools";
import type { ToolId, ToolInfo } from "@/domain/types";
import { TOOL_CATEGORY_LABELS } from "@/lib/labels";
import type { StepProps } from "./step-props";

const CATEGORY_ORDER = Object.keys(TOOL_CATEGORY_LABELS) as ToolInfo["category"][];

export function ToolsStep({ state, dispatch }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-lg bg-info-soft p-3 text-sm text-info">
        Select the tools you already have. Missing tools only lower a plant’s score, they never exclude it. The cost
        tier ($ to $$$) shows roughly what each would cost.
      </p>
      {CATEGORY_ORDER.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category);
        if (tools.length === 0) return null;
        const ids = new Set(tools.map((t) => t.id));
        return (
          <ChipGroup<ToolId>
            key={category}
            multiple
            label={`${TOOL_CATEGORY_LABELS[category]}: I have`}
            options={tools.map((t) => ({ value: t.id, label: `${t.name} (${t.costTier})`, icon: t.emoji }))}
            value={state.tools.filter((id) => ids.has(id))}
            onChange={(selected) =>
              dispatch({
                type: "patch",
                changes: { tools: [...state.tools.filter((id) => !ids.has(id)), ...selected] },
              })
            }
          />
        );
      })}
    </div>
  );
}
