"use client";

import { PageHeader } from "@/components/ui";
import { useAppData } from "@/state/AppDataProvider";
import { BackupSection } from "./BackupSection";
import { CustomPlantsSection } from "./CustomPlantsSection";
import { DangerZone } from "./DangerZone";
import { GardensSection } from "./GardensSection";
import { PreferencesSection } from "./PreferencesSection";

export function SettingsPage() {
  const { hydrated } = useAppData();

  return (
    <>
      <PageHeader title="Settings" description="Preferences, gardens, custom plants and backups." />
      {hydrated ? (
        <div className="flex flex-col gap-6">
          <PreferencesSection />
          <GardensSection />
          <CustomPlantsSection />
          <BackupSection />
          <DangerZone />
        </div>
      ) : (
        <p role="status" aria-live="polite" className="animate-pulse text-muted">
          Loading…
        </p>
      )}
    </>
  );
}
