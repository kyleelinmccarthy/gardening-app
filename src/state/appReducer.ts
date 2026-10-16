import { DEFAULT_CELL_SIZE_INCHES, MAX_BED_DIMENSION, MIN_BED_DIMENSION, isContainerBedKind } from "@/domain/constants";
import { todayIso } from "@/domain/dates";
import { createId } from "@/lib/id";
import { withoutUndefined } from "@/lib/object";
import { isCellInBed, sanitizeAppData } from "@/storage/sanitize";
import type {
  AppData,
  AppSettings,
  Bed,
  CareLogEntry,
  Garden,
  GardenProfile,
  JournalEntry,
  Plant,
  Planting,
  Reminder,
} from "@/domain/types";

/**
 * Every garden-scoped action names its garden explicitly (`gardenId`), which
 * keeps the reducer free of "current garden" coupling and trivially testable.
 * Actions that reference an unknown garden / child id leave the state untouched
 * (same object identity, so React skips re-rendering and persisting).
 */
export type AppAction =
  // gardens
  | { type: "garden/create"; garden: Garden }
  | { type: "garden/update"; gardenId: string; name?: string; profile?: Partial<GardenProfile> }
  | { type: "garden/delete"; gardenId: string }
  | { type: "garden/setActive"; gardenId: string }
  // beds
  | { type: "bed/add"; gardenId: string; bed: Bed }
  | { type: "bed/update"; gardenId: string; bedId: string; changes: BedChanges }
  | { type: "bed/delete"; gardenId: string; bedId: string }
  | {
      type: "bed/place";
      gardenId: string;
      bedId: string;
      plantId: string;
      x: number;
      y: number;
      /** Id for an auto-created planting (generated when omitted). */
      plantingId?: string;
      /** ISO date for an auto-created planting (today when omitted). */
      plantedOn?: string;
    }
  | { type: "bed/clearCell"; gardenId: string; bedId: string; x: number; y: number }
  | { type: "bed/clearAll"; gardenId: string; bedId: string }
  // plantings
  | { type: "planting/add"; gardenId: string; planting: Planting }
  | { type: "planting/update"; gardenId: string; plantingId: string; changes: Partial<Omit<Planting, "id">> }
  | { type: "planting/delete"; gardenId: string; plantingId: string }
  // care log
  | { type: "care/log"; gardenId: string; entry: CareLogEntry }
  | { type: "care/deleteLog"; gardenId: string; entryId: string }
  // reminders
  | { type: "reminder/add"; gardenId: string; reminder: Reminder }
  | { type: "reminder/update"; gardenId: string; reminderId: string; changes: Partial<Omit<Reminder, "id">> }
  | { type: "reminder/delete"; gardenId: string; reminderId: string }
  // journal
  | { type: "journal/add"; gardenId: string; entry: JournalEntry }
  | { type: "journal/update"; gardenId: string; entryId: string; changes: Partial<Omit<JournalEntry, "id">> }
  | { type: "journal/delete"; gardenId: string; entryId: string }
  // app-level
  | { type: "customPlant/upsert"; plant: Plant }
  | { type: "customPlant/delete"; plantId: string }
  | { type: "settings/update"; changes: Partial<AppSettings> }
  | { type: "data/replace"; data: AppData };

/** Bed fields that can be edited; placements change only via bed/place & friends. */
export type BedChanges = Partial<Omit<Bed, "id" | "placements">>;

// --- helpers ---------------------------------------------------------------

/** Applies `fn` to one garden. Unknown id, or `fn` returning the same garden, yields the same state. */
function updateGarden(state: AppData, gardenId: string, fn: (garden: Garden) => Garden): AppData {
  const garden = state.gardens.find((g) => g.id === gardenId);
  if (!garden) return state;
  const updated = fn(garden);
  if (updated === garden) return state;
  return { ...state, gardens: state.gardens.map((g) => (g === garden ? updated : g)) };
}

/** Shallow-patches the item with `id`; returns the same array if it is not found. */
function patchById<T extends { id: string }>(items: T[], id: string, changes: Partial<Omit<T, "id">>): T[] {
  if (!items.some((item) => item.id === id)) return items;
  const patch = withoutUndefined(changes);
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.some((item) => item.id === id) ? items.filter((item) => item.id !== id) : items;
}

/** Applies `fn` to one bed of a garden; unknown bed leaves the garden unchanged. */
function updateBed(garden: Garden, bedId: string, fn: (bed: Bed) => Bed): Garden {
  const bed = garden.beds.find((b) => b.id === bedId);
  if (!bed) return garden;
  const updated = fn(bed);
  if (updated === bed) return garden;
  return { ...garden, beds: garden.beds.map((b) => (b === bed ? updated : b)) };
}

const isActivePlanting = (p: Planting) => p.status === "planned" || p.status === "growing";

/** Removes a key from a copy of the object (so it does not serialise as `undefined`). */
function withoutKey<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const { [key]: _removed, ...rest } = obj;
  void _removed;
  return rest;
}

function placeInBed(
  garden: Garden,
  action: Extract<AppAction, { type: "bed/place" }>,
): Garden {
  const bed = garden.beds.find((b) => b.id === action.bedId);
  if (!bed || !isCellInBed(bed, action.x, action.y)) return garden;

  const placements = [
    ...bed.placements.filter((p) => p.x !== action.x || p.y !== action.y),
    { plantId: action.plantId, x: action.x, y: action.y },
  ];

  // Placing a plant implies it is being (or will be) grown in this bed: make sure
  // a planned/growing Planting exists for plant+bed, otherwise create a "planned"
  // one (quantity 1; inContainer when the bed is a pot, windowsill or shelf).
  const hasPlanting = garden.plantings.some(
    (p) => p.plantId === action.plantId && p.bedId === bed.id && isActivePlanting(p),
  );
  const plantings = hasPlanting
    ? garden.plantings
    : [
        ...garden.plantings,
        {
          id: action.plantingId ?? createId("planting"),
          plantId: action.plantId,
          bedId: bed.id,
          quantity: 1,
          plantedOn: action.plantedOn ?? todayIso(),
          status: "planned" as const,
          inContainer: isContainerBedKind(bed.kind),
        },
      ];

  return {
    ...garden,
    beds: garden.beds.map((b) => (b === bed ? { ...bed, placements } : b)),
    plantings,
  };
}

/** Rounds to a whole number within the allowed grid size; non-numbers yield undefined (= "no change"). */
function validDimension(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(MAX_BED_DIMENSION, Math.max(MIN_BED_DIMENSION, Math.round(value)));
}

function validCellSize(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Drops undefined values and replaces invalid grid fields, so a bed always stays serialisable and valid. */
function sanitizeBedChanges(changes: BedChanges): BedChanges {
  const { columns, rows, cellSizeInches, ...rest } = withoutUndefined(changes);
  return withoutUndefined({
    ...rest,
    columns: validDimension(columns),
    rows: validDimension(rows),
    cellSizeInches: validCellSize(cellSizeInches),
  });
}

/** A new bed with in-range dimensions and a positive cell size. */
function normalizeNewBed(bed: Bed): Bed {
  return {
    ...bed,
    columns: validDimension(bed.columns) ?? MIN_BED_DIMENSION,
    rows: validDimension(bed.rows) ?? MIN_BED_DIMENSION,
    cellSizeInches: validCellSize(bed.cellSizeInches) ?? DEFAULT_CELL_SIZE_INCHES,
  };
}

function updateBedDetails(bed: Bed, changes: BedChanges): Bed {
  const next = { ...bed, ...sanitizeBedChanges(changes) };
  // Shrinking the grid drops placements that no longer fit.
  const placements = bed.placements.filter((p) => isCellInBed(next, p.x, p.y));
  return placements.length === bed.placements.length ? next : { ...next, placements };
}

/** Keeps `inContainer` of a bed's plantings in line with the bed's kind. */
function syncContainerFlag(garden: Garden, bed: Bed): Garden {
  const inContainer = isContainerBedKind(bed.kind);
  if (garden.plantings.every((p) => p.bedId !== bed.id || p.inContainer === inContainer)) return garden;
  return {
    ...garden,
    plantings: garden.plantings.map((p) => (p.bedId === bed.id ? { ...p, inContainer } : p)),
  };
}

// --- reducer ---------------------------------------------------------------

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    // gardens
    case "garden/create":
      return { ...state, gardens: [...state.gardens, action.garden], activeGardenId: action.garden.id };
    case "garden/update":
      return updateGarden(state, action.gardenId, (g) => ({
        ...g,
        name: action.name ?? g.name,
        profile: action.profile ? { ...g.profile, ...withoutUndefined(action.profile) } : g.profile,
      }));
    case "garden/delete": {
      if (!state.gardens.some((g) => g.id === action.gardenId)) return state;
      const gardens = state.gardens.filter((g) => g.id !== action.gardenId);
      const activeGardenId =
        state.activeGardenId === action.gardenId ? (gardens[0]?.id ?? null) : state.activeGardenId;
      return { ...state, gardens, activeGardenId };
    }
    case "garden/setActive":
      return state.gardens.some((g) => g.id === action.gardenId)
        ? { ...state, activeGardenId: action.gardenId }
        : state;

    // beds
    case "bed/add":
      return updateGarden(state, action.gardenId, (g) => ({ ...g, beds: [...g.beds, normalizeNewBed(action.bed)] }));
    case "bed/update":
      return updateGarden(state, action.gardenId, (g) => {
        const bed = g.beds.find((b) => b.id === action.bedId);
        if (!bed) return g;
        const updated = updateBedDetails(bed, action.changes);
        const withBed = { ...g, beds: g.beds.map((b) => (b === bed ? updated : b)) };
        return updated.kind === bed.kind ? withBed : syncContainerFlag(withBed, updated);
      });
    case "bed/delete":
      return updateGarden(state, action.gardenId, (g) => {
        if (!g.beds.some((b) => b.id === action.bedId)) return g;
        return {
          ...g,
          beds: g.beds.filter((b) => b.id !== action.bedId),
          plantings: g.plantings.map((p) => (p.bedId === action.bedId ? withoutKey(p, "bedId") : p)),
        };
      });
    case "bed/place":
      return updateGarden(state, action.gardenId, (g) => placeInBed(g, action));
    case "bed/clearCell":
      return updateGarden(state, action.gardenId, (g) =>
        updateBed(g, action.bedId, (bed) => {
          const placements = bed.placements.filter((p) => p.x !== action.x || p.y !== action.y);
          return placements.length === bed.placements.length ? bed : { ...bed, placements };
        }),
      );
    case "bed/clearAll":
      return updateGarden(state, action.gardenId, (g) =>
        updateBed(g, action.bedId, (bed) => (bed.placements.length ? { ...bed, placements: [] } : bed)),
      );

    // plantings
    case "planting/add":
      return updateGarden(state, action.gardenId, (g) => ({ ...g, plantings: [...g.plantings, action.planting] }));
    case "planting/update":
      return updateGarden(state, action.gardenId, (g) => {
        const plantings = patchById(g.plantings, action.plantingId, action.changes);
        return plantings === g.plantings ? g : { ...g, plantings };
      });
    case "planting/delete":
      return updateGarden(state, action.gardenId, (g) => {
        const plantings = removeById(g.plantings, action.plantingId);
        if (plantings === g.plantings) return g;
        // Care history and journal stay; only reminders lose their link.
        const reminders = g.reminders.map((r) =>
          r.plantingId === action.plantingId ? withoutKey(r, "plantingId") : r,
        );
        return { ...g, plantings, reminders };
      });

    // care log
    case "care/log":
      return updateGarden(state, action.gardenId, (g) => ({ ...g, careLog: [...g.careLog, action.entry] }));
    case "care/deleteLog":
      return updateGarden(state, action.gardenId, (g) => {
        const careLog = removeById(g.careLog, action.entryId);
        return careLog === g.careLog ? g : { ...g, careLog };
      });

    // reminders
    case "reminder/add":
      return updateGarden(state, action.gardenId, (g) => ({ ...g, reminders: [...g.reminders, action.reminder] }));
    case "reminder/update":
      return updateGarden(state, action.gardenId, (g) => {
        const reminders = patchById(g.reminders, action.reminderId, action.changes);
        return reminders === g.reminders ? g : { ...g, reminders };
      });
    case "reminder/delete":
      return updateGarden(state, action.gardenId, (g) => {
        const reminders = removeById(g.reminders, action.reminderId);
        return reminders === g.reminders ? g : { ...g, reminders };
      });

    // journal
    case "journal/add":
      return updateGarden(state, action.gardenId, (g) => ({ ...g, journal: [...g.journal, action.entry] }));
    case "journal/update":
      return updateGarden(state, action.gardenId, (g) => {
        const journal = patchById(g.journal, action.entryId, action.changes);
        return journal === g.journal ? g : { ...g, journal };
      });
    case "journal/delete":
      return updateGarden(state, action.gardenId, (g) => {
        const journal = removeById(g.journal, action.entryId);
        return journal === g.journal ? g : { ...g, journal };
      });

    // app-level
    case "customPlant/upsert": {
      const plant = { ...action.plant, custom: true };
      const exists = state.customPlants.some((p) => p.id === plant.id);
      const customPlants = exists
        ? state.customPlants.map((p) => (p.id === plant.id ? plant : p))
        : [...state.customPlants, plant];
      return { ...state, customPlants };
    }
    case "customPlant/delete":
      return { ...state, customPlants: state.customPlants.filter((p) => p.id !== action.plantId) };
    case "settings/update":
      return { ...state, settings: { ...state.settings, ...withoutUndefined(action.changes) } };
    case "data/replace":
      return sanitizeAppData(action.data);
  }
}
