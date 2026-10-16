import type { AppData } from "@/domain/types";
import { createEmptyAppData, parseAppData, type ParseResult } from "./schema";
import { sanitizeAppData } from "./sanitize";
import type { KeyValueStorage } from "./storage";

export const DEFAULT_STORAGE_KEY = "garden-planner:v1";

/** How many unreadable payloads are kept for manual recovery. */
export const MAX_CORRUPT_BACKUPS = 3;

/**
 * - ok: saved data was read.
 * - empty: nothing has been saved yet.
 * - corrupt: something was saved but could not be read; a backup copy was kept.
 * - unavailable: storage cannot be read (blocked by the browser), so nothing can be persisted.
 */
export type StorageStatus = "ok" | "empty" | "corrupt" | "unavailable";

export interface LoadResult {
  data: AppData;
  status: StorageStatus;
}

export interface AppDataRepository {
  /** The storage key holding the data, when there is one (lets callers recognise cross-tab storage events). */
  readonly storageKey?: string;
  /** Never throws: returns empty data when nothing valid is stored. */
  load(): AppData;
  /** Like `load()`, but also says why the data may be empty. Never throws. */
  loadWithStatus(): LoadResult;
  save(data: AppData): void;
  clear(): void;
}

export interface LocalRepositoryOptions {
  /** Clock used to timestamp backups (injectable for tests). */
  now?: () => Date;
}

/** Storage key prefix under which unreadable payloads are preserved. */
export const corruptBackupPrefix = (key: string) => `${key}:corrupt-backup:`;

export function createLocalRepository(
  storage: KeyValueStorage,
  key: string = DEFAULT_STORAGE_KEY,
  { now = () => new Date() }: LocalRepositoryOptions = {},
): AppDataRepository {
  const backupPrefix = corruptBackupPrefix(key);

  /** Existing backup keys, oldest first (ISO timestamps sort lexicographically). */
  function backupKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < (storage.length ?? 0); i++) {
      const k = storage.key?.(i);
      if (k?.startsWith(backupPrefix)) keys.push(k);
    }
    return keys.sort();
  }

  function backUp(raw: string): void {
    attempt(() => {
      const existing = backupKeys();
      // Re-reading the same unreadable payload must not evict older, different backups.
      if (existing.some((k) => storage.getItem(k) === raw)) return;
      storage.setItem(`${backupPrefix}${now().toISOString()}`, raw);
      for (const k of backupKeys().slice(0, -MAX_CORRUPT_BACKUPS)) storage.removeItem(k);
    });
  }

  function loadWithStatus(): LoadResult {
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch {
      return { data: createEmptyAppData(), status: "unavailable" };
    }
    if (raw === null) return { data: createEmptyAppData(), status: "empty" };

    // Our own stored data is trusted for size: only user-supplied imports are capped.
    const result = parseAppDataJson(raw);
    if (result.ok) return { data: sanitizeAppData(result.data), status: "ok" };

    backUp(raw);
    return { data: createEmptyAppData(), status: "corrupt" };
  }

  return {
    storageKey: key,
    loadWithStatus,
    load: () => loadWithStatus().data,
    save(data) {
      // A failed write (quota, private mode) must not crash the UI.
      attempt(() => storage.setItem(key, JSON.stringify(data)));
    },
    clear() {
      attempt(() => storage.removeItem(key));
    },
  };
}

/** Stand-in when the browser offers no usable storage: loads empty, persists nothing. */
export function createUnavailableRepository(): AppDataRepository {
  const loadWithStatus = (): LoadResult => ({ data: createEmptyAppData(), status: "unavailable" });
  return { loadWithStatus, load: () => loadWithStatus().data, save() {}, clear() {} };
}

export function exportAppData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/** Largest backup accepted by `importAppData` (characters). Real backups are a few hundred KB. */
export const MAX_IMPORT_CHARS = 5_000_000;
export const IMPORT_TOO_LARGE_ERROR = "That file is too large to be a Garden Planner backup (limit 5 MB).";

/** Parses user-supplied backup text. Refuses oversized input before parsing it. */
export function importAppData(json: string): ParseResult {
  if (json.length > MAX_IMPORT_CHARS) {
    return { ok: false, error: IMPORT_TOO_LARGE_ERROR };
  }
  return parseAppDataJson(json);
}

function parseAppDataJson(json: string): ParseResult {
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
