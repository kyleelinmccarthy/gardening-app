/** Selection of calendar plants: defaults plus the user's explicit toggles. */

export type SelectionOverrides = Readonly<Record<string, boolean>>;

/** Pool members that are selected: an explicit override wins, otherwise the default. */
export function resolveSelection(
  pool: readonly string[],
  defaults: ReadonlySet<string>,
  overrides: SelectionOverrides,
): string[] {
  return pool.filter((id) => overrides[id] ?? defaults.has(id));
}

/** Folds a chip-group change (previous → next selection) into the overrides. */
export function applyChipChange(
  overrides: SelectionOverrides,
  previous: readonly string[],
  next: readonly string[],
): SelectionOverrides {
  const result: Record<string, boolean> = { ...overrides };
  for (const id of next) if (!previous.includes(id)) result[id] = true;
  for (const id of previous) if (!next.includes(id)) result[id] = false;
  return result;
}
