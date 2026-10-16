import type { BedKind } from "./types";

/** Smallest / largest number of columns or rows a bed grid may have. */
export const MIN_BED_DIMENSION = 1;
export const MAX_BED_DIMENSION = 20;

/** Default edge length of a bed cell (square-foot gardening). */
export const DEFAULT_CELL_SIZE_INCHES = 12;

/** Bed kinds whose plantings live in a pot, windowsill tray or shelf rather than the ground. */
const CONTAINER_BED_KINDS: readonly BedKind[] = ["container", "windowsill", "shelf"];

export const isContainerBedKind = (kind: BedKind): boolean => CONTAINER_BED_KINDS.includes(kind);
