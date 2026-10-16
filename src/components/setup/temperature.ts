import { cToF, fToC } from "@/domain/climate";
import type { TemperatureUnit } from "@/domain/types";

/** Stored °F → whole degrees in the user's unit (never "-0"). */
export const toDisplayTemp = (f: number, unit: TemperatureUnit): number => {
  const v = Math.round(unit === "C" ? fToC(f) : f);
  return v === 0 ? 0 : v;
};

/** Whole degrees in the user's unit → whole °F (the storage unit). */
export const fromDisplayTemp = (value: number, unit: TemperatureUnit): number =>
  Math.round(unit === "C" ? cToF(value) : value);
