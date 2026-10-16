"use client";

import { PlantLink } from "@/components/plants/PlantLink";
import { eventsInMonth } from "@/domain/calendar";
import type { CalendarEvent } from "@/domain/types";
import { CALENDAR_EVENT_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { EVENT_BAR_CLASSES } from "./event-styles";
import { eventRangeLabel, timingLabel } from "./timeline";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function EventItem({ event, extra }: { event: CalendarEvent; extra?: string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-sm">
      <span aria-hidden="true" className={cn("inline-block h-3 w-3 shrink-0 rounded-sm", EVENT_BAR_CLASSES[event.type])} />
      <PlantLink plantId={event.plantId} />
      <span className="font-medium">{CALENDAR_EVENT_LABELS[event.type]}</span>
      <span className="text-muted">{eventRangeLabel(event)}</span>
      {extra && <span className="text-muted">· {extra}</span>}
    </li>
  );
}

/** "By month" tab: every month with the events that overlap it. */
export function MonthList({ events, year }: { events: readonly CalendarEvent[]; year: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {MONTH_NAMES.map((name, index) => {
        const inMonth = eventsInMonth(events, year, index);
        return (
          <section key={name} aria-label={`${name} ${year}`} className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-1 font-semibold">{name}</h3>
            {inMonth.length === 0 ? (
              <p className="text-sm text-muted">Nothing scheduled.</p>
            ) : (
              <ul className="divide-y divide-border">
                {inMonth.map((e) => (
                  <EventItem key={`${e.plantId}-${e.type}-${e.start}`} event={e} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** "Upcoming" tab: events open now or starting within the horizon. */
export function UpcomingList({ events, today, days }: { events: readonly CalendarEvent[]; today: string; days: number }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">Nothing is scheduled for the next {days} days.</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4" aria-label={`Next ${days} days`}>
      {events.map((e) => (
        <EventItem key={`${e.plantId}-${e.type}-${e.start}`} event={e} extra={timingLabel(e, today)} />
      ))}
    </ul>
  );
}
