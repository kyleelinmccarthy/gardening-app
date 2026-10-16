"use client";

import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Checkbox } from "@/components/setup/Checkbox";
import { TemperatureInput } from "@/components/setup/TemperatureInput";
import { Button, ChipGroup, Field, NumberInput, Select, TextInput, Textarea } from "@/components/ui";
import { FERTILIZERS } from "@/data/fertilizers";
import { INSECTS } from "@/data/insects";
import { TOOLS } from "@/data/tools";
import {
  ALLERGENS,
  GARDEN_GOALS,
  INDOOR_LIGHTS,
  PLANT_CATEGORIES,
  SOIL_TYPES,
  SUN_EXPOSURES,
  TOXICITY_LEVELS,
  type Allergen,
  type GardenGoal,
  type GardenSetting,
  type IndoorLight,
  type Plant,
  type SoilType,
  type SunExposure,
  type TemperatureUnit,
} from "@/domain/types";
import {
  ALLERGEN_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DRAINAGE_LABELS,
  FEEDING_LABELS,
  GOAL_LABELS,
  HUMIDITY_LABELS,
  INDOOR_LIGHT_LABELS,
  LIFE_CYCLE_LABELS,
  PET_LABELS,
  SETTING_LABELS,
  SOIL_LABELS,
  SUN_LABELS,
  TOXICITY_LABELS,
  WATER_LABELS,
  toOptions,
} from "@/lib/labels";
import {
  TOXICITY_TARGETS,
  emptyPlantForm,
  fromPlant,
  makeCustomPlantId,
  toPlant,
  validatePlantForm,
  type CustomPlantFormValues as Values,
  type PlantFormErrors,
} from "./customPlantForm";
import { MultiSelectList } from "./MultiSelectList";

export interface CustomPlantFormProps {
  /** Plant being edited; omit to create. */
  initial?: Plant;
  unit: TemperatureUnit;
  /** Plants that can be picked as companions / antagonists (the plant being edited is excluded). */
  catalogPlants: readonly Pick<Plant, "id" | "name">[];
  onSave: (plant: Plant) => void;
  onCancel: () => void;
}

const SETTING_OPTIONS = toOptions(SETTING_LABELS);
const GARDEN_ENVIRONMENTS: readonly GardenSetting[] = ["outdoor", "indoor"];
const INSECT_OPTIONS = (roles: readonly string[]) =>
  INSECTS.filter((i) => roles.includes(i.role)).map((i) => ({ value: i.id, label: `${i.emoji} ${i.name}` }));
const BENEFICIAL_OPTIONS = INSECT_OPTIONS(["beneficial", "pollinator"]);
const PEST_OPTIONS = INSECT_OPTIONS(["pest", "animal-pest"]);
const FERTILIZER_OPTIONS = FERTILIZERS.map((f) => ({ value: f.id, label: f.name }));
const TOOL_OPTIONS = TOOLS.map((t) => ({ value: t.id, label: `${t.emoji} ${t.name}` }));

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <legend className="px-2 text-base font-semibold text-foreground">{title}</legend>
      {hint && <p className="-mt-2 text-sm text-muted">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const cls = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={`grid gap-4 ${cls}`}>{children}</div>;
}

export function CustomPlantForm({ initial, unit, catalogPlants, onSave, onCancel }: CustomPlantFormProps) {
  const [values, setValues] = useState<Values>(() => (initial ? fromPlant(initial) : emptyPlantForm()));
  const [submitted, setSubmitted] = useState(false);
  const errors: PlantFormErrors = submitted ? validatePlantForm(values) : {};
  const errorCount = Object.keys(errors).length;
  const unitLabel = unit === "C" ? "°C" : "°F";

  const set = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  }, []);
  /** Stable handler shared by every `MultiSelectList` (they are memoised). */
  const setList = useCallback((name: string, value: string[]) => {
    setValues((v) => ({ ...v, [name]: value }));
  }, []);

  const text = (key: keyof Values) => ({
    value: values[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
  });

  /** A numeric text field bound to a string form value. */
  function num(key: keyof Values, label: string, props: { min?: number; max?: number; step?: number | string; hint?: string } = {}) {
    const { hint, ...inputProps } = props;
    return (
      <Field label={label} hint={hint} error={errors[key]}>
        <NumberInput {...inputProps} {...text(key)} />
      </Field>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validatePlantForm(values)).length > 0) return;
    onSave(toPlant(values, initial?.id ?? makeCustomPlantId(values.name)));
  }

  const companionOptions = useMemo(
    () => catalogPlants.filter((p) => p.id !== initial?.id).map((p) => ({ value: p.id, label: p.name })),
    [catalogPlants, initial?.id],
  );
  const hasIndoor = values.environments.includes("indoor");

  return (
    <form onSubmit={onSubmit} noValidate aria-label={initial ? `Edit ${initial.name}` : "New custom plant"} className="flex flex-col gap-5">
      {errorCount > 0 && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger">
          Please fix {errorCount} {errorCount === 1 ? "problem" : "problems"} below before saving.
        </p>
      )}

      <Section title="Basics">
        <Grid>
          <Field label="Name" error={errors.name}>
            <TextInput {...text("name")} maxLength={80} autoComplete="off" />
          </Field>
          <Field label="Scientific name">
            <TextInput {...text("scientificName")} maxLength={120} autoComplete="off" />
          </Field>
          <Field label="Emoji">
            <TextInput {...text("emoji")} maxLength={8} className="max-w-24" />
          </Field>
          <Field label="Category">
            <Select options={toOptions(CATEGORY_LABELS, PLANT_CATEGORIES)} {...text("category")} />
          </Field>
          <Field label="Life cycle">
            <Select options={toOptions(LIFE_CYCLE_LABELS)} {...text("lifeCycle")} />
          </Field>
          <Field label="Difficulty">
            <Select options={toOptions(DIFFICULTY_LABELS)} {...text("difficulty")} />
          </Field>
        </Grid>
        <Field label="Description">
          <Textarea {...text("description")} />
        </Field>
        <div className="flex flex-col gap-1">
          <ChipGroup<GardenSetting>
            multiple
            label="Environments"
            options={SETTING_OPTIONS.filter((o) => GARDEN_ENVIRONMENTS.includes(o.value))}
            value={values.environments}
            onChange={(v) => set("environments", v)}
          />
          {errors.environments && <p role="alert" className="text-xs font-medium text-danger">{errors.environments}</p>}
        </div>
        <Checkbox label="Edible" checked={values.edible} onChange={(c) => set("edible", c)} />
      </Section>

      <Section title="Light & water">
        <div className="flex flex-col gap-1">
          <ChipGroup<SunExposure>
            multiple
            label="Outdoor sun exposures"
            options={toOptions(SUN_LABELS, SUN_EXPOSURES)}
            value={values.sun}
            onChange={(v) => set("sun", v)}
          />
          {errors.sun && <p role="alert" className="text-xs font-medium text-danger">{errors.sun}</p>}
        </div>
        {hasIndoor && (
          <ChipGroup<IndoorLight>
            multiple
            label="Indoor light levels"
            options={toOptions(INDOOR_LIGHT_LABELS, INDOOR_LIGHTS)}
            value={values.indoorLight}
            onChange={(v) => set("indoorLight", v)}
          />
        )}
        <Grid>
          <Field label="Water need">
            <Select options={toOptions(WATER_LABELS)} {...text("water")} />
          </Field>
          {num("wateringIntervalDays", "Watering interval (days)", { min: 1, step: 1, hint: "Days between waterings in mild weather." })}
          <Field label="Humidity">
            <Select options={toOptions(HUMIDITY_LABELS)} {...text("humidity")} />
          </Field>
        </Grid>
        <Field label="Water notes">
          <Textarea {...text("waterNotes")} rows={2} />
        </Field>
      </Section>

      <Section title="Climate" hint={`Temperatures are entered in ${unitLabel} and stored in °F.`}>
        <Grid cols={4}>
          <Field label={`Minimum survivable (${unitLabel})`}>
            <TemperatureInput unit={unit} value={values.minF} onChange={(v) => set("minF", v)} />
          </Field>
          <Field label={`Ideal low (${unitLabel})`}>
            <TemperatureInput unit={unit} value={values.idealMinF} onChange={(v) => set("idealMinF", v)} />
          </Field>
          <Field label={`Ideal high (${unitLabel})`}>
            <TemperatureInput unit={unit} value={values.idealMaxF} onChange={(v) => set("idealMaxF", v)} />
          </Field>
          <Field label={`Heat stress above (${unitLabel})`}>
            <TemperatureInput unit={unit} value={values.maxF} onChange={(v) => set("maxF", v)} />
          </Field>
        </Grid>
        {errors.minF && <p role="alert" className="text-xs font-medium text-danger">{errors.minF}</p>}
        <Grid>
          {num("zoneMin", "Hardiness zone from", { min: 1, max: 13, step: 1 })}
          {num("zoneMax", "Hardiness zone to", { min: 1, max: 13, step: 1 })}
        </Grid>
      </Section>

      <Section title="Soil & feeding">
        <div className="flex flex-col gap-1">
          <ChipGroup<SoilType>
            multiple
            label="Soil types"
            options={toOptions(SOIL_LABELS, SOIL_TYPES)}
            value={values.soilTypes}
            onChange={(v) => set("soilTypes", v)}
          />
          {errors.soilTypes && <p role="alert" className="text-xs font-medium text-danger">{errors.soilTypes}</p>}
        </div>
        <Grid cols={3}>
          {num("phMin", "Minimum soil pH", { min: 0, max: 14, step: 0.1 })}
          {num("phMax", "Maximum soil pH", { min: 0, max: 14, step: 0.1 })}
          <Field label="Drainage">
            <Select options={toOptions(DRAINAGE_LABELS)} {...text("drainage")} />
          </Field>
          <Field label="Feeding level">
            <Select options={toOptions(FEEDING_LABELS)} {...text("feeding")} />
          </Field>
          {num("feedFrequencyDays", "Feeding frequency (days)", { min: 0, step: 1, hint: "0 means do not feed." })}
        </Grid>
        <MultiSelectList
          name="fertilizers" label="Recommended fertilizers"
          options={FERTILIZER_OPTIONS}
          value={values.fertilizers}
          onChange={setList}
        />
        <Field label="Feeding notes">
          <Textarea {...text("fertilizerNotes")} rows={2} />
        </Field>
      </Section>

      <Section title="Size & timing" hint="Planting windows are in weeks relative to the last spring frost (negative = before).">
        <Grid cols={3}>
          {num("spacingInches", "Spacing (inches)", { min: 1, step: 1 })}
          {num("heightMin", "Minimum height (inches)", { min: 0, step: 1 })}
          {num("heightMax", "Maximum height (inches)", { min: 0, step: 1 })}
          {num("daysMin", "Days to maturity (min)", { min: 1, step: 1, hint: "Leave both blank if not applicable." })}
          {num("daysMax", "Days to maturity (max)", { min: 1, step: 1 })}
        </Grid>
        <Grid cols={4}>
          {num("startIndoorsWeeks", "Start indoors (weeks)", { step: 1 })}
          {num("directSowWeeks", "Direct sow (weeks)", { step: 1 })}
          {num("transplantWeeks", "Transplant (weeks)", { step: 1 })}
          {num("fallSowWeeks", "Fall sow (weeks before first frost)", { min: 0, step: 1 })}
        </Grid>
        <Field label="Planting notes">
          <Textarea {...text("plantingNotes")} rows={2} />
        </Field>
      </Section>

      <Section title="Containers">
        <Checkbox label="Suitable for containers" checked={values.containerSuitable} onChange={(c) => set("containerSuitable", c)} />
        {values.containerSuitable && (
          <Grid>
            {num("containerMinGallons", "Minimum container size (gallons)", { min: 0, step: 0.5 })}
            <Field label="Container notes">
              <TextInput {...text("containerNotes")} />
            </Field>
          </Grid>
        )}
      </Section>

      <Section title="Companions" hint="Plants that grow well, or poorly, next to this one.">
        <MultiSelectList
          name="companions" label="Companion plants"
          options={companionOptions}
          value={values.companions}
          onChange={setList}
        />
        <MultiSelectList
          name="antagonists" label="Antagonist plants"
          options={companionOptions}
          value={values.antagonists}
          onChange={setList}
          error={errors.antagonists}
        />
        <Field label="Companion notes">
          <Textarea {...text("companionNotes")} rows={2} />
        </Field>
      </Section>

      <Section title="Insects">
        <MultiSelectList name="attracts" label="Attracts" options={BENEFICIAL_OPTIONS} value={values.attracts} onChange={setList} />
        <MultiSelectList name="pests" label="Common pests" options={PEST_OPTIONS} value={values.pests} onChange={setList} />
        <MultiSelectList name="repels" label="Repels" options={PEST_OPTIONS} value={values.repels} onChange={setList} />
      </Section>

      <Section title="Safety">
        <Grid cols={3}>
          {TOXICITY_TARGETS.map((target) => (
            <Field key={target} label={`Toxicity to ${target === "human" ? "humans" : `${PET_LABELS[target].toLowerCase()}s`}`}>
              <Select
                options={toOptions(TOXICITY_LABELS, TOXICITY_LEVELS)}
                value={values.toxicity[target]}
                onChange={(e) => set("toxicity", { ...values.toxicity, [target]: e.target.value as Values["toxicity"][typeof target] })}
              />
            </Field>
          ))}
        </Grid>
        <Field label="Toxicity notes" hint="Which parts are toxic and what symptoms to expect.">
          <Textarea {...text("toxicityNotes")} rows={2} />
        </Field>
        <ChipGroup<Allergen>
          multiple
          label="Allergens"
          options={ALLERGENS.map((a) => ({ value: a, label: ALLERGEN_LABELS[a] }))}
          value={values.allergens}
          onChange={(v) => set("allergens", v)}
        />
        <Field label="Allergy notes">
          <Textarea {...text("allergyNotes")} rows={2} />
        </Field>
      </Section>

      <Section title="Tools">
        <MultiSelectList name="requiredTools" label="Required tools" options={TOOL_OPTIONS} value={values.requiredTools} onChange={setList} />
        <MultiSelectList
          name="helpfulTools" label="Helpful tools"
          options={TOOL_OPTIONS}
          value={values.helpfulTools}
          onChange={setList}
          error={errors.helpfulTools}
        />
      </Section>

      <Section title="Goals & tips">
        <ChipGroup<GardenGoal>
          multiple
          label="Goals this plant serves"
          options={toOptions(GOAL_LABELS, GARDEN_GOALS)}
          value={values.goals}
          onChange={(v) => set("goals", v)}
        />
        <Field label="Care tips" hint="One tip per line.">
          <Textarea {...text("careTips")} rows={4} />
        </Field>
        <Field label="Harvest tips">
          <Textarea {...text("harvestTips")} rows={2} />
        </Field>
      </Section>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save changes" : "Add plant"}</Button>
      </div>
    </form>
  );
}
