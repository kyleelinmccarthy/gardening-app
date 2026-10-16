"use client";

import Link from "next/link";
import { Button, Card } from "@/components/ui";
import type { CareTaskItem } from "@/domain/care";
import { CARE_EMOJI } from "@/lib/labels";
import { MoreLink } from "./MoreLink";

/** How many due tasks the dashboard lists before pointing to the care page. */
export const TODAYS_CARE_LIMIT = 5;

export interface CareCardProps {
  /** Every task due today or overdue; the card shows the first few. */
  tasks: readonly CareTaskItem[];
  hasPlantings: boolean;
  onDone: (task: CareTaskItem) => void;
}

export function CareCard({ tasks, hasPlantings, onDone }: CareCardProps) {
  const shown = tasks.slice(0, TODAYS_CARE_LIMIT);
  const hidden = tasks.length - shown.length;
  return (
    <Card
      title="Today’s care"
      actions={
        <Link href="/care" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          All care tasks
        </Link>
      }
    >
      {shown.length === 0 ? (
        <p className="text-sm text-muted">
          {hasPlantings
            ? "Nothing is due today. Enjoy the garden!"
            : "Add plants in the planner and their care schedule will show up here."}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {shown.map((task) => (
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
              <Button size="sm" variant="secondary" aria-label={`Mark done: ${task.title}`} onClick={() => onDone(task)}>
                Done
              </Button>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <MoreLink href="/care">+{hidden} more on the care page</MoreLink>
      )}
    </Card>
  );
}
