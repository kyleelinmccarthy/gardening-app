import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { TemperatureUnit } from "@/domain/types";
import { TemperatureInput } from "./TemperatureInput";
import { fromDisplayTemp, toDisplayTemp } from "./temperature";

function Harness({ initial, unit }: { initial: number; unit: TemperatureUnit }) {
  const [f, setF] = useState(initial);
  return (
    <>
      <label>
        Temp
        <TemperatureInput value={f} onChange={setF} unit={unit} />
      </label>
      <output data-testid="stored">{f}</output>
      <button onClick={() => setF(100)}>external</button>
    </>
  );
}

describe("temperature conversion helpers", () => {
  it("round-trips whole degrees", () => {
    for (let c = -40; c <= 45; c++) expect(toDisplayTemp(fromDisplayTemp(c, "C"), "C")).toBe(c);
  });
  it("is the identity in °F", () => {
    expect(toDisplayTemp(72, "F")).toBe(72);
    expect(fromDisplayTemp(72, "F")).toBe(72);
  });
});

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
    await user.type(input, "-5");
    expect(input).toHaveValue(-5);
    expect(screen.getByTestId("stored")).toHaveTextContent("-5");
  });

  it("follows external changes to the value", async () => {
    const user = userEvent.setup();
    render(<Harness initial={30} unit="F" />);
    await user.clear(screen.getByLabelText("Temp"));
    await user.click(screen.getByRole("button", { name: "external" }));
    expect(screen.getByLabelText("Temp")).toHaveValue(100);
  });
});
