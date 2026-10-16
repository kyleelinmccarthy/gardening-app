import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MonthDayInput } from "./MonthDayInput";

describe("MonthDayInput", () => {
  it("shows the month and day and reports changes as MM-DD", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MonthDayInput label="Last spring frost" value="04-15" onChange={onChange} />);
    expect(screen.getByLabelText("Last spring frost month")).toHaveValue("04");
    expect(screen.getByLabelText("Last spring frost day")).toHaveValue("15");
    await user.selectOptions(screen.getByLabelText("Last spring frost month"), "06");
    expect(onChange).toHaveBeenLastCalledWith("06-15");
    await user.selectOptions(screen.getByLabelText("Last spring frost day"), "3");
    expect(onChange).toHaveBeenLastCalledWith("04-03");
  });

  it("marks both selects invalid and describes them with the error message", () => {
    render(<MonthDayInput label="First fall frost" value="10-15" onChange={() => {}} error="Enter a valid first fall frost date." />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a valid first fall frost date.");
    for (const name of ["First fall frost month", "First fall frost day"]) {
      const select = screen.getByLabelText(name);
      expect(select).toBeInvalid();
      expect(select).toHaveAccessibleDescription("Enter a valid first fall frost date.");
    }
  });

  it("has no alert or invalid state without an error", () => {
    render(<MonthDayInput label="Last spring frost" value="04-15" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Last spring frost month")).toBeValid();
  });

  it("disables both selects", () => {
    render(<MonthDayInput label="Last spring frost" value="04-15" onChange={() => {}} disabled />);
    expect(screen.getByLabelText("Last spring frost month")).toBeDisabled();
    expect(screen.getByLabelText("Last spring frost day")).toBeDisabled();
  });
});
