import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelectList } from "./MultiSelectList";

const options = [
  { value: "basil", label: "Basil" },
  { value: "fennel", label: "Fennel" },
  { value: "tomato", label: "Tomato" },
];

function setup(props: Partial<React.ComponentProps<typeof MultiSelectList<string>>> = {}) {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<MultiSelectList name="companions" label="Companions" options={options} value={[]} onChange={onChange} {...props} />);
  const group = screen.getByRole("group", { name: "Companions" });
  return { user, onChange, group };
}

describe("MultiSelectList", () => {
  it("summarises the current picks, or says none are selected", () => {
    const { group } = setup({ value: ["tomato", "basil"] });
    expect(within(group).getByText("Basil, Tomato")).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Choose Companions" })).toHaveTextContent("Choose (2)");
  });

  it("shows 'None selected' by default", () => {
    const { group } = setup();
    expect(within(group).getByText("None selected")).toBeInTheDocument();
  });

  it("opens and closes the checkbox panel", async () => {
    const { user, group } = setup();
    expect(within(group).queryByRole("checkbox")).not.toBeInTheDocument();
    const toggle = within(group).getByRole("button", { name: "Choose Companions" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(within(group).getAllByRole("checkbox")).toHaveLength(3);
    const close = within(group).getByRole("button", { name: "Close Companions" });
    expect(close).toHaveAttribute("aria-expanded", "true");
    await user.click(close);
    expect(within(group).queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("reports additions and removals with the list name", async () => {
    const { user, onChange, group } = setup({ value: ["basil"] });
    await user.click(within(group).getByRole("button", { name: "Choose Companions" }));
    await user.click(within(group).getByRole("checkbox", { name: "Tomato" }));
    expect(onChange).toHaveBeenLastCalledWith("companions", ["basil", "tomato"]);
    await user.click(within(group).getByRole("checkbox", { name: "Basil" }));
    expect(onChange).toHaveBeenLastCalledWith("companions", []);
  });

  it("filters options and reports when nothing matches", async () => {
    const { user, group } = setup();
    await user.click(within(group).getByRole("button", { name: "Choose Companions" }));
    const filter = within(group).getByLabelText("Filter Companions");
    await user.type(filter, "FEN");
    expect(within(group).getAllByRole("checkbox").map((c) => (c as HTMLInputElement).labels?.[0]?.textContent)).toEqual(["Fennel"]);
    await user.clear(filter);
    await user.type(filter, "zzz");
    expect(within(group).queryByRole("checkbox")).not.toBeInTheDocument();
    expect(within(group).getByText("No matches.")).toBeInTheDocument();
  });

  it("does not submit a surrounding form when Enter is pressed in the filter", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <MultiSelectList name="x" label="Things" options={options} value={[]} onChange={() => {}} />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Choose Things" }));
    await user.type(screen.getByLabelText("Filter Things"), "ba{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders hint and error text", () => {
    const { group } = setup({ hint: "Pick friends.", error: "Not both." });
    expect(within(group).getByText("Pick friends.")).toBeInTheDocument();
    expect(within(group).getByRole("alert")).toHaveTextContent("Not both.");
  });
});
