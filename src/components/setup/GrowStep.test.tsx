import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GrowStep } from "./GrowStep";
import type { SetupFormState } from "./setupForm";
import { StepHarness } from "./stepHarness";

function setup(initial: Partial<SetupFormState> = {}, errors = {}, unit: "F" | "C" = "F") {
  let latest!: SetupFormState;
  const user = userEvent.setup();
  render(
    <StepHarness
      step={GrowStep}
      initial={initial}
      errors={errors}
      unit={unit}
      onState={(s) => {
        latest = s;
      }}
    />,
  );
  return { user, state: () => latest };
}

describe("GrowStep", () => {
  it("toggles interests and goals", async () => {
    const { user, state } = setup();
    await user.click(screen.getByRole("button", { name: /Herbs/ }));
    expect(state().interests).toEqual(["herb"]);
    await user.click(screen.getByRole("button", { name: /Herbs/ }));
    expect(state().interests).toEqual([]);
  });

  it("stores the experience level", async () => {
    const { user, state } = setup();
    await user.click(screen.getByRole("radio", { name: /advanced/i }));
    expect(state().experience).toBe("advanced");
  });

  it("keeps NaN in state while hours are blank, and shows the validation error", async () => {
    const { user, state } = setup({ weeklyHours: 4 }, { weeklyHours: "Enter hours per week between 0 and 168." }, "C");
    const hours = screen.getByLabelText("Hours per week you can spend");
    expect(hours).toHaveValue(4);
    expect(hours).toBeInvalid();
    expect(screen.getByRole("alert")).toHaveTextContent(/between 0 and 168/);
    await user.clear(hours);
    expect(Number.isNaN(state().weeklyHours)).toBe(true);
    await user.type(hours, "2.5");
    expect(state().weeklyHours).toBe(2.5);
  });

  it("is unaffected by the temperature unit (hours, not degrees)", () => {
    setup({ weeklyHours: 6 }, {}, "C");
    expect(screen.getByLabelText("Hours per week you can spend")).toHaveValue(6);
  });
});
