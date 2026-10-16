import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewStep } from "./ReviewStep";
import { initialSetupState, SETUP_STEPS, type SetupFormState } from "./setupForm";

function setup(changes: Partial<SetupFormState> = {}, unit: "F" | "C" = "F") {
  const onEdit = vi.fn();
  const user = userEvent.setup();
  const state = { ...initialSetupState(), name: "Yard", ...changes };
  render(<ReviewStep state={state} errors={{}} dispatch={() => {}} unit={unit} onEdit={onEdit} />);
  return { user, onEdit };
}

const row = (term: string) => screen.getByText(term, { selector: "dt" }).nextElementSibling as HTMLElement;

describe("ReviewStep", () => {
  it("shows temperatures in the user's unit", () => {
    setup({ summerHighF: 86, winterLowF: -4 }, "C");
    expect(row("Summer high")).toHaveTextContent("30°C");
    expect(row("Winter low")).toHaveTextContent("-20°C");
  });

  it("shows indoor temperature in °C for indoor gardens", () => {
    setup({ setting: "indoor", indoorTempF: 68 }, "C");
    expect(row("Indoors")).toHaveTextContent("20°C");
  });

  it("shows hours per week, or a dash (never NaN) when blank", () => {
    const { unmount } = setup({ weeklyHours: 6 });
    expect(row("Time per week")).toHaveTextContent("6 h");
    unmount();
    setup({ weeklyHours: Number.NaN });
    expect(row("Time per week")).toHaveTextContent("—");
    expect(document.body).not.toHaveTextContent("NaN");
  });

  it("shows no warning when every step is valid", () => {
    setup();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("flags invalid steps with links that jump to them", async () => {
    const { user, onEdit } = setup({ name: "  ", weeklyHours: Number.NaN, summerHighF: null });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/fix these before saving/i);
    await user.click(within(alert).getByRole("button", { name: /Basics: Give your garden a name/ }));
    expect(onEdit).toHaveBeenLastCalledWith(SETUP_STEPS.findIndex((s) => s.id === "basics"));
    await user.click(within(alert).getByRole("button", { name: /Climate: Enter a summer high/ }));
    expect(onEdit).toHaveBeenLastCalledWith(SETUP_STEPS.findIndex((s) => s.id === "climate"));
    await user.click(within(alert).getByRole("button", { name: /What to grow: Enter hours per week/ }));
    expect(onEdit).toHaveBeenLastCalledWith(SETUP_STEPS.findIndex((s) => s.id === "grow"));
  });
});
