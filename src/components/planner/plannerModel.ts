/**
 * Pure helpers for the bed planner: palette grouping, labels, warnings and
 * bed-form parsing. No React; companion/density rules stay in `@/domain`.
 */
import { footprintSpan, plantsPerCell, type CellStatus, type CrowdingIssue } from "@/domain/companions";
import type { NewBedInput } from "@/domain/defaults";
import type { Bed, BedKind, CompanionPair, GardenSetting, Plant, PlantCatalog, SunExposure } from "@/domain/types";
import { SUN_LABELS } from "@/lib/labels";

// --- palette ---------------------------------------------------------------

export type PaletteSectionId = "garden" | "recommended" | "all";

export interface PaletteSection {
  id: PaletteSectionId;
  title: string;
  plants: Plant[];
}

export interface PaletteInput {
  allPlants: readonly Plant[];
  /** Plant ids from the garden's plantings (unknown ids are ignored). */
  gardenPlantIds: readonly string[];
  recommended: readonly Plant[];
  query: string;
}

/**
 * Splits plants into "In your garden", "Recommended for you" and "All plants".
 * Each plant appears once (in the first section that claims it); a search
 * query narrows every section and empty sections are dropped.
 */
export function buildPalette({ allPlants, gardenPlantIds, recommended, query }: PaletteInput): PaletteSection[] {
  const q = query.trim().toLowerCase();
  const matches = (p: Plant) =>
    q === "" || p.name.toLowerCase().includes(q) || p.scientificName.toLowerCase().includes(q);
  const byId = new Map(allPlants.map((p) => [p.id, p]));
  const used = new Set<string>();
  const take = (plants: readonly (Plant | undefined)[]): Plant[] => {
    const taken: Plant[] = [];
    for (const p of plants) {
      if (!p || used.has(p.id) || !matches(p)) continue;
      used.add(p.id);
      taken.push(p);
    }
    return taken;
  };

  const sections: PaletteSection[] = [
    { id: "garden", title: "In your garden", plants: take(gardenPlantIds.map((id) => byId.get(id))) },
    { id: "recommended", title: "Recommended for you", plants: take(recommended) },
    { id: "all", title: "All plants", plants: take(allPlants) },
  ];
  return sections.filter((s) => s.plants.length > 0);
}

// --- labels ----------------------------------------------------------------

export interface CellState {
  status?: CellStatus;
  /** A multi-square plant with another plant inside its footprint. */
  crowded?: boolean;
}

const CELL_STATUS_TEXT: Record<CellStatus, string | null> = {
  good: "good companions nearby",
  bad: "next to a plant it should be kept apart from",
  neutral: null,
};

/** What is notable about an occupied cell (colour is not the only cue), or null when nothing is. */
export function cellStatusText(status: CellStatus, crowded: boolean): string | null {
  const parts = [CELL_STATUS_TEXT[status], crowded ? "crowded" : null].filter((p): p is string => p !== null);
  return parts.length > 0 ? parts.join(", ") : null;
}

/** Accessible name for a grid cell; coordinates are 0-based in, 1-based out. */
export function cellLabel(x: number, y: number, plant?: Pick<Plant, "name">, state: CellState = {}): string {
  const base = `Row ${y + 1}, column ${x + 1}: ${plant ? plant.name : "empty"}`;
  const status = plant ? cellStatusText(state.status ?? "neutral", state.crowded ?? false) : null;
  return status ? `${base} — ${status}` : base;
}

/** Name trimmed to `max` characters (with an ellipsis) for tight grid cells. */
export function shortName(name: string, max = 9): string {
  return name.length <= max ? name : `${name.slice(0, max - 1)}…`;
}

// --- warnings & hints ------------------------------------------------------

export function sunMismatch(bed: Pick<Bed, "sun">, plant: Pick<Plant, "sun">): boolean {
  return !plant.sun.includes(bed.sun);
}

export function sunWarning(bed: Pick<Bed, "sun">, plant: Pick<Plant, "name" | "sun">): string | null {
  if (!sunMismatch(bed, plant)) return null;
  const wanted = plant.sun.map((s) => SUN_LABELS[s].toLowerCase()).join(" or ");
  return `${plant.name} prefers ${wanted}, but this bed has ${SUN_LABELS[bed.sun].toLowerCase()}.`;
}

/** The id of the other plant in a pair. */
const otherId = (pair: CompanionPair, plantId: string) => (pair.a === plantId ? pair.b : pair.a);

/** "Fennel conflicts with Tomato next to it", or null when nothing conflicts. */
export function conflictWarning(
  conflicts: readonly CompanionPair[],
  plant: Pick<Plant, "id" | "name">,
  catalog: PlantCatalog,
): string | null {
  if (conflicts.length === 0) return null;
  const names = conflicts.map((c) => catalog.get(otherId(c, plant.id))?.name ?? otherId(c, plant.id));
  return `${plant.name} conflicts with ${names.join(", ")} next to it`;
}

const squares = (span: number) => `${span}×${span} squares`;

/** "4 per square" or "Spreads over about 2×2 squares — keep neighbouring squares free". */
export function densityHint(plant: Plant, cellSizeInches: number): string {
  const span = footprintSpan(plant, cellSizeInches);
  if (span > 1) return `Spreads over about ${squares(span)} — keep neighbouring squares free`;
  return `${plantsPerCell(plant, cellSizeInches).perCell} per square`;
}

/** "Tomato needs about 2×2 squares — Basil at row 1, col 2 is crowding it". */
export function describeCrowding(issue: CrowdingIssue, catalog: PlantCatalog, cellSizeInches: number): string {
  const plant = catalog.get(issue.plantId);
  const name = plant?.name ?? issue.plantId;
  const needs = plant ? ` needs about ${squares(footprintSpan(plant, cellSizeInches))}` : " needs more room";
  const who = issue.neighbours.map((n) => `${catalog.get(n.plantId)?.name ?? n.plantId} at row ${n.y + 1}, col ${n.x + 1}`);
  const list = who.length > 1 ? `${who.slice(0, -1).join(", ")} and ${who[who.length - 1]}` : who[0];
  return `${name}${needs} — ${list} ${who.length > 1 ? "are" : "is"} crowding it`;
}

// --- analysis --------------------------------------------------------------

export interface PairDescription {
  key: string;
  names: [string, string];
  note?: string;
}

/** Display names plus the first companion note either plant declares. */
export function describePair(pair: CompanionPair, catalog: PlantCatalog): PairDescription {
  const a = catalog.get(pair.a);
  const b = catalog.get(pair.b);
  return {
    key: `${pair.a}|${pair.b}`,
    names: [a?.name ?? pair.a, b?.name ?? pair.b],
    note: a?.companionNotes || b?.companionNotes || undefined,
  };
}

export interface PlacementSummary {
  plant: Plant;
  count: number;
}

/** Cells per plant in a bed, most numerous first (unknown plants skipped). */
export function summarizePlacements(bed: Bed, catalog: PlantCatalog): PlacementSummary[] {
  const counts = new Map<string, number>();
  for (const p of bed.placements) counts.set(p.plantId, (counts.get(p.plantId) ?? 0) + 1);
  const summary: PlacementSummary[] = [];
  for (const [id, count] of counts) {
    const plant = catalog.get(id);
    if (plant) summary.push({ plant, count });
  }
  return summary.sort((x, y) => y.count - x.count || x.plant.name.localeCompare(y.plant.name));
}

// --- bed form --------------------------------------------------------------

export const MIN_BED_DIMENSION = 1;
export const MAX_BED_DIMENSION = 20;
export const MAX_CELL_SIZE_INCHES = 120;

export interface BedFormValues {
  name: string;
  kind: BedKind;
  columns: string;
  rows: string;
  cellSizeInches: string;
  sun: SunExposure;
}

export type BedFormField = "name" | "columns" | "rows" | "cellSizeInches";
export type BedFormErrors = Partial<Record<BedFormField, string>>;
export type BedFormResult = { ok: true; value: NewBedInput } | { ok: false; errors: BedFormErrors };

export function defaultBedValues(setting: GardenSetting, sun: SunExposure): BedFormValues {
  const indoor = setting === "indoor";
  return {
    name: "",
    kind: indoor ? "windowsill" : "raised-bed",
    columns: indoor ? "3" : "4",
    rows: indoor ? "2" : "4",
    cellSizeInches: "12",
    sun,
  };
}

export function bedToFormValues(bed: Bed): BedFormValues {
  return {
    name: bed.name,
    kind: bed.kind,
    columns: String(bed.columns),
    rows: String(bed.rows),
    cellSizeInches: String(bed.cellSizeInches),
    sun: bed.sun,
  };
}

function parseDimension(raw: string, label: string): { value?: number; error?: string } {
  const n = Number(raw);
  if (raw.trim() === "" || !Number.isInteger(n) || n < MIN_BED_DIMENSION || n > MAX_BED_DIMENSION) {
    return { error: `${label} must be a whole number from ${MIN_BED_DIMENSION} to ${MAX_BED_DIMENSION}.` };
  }
  return { value: n };
}

export function parseBedForm(values: BedFormValues): BedFormResult {
  const errors: BedFormErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Give the bed a name.";

  const columns = parseDimension(values.columns, "Columns");
  if (columns.error) errors.columns = columns.error;
  const rows = parseDimension(values.rows, "Rows");
  if (rows.error) errors.rows = rows.error;

  const cell = Number(values.cellSizeInches);
  if (values.cellSizeInches.trim() === "" || !(cell > 0) || cell > MAX_CELL_SIZE_INCHES) {
    errors.cellSizeInches = `Cell size must be between 1 and ${MAX_CELL_SIZE_INCHES} inches.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      kind: values.kind,
      columns: columns.value!,
      rows: rows.value!,
      cellSizeInches: cell,
      sun: values.sun,
    },
  };
}
