"use client";

import { useMemo } from "react";
import { PlantLink } from "@/components/plants/PlantLink";
import { Badge, Button, Card } from "@/components/ui";
import { completeTask, getCareTasks, type CareTaskItem } from "@/domain/care";
import { todayIso } from "@/domain/dates";
import type { Garden } from "@/domain/types";
import { CARE_EMOJI, CARE_LABELS } from "@/lib/labels";
import { createId } from "@/lib/id";
import { useAppData } from "@/state/AppDataProvider";
import { careContext, completionActions, dueLabel, groupTasksByType, partitionTasks } from "./careModel";

const UPCOMING_DAYS = 7;

interface TaskRowProps {
  task: CareTaskItem;
  today: string;
  /** Plant the task is about, when it belongs to a planting. */
  plantId?: string;
  onDone?: () => void;
}

function TaskRow({ task, today, plantId, onDone }: TaskRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{task.title}</p>
        {task.detail && <p className="text-sm text-muted">{task.detail}</p>}
        {plantId && (
          <p className="mt-0.5 text-xs">
            <PlantLink plantId={plantId} />
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={task.overdueDays > 0 ? "danger" : task.dueDate <= today ? "warning" : "neutral"}>
          {dueLabel(task, today)}
        </Badge>
        {onDone && (
          <Button size="sm" aria-label={`Done: ${task.title}`} onClick={onDone}>
            Done
          </Button>
        )}
      </div>
    </li>
  );
}

/** Today tab: overdue and due-today tasks grouped by type, then the week ahead. */
export function TodayTab({ garden }: { garden: Garden }) {
  const { catalog, dispatch } = useAppData();
  const today = todayIso();

  const { due, upcoming } = useMemo(() => {
    const tasks = getCareTasks(garden, catalog, today, careContext(garden.profile), UPCOMING_DAYS);
    return partitionTasks(tasks, today);
  }, [garden, catalog, today]);

  function markDone(task: CareTaskItem) {
    const completion = completeTask(task, today, createId("log"));
    for (const action of completionActions(garden.id, completion)) dispatch(action);
  }

  const plantIdOf = (task: CareTaskItem) => garden.plantings.find((p) => p.id === task.plantingId)?.plantId;
  const groups = groupTasksByType(due);
  const hasGrowing = garden.plantings.some((p) => p.status === "growing");

  return (
    <div className="flex flex-col gap-6">
      <Card title="Due today" description="Overdue and due-today tasks.">
        {groups.length === 0 ? (
          <p className="text-sm text-muted">
            {hasGrowing || garden.reminders.length > 0
              ? "All caught up — nothing to do today. 🎉"
              : "No tasks yet. Mark a planting as “Growing” under My plants to get care tasks."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <section key={group.type} aria-label={CARE_LABELS[group.type]}>
                <h3 className="text-sm font-semibold text-foreground">
                  <span aria-hidden="true">{CARE_EMOJI[group.type]}</span> {CARE_LABELS[group.type]}
                </h3>
                <ul className="divide-y divide-border">
                  {group.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} today={today} plantId={plantIdOf(task)} onDone={() => markDone(task)} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Card>

      <Card title={`Upcoming (${UPCOMING_DAYS} days)`}>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">Nothing else due this week.</p>
        ) : (
          <ul className="divide-y divide-border" aria-label="Upcoming tasks">
            {upcoming.map((task) => (
              <TaskRow key={task.id} task={task} today={today} plantId={plantIdOf(task)} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
