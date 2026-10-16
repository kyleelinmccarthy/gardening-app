import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { TemperatureUnit } from "@/domain/types";
import { TemperatureInput } from "./TemperatureInput";

function Harness({ initial, unit }: { initial: number | null; unit: TemperatureUnit }) {
  const [f, setF] = useState<number | null>(initial);
  return (
    <>
      <label>
        Temp
        <TemperatureInput value={f} onChange={setF} unit={unit} />
      </label>
      <output data-testid="stored">{f === null ? "empty" : f}</output>
      <button onClick={() => setF(100)}>external</button>
    </>
  );
}

describe("TemperatureInput", () => {
  it("shows the stored °F value converted to °C and stores °F", async () => {
    const user = userEvent.setup();
    render(<Harness initial={68} unit="C" />);
    const input = screen.getByLabelText("Temp");
    expect(input).toHaveValue(20);
    await user.clear(input);
    await user.type(input, "25");
    expect(screen.getByTestId("stored")).toHaveTextContent("77");
  });

  it("lets the user clear the field and type a negative number", async () => {
    const user = userEvent.setup();
    render(<Harness initial={30} unit="F" />);
    const input = screen.getByLabelText("Temp");
    await user.clear(input);
    expect(input).toHaveValue(null);
    expect(screen.getByTestId("stored")).toHaveTextContent("empty");
    await user.type(input, "-5");
    expect(input).toHaveValue(-5);
    expect(screen.getByTestId("stored")).toHaveTextContent("-5");
  });

  it("reports null when the field is cleared, in either unit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <label>
        Temp
        <TemperatureInput value={68} onChange={onChange} unit="C" />
      </label>,
    );
    await user.clear(screen.getByLabelText("Temp"));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("shows an empty field for a null value and reports whole °F when typed into", async () => {
    const user = userEvent.setup();
    render(<Harness initial={null} unit="C" />);
    const input = screen.getByLabelText("Temp");
    expect(input).toHaveValue(null);
    await user.type(input, "30");
    expect(screen.getByTestId("stored")).toHaveTextContent("86");
  });

  it("follows external changes to the value", async () => {
    const user = userEvent.setup();
    render(<Harness initial={30} unit="F" />);
    await user.clear(screen.getByLabelText("Temp"));
    await user.click(screen.getByRole("button", { name: "external" }));
    expect(screen.getByLabelText("Temp")).toHaveValue(100);
  });
});
