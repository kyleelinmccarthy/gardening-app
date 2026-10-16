"use client";

import { PlantLink } from "@/components/plants/PlantLink";
import type { CalendarEvent, ClimateProfile, Plant, PlantCatalog } from "@/domain/types";
import { CALENDAR_EVENT_LABELS } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { formatDisplayDate } from "@/domain/dates";
import { EVENT_BAR_CLASSES, EVENT_TYPE_ORDER } from "./event-styles";
import {
  buildTimelineRows,
  dateToPercent,
  eventDescription,
  frostMarkers,
  monthColumns,
} from "./timeline";

export interface TimelineViewProps {
  year: number;
  plantIds: readonly string[];
  events: readonly CalendarEvent[];
  climate: ClimateProfile;
  catalog: PlantCatalog;
  /** ISO date of today; draws a marker when it falls in `year`. */
  today: string;
}

const LANE_HEIGHT_REM = 1.1;
const ROW_PADDING_REM = 0.6;

function Legend() {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {EVENT_TYPE_ORDER.map((type) => (
        <li key={type} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn("inline-block h-3 w-5 rounded-sm", EVENT_BAR_CLASSES[type])} />
          {CALENDAR_EVENT_LABELS[type]}
        </li>
      ))}
    </ul>
  );
}

/** Year view: a row per plant, month columns, coloured bars and frost markers. */
export function TimelineView({ year, plantIds, events, climate, catalog, today }: TimelineViewProps) {
  const months = monthColumns(year);
  const rows = buildTimelineRows(plantIds, events, year);
  const frost = frostMarkers(climate, year);
  const todayPercent = today.startsWith(String(year)) ? dateToPercent(today, year) : null;

  const lines: { key: string; percent: number; className: string; label: string }[] = [];
  if (frost.lastFrost) lines.push({ key: "last", percent: frost.lastFrost.percent, className: "bg-info", label: `Last frost ${formatDisplayDate(frost.lastFrost.date)}` });
  if (frost.firstFrost) lines.push({ key: "first", percent: frost.firstFrost.percent, className: "bg-info", label: `First frost ${formatDisplayDate(frost.firstFrost.date)}` });
  if (todayPercent !== null) lines.push({ key: "today", percent: todayPercent, className: "bg-danger", label: "Today" });

  return (
    <div className="flex flex-col gap-3">
      <Legend />
      <p className="text-sm text-muted">
        {frost.frostFree ? (
          "Frost-free climate: no frost markers, so windows use a nominal Feb 1 – Dec 1 season."
        ) : (
          <>
            <span aria-hidden="true" className="mr-1 inline-block h-3 w-0.5 bg-info align-middle" />
            {frost.lastFrost && <>Last frost {formatDisplayDate(frost.lastFrost.date)}</>}
            {frost.lastFrost && frost.firstFrost && " · "}
            {frost.firstFrost && <>First frost {formatDisplayDate(frost.firstFrost.date)}</>}
          </>
        )}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <div className="min-w-[44rem]">
          <div className="flex border-b border-border text-xs text-muted">
            <div className="w-36 shrink-0 px-3 py-1.5 font-medium">Plant</div>
            <div className="relative h-7 flex-1" aria-hidden="true">
              {months.map((m) => (
                <span key={m.index} className="absolute top-1.5 pl-1" style={{ left: `${m.left}%` }}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>
          {rows.map((row) => {
            const plant: Plant | undefined = catalog.get(row.plantId);
            const height = row.laneCount * LANE_HEIGHT_REM + ROW_PADDING_REM;
            return (
              <div key={row.plantId} className="flex border-b border-border last:border-b-0" role="group" aria-label={`${plant?.name ?? row.plantId} schedule`}>
                <div className="flex w-36 shrink-0 items-center px-3 text-sm">
                  <PlantLink plantId={row.plantId} />
                </div>
                <div className="relative flex-1" style={{ height: `${height}rem` }}>
                  {months.map((m) => (
                    <span key={m.index} aria-hidden="true" className="absolute inset-y-0 border-l border-border/60" style={{ left: `${m.left}%` }} />
                  ))}
                  {lines.map((l) => (
                    <span key={l.key} aria-hidden="true" title={l.label} className={cn("absolute inset-y-0 w-0.5", l.className, l.key === "today" && "opacity-70")} style={{ left: `${l.percent}%` }} />
                  ))}
                  {row.bars.map((bar) => {
                    const description = eventDescription(plant?.name ?? row.plantId, bar.event);
                    return (
                      <span
                        key={`${bar.event.type}-${bar.event.start}`}
                        role="img"
                        aria-label={description}
                        title={description}
                        className={cn("absolute rounded-sm", EVENT_BAR_CLASSES[bar.event.type])}
                        style={{
                          left: `${bar.left}%`,
                          width: `${bar.width}%`,
                          top: `${ROW_PADDING_REM / 2 + bar.lane * LANE_HEIGHT_REM}rem`,
                          height: `${LANE_HEIGHT_REM - 0.2}rem`,
                        }}
                      />
                    );
                  })}
                  {row.bars.length === 0 && (
                    <span className="absolute inset-0 flex items-center px-2 text-xs text-muted">
                      No scheduled windows{plant?.planting.notes ? ` — ${plant.planting.notes}` : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
