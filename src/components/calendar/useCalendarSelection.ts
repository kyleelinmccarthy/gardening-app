import { useMemo, useState } from "react";
import type { ChipOption } from "@/components/ui";
import { recommendPlants } from "@/domain/recommendation";
import type { Garden, Plant, PlantCatalog } from "@/domain/types";
import { applyChipChange, resolveSelection } from "./plantSelection";
import { defaultCalendarPlantIds } from "./timeline";

const RECOMMENDATION_LIMIT = 15;

export interface CalendarSelection {
  selectedIds: string[];
  selectedPlants: Plant[];
  /** Every plant offered as a chip (garden plants, recommendations and any added). */
  chipOptions: ChipOption<string>[];
  /** Catalog plants not yet in the chip pool, for the "add another plant" select. */
  addable: { value: string; label: string }[];
  includeRecommended: boolean;
  setIncludeRecommended: (include: boolean) => void;
  /** Folds a chip-group change into the user's explicit choices. */
  changeSelection: (next: readonly string[]) => void;
  addPlant: (id: string) => void;
}

/**
 * Which plants the calendar shows: the garden's plants (plus top recommendations
 * on request) as defaults, adjusted by the user's explicit toggles and additions.
 */
export function useCalendarSelection(garden: Garden, catalog: PlantCatalog): CalendarSelection {
  const gardenIds = useMemo(() => defaultCalendarPlantIds(garden).filter((id) => catalog.get(id)), [garden, catalog]);
  const recommendedIds = useMemo(
    () => recommendPlants(catalog.all(), garden.profile, { limit: RECOMMENDATION_LIMIT }).map((r) => r.plant.id),
    [catalog, garden.profile],
  );
  const [includeRecommended, setIncludeRecommended] = useState(gardenIds.length === 0);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [extraIds, setExtraIds] = useState<string[]>([]);

  const pool = useMemo(() => [...new Set([...gardenIds, ...recommendedIds, ...extraIds])], [gardenIds, recommendedIds, extraIds]);
  const defaults = useMemo(
    () => new Set([...gardenIds, ...(includeRecommended ? recommendedIds : [])]),
    [gardenIds, recommendedIds, includeRecommended],
  );
  const selectedIds = useMemo(() => resolveSelection(pool, defaults, overrides), [pool, defaults, overrides]);
  const selectedPlants = useMemo(() => selectedIds.flatMap((id) => catalog.get(id) ?? []), [selectedIds, catalog]);

  const chipOptions = pool.flatMap((id) => {
    const plant = catalog.get(id);
    return plant ? [{ value: id, label: plant.name, icon: plant.emoji }] : [];
  });
  const addable = catalog
    .all()
    .filter((p) => !pool.includes(p.id))
    .map((p) => ({ value: p.id, label: `${p.emoji} ${p.name}` }));

  return {
    selectedIds,
    selectedPlants,
    chipOptions,
    addable,
    includeRecommended,
    setIncludeRecommended,
    changeSelection: (next) => setOverrides((o) => applyChipChange(o, selectedIds, next)),
    addPlant: (id) => {
      if (!id) return;
      setExtraIds((ids) => [...ids, id]);
      setOverrides((o) => ({ ...o, [id]: true }));
    },
  };
}
