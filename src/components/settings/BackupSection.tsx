"use client";

import { useId, useState, type ChangeEvent } from "react";
import { Button, Card } from "@/components/ui";
import type { AppData } from "@/domain/types";
import { exportAppData } from "@/storage/repository";
import { useAppData } from "@/state/AppDataProvider";
import { backupFileName, describeBackup, downloadTextFile, readBackupFile } from "./backup";

export function BackupSection() {
  const { data, dispatch } = useAppData();
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<AppData | null>(null);
  const [done, setDone] = useState(false);

  function exportJson() {
    downloadTextFile(backupFileName(), exportAppData(data));
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = ""; // allow re-selecting the same file
    if (!file) return;
    setDone(false);
    const result = await readBackupFile(file);
    if (result.ok) {
      setError(null);
      setPending(result.data);
    } else {
      setPending(null);
      setError(result.error);
    }
  }

  function confirmImport() {
    if (!pending) return;
    dispatch({ type: "data/replace", data: pending });
    setPending(null);
    setDone(true);
  }

  return (
    <Card title="Backup & restore" description="Your data lives only in this browser. Export a copy to keep it safe or move it to another device.">
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="secondary" onClick={exportJson}>
            Export JSON
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            Import backup file
          </label>
          <input
            id={inputId}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void onFile(e)}
            className="text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm"
          />
          <p className="text-xs text-muted">Importing replaces everything currently in this browser.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
        {done && (
          <p role="status" className="rounded-lg bg-success-soft p-3 text-sm text-success">
            Backup imported.
          </p>
        )}
        {pending && (
          <div role="alertdialog" aria-label="Confirm import" className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-sm text-foreground">
              This file contains {describeBackup(pending)}. Importing will replace all of your current data.
            </p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={confirmImport}>
                Replace my data
              </Button>
              <Button variant="secondary" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
