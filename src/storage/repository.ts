import type { AppData } from "@/domain/types";
import { createEmptyAppData, parseAppData, type ParseResult } from "./schema";
import type { KeyValueStorage } from "./storage";

export const DEFAULT_STORAGE_KEY = "garden-planner:v1";

export interface AppDataRepository {
  /** Never throws: returns empty data when nothing valid is stored. */
  load(): AppData;
  save(data: AppData): void;
  clear(): void;
}

export function createLocalRepository(
  storage: KeyValueStorage,
  key: string = DEFAULT_STORAGE_KEY,
): AppDataRepository {
  const backupKey = `${key}:corrupt-backup`;

  return {
    load() {
      let raw: string | null;
      try {
        raw = storage.getItem(key);
      } catch {
        return createEmptyAppData();
      }
      if (raw === null) return createEmptyAppData();

      const result = importAppData(raw);
      if (result.ok) return result.data;

      // Keep the unreadable payload so the user can recover it manually.
      attempt(() => storage.setItem(backupKey, raw));
      return createEmptyAppData();
    },
    save(data) {
      // A failed write (quota, private mode) must not crash the UI.
      attempt(() => storage.setItem(key, JSON.stringify(data)));
    },
    clear() {
      attempt(() => storage.removeItem(key));
    },
  };
}

export function exportAppData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importAppData(json: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  return parseAppData(parsed);
}

function attempt(fn: () => void): void {
  try {
    fn();
  } catch {
    /* storage unavailable or full: persistence is best-effort */
  }
}
