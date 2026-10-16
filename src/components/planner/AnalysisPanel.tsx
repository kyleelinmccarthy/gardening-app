"use client";

import { Card } from "@/components/ui";
import type { BedAnalysis } from "@/domain/companions";
import type { CompanionPair, Plant, PlantCatalog } from "@/domain/types";
import { describePair, summarizePlacements } from "./plannerModel";
import type { Bed } from "@/domain/types";

export interface AnalysisPanelProps {
  bed: Bed;
  analysis: BedAnalysis;
  catalog: PlantCatalog;
  /** Good companions of the plant currently selected in the palette. */
  suggestions: readonly Plant[];
  selectedPlant?: Plant;
  onPickSuggestion: (plantId: string) => void;
}

function PairList({ pairs, catalog, symbol, empty }: { pairs: readonly CompanionPair[]; catalog: PlantCatalog; symbol: string; empty: string }) {
  if (pairs.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {pairs.map((pair) => {
        const d = describePair(pair, catalog);
        return (
          <li key={d.key} className="text-sm">
            <span className="font-medium">
              {d.names[0]} {symbol} {d.names[1]}
            </span>
            {d.note && <span className="block text-muted">{d.note}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** Conflicts, benefits, plant counts and companion suggestions for the bed. */
export function AnalysisPanel({ bed, analysis, catalog, suggestions, selectedPlant, onPickSuggestion }: AnalysisPanelProps) {
  const summary = summarizePlacements(bed, catalog);
  return (
    <Card title="Bed analysis" headingLevel="h3" className="flex flex-col gap-4">
      <section aria-label="Conflicts">
        <h4 className="mb-1.5 text-sm font-semibold text-danger">⚠ Conflicts ({analysis.conflicts.length})</h4>
        <PairList pairs={analysis.conflicts} catalog={catalog} symbol="✕" empty="No conflicts — nothing here dislikes its neighbours." />
      </section>
      <section aria-label="Benefits">
        <h4 className="mb-1.5 text-sm font-semibold text-success">✓ Good pairings ({analysis.benefits.length})</h4>
        <PairList pairs={analysis.benefits} catalog={catalog} symbol="♥" empty="No companion pairs yet. Plant friends side by side." />
      </section>
      {selectedPlant && (
        <section aria-label="Good companions to add">
          <h4 className="mb-1.5 text-sm font-semibold">Good companions to add for {selectedPlant.name}</h4>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted">No known companions for {selectedPlant.name}.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-label={`Use ${p.name}`}
                    onClick={() => onPickSuggestion(p.id)}
                    className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-sm hover:bg-surface-muted"
                  >
                    <span aria-hidden="true">{p.emoji}</span>
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {summary.length > 0 && (
        <section aria-label="Plants in this bed">
          <h4 className="mb-1.5 text-sm font-semibold">In this bed</h4>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {summary.map(({ plant, count }) => (
              <li key={plant.id}>
                <span aria-hidden="true">{plant.emoji}</span> {plant.name} × {count}
              </li>
            ))}
          </ul>
        </section>
      )}
    </Card>
  );
}
