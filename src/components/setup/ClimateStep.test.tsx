import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClimateStep } from "./ClimateStep";
import type { SetupFormState } from "./setupForm";
import { StepHarness } from "./stepHarness";
import type { ZipLookupResult } from "./zipLookup";

type Lookup = (zip: string) => Promise<ZipLookupResult>;

function setup(lookupZone?: Lookup, initial: Partial<SetupFormState> = {}, unit: "F" | "C" = "F") {
  let latest!: SetupFormState;
  const user = userEvent.setup();
  render(
    <StepHarness
      step={ClimateStep}
      stepProps={{ lookupZone }}
      initial={initial}
      unit={unit}
      onState={(s) => {
        latest = s;
      }}
    />,
  );
  return { user, state: () => latest };
}

describe("ClimateStep zip lookup", () => {
  it("tells users which service the ZIP lookup contacts", () => {
    setup();
    expect(screen.getByText(/looks up your zone via phzmapi\.org/i)).toBeInTheDocument();
  });

  it("clears the 'We selected zone' message when the zone is changed by hand", async () => {
    const lookup = vi.fn<Lookup>().mockResolvedValue({ ok: true, zone: 6, label: "6b" });
    const { user } = setup(lookup);
    await user.type(screen.getByLabelText(/ZIP code/), "02134");
    await user.click(screen.getByRole("button", { name: "Look up zone" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/We selected zone 6/);

    await user.selectOptions(screen.getByLabelText("USDA hardiness zone"), "5");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("starts only one lookup when Enter is pressed repeatedly while loading", async () => {
    let resolve!: (r: ZipLookupResult) => void;
    const lookup = vi.fn<Lookup>().mockImplementation(() => new Promise((r) => (resolve = r)));
    const { user } = setup(lookup);
    await user.type(screen.getByLabelText(/ZIP code/), "02134{Enter}{Enter}{Enter}");
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Looking up…" })).toBeDisabled();

    resolve({ ok: true, zone: 6, label: "6b" });
    expect(await screen.findByRole("status")).toBeInTheDocument();
    // Once finished, a new lookup is allowed again.
    await user.type(screen.getByLabelText(/ZIP code/), "{Enter}");
    expect(lookup).toHaveBeenCalledTimes(2);
  });
});

describe("ClimateStep in °C", () => {
  it("labels and shows temperatures in Celsius", () => {
    setup(undefined, { setting: "indoor", summerHighF: 86, winterLowF: -4, indoorTempF: 68 }, "C");
    expect(screen.getByLabelText("Typical summer high (°C)")).toHaveValue(30);
    expect(screen.getByLabelText("Typical winter low (°C)")).toHaveValue(-20);
    expect(screen.getByLabelText("Average indoor temperature (°C)")).toHaveValue(20);
  });

  it("converts what the user types back to °F in the form state", async () => {
    const { user, state } = setup(undefined, { setting: "indoor", summerHighF: 86, winterLowF: -4, indoorTempF: 68 }, "C");
    const high = screen.getByLabelText("Typical summer high (°C)");
    await user.clear(high);
    await user.type(high, "35");
    expect(state().summerHighF).toBe(95);
    const indoor = screen.getByLabelText("Average indoor temperature (°C)");
    await user.clear(indoor);
    await user.type(indoor, "22");
    expect(state().indoorTempF).toBe(72);
    expect(high).toHaveValue(35);
  });

  it("describes zones in Celsius", () => {
    setup(undefined, {}, "C");
    const options = Array.from(screen.getByLabelText("USDA hardiness zone").querySelectorAll("option")).map((o) => o.textContent);
    expect(options.every((t) => t?.includes("°C") && !t.includes("°F"))).toBe(true);
  });
});
