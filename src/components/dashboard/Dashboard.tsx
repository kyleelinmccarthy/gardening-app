"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge, Button, ButtonLink, Card, PageHeader, ReasonList, Select, StatTile } from "@/components/ui";
import { formatDisplayDate, todayIso } from "@/domain/dates";
import type { CareTaskItem } from "@/domain/care";
import type { CalendarEvent, Garden } from "@/domain/types";
import { createId } from "@/lib/id";
import { CALENDAR_EVENT_LABELS, CARE_EMOJI } from "@/lib/labels";
import { useAppData } from "@/state/AppDataProvider";
import {
  TODAYS_CARE_LIMIT,
  UPCOMING_EVENT_DAYS,
  completionActions,
  summarizeGarden,
} from "./dashboardSummary";
import { profileChips } from "./profileChips";
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
  const dueNow = summary.tasksDue.slice(0, TODAYS_CARE_LIMIT);
  const plantName = (id: string) => catalog.get(id)?.name ?? id;
  const plantEmoji = (id: string) => catalog.get(id)?.emoji ?? "🌱";

  function markDone(task: CareTaskItem) {
    for (const action of completionActions(garden.id, task, today, createId("care"))) dispatch(action);
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
        <Card
          title="Today’s care"
          actions={
            <Link href="/care" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
              All care tasks
            </Link>
          }
        >
          {dueNow.length === 0 ? (
            <p className="text-sm text-muted">
              {garden.plantings.length === 0
                ? "Add plants in the planner and their care schedule will show up here."
                : "Nothing is due today. Enjoy the garden!"}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {dueNow.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      <span aria-hidden="true">{CARE_EMOJI[task.type]} </span>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted">
                      {task.overdueDays > 0 ? `Overdue by ${task.overdueDays} day${task.overdueDays === 1 ? "" : "s"}` : "Due today"}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" aria-label={`Mark done: ${task.title}`} onClick={() => markDone(task)}>
                    Done
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {summary.tasksDue.length > dueNow.length && (
            <p className="mt-2 text-xs text-muted">+{summary.tasksDue.length - dueNow.length} more on the care page.</p>
          )}
        </Card>

        <Card
          title="Coming up"
          actions={
            <Link href="/calendar" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
              Full calendar
            </Link>
          }
        >
          {summary.upcoming.length === 0 ? (
            <p className="text-sm text-muted">
              No planting windows in the next {UPCOMING_EVENT_DAYS} days for your planned and growing plants.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {summary.upcoming.slice(0, 6).map((e) => (
                <li key={`${e.plantId}-${e.type}-${e.start}`} className="py-2 text-sm">
                  <p className="font-medium text-foreground">
                    <span aria-hidden="true">{plantEmoji(e.plantId)} </span>
                    {CALENDAR_EVENT_LABELS[e.type]}: {plantName(e.plantId)}
                  </p>
                  <p className="text-xs text-muted">{describeWindow(e, today)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Safety alerts" description="Plants in your garden that conflict with your household." className="lg:col-span-2">
          {summary.safetyAlerts.length === 0 ? (
            <p className="text-sm text-muted">No pet, allergy or child-safety concerns for your current plants.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {summary.safetyAlerts.map((a) => (
                <li key={a.plant.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <span aria-hidden="true">{a.plant.emoji}</span>
                    <Link href={`/plants/${a.plant.id}`} className="text-primary underline-offset-2 hover:underline">
                      {a.plant.name}
                    </Link>
                    {a.severe && <Badge tone="danger">High risk</Badge>}
                  </p>
                  <ReasonList reasons={a.issues} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {summary.conflicts.length > 0 && (
          <Card
            title="Companion conflicts"
            description="Plants that grow poorly side by side."
            className="lg:col-span-2"
            actions={<ButtonLink href="/planner" size="sm" variant="secondary">Open planner</ButtonLink>}
          >
            <ul className="flex flex-col gap-1 text-sm">
              {summary.conflicts.map((c) => (
                <li key={`${c.bedId}-${c.plantA}-${c.plantB}`}>
                  <span aria-hidden="true">⚠️ </span>
                  {c.plantA} and {c.plantB} are neighbours in {c.bedName}.
                </li>
              ))}
            </ul>
          </Card>
        )}
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

function describeWindow(e: CalendarEvent, today: string): string {
  const start = e.start <= today ? "Open now" : formatDisplayDate(e.start);
  return e.start === e.end ? start : `${start} to ${formatDisplayDate(e.end)}`;
}
