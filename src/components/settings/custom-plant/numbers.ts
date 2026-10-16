/** Parsing helpers for the form's string-valued numeric fields. */

/** NaN when blank. */
export const toNum = (s: string): number => (s.trim() === "" ? Number.NaN : Number(s));
export const isBlank = (s: string): boolean => s.trim() === "";
export const optionalNum = (s: string): number | undefined => (isBlank(s) ? undefined : Number(s));
export const str = (n: number | undefined): string => (n === undefined ? "" : String(n));
