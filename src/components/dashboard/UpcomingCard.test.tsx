import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPlantCatalog } from "@/domain/catalog";
import type { CalendarEvent } from "@/domain/types";
import { makePlant } from "@/test/fixtures";
import { UPCOMING_LIMIT, UpcomingCard } from "./UpcomingCard";

const catalog = createPlantCatalog([makePlant({ id: "tomato", name: "Tomato", emoji: "🍅" })]);
const events = (n: number): CalendarEvent[] =>
  Array.from({ length: n }, (_, i) => ({
    plantId: "tomato",
    type: "transplant",
    start: `2026-04-${String(21 + i).padStart(2, "0")}`,
    end: `2026-04-${String(21 + i).padStart(2, "0")}`,
  }));

const renderCard = (n: number) => render(<UpcomingCard events={events(n)} today="2026-04-20" catalog={catalog} />);

describe("UpcomingCard", () => {
  it("lists every event when there are few", () => {
    renderCard(3);
    const card = screen.getByRole("region", { name: "Coming up" });
    expect(within(card).getAllByRole("listitem")).toHaveLength(3);
    expect(within(card).queryByText(/more in the calendar/)).not.toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Full calendar" })).toHaveAttribute("href", "/calendar");
  });

  it("truncates long lists and links to the rest of the calendar", () => {
    renderCard(UPCOMING_LIMIT + 3);
    const card = screen.getByRole("region", { name: "Coming up" });
    expect(within(card).getAllByRole("listitem")).toHaveLength(UPCOMING_LIMIT);
    expect(within(card).getByRole("link", { name: "+3 more in the calendar" })).toHaveAttribute("href", "/calendar");
  });

  it("shows exactly the limit without a 'more' link", () => {
    renderCard(UPCOMING_LIMIT);
    expect(screen.queryByText(/more in the calendar/)).not.toBeInTheDocument();
  });

  it("explains an empty window", () => {
    renderCard(0);
    expect(screen.getByText(/No planting windows in the next 14 days/)).toBeInTheDocument();
  });

  it("describes open and future windows", () => {
    render(
      <UpcomingCard
        today="2026-04-20"
        catalog={catalog}
        events={[
          { plantId: "tomato", type: "transplant", start: "2026-04-10", end: "2026-04-25" },
          { plantId: "tomato", type: "harvest", start: "2026-04-28", end: "2026-04-28" },
        ]}
      />,
    );
    expect(screen.getByText(/^Open now to /)).toBeInTheDocument();
    expect(screen.getAllByText("Tomato", { exact: false }).length).toBeGreaterThan(0);
  });
});
