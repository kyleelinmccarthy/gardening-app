"use client";

import { Button, Card } from "@/components/ui";
import { createEmptyAppData } from "@/storage/schema";
import { useAppData } from "@/state/AppDataProvider";

export function DangerZone() {
  const { dispatch } = useAppData();

  function reset() {
    const ok = window.confirm("Erase ALL gardens, plantings, custom plants and settings from this browser? This can't be undone.");
    if (ok) dispatch({ type: "data/replace", data: createEmptyAppData() });
  }

  return (
    <Card title="Danger zone" description="Export a backup first if you might want your data back.">
      <Button variant="danger" onClick={reset}>
        Reset all data
      </Button>
    </Card>
  );
}
