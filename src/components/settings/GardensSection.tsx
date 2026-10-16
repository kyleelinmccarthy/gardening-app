"use client";

import { useState } from "react";
import { Badge, Button, ButtonLink, Card, EmptyState, Field, TextInput } from "@/components/ui";
import { SETTING_LABELS } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";

export function GardensSection() {
  const { data, dispatch } = useAppData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function startRename(id: string, name: string) {
    setEditingId(id);
    setDraft(name);
  }

  function saveRename(id: string) {
    const name = draft.trim();
    if (!name) return;
    dispatch({ type: "garden/update", gardenId: id, name });
    setEditingId(null);
  }

  function remove(id: string, name: string) {
    const ok = window.confirm(`Delete “${name}” and everything in it (beds, plantings, care history, journal)? This can't be undone.`);
    if (ok) dispatch({ type: "garden/delete", gardenId: id });
  }

  return (
    <Card
      title="Gardens"
      description="Rename, switch or remove your gardens."
      actions={<ButtonLink href="/setup?new=1" size="sm">Add garden</ButtonLink>}
    >
      {data.gardens.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No gardens yet"
          description="Create your first garden to get plant recommendations."
          action={<ButtonLink href="/setup">Set up my garden</ButtonLink>}
        />
      ) : (
        <ul className="divide-y divide-border">
          {data.gardens.map((g) => {
            const active = g.id === data.activeGardenId;
            const editing = editingId === g.id;
            return (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                {editing ? (
                  <form
                    className="flex flex-1 flex-wrap items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveRename(g.id);
                    }}
                  >
                    <Field label="Garden name" className="min-w-52 flex-1">
                      <TextInput value={draft} maxLength={60} autoFocus onChange={(e) => setDraft(e.target.value)} />
                    </Field>
                    <Button type="submit" disabled={!draft.trim()}>
                      Save name
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                        {g.name}
                        {active && <Badge tone="success">Active</Badge>}
                      </p>
                      <p className="text-xs text-muted">
                        {SETTING_LABELS[g.profile.setting]} · {g.plantings.length} planting{g.plantings.length === 1 ? "" : "s"} ·{" "}
                        {g.beds.length} bed{g.beds.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!active && (
                        <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "garden/setActive", gardenId: g.id })} aria-label={`Set ${g.name} active`}>
                          Set active
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => startRename(g.id, g.name)} aria-label={`Rename ${g.name}`}>
                        Rename
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(g.id, g.name)} aria-label={`Delete ${g.name}`}>
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
