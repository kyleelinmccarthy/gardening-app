"use client";

import { useMemo, useState } from "react";
import { Card, Checkbox, ChipGroup, GardenGate, PageHeader, Select, Tabs } from "@/components/ui";
import { buildPlantingCalendar, upcomingEvents } from "@/domain/calendar";
import { todayIso } from "@/domain/dates";
import type { Garden } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { MonthList, UpcomingList } from "./EventLists";
import { TimelineView } from "./TimelineView";
import { useCalendarSelection } from "./useCalendarSelection";

const UPCOMING_DAYS = 30;

function Calendar({ garden }: { garden: Garden }) {
  const { catalog } = useAppData();
  const today = todayIso();
  const thisYear = Number(today.slice(0, 4));

  const [year, setYear] = useState(thisYear);
  const { selectedIds, selectedPlants, chipOptions, addable, includeRecommended, setIncludeRecommended, changeSelection, addPlant } =
    useCalendarSelection(garden, catalog);

  const climate = garden.profile.climate;
  const events = useMemo(() => buildPlantingCalendar(selectedPlants, climate, year), [selectedPlants, climate, year]);
  const upcoming = useMemo(() => {
    // Last year's events can still be open (e.g. a harvest running into January).
    const both = [thisYear - 1, thisYear, thisYear + 1].flatMap((y) => buildPlantingCalendar(selectedPlants, climate, y));
    return upcomingEvents(both, today, UPCOMING_DAYS);
  }, [selectedPlants, climate, thisYear, today]);

  return (
    <div className="flex flex-col gap-6">
      <Card title="Plants on your calendar" description="Defaults to what you are planting; add or remove plants to explore.">
        <div className="flex flex-col gap-4">
          {chipOptions.length > 0 && (
            <ChipGroup
              multiple
              label="Calendar plants"
              options={chipOptions}
              value={selectedIds}
              onChange={changeSelection}
            />
          )}
          <div className="flex flex-wrap items-end gap-4">
            <Checkbox
              label="Include top recommendations"
              checked={includeRecommended}
              onChange={(e) => setIncludeRecommended(e.target.checked)}
            />
            <label className="flex flex-col gap-1 text-sm font-medium">
              Year
              <Select
                value={String(year)}
                onChange={(e) => setYear(Number(e.target.value))}
                options={[
                  { value: String(thisYear), label: `${thisYear} (this year)` },
                  { value: String(thisYear + 1), label: `${thisYear + 1} (next year)` },
                ]}
              />
            </label>
            {addable.length > 0 && (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Add another plant
                <Select value="" placeholder="Choose a plant…" options={addable} onChange={(e) => addPlant(e.target.value)} />
              </label>
            )}
          </div>
        </div>
      </Card>

      {selectedPlants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
          Pick at least one plant above to see its planting schedule.
        </p>
      ) : (
        <Tabs
          label="Calendar views"
          tabs={[
            {
              id: "timeline",
              label: "Timeline",
              content: (
                <TimelineView
                  year={year}
                  plantIds={selectedIds}
                  events={events}
                  climate={climate}
                  catalog={catalog}
                  today={today}
                />
              ),
            },
            { id: "month", label: "By month", content: <MonthList events={events} year={year} /> },
            {
              id: "upcoming",
              label: "Upcoming",
              content: <UpcomingList events={upcoming} today={today} days={UPCOMING_DAYS} />,
            },
          ]}
        />
      )}
    </div>
  );
}

/** /calendar — planting windows and harvests for your plants across the year. */
export function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Planting calendar"
        description="When to start seeds, sow, transplant and harvest, based on your climate's frost dates."
      />
      <GardenGate>{(garden) => <Calendar garden={garden} />}</GardenGate>
    </>
  );
}
