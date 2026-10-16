"use client";

import { Card, Field, Select } from "@/components/ui";
import type { TemperatureUnit } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";

const UNIT_OPTIONS = [
  { value: "F", label: "Fahrenheit (°F)" },
  { value: "C", label: "Celsius (°C)" },
];

export function PreferencesSection() {
  const { data, dispatch } = useAppData();
  return (
    <Card title="Preferences" description="How information is shown across the app.">
      <Field label="Temperature unit" hint="Temperatures are always stored in °F and converted for display.">
        <Select
          className="max-w-xs"
          options={UNIT_OPTIONS}
          value={data.settings.temperatureUnit}
          onChange={(e) => dispatch({ type: "settings/update", changes: { temperatureUnit: e.target.value as TemperatureUnit } })}
        />
      </Field>
    </Card>
  );
}
