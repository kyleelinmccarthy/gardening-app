"use client";

import { useMemo, useState } from "react";
import { PlantLink } from "@/components/plants/PlantLink";
import { Card, Field, Select } from "@/components/ui";
import type { Plant } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { companionLists } from "./guideLookups";

const PRINCIPLES: readonly { title: string; text: string }[] = [
  {
    title: "The Three Sisters",
    text: "Corn gives beans a pole to climb, beans fix nitrogen for the corn and squash, and broad squash leaves shade out weeds and hold moisture.",
  },
  {
    title: "Trap crops",
    text: "Sacrificial plants such as nasturtiums (for aphids) or radishes (for flea beetles) lure pests away from your main crop. Check them often and remove infested plants.",
  },
  {
    title: "Aromatic repellents",
    text: "Strongly scented herbs and flowers like basil, chives, marigolds and rosemary can mask the smell of crops from pests, and many also draw in pollinators and predators.",
  },
  {
    title: "Allelopathy",
    text: "Some plants release chemicals that stunt neighbours: black walnut, fennel and sunflower are classic examples. Keep them away from sensitive vegetables.",
  },
  {
    title: "Mix heights and roots",
    text: "Pair tall sun-lovers with shade-tolerant low plants, and shallow-rooted crops with deep-rooted ones so they do not compete for the same water and nutrients.",
  },
];

function Relations({ title, plants, empty }: { title: string; plants: Plant[]; empty: string }) {
  return (
    <div>
      <h4 className="mb-1.5 font-semibold text-foreground">{title}</h4>
      {plants.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {plants.map((p) => (
            <li key={p.id}>
              <PlantLink plantId={p.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CompanionGuide() {
  const { catalog } = useAppData();
  const plants = catalog.all();
  const [plantId, setPlantId] = useState("");
  const options = useMemo(() => plants.map((p) => ({ value: p.id, label: `${p.emoji} ${p.name}` })), [plants]);
  const selected = plantId ? catalog.get(plantId) : undefined;
  const lists = useMemo(() => (selected ? companionLists(selected, plants) : null), [selected, plants]);

  return (
    <div className="flex flex-col gap-6">
      <Card title="Companion lookup" headingLevel="h3" description="Pick a plant to see its friends and foes.">
        <div className="flex flex-col gap-4">
          <Field label="Plant" className="max-w-sm">
            <Select
              placeholder="Choose a plant…"
              options={options}
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
            />
          </Field>
          {selected && lists && (
            <div className="grid gap-4 sm:grid-cols-2" aria-live="polite">
              <Relations title="Good companions" plants={lists.companions} empty="No known companions in the catalog." />
              <Relations title="Keep apart" plants={lists.antagonists} empty="Nothing to avoid." />
              {selected.companionNotes && <p className="text-sm text-muted sm:col-span-2">{selected.companionNotes}</p>}
            </div>
          )}
        </div>
      </Card>
      <Card title="Companion planting principles" headingLevel="h3">
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <li key={p.title}>
              <strong>{p.title}.</strong> <span className="text-muted">{p.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
