import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultProfile } from "@/domain/defaults";
import type { Planting } from "@/domain/types";
import { makeAppData, makeBed, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { Dashboard } from "./Dashboard";

vi.mock("@/data/plants", async () => {
  const { makePlant } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return {
    BUILTIN_PLANTS: [
      makePlant({ id: "tomato", name: "Tomato", emoji: "🍅", antagonists: ["fennel"], planting: { transplantWeeks: 2 } }),
      makePlant({ id: "fennel", name: "Fennel", emoji: "🌿", antagonists: ["tomato"] }),
      makePlant({
        id: "lily",
        name: "Lily",
        emoji: "🌺",
        toxicity: { cat: "severe", dog: "mild", horse: "mild", bird: "mild", rabbit: "mild", human: "mild" },
      }),
    ],
  };
});

const planting = (id: string, plantId: string, status: Planting["status"] = "growing"): Planting => ({
  id,
  plantId,
  quantity: 1,
  plantedOn: "2026-04-01",
  status,
  inContainer: false,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-04-20T12:00:00"));
});
afterEach(() => vi.useRealTimers());

describe("Dashboard without a garden", () => {
  it("shows the welcome hero with a CTA to /setup", async () => {
    renderWithAppData(<Dashboard />);
    expect(await screen.findByRole("heading", { level: 1, name: /welcome/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /set up my garden/i })).toHaveAttribute("href", "/setup");
    for (const feature of [/companion-aware bed planner/i, /^planting calendar/i, /^care schedule/i, /guides/i]) {
      expect(screen.getByRole("heading", { level: 2, name: feature })).toBeInTheDocument();
    }
  });

  it("lets users open an existing garden when none is active", async () => {
    const user = userEvent.setup();
    const data = makeAppData([makeGarden({ id: "a", name: "Alpha" })], { activeGardenId: null });
    const { getData } = renderWithAppData(<Dashboard />, { data });
    await user.click(await screen.findByRole("button", { name: "Open Alpha" }));
    expect(getData().activeGardenId).toBe("a");
    expect(await screen.findByRole("heading", { level: 1, name: "Alpha" })).toBeInTheDocument();
  });
});

describe("Dashboard with a garden", () => {
  const garden = makeGarden({
    id: "g1",
    name: "Backyard",
    profile: createDefaultProfile({ pets: ["cat"] }),
    beds: [
      makeBed({
        id: "b1",
        name: "North bed",
        placements: [
          { plantId: "tomato", x: 0, y: 0 },
          { plantId: "fennel", x: 1, y: 0 },
        ],
      }),
    ],
    plantings: [planting("p1", "tomato"), planting("p2", "lily", "planned"), planting("p3", "fennel", "planned")],
  });

  it("shows the name, profile chips and an Edit setup link", async () => {
    renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    expect(await screen.findByRole("heading", { level: 1, name: "Backyard" })).toBeInTheDocument();
    const chips = screen.getByRole("list", { name: "Garden profile" });
    expect(within(chips).getByText("Zone 7")).toBeInTheDocument();
    expect(within(chips).getByText("Outdoor")).toBeInTheDocument();
    expect(within(chips).getByText(/Cat/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit setup" })).toHaveAttribute("href", "/setup");
  });

  it("shows stat tiles for plantings, care, events and conflicts", async () => {
    renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    const stats = await screen.findByRole("region", { name: "Summary" }).catch(() => screen.getByLabelText("Summary"));
    expect(within(stats).getByText("Plants growing").nextElementSibling).toHaveTextContent("1");
    expect(within(stats).getByText("2 planned")).toBeInTheDocument();
    expect(within(stats).getByText("Companion conflicts").nextElementSibling).toHaveTextContent("1");
    expect(within(stats).getByText("Care tasks due").nextElementSibling).not.toHaveTextContent("0");
  });

  it("lists due care tasks and completes one with Done", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    const card = await screen.findByRole("region", { name: "Today’s care" });
    const doneButtons = within(card).getAllByRole("button", { name: /^Mark done:/ });
    expect(doneButtons.length).toBeLessThanOrEqual(5);
    expect(within(card).getByRole("link", { name: "All care tasks" })).toHaveAttribute("href", "/care");

    const label = doneButtons[0].getAttribute("aria-label")!;
    await user.click(doneButtons[0]);
    expect(getData().gardens[0].careLog).toHaveLength(1);
    expect(getData().gardens[0].careLog[0]).toMatchObject({ plantingId: "p1", date: "2026-04-20" });
    expect(within(card).queryByRole("button", { name: label })).not.toBeInTheDocument();
  });

  it("shows upcoming planting windows with a calendar link", async () => {
    renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    const card = await screen.findByRole("region", { name: "Coming up" });
    // Tomato transplant window: 2 weeks after Apr 15 = Apr 29 (within 14 days of Apr 20).
    expect(within(card).getByText(/Transplant: Tomato/)).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Full calendar" })).toHaveAttribute("href", "/calendar");
  });

  it("flags plants unsafe for the household with a link to the plant page", async () => {
    renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    const card = await screen.findByRole("region", { name: "Safety alerts" });
    expect(within(card).getByRole("link", { name: "Lily" })).toHaveAttribute("href", "/plants/lily");
    expect(within(card).getByText("High risk")).toBeInTheDocument();
    expect(within(card).getByText(/severely toxic to cats/i)).toBeInTheDocument();
  });

  it("reports no safety alerts for a safe household", async () => {
    const safe = makeGarden({ plantings: [planting("p1", "tomato")], profile: createDefaultProfile() });
    renderWithAppData(<Dashboard />, { data: makeAppData([safe]) });
    expect(await screen.findByText(/no pet, allergy or child-safety concerns/i)).toBeInTheDocument();
  });

  it("links to the main feature pages", async () => {
    renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    const nav = await screen.findByRole("navigation", { name: "Quick links" });
    const hrefs = within(nav).getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(["/recommendations", "/planner", "/plants", "/guides"]);
  });

  it("only offers a garden switcher when there are several gardens", async () => {
    const user = userEvent.setup();
    const other = makeGarden({ id: "g2", name: "Balcony" });
    const { getData, unmount } = renderWithAppData(<Dashboard />, { data: makeAppData([garden, other]) });
    const select = await screen.findByLabelText("Active garden");
    await user.selectOptions(select, "g2");
    expect(getData().activeGardenId).toBe("g2");
    expect(await screen.findByRole("heading", { level: 1, name: "Balcony" })).toBeInTheDocument();
    unmount();

    renderWithAppData(<Dashboard />, { data: makeAppData([garden]) });
    await screen.findByRole("heading", { level: 1, name: "Backyard" });
    expect(screen.queryByLabelText("Active garden")).not.toBeInTheDocument();
  });
});
