"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { formatDisplayDate } from "@/domain/dates";
import { UPCOMING_EVENT_DAYS } from "@/domain/gardenSummary";
import type { CalendarEvent, PlantCatalog } from "@/domain/types";
import { CALENDAR_EVENT_LABELS } from "@/lib/labels";
import { MoreLink } from "./MoreLink";

/** How many upcoming windows the dashboard lists before pointing to the calendar. */
export const UPCOMING_LIMIT = 6;

export interface UpcomingCardProps {
  events: readonly CalendarEvent[];
  today: string;
  catalog: PlantCatalog;
}

export function UpcomingCard({ events, today, catalog }: UpcomingCardProps) {
  const shown = events.slice(0, UPCOMING_LIMIT);
  const hidden = events.length - shown.length;
  return (
    <Card
      title="Coming up"
      actions={
        <Link href="/calendar" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          Full calendar
        </Link>
      }
    >
      {shown.length === 0 ? (
        <p className="text-sm text-muted">
          No planting windows in the next {UPCOMING_EVENT_DAYS} days for your planned and growing plants.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {shown.map((e) => (
            <li key={`${e.plantId}-${e.type}-${e.start}`} className="py-2 text-sm">
              <p className="font-medium text-foreground">
                <span aria-hidden="true">{catalog.get(e.plantId)?.emoji ?? "🌱"} </span>
                {CALENDAR_EVENT_LABELS[e.type]}: {catalog.get(e.plantId)?.name ?? e.plantId}
              </p>
              <p className="text-xs text-muted">{describeWindow(e, today)}</p>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && <MoreLink href="/calendar">+{hidden} more in the calendar</MoreLink>}
    </Card>
  );
}

function describeWindow(e: CalendarEvent, today: string): string {
  const start = e.start <= today ? "Open now" : formatDisplayDate(e.start);
  return e.start === e.end ? start : `${start} to ${formatDisplayDate(e.end)}`;
}
