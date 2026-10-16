"use client";

import { DEFAULT_STORAGE_KEY, corruptBackupPrefix } from "@/storage/repository";
import { useAppData } from "@/state/AppDataProvider";

/** Warns when saved data could not be read or cannot be written. Renders nothing otherwise. */
export function StorageNotice() {
  const { hydrated, storageStatus } = useAppData();
  if (!hydrated) return null;

  let message: string;
  if (storageStatus === "corrupt") {
    message = `We couldn't read your saved garden data. A backup was saved in this browser under the key "${corruptBackupPrefix(DEFAULT_STORAGE_KEY)}…".`;
  } else if (storageStatus === "unavailable") {
    message = "Your browser is blocking local storage, so changes won't be saved.";
  } else {
    return null;
  }

  return (
    <div role="alert" className="border-b border-warning/40 bg-warning-soft px-4 py-2 text-center text-sm text-warning">
      {message}
    </div>
  );
}
