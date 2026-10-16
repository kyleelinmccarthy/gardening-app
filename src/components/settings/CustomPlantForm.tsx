"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui";
import type { Plant, TemperatureUnit } from "@/domain/types";
import {
  emptyPlantForm,
  fromPlant,
  makeCustomPlantId,
  toPlant,
  validatePlantForm,
  type CustomPlantFormValues as Values,
  type PlantFormErrors,
} from "./custom-plant";
import { BasicsSection } from "./custom-plant/BasicsSection";
import { ClimateSection } from "./custom-plant/ClimateSection";
import { CompanionsSection } from "./custom-plant/CompanionsSection";
import { ContainersSection } from "./custom-plant/ContainersSection";
import type { SectionProps } from "./custom-plant/fields";
import { GoalsTipsSection } from "./custom-plant/GoalsTipsSection";
import { InsectsSection } from "./custom-plant/InsectsSection";
import { LightWaterSection } from "./custom-plant/LightWaterSection";
import { SafetySection } from "./custom-plant/SafetySection";
import { SizeTimingSection } from "./custom-plant/SizeTimingSection";
import { SoilFeedingSection } from "./custom-plant/SoilFeedingSection";
import { ToolsSection } from "./custom-plant/ToolsSection";

export interface CustomPlantFormProps {
  /** Plant being edited; omit to create. */
  initial?: Plant;
  unit: TemperatureUnit;
  /** Plants that can be picked as companions / antagonists (the plant being edited is excluded). */
  catalogPlants: readonly Pick<Plant, "id" | "name">[];
  onSave: (plant: Plant) => void;
  onCancel: () => void;
}

export function CustomPlantForm({ initial, unit, catalogPlants, onSave, onCancel }: CustomPlantFormProps) {
  const [values, setValues] = useState<Values>(() => (initial ? fromPlant(initial) : emptyPlantForm()));
  const [submitted, setSubmitted] = useState(false);
  /** Bumped on every failed save so the error summary takes focus each time. */
  const [failedSaves, setFailedSaves] = useState(0);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const errors: PlantFormErrors = submitted ? validatePlantForm(values) : {};
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (failedSaves > 0) summaryRef.current?.focus();
  }, [failedSaves]);

  const set = useCallback<SectionProps["set"]>((key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
  }, []);
  /** Stable handler shared by every `MultiSelectList` (they are memoised). */
  const setList = useCallback((name: string, value: string[]) => {
    setValues((v) => ({ ...v, [name]: value }));
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validatePlantForm(values)).length > 0) {
      setFailedSaves((n) => n + 1);
      return;
    }
    onSave(toPlant(values, initial?.id ?? makeCustomPlantId(values.name)));
  }

  const companionOptions = useMemo(
    () => catalogPlants.filter((p) => p.id !== initial?.id).map((p) => ({ value: p.id, label: p.name })),
    [catalogPlants, initial?.id],
  );
  const section: SectionProps = { values, errors, set, setList };

  return (
    <form onSubmit={onSubmit} noValidate aria-label={initial ? `Edit ${initial.name}` : "New custom plant"} className="flex flex-col gap-5">
      {errorCount > 0 && (
        <p ref={summaryRef} tabIndex={-1} role="alert" className="rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger outline-none">
          Please fix {errorCount} {errorCount === 1 ? "problem" : "problems"} below before saving.
        </p>
      )}

      <BasicsSection {...section} />
      <LightWaterSection {...section} />
      <ClimateSection {...section} unit={unit} />
      <SoilFeedingSection {...section} />
      <SizeTimingSection {...section} />
      <ContainersSection {...section} />
      <CompanionsSection {...section} options={companionOptions} />
      <InsectsSection {...section} />
      <SafetySection {...section} />
      <ToolsSection {...section} />
      <GoalsTipsSection {...section} />

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save changes" : "Add plant"}</Button>
      </div>
    </form>
  );
}
