import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipGroup } from "./ChipGroup";

const options = [
  { value: "a", label: "Alpha", icon: "🅰️" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
] as const;

function Harness({ multiple, initial = [] }: { multiple?: boolean; initial?: ("a" | "b" | "c")[] }) {
  const [value, setValue] = useState(initial);
  return <ChipGroup label="Letters" options={options} value={value} onChange={setValue} multiple={multiple} />;
}

describe("ChipGroup", () => {
  it("renders a labelled group of buttons with aria-pressed", () => {
    render(<Harness initial={["b"]} />);
    const group = screen.getByRole("group", { name: "Letters" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Alpha/ })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "true");
  });

  it("multi mode toggles chips independently", async () => {
    const user = userEvent.setup();
    render(<Harness multiple />);
    await user.click(screen.getByRole("button", { name: "Beta" }));
    await user.click(screen.getByRole("button", { name: "Gamma" }));
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Gamma" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Beta" }));
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "false");
  });

  it("single mode replaces the selection and clears on re-click", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Beta" }));
    await user.click(screen.getByRole("button", { name: "Gamma" }));
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Gamma" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Gamma" }));
    expect(screen.getByRole("button", { name: "Gamma" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports the next value through onChange", async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="L" options={options} value={["a"]} onChange={onChange} multiple />);
    await userEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });
});
