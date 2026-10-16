"use client";

import { useState } from "react";
import { Button, Field, Select, TextInput } from "@/components/ui";
import { ZONES } from "@/data/zones";
import { formatTemperature } from "@/domain/climate";
import { HUMIDITY_LABELS, INDOOR_LIGHT_LABELS, toOptions } from "@/lib/labels";
import { HUMIDITY_LEVELS, INDOOR_LIGHTS } from "@/domain/types";
import { Checkbox } from "./Checkbox";
import { MonthDayInput } from "./MonthDayInput";
import type { StepProps } from "./step-props";
import { TemperatureInput } from "./TemperatureInput";
import { lookupZoneByZip, type ZipLookupResult } from "./zipLookup";

export interface ClimateStepProps extends StepProps {
  /** Injectable for tests. */
  lookupZone?: (zip: string) => Promise<ZipLookupResult>;
}

type LookupStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; ok: boolean; message: string };

const HUMIDITY_OPTIONS = toOptions(HUMIDITY_LABELS, HUMIDITY_LEVELS);
const LIGHT_OPTIONS = toOptions(INDOOR_LIGHT_LABELS, INDOOR_LIGHTS);

export function ClimateStep({ state, errors, dispatch, unit, lookupZone = (zip) => lookupZoneByZip(zip) }: ClimateStepProps) {
  const [status, setStatus] = useState<LookupStatus>({ kind: "idle" });
  const zoneInfo = ZONES.find((z) => z.zone === state.zone);
  const zoneOptions = ZONES.map((z) => ({
    value: String(z.zone),
    label: `Zone ${z.zone}: ${formatTemperature(z.minTempF, unit)} to ${formatTemperature(z.maxTempF, unit)}`,
  }));
  const unitLabel = unit === "C" ? "°C" : "°F";

  async function runLookup() {
    setStatus({ kind: "loading" });
    const result = await lookupZone(state.zip);
    if (result.ok) {
      dispatch({ type: "setZone", zone: result.zone });
      setStatus({
        kind: "done",
        ok: true,
        message: `ZIP ${state.zip.trim()} is in zone ${result.label}. We selected zone ${result.zone} and filled in typical frost dates.`,
      });
    } else {
      setStatus({ kind: "done", ok: false, message: result.error });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="zone-heading" className="flex flex-col gap-4">
        <h3 id="zone-heading" className="font-semibold text-foreground">
          Hardiness zone
        </h3>
        <Field label="USDA hardiness zone" hint={zoneInfo?.description} error={errors.zone}>
          <Select
            options={zoneOptions}
            value={String(state.zone)}
            onChange={(e) => dispatch({ type: "setZone", zone: Number(e.target.value) })}
          />
        </Field>

        <div className="flex flex-wrap items-end gap-2">
          <Field label="ZIP code (optional)" hint="US only. Looks up your zone online." className="w-44">
            <TextInput
              inputMode="numeric"
              maxLength={5}
              autoComplete="postal-code"
              value={state.zip}
              onChange={(e) => dispatch({ type: "patch", changes: { zip: e.target.value } })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runLookup();
                }
              }}
            />
          </Field>
          <Button variant="secondary" onClick={() => void runLookup()} disabled={status.kind === "loading"}>
            {status.kind === "loading" ? "Looking up…" : "Look up zone"}
          </Button>
        </div>
        {status.kind === "done" && (
          <p role={status.ok ? "status" : "alert"} className={status.ok ? "text-sm text-success" : "text-sm text-danger"}>
            {status.message}
          </p>
        )}
      </section>

      <section aria-labelledby="season-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="season-heading" className="font-semibold text-foreground">
            Season & temperatures
          </h3>
          <p className="text-sm text-muted">Filled in from your zone. Adjust anything that doesn’t match your microclimate.</p>
        </div>
        <Checkbox
          label="Frost-free climate"
          hint="Frost never or very rarely happens where I live."
          checked={state.frostFree}
          onChange={(frostFree) => dispatch({ type: "setFrostFree", frostFree })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <MonthDayInput
            label="Last spring frost"
            value={state.lastFrost}
            disabled={state.frostFree}
            error={errors.lastFrost}
            onChange={(lastFrost) => dispatch({ type: "patch", changes: { lastFrost } })}
          />
          <MonthDayInput
            label="First fall frost"
            value={state.firstFrost}
            disabled={state.frostFree}
            error={errors.firstFrost}
            onChange={(firstFrost) => dispatch({ type: "patch", changes: { firstFrost } })}
          />
          <Field label={`Typical summer high (${unitLabel})`} error={errors.summerHighF}>
            <TemperatureInput
              unit={unit}
              value={state.summerHighF}
              onChange={(summerHighF) => dispatch({ type: "patch", changes: { summerHighF } })}
            />
          </Field>
          <Field label={`Typical winter low (${unitLabel})`} error={errors.winterLowF}>
            <TemperatureInput
              unit={unit}
              value={state.winterLowF}
              onChange={(winterLowF) => dispatch({ type: "patch", changes: { winterLowF } })}
            />
          </Field>
          <Field label="Outdoor humidity">
            <Select
              options={HUMIDITY_OPTIONS}
              value={state.humidity}
              onChange={(e) => dispatch({ type: "patch", changes: { humidity: e.target.value as typeof state.humidity } })}
            />
          </Field>
        </div>
      </section>

      {state.setting === "indoor" && (
        <section aria-labelledby="indoor-heading" className="flex flex-col gap-4">
          <div>
            <h3 id="indoor-heading" className="font-semibold text-foreground">
              Indoor conditions
            </h3>
            <p className="text-sm text-muted">Your outdoor climate is still used for seed-starting dates.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Indoor light level">
              <Select
                options={LIGHT_OPTIONS}
                value={state.indoorLight}
                onChange={(e) => dispatch({ type: "patch", changes: { indoorLight: e.target.value as typeof state.indoorLight } })}
              />
            </Field>
            <Field label={`Average indoor temperature (${unitLabel})`} error={errors.indoorTempF}>
              <TemperatureInput
                unit={unit}
                value={state.indoorTempF}
                onChange={(indoorTempF) => dispatch({ type: "patch", changes: { indoorTempF } })}
              />
            </Field>
            <Field label="Indoor humidity">
              <Select
                options={HUMIDITY_OPTIONS}
                value={state.indoorHumidity}
                onChange={(e) => dispatch({ type: "patch", changes: { indoorHumidity: e.target.value as typeof state.indoorHumidity } })}
              />
            </Field>
          </div>
        </section>
      )}
    </div>
  );
}
