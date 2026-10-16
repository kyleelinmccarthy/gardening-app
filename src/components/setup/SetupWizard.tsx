"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, Card, ConfirmButton, PageHeader } from "@/components/ui";
import { createGarden } from "@/domain/defaults";
import type { Garden } from "@/domain/types";
import { useAppData } from "@/state/AppDataProvider";
import { BasicsStep } from "./BasicsStep";
import { ClimateStep } from "./ClimateStep";
import { GrowStep } from "./GrowStep";
import { ReviewStep } from "./ReviewStep";
import { SafetyStep } from "./SafetyStep";
import { SpaceStep } from "./SpaceStep";
import { StepIndicator } from "./StepIndicator";
import { ToolsStep } from "./ToolsStep";
import {
  SETUP_STEPS,
  firstInvalidStep,
  initialSetupState,
  isSetupDirty,
  setupReducer,
  stateFromProfile,
  toProfile,
  validateStep,
  type SetupStepId,
} from "./setupForm";
import type { StepProps } from "./step-props";
import type { ZipLookupResult } from "./zipLookup";

export interface SetupWizardProps {
  /** Injectable ZIP → zone lookup (tests). */
  lookupZone?: (zip: string) => Promise<ZipLookupResult>;
}

/** Garden setup: edits the active garden, or creates a new one (`?new=1` or the toggle). */
export function SetupWizard({ lookupZone }: SetupWizardProps) {
  const { hydrated, activeGarden } = useAppData();
  const searchParams = useSearchParams();
  const [forceNew, setForceNew] = useState(searchParams.get("new") === "1");

  if (!hydrated) {
    return (
      <div role="status" aria-live="polite" className="animate-pulse text-muted">
        Loading…
      </div>
    );
  }

  const editing = activeGarden && !forceNew ? activeGarden : null;
  return (
    <SetupWizardForm
      // Remount (fresh form state) whenever we switch between editing and creating;
      // the form asks for confirmation first when that would discard input.
      key={editing?.id ?? "new"}
      garden={editing}
      canSwitch={activeGarden !== null}
      activeGardenName={activeGarden?.name}
      onSwitch={() => setForceNew((v) => !v)}
      lookupZone={lookupZone}
    />
  );
}

interface FormProps extends SetupWizardProps {
  garden: Garden | null;
  canSwitch: boolean;
  activeGardenName?: string;
  onSwitch: () => void;
}

function SetupWizardForm({ garden, canSwitch, activeGardenName, onSwitch, lookupZone }: FormProps) {
  const router = useRouter();
  const { data, dispatch: dispatchApp } = useAppData();
  const unit = data.settings.temperatureUnit;
  const [initial] = useState(() => (garden ? stateFromProfile(garden.name, garden.profile) : initialSetupState()));
  const [state, dispatch] = useReducer(setupReducer, initial);
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ target: "heading" | "invalid" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);

  const step = SETUP_STEPS[stepIndex];
  const isLast = stepIndex === SETUP_STEPS.length - 1;
  const errors = showErrors ? validateStep(step.id, state) : {};

  // Keyboard and screen-reader users follow focus: land on the first problem, or on the new step's heading.
  useEffect(() => {
    if (!focusRequest) return;
    const invalid = focusRequest.target === "invalid" ? formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') : null;
    (invalid ?? headingRef.current)?.focus();
  }, [focusRequest]);

  function goTo(index: number) {
    setStepIndex(index);
    setMaxReached((m) => Math.max(m, index));
    setShowErrors(false);
    setFocusRequest({ target: "heading" });
  }

  function showProblems() {
    setShowErrors(true);
    setFocusRequest({ target: "invalid" });
  }

  function save() {
    const invalid = firstInvalidStep(state);
    if (invalid) {
      goTo(SETUP_STEPS.findIndex((s) => s.id === invalid));
      return showProblems();
    }
    const name = state.name.trim();
    const profile = toProfile(state);
    if (garden) dispatchApp({ type: "garden/update", gardenId: garden.id, name, profile });
    else dispatchApp({ type: "garden/create", garden: createGarden(name, profile) });
    router.push("/recommendations");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLast) return save();
    if (Object.keys(validateStep(step.id, state)).length > 0) return showProblems();
    goTo(stepIndex + 1);
  }

  const dirty = isSetupDirty(initial, state);
  const switchLabel = garden ? "Start a new garden instead" : `Edit ${activeGardenName ?? "current garden"} instead`;

  const stepProps: StepProps = { state, errors, dispatch, unit };
  const body: Record<SetupStepId, ReactNode> = {
    basics: <BasicsStep {...stepProps} />,
    climate: <ClimateStep {...stepProps} lookupZone={lookupZone} />,
    space: <SpaceStep {...stepProps} />,
    tools: <ToolsStep {...stepProps} />,
    grow: <GrowStep {...stepProps} />,
    safety: <SafetyStep {...stepProps} />,
    review: <ReviewStep {...stepProps} onEdit={goTo} />,
  };

  return (
    <>
      <PageHeader
        title={garden ? `Edit setup: ${garden.name}` : "Set up a new garden"}
        description="A few quick questions so we can recommend plants that suit your climate, space, tools and household."
        actions={
          canSwitch &&
          (dirty ? (
            <ConfirmButton
              label={switchLabel}
              prompt="Discard your changes?"
              confirmLabel="Yes, discard changes"
              onConfirm={onSwitch}
            />
          ) : (
            <Button variant="secondary" size="sm" onClick={onSwitch}>
              {switchLabel}
            </Button>
          ))
        }
      />
      <StepIndicator steps={SETUP_STEPS} current={stepIndex} maxReachable={maxReached} onSelect={goTo} />
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <Card
          headingLevel="h2"
          // The Card primitive has no heading ref, so the focus target is a span inside the heading.
          title={
            <span ref={headingRef} tabIndex={-1} className="outline-none">
              {step.label}
            </span>
          }
        >
          {body[step.id]}
        </Card>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="secondary" disabled={stepIndex === 0} onClick={() => goTo(stepIndex - 1)}>
            Back
          </Button>
          <Button type="submit">{isLast ? (garden ? "Save changes" : "Create garden") : "Next"}</Button>
        </div>
      </form>
    </>
  );
}

