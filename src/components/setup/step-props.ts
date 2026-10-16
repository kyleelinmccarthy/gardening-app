import type { Dispatch } from "react";
import type { TemperatureUnit } from "@/domain/types";
import type { SetupAction, SetupErrors, SetupFormState } from "./setupForm";

/** Props shared by every wizard step component. */
export interface StepProps {
  state: SetupFormState;
  errors: SetupErrors;
  dispatch: Dispatch<SetupAction>;
  unit: TemperatureUnit;
}
