"use client";

import { useMemo, useState } from "react";
import { Card, Checkbox, ChipGroup, GardenGate, PageHeader, Select, Tabs, type ChipOption } from "@/components/ui";
import { buildPlantingCalendar, upcomingEvents } from "@/domain/calendar";
import { todayIso } from "@/domain/dates";
import { recommendPlants } from "@/domain/recommendation";
import type { Garden } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { MonthList, UpcomingList } from "./EventLists";
import { TimelineView } from "./TimelineView";
import { applyChipChange, resolveSelection } from "./plantSelection";
import { defaultCalendarPlantIds } from "./timeline";

const RECOMMENDATION_LIMIT = 15;
const UPCOMING_DAYS = 30;

function Calendar({ garden }: { garden: Garden }) {
  const { catalog } = useAppData();
  const today = todayIso();
  const thisYear = Number(today.slice(0, 4));

  const [year, setYear] = useState(thisYear);
  const gardenIds = useMemo(
    () => defaultCalendarPlantIds(garden).filter((id) => catalog.get(id)),
    [garden, catalog],
  );
  const recommendedIds = useMemo(
    () => recommendPlants(catalog.all(), garden.profile, { limit: RECOMMENDATION_LIMIT }).map((r) => r.plant.id),
    [catalog, garden.profile],
  );
  const [includeRecommended, setIncludeRecommended] = useState(gardenIds.length === 0);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [extraIds, setExtraIds] = useState<string[]>([]);

  const pool = useMemo(() => [...new Set([...gardenIds, ...recommendedIds, ...extraIds])], [gardenIds, recommendedIds, extraIds]);
  const defaults = useMemo(
    () => new Set([...gardenIds, ...(includeRecommended ? recommendedIds : [])]),
    [gardenIds, recommendedIds, includeRecommended],
  );
  const selectedIds = useMemo(() => resolveSelection(pool, defaults, overrides), [pool, defaults, overrides]);
  const selectedPlants = useMemo(() => selectedIds.flatMap((id) => catalog.get(id) ?? []), [selectedIds, catalog]);

  const climate = garden.profile.climate;
  const events = useMemo(() => buildPlantingCalendar(selectedPlants, climate, year), [selectedPlants, climate, year]);
  const upcoming = useMemo(() => {
    const both = [thisYear, thisYear + 1].flatMap((y) => buildPlantingCalendar(selectedPlants, climate, y));
    return upcomingEvents(both, today, UPCOMING_DAYS);
  }, [selectedPlants, climate, thisYear, today]);

  const chipOptions: ChipOption<string>[] = pool.flatMap((id) => {
    const plant = catalog.get(id);
    return plant ? [{ value: id, label: plant.name, icon: plant.emoji }] : [];
  });
  const addable = catalog
    .all()
    .filter((p) => !pool.includes(p.id))
    .map((p) => ({ value: p.id, label: `${p.emoji} ${p.name}` }));

  function addPlant(id: string) {
    if (!id) return;
    setExtraIds((ids) => [...ids, id]);
    setOverrides((o) => ({ ...o, [id]: true }));
  }

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
              onChange={(next) => setOverrides((o) => applyChipChange(o, selectedIds, next))}
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
