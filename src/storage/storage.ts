/** Minimal synchronous key-value store (a subset of the Web Storage API). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Optional key enumeration (as on Web Storage); lets callers list and prune related keys. */
  readonly length?: number;
  key?(index: number): string | null;
}

/** In-memory storage: used on the server, in private mode fallbacks and in tests. */
export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    get length() {
      return map.size;
    },
    key: (index) => [...map.keys()][index] ?? null,
  };
}

/**
 * Returns window.localStorage, or null when it is unavailable (server-side
 * rendering, or browsers that throw on access / write, e.g. Safari private mode).
 */
export function getBrowserStorage(): KeyValueStorage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window.localStorage;
    if (!storage) return null;
    const probe = "__garden-planner:probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}
