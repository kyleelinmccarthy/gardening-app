"use client";

import { Badge } from "@/components/ui";
import { TOOLS } from "@/data/tools";
import { COST_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { GuideCard, GuideList } from "./GuideCard";
import { groupToolsByCategory } from "./guideLookups";

export function ToolGuide() {
  const { activeGarden } = useAppData();
  const owned = activeGarden?.profile.tools ?? [];
  return (
    <div className="flex flex-col gap-8">
      {groupToolsByCategory(TOOLS).map((group) => (
        <section key={group.category} aria-labelledby={`tools-${group.category}`} className="flex flex-col gap-3">
          <h3 id={`tools-${group.category}`} className="text-lg font-semibold">
            {group.label}
          </h3>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {group.tools.map((tool) => (
              <GuideCard
                key={tool.id}
                id={`tool-${tool.id}`}
                title={
                  <>
                    <span aria-hidden="true">{tool.emoji}</span> {tool.name}
                  </>
                }
                badges={
                  <>
                    <Badge>
                      {tool.costTier} · {COST_LABELS[tool.costTier]}
                    </Badge>
                    {owned.includes(tool.id) && <Badge tone="success">✓ You have this</Badge>}
                  </>
                }
              >
                <p>{tool.description}</p>
                <GuideList title="Cheap alternatives" items={tool.alternatives} />
              </GuideCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
