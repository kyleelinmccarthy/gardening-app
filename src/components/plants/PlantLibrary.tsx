"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Button, Card, Checkbox, ChipGroup, EmptyState, Field, LoadingState, Select, TextInput } from "@/components/ui";
import { filterPlants } from "@/domain/filters";
import { evaluatePlant } from "@/domain/recommendation";
import { DIFFICULTIES, GARDEN_GOALS, PLANT_CATEGORIES, SUN_EXPOSURES, WATER_NEEDS } from "@/domain/types";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  SETTING_LABELS,
  SUN_LABELS,
  toOptions,
  WATER_LABELS,
} from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import { AddToGardenButton } from "./AddToGardenButton";
import {
  countActiveFilters,
  DEFAULT_LIBRARY_STATE,
  sortPlants,
  toPlantFilters,
  type LibrarySort,
  type LibraryState,
} from "./libraryFilters";
import { PlantCard } from "./PlantCard";

const CATEGORY_OPTIONS = PLANT_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
  icon: CATEGORY_EMOJI[value],
}));
const SUN_OPTIONS = toOptions(SUN_LABELS, SUN_EXPOSURES);
const WATER_OPTIONS = toOptions(WATER_LABELS, WATER_NEEDS);
const DIFFICULTY_OPTIONS = toOptions(DIFFICULTY_LABELS, DIFFICULTIES);
const GOAL_OPTIONS = toOptions(GOAL_LABELS, GARDEN_GOALS);
const ENVIRONMENT_OPTIONS = [
  { value: "outdoor", label: SETTING_LABELS.outdoor },
  { value: "indoor", label: SETTING_LABELS.indoor },
];
const ZONE_OPTIONS = Array.from({ length: 13 }, (_, i) => ({ value: String(i + 1), label: `Zone ${i + 1}` }));

/** Searchable, filterable library of every built-in and custom plant. */
export function PlantLibrary() {
  const { catalog, activeGarden, hydrated } = useAppData();
  const [state, setState] = useState<LibraryState>(DEFAULT_LIBRARY_STATE);
  const profile = activeGarden?.profile ?? null;

  const set = <K extends keyof LibraryState>(key: K, value: LibraryState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  // Typing stays responsive: the (cheap) filtering follows the query one render behind.
  const deferredQuery = useDeferredValue(state.query);
  const filtered = useMemo(
    () => filterPlants(catalog.all(), toPlantFilters({ ...state, query: deferredQuery }, profile)),
    [catalog, state, deferredQuery, profile],
  );
  // Scoring is the expensive part; it depends only on the catalog and garden, never on the filters.
  const wantsScores = state.sort === "match" && profile !== null;
  const scores = useMemo(
    () => (wantsScores ? new Map(catalog.all().map((p) => [p.id, evaluatePlant(p, profile).score])) : null),
    [catalog, profile, wantsScores],
  );
  const results = useMemo(
    () => sortPlants(filtered, state.sort, (p) => scores?.get(p.id) ?? 0),
    [filtered, state.sort, scores],
  );

  if (!hydrated) return <LoadingState />;

  const activeCount = countActiveFilters(state);
  const sortOptions = [
    { value: "name", label: "Name (A–Z)" },
    { value: "difficulty", label: "Easiest first" },
    ...(profile ? [{ value: "match", label: "Best match for my garden" }] : []),
  ];
  // The garden may have been removed/switched while "match" was selected.
  const sortValue: LibrarySort = state.sort === "match" && !profile ? "name" : state.sort;

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Find plants"
        actions={
          activeCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setState({ ...DEFAULT_LIBRARY_STATE, sort: state.sort })}>
              Clear filters ({activeCount})
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Search plants" hint="Name, scientific name or description">
            <TextInput
              type="search"
              value={state.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="e.g. tomato, basil, succulent…"
            />
          </Field>
          <ChipGroup
            label="Category"
            multiple
            options={CATEGORY_OPTIONS}
            value={state.categories}
            onChange={(v) => set("categories", v)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ChipGroup label="Sun" multiple options={SUN_OPTIONS} value={state.sun} onChange={(v) => set("sun", v)} />
            <ChipGroup label="Water" multiple options={WATER_OPTIONS} value={state.water} onChange={(v) => set("water", v)} />
            <ChipGroup
              label="Difficulty"
              multiple
              options={DIFFICULTY_OPTIONS}
              value={state.difficulty}
              onChange={(v) => set("difficulty", v)}
            />
            <ChipGroup label="Goals" multiple options={GOAL_OPTIONS} value={state.goals} onChange={(v) => set("goals", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Grown">
              <Select
                placeholder="Indoors or outdoors"
                options={ENVIRONMENT_OPTIONS}
                value={state.environment}
                onChange={(e) => set("environment", e.target.value as LibraryState["environment"])}
              />
            </Field>
            <Field label="Hardiness zone">
              <Select
                placeholder="Any zone"
                options={ZONE_OPTIONS}
                value={state.zone === null ? "" : String(state.zone)}
                onChange={(e) => set("zone", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="Sort by">
              <Select options={sortOptions} value={sortValue} onChange={(e) => set("sort", e.target.value as LibrarySort)} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Checkbox label="Container-friendly" checked={state.containerOnly} onChange={(e) => set("containerOnly", e.target.checked)} />
            <Checkbox label="Edible only" checked={state.edibleOnly} onChange={(e) => set("edibleOnly", e.target.checked)} />
            <Checkbox
              label="Safe for my pets"
              hint={profile ? (profile.pets.length ? undefined : "Your garden has no pets") : "Set up a garden to use this"}
              checked={state.petSafe}
              disabled={!profile}
              onChange={(e) => set("petSafe", e.target.checked)}
            />
            <Checkbox
              label="Exclude my allergens"
              hint={profile ? (profile.allergies.length ? undefined : "No allergies in your profile") : "Set up a garden to use this"}
              checked={state.excludeMyAllergens}
              disabled={!profile}
              onChange={(e) => set("excludeMyAllergens", e.target.checked)}
            />
          </div>
        </div>
      </Card>

      <h2 className="sr-only">Plants</h2>
      <p aria-live="polite" className="text-sm text-muted">
        {results.length} {results.length === 1 ? "plant" : "plants"}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No plants match these filters"
          description="Try a different search or loosen some filters."
          action={
            <Button variant="secondary" onClick={() => setState({ ...DEFAULT_LIBRARY_STATE, sort: state.sort })}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((plant) => (
            <li key={plant.id}>
              <PlantCard plant={plant} actions={<AddToGardenButton plantId={plant.id} />} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
