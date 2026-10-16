import { todayIso } from "@/domain/dates";
import type { AppData } from "@/domain/types";
import { IMPORT_TOO_LARGE_ERROR, MAX_IMPORT_CHARS, importAppData } from "@/storage/repository";
import type { ParseResult } from "@/storage/schema";

export const backupFileName = (today: string = todayIso()): string => `garden-planner-backup-${today}.json`;

/** Triggers a browser download of `content` via a temporary object URL. */
export function downloadTextFile(filename: string, content: string, mime = "application/json"): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Largest backup file we will read (bytes); a UTF-8 file this size holds at most `MAX_IMPORT_CHARS` characters. */
export const MAX_BACKUP_BYTES = MAX_IMPORT_CHARS;

/** Reads and validates an exported backup file. Never throws. */
export async function readBackupFile(file: Blob): Promise<ParseResult> {
  if (file.size > MAX_BACKUP_BYTES) {
    return { ok: false, error: IMPORT_TOO_LARGE_ERROR };
  }
  try {
    return importAppData(await file.text());
  } catch {
    return { ok: false, error: "That file couldn't be read." };
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** One-line summary of what a backup contains, for the confirm step. */
export function describeBackup(data: AppData): string {
  return `${plural(data.gardens.length, "garden")} and ${plural(data.customPlants.length, "custom plant")}`;
}
