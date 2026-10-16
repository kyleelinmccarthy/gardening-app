"use client";

import { useMemo, useState } from "react";
import { PlantLink } from "@/components/plants/PlantLink";
import { Badge, Field, TextInput } from "@/components/ui";
import { INSECTS } from "@/data/insects";
import type { Insect, Plant } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { GuideCard, GuideList } from "./GuideCard";
import {
  insectsInGroup,
  plantsAffectedBy,
  plantsAttracting,
  plantsRepelling,
  searchInsects,
  type InsectGroup,
} from "./guideLookups";

const ROLE_BADGES: Record<Insect["role"], { label: string; tone: "danger" | "warning" | "success" | "info" }> = {
  pest: { label: "Pest", tone: "danger" },
  "animal-pest": { label: "Wildlife pest", tone: "warning" },
  beneficial: { label: "Beneficial", tone: "success" },
  pollinator: { label: "Pollinator", tone: "info" },
};

function PlantLinks({ title, plants }: { title: string; plants: Plant[] }) {
  if (plants.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1 font-semibold text-foreground">{title}</h4>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {plants.map((p) => (
          <li key={p.id}>
            <PlantLink plantId={p.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const COPY: Record<InsectGroup, { search: string; signs: string; manage: string }> = {
  pests: { search: "Search pests & wildlife", signs: "Signs to look for", manage: "How to manage it" },
  beneficials: { search: "Search beneficials & pollinators", signs: "How to recognise it", manage: "How to attract it" },
};

/** Searchable insect/wildlife entries for one group (pests, or beneficials & pollinators). */
export function InsectGuide({ group }: { group: InsectGroup }) {
  const { catalog } = useAppData();
  const [query, setQuery] = useState("");
  const copy = COPY[group];
  const plants = catalog.all();
  const insects = useMemo(() => searchInsects(insectsInGroup(INSECTS, group), query), [group, query]);

  return (
    <div className="flex flex-col gap-4">
      <Field label={copy.search}>
        <TextInput type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or symptom…" />
      </Field>
      {insects.length === 0 ? (
        <p className="text-sm text-muted">Nothing matches &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {insects.map((insect) => {
            const role = ROLE_BADGES[insect.role];
            const isPest = group === "pests";
            return (
              <GuideCard
                key={insect.id}
                id={`insect-${insect.id}`}
                title={
                  <>
                    <span aria-hidden="true">{insect.emoji}</span> {insect.name}
                  </>
                }
                badges={<Badge tone={role.tone}>{role.label}</Badge>}
              >
                <p>{insect.description}</p>
                <GuideList title={copy.signs} items={insect.signs} />
                <GuideList title={copy.manage} items={insect.management} ordered />
                {insect.safetyNotes && (
                  <p className="rounded-lg bg-warning-soft p-2 text-warning">
                    <strong>Safety: </strong>
                    {insect.safetyNotes}
                  </p>
                )}
                {isPest ? (
                  <>
                    <PlantLinks title="Plants affected" plants={plantsAffectedBy(insect.id, plants)} />
                    <PlantLinks title="Plants that help deter it" plants={plantsRepelling(insect.id, plants)} />
                  </>
                ) : (
                  <PlantLinks title="Plants that attract them" plants={plantsAttracting(insect.id, plants)} />
                )}
              </GuideCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
