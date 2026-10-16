"use client";

import { GardenGate } from "@/components/planner/GardenGate";
import { PageHeader, Tabs } from "@/components/ui";
import { CareLogTab } from "./CareLogTab";
import { JournalTab } from "./JournalTab";
import { MyPlantsTab } from "./MyPlantsTab";
import { RemindersTab } from "./RemindersTab";
import { TodayTab } from "./TodayTab";

/** /care — daily tasks, plantings, reminders, care history and journal. */
export function CarePage() {
  return (
    <>
      <PageHeader
        title="Care hub"
        description="Stay on top of watering, feeding and harvests, and keep notes as your garden grows."
      />
      <GardenGate>
        {(garden) => (
          <Tabs
            label="Care sections"
            tabs={[
              { id: "today", label: "Today", content: <TodayTab garden={garden} /> },
              { id: "plants", label: "My plants", content: <MyPlantsTab garden={garden} /> },
              { id: "reminders", label: "Reminders", content: <RemindersTab garden={garden} /> },
              { id: "log", label: "Care log", content: <CareLogTab garden={garden} /> },
              { id: "journal", label: "Journal", content: <JournalTab garden={garden} /> },
            ]}
          />
        )}
      </GardenGate>
    </>
  );
}
