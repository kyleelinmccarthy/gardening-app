import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CareTaskItem } from "@/domain/care";
import { CareCard, TODAYS_CARE_LIMIT } from "./CareCard";

const task = (i: number, overdueDays = 0): CareTaskItem =>
  ({ id: `water:p${i}`, type: "water", plantingId: `p${i}`, title: `Water plant ${i}`, overdueDays }) as unknown as CareTaskItem;

describe("CareCard", () => {
  it("lists tasks, describes lateness and reports Done", async () => {
    const onDone = vi.fn();
    const user = userEvent.setup();
    render(<CareCard tasks={[task(1), task(2, 3)]} hasPlantings onDone={onDone} />);
    const card = screen.getByRole("region", { name: "Today’s care" });
    expect(within(card).getByText("Due today")).toBeInTheDocument();
    expect(within(card).getByText("Overdue by 3 days")).toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "Mark done: Water plant 2" }));
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ id: "water:p2" }));
  });

  it("truncates and links to the care page for the rest", () => {
    render(<CareCard tasks={Array.from({ length: TODAYS_CARE_LIMIT + 2 }, (_, i) => task(i))} hasPlantings onDone={() => {}} />);
    expect(screen.getAllByRole("button", { name: /^Mark done:/ })).toHaveLength(TODAYS_CARE_LIMIT);
    expect(screen.getByRole("link", { name: "+2 more on the care page" })).toHaveAttribute("href", "/care");
  });

  it("explains an empty list differently with and without plantings", () => {
    const { rerender } = render(<CareCard tasks={[]} hasPlantings={false} onDone={() => {}} />);
    expect(screen.getByText(/Add plants in the planner/)).toBeInTheDocument();
    rerender(<CareCard tasks={[]} hasPlantings onDone={() => {}} />);
    expect(screen.getByText(/Nothing is due today/)).toBeInTheDocument();
  });
});
