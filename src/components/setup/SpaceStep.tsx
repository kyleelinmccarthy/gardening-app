"use client";

import { Field, Select } from "@/components/ui";
import { SOILS } from "@/data/soils";
import { SOIL_TYPES, SPACE_SIZES, SUN_EXPOSURES, type SoilType, type SpaceSize, type SunExposure } from "@/domain/types";
import { SOIL_LABELS, SPACE_LABELS, SUN_LABELS, toOptions } from "@/lib/labels";
import { ChoiceCards } from "./ChoiceCards";
import { Checkbox } from "./Checkbox";
import type { StepProps } from "./step-props";

const SUN_OPTIONS = toOptions(SUN_LABELS, SUN_EXPOSURES);
const SOIL_OPTIONS = toOptions(SOIL_LABELS, SOIL_TYPES);
const SPACE_OPTIONS = toOptions(SPACE_LABELS, SPACE_SIZES);

export function SpaceStep({ state, dispatch }: StepProps) {
  const indoor = state.setting === "indoor";
  const soil = SOILS.find((s) => s.id === state.soilType);

  return (
    <div className="flex flex-col gap-6">
      {indoor ? (
        <p className="rounded-lg bg-info-soft p-3 text-sm text-info">
          Indoor gardens use the light level from the previous step instead of outdoor sun, and always grow in containers.
        </p>
      ) : (
        <ChoiceCards<SunExposure>
          legend="Best sun exposure in your growing area"
          options={SUN_OPTIONS}
          value={state.sunExposure}
          columnsClassName="sm:grid-cols-2"
          onChange={(sunExposure) => dispatch({ type: "patch", changes: { sunExposure } })}
        />
      )}

      <Field
        label={indoor ? "Potting medium you use" : "Soil type"}
        hint={soil ? `${soil.description} How to identify: ${soil.identify}` : undefined}
      >
        <Select
          options={SOIL_OPTIONS}
          value={state.soilType}
          onChange={(e) => dispatch({ type: "patch", changes: { soilType: e.target.value as SoilType } })}
        />
      </Field>

      <Field label="Space available">
        <Select
          options={SPACE_OPTIONS}
          value={state.space}
          onChange={(e) => dispatch({ type: "patch", changes: { space: e.target.value as SpaceSize } })}
        />
      </Field>

      {!indoor && (
        <Checkbox
          label="Containers only"
          hint="Balcony, patio or deck: no in-ground planting."
          checked={state.containersOnly}
          onChange={(containersOnly) => dispatch({ type: "patch", changes: { containersOnly } })}
        />
      )}
    </div>
  );
}
