import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";
import { LoadingState } from "./LoadingState";

describe("Checkbox", () => {
  it("is a native checkbox named by its label", () => {
    render(<Checkbox label="Edible only" />);
    expect(screen.getByRole("checkbox", { name: "Edible only" })).not.toBeChecked();
  });

  it("toggles on label click and reports the change", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Edible only" onChange={onChange} />);
    await userEvent.click(screen.getByText("Edible only"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("supports controlled use", async () => {
    const seen: boolean[] = [];
    render(<Checkbox label="On" checked={false} onChange={(e) => seen.push(e.target.checked)} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(seen).toEqual([true]);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("describes the control with its hint and any aria-describedby", () => {
    render(
      <>
        <p id="extra">Extra</p>
        <Checkbox label="Pets" hint="Hide toxic plants" aria-describedby="extra" />
      </>,
    );
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("Extra Hide toxic plants");
  });

  it("can be disabled", () => {
    render(<Checkbox label="Nope" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});

describe("LoadingState", () => {
  it("is a busy status region with the default label", () => {
    render(<LoadingState />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Loading…");
  });

  it("accepts a custom label", () => {
    render(<LoadingState label="Loading beds…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading beds…");
  });
});
