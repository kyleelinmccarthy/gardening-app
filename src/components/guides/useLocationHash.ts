"use client";

import { useSyncExternalStore } from "react";

/** Fired by `replaceHash` because `history.replaceState` does not raise `hashchange`. */
const HASH_EVENT = "guides:hashchange";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(HASH_EVENT, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(HASH_EVENT, onChange);
  };
}

/** Current `location.hash` ("" on the server and before hydration). Re-renders when it changes. */
export function useLocationHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
}

/** Updates the hash without adding a history entry or scrolling. */
export function replaceHash(hash: string) {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}#${hash}`);
  window.dispatchEvent(new Event(HASH_EVENT));
}

/** True when the URL hash points at this element id (for highlighting a deep-linked card). */
export function useIsTargeted(id: string): boolean {
  return useLocationHash() === `#${id}`;
}
