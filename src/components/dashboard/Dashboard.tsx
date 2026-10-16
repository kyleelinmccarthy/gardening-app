"use client";

import Link from "next/link";
import { useMemo } from "react";
import { completionActions } from "@/components/care/careModel";
import { Badge, Button, ButtonLink, Card, PageHeader, Select, StatTile } from "@/components/ui";
import { todayIso } from "@/domain/dates";
import { summarizeGarden, UPCOMING_EVENT_DAYS } from "@/domain/gardenSummary";
import { completeTask, type CareTaskItem } from "@/domain/care";
import type { Garden } from "@/domain/types";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { CareCard } from "./CareCard";
import { ConflictsCard } from "./ConflictsCard";
import { profileChips } from "./profileChips";
import { SafetyCard } from "./SafetyCard";
import { UpcomingCard } from "./UpcomingCard";
import { WelcomeHero } from "./WelcomeHero";

const QUICK_LINKS = [
  { href: "/recommendations", icon: "✨", label: "Recommendations", text: "Plants matched to your garden" },
  { href: "/planner", icon: "🗺️", label: "Planner", text: "Lay out your beds" },
  { href: "/plants", icon: "📚", label: "Plant Library", text: "Browse every plant" },
  { href: "/guides", icon: "📖", label: "Guides", text: "Pests, soil and fertilizer" },
];

export function Dashboard() {
  const { hydrated, activeGarden, data, dispatch } = useAppData();

  if (!hydrated) {
    return (
      <div role="status" aria-live="polite" className="animate-pulse space-y-4 text-muted">
        <div className="h-9 w-64 rounded-lg bg-surface-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-muted" />
          ))}
        </div>
        <span>Loading…</span>
      </div>
    );
  }

  if (!activeGarden) {
    return (
      <>
        <WelcomeHero />
        {data.gardens.length > 0 && (
          <Card className="mt-8" title="Open an existing garden">
            <ul className="flex flex-wrap gap-2">
              {data.gardens.map((g) => (
                <li key={g.id}>
                  <Button variant="secondary" onClick={() => dispatch({ type: "garden/setActive", gardenId: g.id })}>
                    Open {g.name}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </>
    );
  }

  return <GardenDashboard garden={activeGarden} />;
}

function GardenDashboard({ garden }: { garden: Garden }) {
  const { data, dispatch, catalog } = useAppData();
  const unit = data.settings.temperatureUnit;
  const today = todayIso();
  const summary = useMemo(() => summarizeGarden(garden, catalog, today), [garden, catalog, today]);
  const chips = profileChips(garden, unit);

  function markDone(task: CareTaskItem) {
    for (const action of completionActions(garden.id, completeTask(task, today, createId("care")))) dispatch(action);
  }

  return (
    <>
      <PageHeader
        title={garden.name}
        description="Your garden at a glance."
        actions={
          <>
            {data.gardens.length > 1 && (
              <label className="flex items-center gap-2 text-sm text-muted">
                <span>Active garden</span>
                <Select
                  className="w-auto"
                  value={garden.id}
                  options={data.gardens.map((g) => ({ value: g.id, label: g.name }))}
                  onChange={(e) => dispatch({ type: "garden/setActive", gardenId: e.target.value })}
                />
              </label>
            )}
            <ButtonLink href="/setup" variant="secondary">
              Edit setup
            </ButtonLink>
          </>
        }
      />

      <ul aria-label="Garden profile" className="-mt-2 mb-6 flex flex-wrap gap-2">
        {chips.map((c) => (
          <li key={c.key}>
            <Badge tone={c.tone}>{c.label}</Badge>
          </li>
        ))}
      </ul>

      <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Plants growing"
          value={summary.growingCount}
          hint={`${summary.plannedCount} planned`}
        />
        <StatTile
          label="Care tasks due"
          value={summary.tasksDue.length}
          hint={summary.tasksDue.length === 0 ? "All caught up" : "Today and overdue"}
        />
        <StatTile
          label="Planting events"
          value={summary.upcoming.length}
          hint={`Next ${UPCOMING_EVENT_DAYS} days`}
        />
        <StatTile
          label="Companion conflicts"
          value={summary.conflicts.length}
          hint={summary.conflicts.length === 0 ? "None in your beds" : "Check the planner"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <CareCard tasks={summary.tasksDue} hasPlantings={garden.plantings.length > 0} onDone={markDone} />
        <UpcomingCard events={summary.upcoming} today={today} catalog={catalog} />
        <SafetyCard alerts={summary.safetyAlerts} />
        <ConflictsCard conflicts={summary.conflicts} />
      </div>

      <nav aria-label="Quick links" className="mt-8">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex h-full flex-col gap-0.5 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted"
              >
                <span className="font-semibold text-foreground">
                  <span aria-hidden="true">{l.icon} </span>
                  {l.label}
                </span>
                <span className="text-sm text-muted">{l.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
