"use client";

import type { ReactNode } from "react";
import { Badge, Button } from "@/components/ui";
import { TOOLS } from "@/data/tools";
import { formatTemperature } from "@/domain/climate";
import {
  ALLERGEN_LABELS,
  CATEGORY_LABELS,
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  HUMIDITY_LABELS,
  INDOOR_LIGHT_LABELS,
  PET_LABELS,
  SETTING_LABELS,
  SOIL_LABELS,
  SPACE_LABELS,
  SUN_LABELS,
} from "@/lib/labels";
import { formatMonthDay } from "./format";
import type { StepProps } from "./step-props";

export interface ReviewStepProps extends StepProps {
  /** Jump back to a step by id for editing. */
  onEdit: (stepIndex: number) => void;
}

const list = (items: readonly string[], empty: string) => (items.length > 0 ? items.join(", ") : empty);

function Section({ title, stepIndex, onEdit, children }: { title: string; stepIndex: number; onEdit: (i: number) => void; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button size="sm" variant="ghost" onClick={() => onEdit(stepIndex)} aria-label={`Edit ${title}`}>
          Edit
        </Button>
      </div>
      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[10rem_1fr]">{children}</dl>
    </section>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{term}</dt>
      <dd className="text-foreground">{children}</dd>
    </>
  );
}

export function ReviewStep({ state, unit, onEdit }: ReviewStepProps) {
  const indoor = state.setting === "indoor";
  const t = (f: number) => formatTemperature(f, unit);
  const toolNames = state.tools.map((id) => TOOLS.find((x) => x.id === id)?.name ?? id);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">Check everything looks right. You can change any of this later from “Edit setup”.</p>
      <Section title="Basics" stepIndex={0} onEdit={onEdit}>
        <Row term="Name">{state.name.trim() || "—"}</Row>
        <Row term="Setting">{SETTING_LABELS[state.setting]}</Row>
      </Section>
      <Section title="Climate" stepIndex={1} onEdit={onEdit}>
        <Row term="Hardiness zone">Zone {state.zone}</Row>
        <Row term="Frost dates">
          {state.frostFree
            ? "Frost-free"
            : `Last ${formatMonthDay(state.lastFrost)}, first ${formatMonthDay(state.firstFrost)}`}
        </Row>
        <Row term="Summer high">{t(state.summerHighF)}</Row>
        <Row term="Winter low">{t(state.winterLowF)}</Row>
        <Row term="Humidity">{HUMIDITY_LABELS[state.humidity]}</Row>
        {indoor && (
          <Row term="Indoors">
            {INDOOR_LIGHT_LABELS[state.indoorLight]}, {t(state.indoorTempF)}, {HUMIDITY_LABELS[state.indoorHumidity].toLowerCase()}
          </Row>
        )}
      </Section>
      <Section title="Space & soil" stepIndex={2} onEdit={onEdit}>
        {!indoor && <Row term="Sun">{SUN_LABELS[state.sunExposure]}</Row>}
        <Row term="Soil">{SOIL_LABELS[state.soilType]}</Row>
        <Row term="Space">{SPACE_LABELS[state.space]}</Row>
        <Row term="Containers only">{indoor || state.containersOnly ? "Yes" : "No"}</Row>
      </Section>
      <Section title="Tools" stepIndex={3} onEdit={onEdit}>
        <Row term="I have">{list(toolNames, "No tools selected")}</Row>
      </Section>
      <Section title="What to grow" stepIndex={4} onEdit={onEdit}>
        <Row term="Interests">{list(state.interests.map((c) => CATEGORY_LABELS[c]), "Everything")}</Row>
        <Row term="Goals">{list(state.goals.map((g) => GOAL_LABELS[g]), "None selected")}</Row>
        <Row term="Experience">{EXPERIENCE_LABELS[state.experience]}</Row>
        <Row term="Time per week">{state.weeklyHours} h</Row>
      </Section>
      <Section title="Household" stepIndex={5} onEdit={onEdit}>
        <Row term="Pets">{list(state.pets.map((p) => PET_LABELS[p]), "None")}</Row>
        <Row term="Allergies">{list(state.allergies.map((a) => ALLERGEN_LABELS[a]), "None")}</Row>
        <Row term="Children">
          {state.hasChildren ? <Badge tone="warning">Children in household</Badge> : "No young children"}
        </Row>
      </Section>
    </div>
  );
}
