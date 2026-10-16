import { useReducer, type ComponentType } from "react";
import type { TemperatureUnit } from "@/domain/types";
import { initialSetupState, setupReducer, type SetupErrors, type SetupFormState } from "./setupForm";
import type { StepProps } from "./step-props";

export interface StepHarnessProps<P extends object> {
  step: ComponentType<StepProps & P>;
  /** Extra props for the step (e.g. `lookupZone`). */
  stepProps?: P;
  initial?: Partial<SetupFormState>;
  unit?: TemperatureUnit;
  errors?: SetupErrors;
  /** Called on every render with the latest form state. */
  onState?: (state: SetupFormState) => void;
}

/** Test helper: renders one wizard step against a live reducer so edits flow back into `state`. */
export function StepHarness<P extends object = object>({
  step: Step,
  stepProps,
  initial,
  unit = "F",
  errors = {},
  onState,
}: StepHarnessProps<P>) {
  const [state, dispatch] = useReducer(setupReducer, { ...initialSetupState(), ...initial });
  onState?.(state);
  return <Step {...(stepProps as P)} state={state} errors={errors} dispatch={dispatch} unit={unit} />;
}
