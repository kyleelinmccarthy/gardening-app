import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { todayIso } from "@/domain/dates";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { CalendarPage } from "./CalendarPage";

vi.mock("@/data/plants", async () => {
  const { makePlant } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return {
    BUILTIN_PLANTS: [
      makePlant({ id: "tomato", name: "Tomato", emoji: "🍅", planting: { startIndoorsWeeks: -6, transplantWeeks: 2 }, daysToMaturity: { min: 60, max: 80 } }),
      makePlant({ id: "lettuce", name: "Lettuce", emoji: "🥬", planting: { directSowWeeks: -4 }, daysToMaturity: { min: 30, max: 45 } }),
      makePlant({ id: "fern", name: "Fern", emoji: "🪴", planting: { notes: "Plant any time." }, daysToMaturity: undefined }),
    ],
  };
});

const year = Number(todayIso().slice(0, 4));
const planting = (plantId: string, status: "planned" | "growing" | "harvested" = "growing") => ({
  id: `p-${plantId}`,
  plantId,
  quantity: 1,
  plantedOn: `${year}-05-01`,
  status,
  inContainer: false,
});
const data = (plantings = [planting("tomato")], profile = {}) => {
  const garden = makeGarden({ plantings });
  garden.profile = { ...garden.profile, ...profile };
  return makeAppData([garden]);
};

describe("CalendarPage", () => {
  it("prompts for setup without a garden", async () => {
    renderWithAppData(<CalendarPage />);
    expect(await screen.findByRole("link", { name: /set up my garden/i })).toBeInTheDocument();
  });

  it("charts the plants being grown with accessible bars", async () => {
    renderWithAppData(<CalendarPage />, { data: data() });
    const row = await screen.findByRole("group", { name: "Tomato schedule" });
    // last frost 04-15 (default profile) => start indoors 6 weeks earlier, transplant 2 weeks later.
    expect(within(row).getByRole("img", { name: `Tomato: Start seeds indoors, Mar 4 – Mar 17` })).toBeInTheDocument();
    expect(within(row).getByRole("img", { name: /Tomato: Transplant, Apr 29 – May 12/ })).toBeInTheDocument();
    expect(within(row).getByRole("img", { name: /Tomato: Harvest/ })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Lettuce schedule" })).not.toBeInTheDocument();
  });

  it("shows the legend and frost dates", async () => {
    renderWithAppData(<CalendarPage />, { data: data() });
    const legend = await screen.findByRole("list", { name: "Legend" });
    expect(within(legend).getByText("Transplant")).toBeInTheDocument();
    expect(screen.getByText(/Last frost Apr 15 · First frost Oct 25/)).toBeInTheDocument();
  });

  it("notes frost-free climates", async () => {
    const climate = { hardinessZone: 11, lastFrost: null, firstFrost: null, summerHighF: 90, winterLowF: 50, humidity: "average" as const };
    renderWithAppData(<CalendarPage />, { data: data([planting("tomato")], { climate }) });
    expect(await screen.findByText(/Frost-free climate/)).toBeInTheDocument();
  });

  it("falls back to recommendations when the garden has no plantings", async () => {
    renderWithAppData(<CalendarPage />, { data: data([]) });
    expect(await screen.findByLabelText("Include top recommendations")).toBeChecked();
    expect(await screen.findByRole("group", { name: "Tomato schedule" })).toBeInTheDocument();
  });

  it("adds and removes plants with chips", async () => {
    const user = userEvent.setup();
    renderWithAppData(<CalendarPage />, { data: data() });
    await screen.findByRole("group", { name: "Tomato schedule" });
    const chips = screen.getByRole("group", { name: "Calendar plants" });

    await user.click(within(chips).getByRole("button", { name: "Lettuce" }));
    expect(screen.getByRole("group", { name: "Lettuce schedule" })).toBeInTheDocument();

    await user.click(within(chips).getByRole("button", { name: "Tomato" }));
    expect(screen.queryByRole("group", { name: "Tomato schedule" })).not.toBeInTheDocument();
  });

  it("includes recommendations when the toggle is turned on", async () => {
    const user = userEvent.setup();
    renderWithAppData(<CalendarPage />, { data: data() });
    await screen.findByRole("group", { name: "Tomato schedule" });
    expect(screen.queryByRole("group", { name: "Lettuce schedule" })).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Include top recommendations"));
    expect(screen.getByRole("group", { name: "Lettuce schedule" })).toBeInTheDocument();
  });

  it("switches to next year", async () => {
    const user = userEvent.setup();
    renderWithAppData(<CalendarPage />, { data: data() });
    await screen.findByRole("group", { name: "Tomato schedule" });
    await user.selectOptions(screen.getByLabelText("Year"), String(year + 1));
    expect(screen.getByRole("img", { name: /Tomato: Transplant, Apr 29 – May 12/ })).toBeInTheDocument();
  });

  it("explains plants without planting windows", async () => {
    renderWithAppData(<CalendarPage />, { data: data([planting("fern")]) });
    expect(await screen.findByText(/No scheduled windows — Plant any time\./)).toBeInTheDocument();
  });

  it("lists events month by month", async () => {
    const user = userEvent.setup();
    renderWithAppData(<CalendarPage />, { data: data() });
    await user.click(await screen.findByRole("tab", { name: "By month" }));
    const may = screen.getByRole("region", { name: `May ${year}` });
    expect(within(may).getByText("Transplant")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: `February ${year}` })).getByText("Nothing scheduled.")).toBeInTheDocument();
  });

  describe("upcoming tab", () => {
    afterEach(() => vi.useRealTimers());

    it("lists events starting within 30 days", async () => {
      vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 3, 20, 12) });
      const user = userEvent.setup();
      renderWithAppData(<CalendarPage />, { data: data() });
      await user.click(await screen.findByRole("tab", { name: "Upcoming" }));
      const list = screen.getByRole("list", { name: "Next 30 days" });
      expect(within(list).getByText("Transplant")).toBeInTheDocument();
      expect(within(list).getByText(/Starts in 9 days/)).toBeInTheDocument();
      expect(within(list).queryByText("Harvest")).not.toBeInTheDocument();
    });

    it("says when nothing is coming up", async () => {
      vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 0, 5, 12) });
      const user = userEvent.setup();
      renderWithAppData(<CalendarPage />, { data: data([planting("fern")]) });
      await user.click(await screen.findByRole("tab", { name: "Upcoming" }));
      expect(screen.getByText(/Nothing is scheduled for the next 30 days/)).toBeInTheDocument();
    });
  });
});
