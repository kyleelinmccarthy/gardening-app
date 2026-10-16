import { MAX_ZONE, MIN_ZONE } from "./setupForm";

export type ZipLookupResult =
  | { ok: true; zone: number; label: string }
  | { ok: false; error: string };

export type FetchLike = (input: string) => Promise<Pick<Response, "ok" | "status" | "json">>;

const ZIP_PATTERN = /^\d{5}$/;
const FAILURE = "Couldn't look up that ZIP code. Pick your zone from the list instead.";

/**
 * Looks up the USDA hardiness zone for a US ZIP code via phzmapi.org.
 * Never throws: failures come back as `{ ok: false, error }`.
 * `fetchImpl` is injectable for tests.
 */
export async function lookupZoneByZip(
  zip: string,
  fetchImpl: FetchLike = (url) => fetch(url),
): Promise<ZipLookupResult> {
  const trimmed = zip.trim();
  if (!ZIP_PATTERN.test(trimmed)) return { ok: false, error: "Enter a 5-digit US ZIP code." };
  try {
    const res = await fetchImpl(`https://phzmapi.org/${trimmed}.json`);
    if (!res.ok) return { ok: false, error: res.status === 404 ? "We couldn't find that ZIP code." : FAILURE };
    const body: unknown = await res.json();
    const raw = typeof body === "object" && body !== null ? (body as { zone?: unknown }).zone : undefined;
    const label = typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
    const zone = Number.parseInt(label, 10);
    if (!Number.isInteger(zone) || zone < MIN_ZONE || zone > MAX_ZONE) {
      return { ok: false, error: "That ZIP code didn't return a usable hardiness zone." };
    }
    return { ok: true, zone, label };
  } catch {
    return { ok: false, error: FAILURE };
  }
}
