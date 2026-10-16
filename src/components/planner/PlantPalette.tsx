"use client";

import { Field, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PaletteSection } from "./plannerModel";

export type PlannerTool = { kind: "plant"; plantId: string } | { kind: "eraser" } | null;

export interface PlantPaletteProps {
  sections: readonly PaletteSection[];
  tool: PlannerTool;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectPlant: (plantId: string) => void;
  onToggleEraser: () => void;
}

const toolButton = (pressed: boolean) =>
  cn(
    "flex min-h-9 w-full items-center gap-2 rounded-lg border px-2.5 py-1 text-left text-sm transition-colors",
    pressed
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-surface text-foreground hover:bg-surface-muted",
  );

/** Search box, eraser, and plant sections; picking a tool then clicking cells paints the bed. */
export function PlantPalette({ sections, tool, query, onQueryChange, onSelectPlant, onToggleEraser }: PlantPaletteProps) {
  const selectedId = tool?.kind === "plant" ? tool.plantId : null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="sr-only">Plant palette</h3>
      <Field label="Search plants">
        <TextInput type="search" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Tomato, basil…" />
      </Field>

      <button type="button" aria-pressed={tool?.kind === "eraser"} onClick={onToggleEraser} className={toolButton(tool?.kind === "eraser")}>
        <span aria-hidden="true">🧽</span>
        Eraser
      </button>

      <div className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1">
        {sections.length === 0 && <p className="text-sm text-muted">No plants match “{query}”.</p>}
        {sections.map((section) => (
          <section key={section.id} aria-label={section.title}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{section.title}</h4>
            <ul className="flex flex-col gap-1">
              {section.plants.map((plant) => (
                <li key={plant.id}>
                  <button
                    type="button"
                    aria-pressed={selectedId === plant.id}
                    onClick={() => onSelectPlant(plant.id)}
                    className={toolButton(selectedId === plant.id)}
                  >
                    <span aria-hidden="true">{plant.emoji}</span>
                    {plant.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
