import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmButton } from "./ConfirmButton";

function setup(props: Partial<React.ComponentProps<typeof ConfirmButton>> = {}) {
  const onConfirm = vi.fn();
  render(<ConfirmButton label="Delete" prompt="Delete this bed?" onConfirm={onConfirm} {...props} />);
  return { onConfirm, user: userEvent.setup() };
}

describe("ConfirmButton", () => {
  it("shows only the trigger until it is clicked", () => {
    setup();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("uses ariaLabel as the trigger's accessible name", () => {
    setup({ ariaLabel: "Delete Tomato planting" });
    expect(screen.getByRole("button", { name: "Delete Tomato planting" })).toHaveTextContent("Delete");
  });

  it("asks the question in a named group and does not run the action yet", async () => {
    const { user, onConfirm } = setup();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("group", { name: "Delete this bed?" })).toBeInTheDocument();
    expect(screen.getByText("Delete this bed?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("moves focus to the confirm button when the question opens", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("button", { name: "Yes, delete" })).toHaveFocus();
  });

  it("runs the action once on confirm and closes the question", async () => {
    const { user, onConfirm } = setup({ confirmLabel: "Remove it" });
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Remove it" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("cancels without running the action and returns focus to the trigger", async () => {
    const { user, onConfirm } = setup();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
  });

  it("returns focus to the trigger after confirming when it stays mounted", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
  });

  it("does not steal focus on first render", () => {
    setup();
    expect(screen.getByRole("button", { name: "Delete" })).not.toHaveFocus();
  });
});
