import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const tabs = [
  { id: "one", label: "One", content: <p>First panel</p> },
  { id: "two", label: "Two", content: <p>Second panel</p> },
  { id: "three", label: "Three", content: <p>Third panel</p> },
];

describe("Tabs", () => {
  it("shows the first tab by default with proper roles", () => {
    render(<Tabs tabs={tabs} label="Sections" />);
    expect(screen.getByRole("tablist", { name: "Sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("First panel");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("One");
  });

  it("switches on click", async () => {
    render(<Tabs tabs={tabs} label="Sections" />);
    await userEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
  });

  it("moves with arrow keys, wrapping, plus Home/End", async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} label="Sections" />);
    screen.getByRole("tab", { name: "One" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
  });

  it("uses roving tabindex", () => {
    render(<Tabs tabs={tabs} label="Sections" defaultValue="two" />);
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("tabindex", "-1");
  });

  it("calls onChange and supports controlled value", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} label="Sections" value="one" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Three" }));
    expect(onChange).toHaveBeenCalledWith("three");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("First panel");
  });
});
