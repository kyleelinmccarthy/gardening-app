/** Creates a unique id, optionally prefixed (`createId("bed")` → `bed-<uuid>`). */
export function createId(prefix?: string): string {
  const unique = randomToken();
  return prefix ? `${prefix}-${unique}` : unique;
}

function randomToken(): string {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}
