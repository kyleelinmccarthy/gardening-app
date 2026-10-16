import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, todayIso } from "@/domain/dates";
import type { Garden, Planting } from "@/domain/types";
import { makeAppData, makeBed, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { CarePage } from "./CarePage";

vi.mock("@/data/plants", async () => {
  const { makePlant } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return {
    BUILTIN_PLANTS: [
      makePlant({
        id: "tomato",
        name: "Tomato",
        emoji: "🍅",
        wateringIntervalDays: 3,
        fertilizer: { feeding: "heavy", recommended: ["compost"], frequencyDays: 14, notes: "Feed." },
        daysToMaturity: { min: 60, max: 80 },
      }),
      makePlant({ id: "basil", name: "Basil", emoji: "🌿", wateringIntervalDays: 2 }),
    ],
  };
});

const today = todayIso();
const daysAgo = (n: number) => addDays(today, -n);
const inDays = (n: number) => addDays(today, n);

const planting = (overrides: Partial<Planting> = {}): Planting => ({
  id: "p1",
  plantId: "tomato",
  quantity: 2,
  plantedOn: daysAgo(10),
  status: "growing",
  inContainer: false,
  ...overrides,
});

const setup = (garden: Partial<Garden> = {}) =>
  renderWithAppData(<CarePage />, { data: makeAppData([makeGarden({ plantings: [planting()], ...garden })]) });

const openTab = async (name: string) => userEvent.click(await screen.findByRole("tab", { name }));

describe("CarePage", () => {
  it("asks to set up a garden when none exists", async () => {
    renderWithAppData(<CarePage />);
    expect(await screen.findByRole("link", { name: /set up my garden/i })).toHaveAttribute("href", "/setup");
  });

  describe("Today", () => {
    it("groups overdue tasks by type with emoji", async () => {
      setup();
      const water = await screen.findByRole("region", { name: "Water" });
      expect(within(water).getByText("Water Tomato")).toBeInTheDocument();
      expect(within(water).getByText("7 days overdue")).toBeInTheDocument();
      expect(screen.getByRole("region", { name: "Inspect for pests" })).toBeInTheDocument();
    });

    it("logs care when a task is marked done and removes it", async () => {
      const user = userEvent.setup();
      const { getData } = setup();
      await user.click(await screen.findByRole("button", { name: "Done: Water Tomato" }));

      expect(screen.queryByRole("button", { name: "Done: Water Tomato" })).not.toBeInTheDocument();
      expect(getData().gardens[0].careLog).toMatchObject([{ plantingId: "p1", type: "water", date: today }]);
    });

    it("completes one-off reminders", async () => {
      const user = userEvent.setup();
      const { getData } = setup({
        plantings: [],
        reminders: [{ id: "r1", title: "Buy mulch", dueDate: today, done: false }],
      });
      await user.click(await screen.findByRole("button", { name: "Done: Buy mulch" }));
      expect(getData().gardens[0].reminders[0].done).toBe(true);
    });

    it("reschedules repeating reminders instead of finishing them", async () => {
      const user = userEvent.setup();
      const { getData } = setup({
        plantings: [],
        reminders: [{ id: "r1", title: "Turn compost", dueDate: today, repeatDays: 7, done: false }],
      });
      await user.click(await screen.findByRole("button", { name: "Done: Turn compost" }));
      expect(getData().gardens[0].reminders[0]).toMatchObject({ done: false, dueDate: inDays(7) });
    });

    it("lists the next 7 days separately, without a Done button", async () => {
      setup({
        plantings: [],
        reminders: [
          { id: "r1", title: "Soon", dueDate: inDays(3), done: false },
          { id: "r2", title: "Far away", dueDate: inDays(30), done: false },
        ],
      });
      const upcoming = await screen.findByRole("list", { name: "Upcoming tasks" });
      expect(within(upcoming).getByText("Soon")).toBeInTheDocument();
      expect(within(upcoming).queryByText("Far away")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Done: Soon" })).not.toBeInTheDocument();
    });

    it("says when all caught up", async () => {
      setup({ plantings: [planting({ status: "growing", plantedOn: today })] });
      expect(await screen.findByText(/All caught up/)).toBeInTheDocument();
    });
  });

  describe("My plants", () => {
    it("shows computed watering and feeding cadence and last care dates", async () => {
      setup({ careLog: [{ id: "l1", plantingId: "p1", type: "water", date: daysAgo(2) }] });
      await openTab("My plants");
      const card = (await screen.findAllByRole("listitem"))[0];
      expect(within(card).getByText("every 3 days")).toBeInTheDocument();
      expect(within(card).getByText("every 14 days")).toBeInTheDocument();
      expect(within(card).getAllByText("not logged yet")).toHaveLength(1);
    });

    it("waters containers more often", async () => {
      setup({ plantings: [planting({ inContainer: true })] });
      await openTab("My plants");
      expect(await screen.findByText("every 2 days")).toBeInTheDocument();
    });

    it("sets the planted date to today when a planned planting starts growing", async () => {
      const user = userEvent.setup();
      const { getData } = setup({ plantings: [planting({ status: "planned", plantedOn: "2020-01-01" })] });
      await openTab("My plants");
      await user.selectOptions(await screen.findByLabelText("Status of Tomato"), "growing");
      expect(getData().gardens[0].plantings[0]).toMatchObject({ status: "growing", plantedOn: today });
    });

    it("edits quantity, container and notes", async () => {
      const user = userEvent.setup();
      const { getData } = setup();
      await openTab("My plants");

      const qty = await screen.findByLabelText("Quantity of Tomato");
      await user.clear(qty);
      await user.type(qty, "5");
      await user.click(screen.getByLabelText("Tomato is in a container"));
      await user.type(screen.getByLabelText("Notes on Tomato"), "Cherry type");
      await user.tab();

      expect(getData().gardens[0].plantings[0]).toMatchObject({ quantity: 5, inContainer: true, notes: "Cherry type" });
    });

    it("quick-logs watering and shows it as last watered", async () => {
      const user = userEvent.setup();
      const { getData } = setup();
      await openTab("My plants");
      await user.click(await screen.findByRole("button", { name: "Log watering for Tomato" }));
      expect(getData().gardens[0].careLog).toMatchObject([{ plantingId: "p1", type: "water", date: today }]);
      await user.click(screen.getByRole("button", { name: "Log feeding for Tomato" }));
      expect(getData().gardens[0].careLog.map((e) => e.type)).toEqual(["water", "fertilize"]);
    });

    it("shows the bed name and deletes after confirmation", async () => {
      const user = userEvent.setup();
      const { getData } = setup({ beds: [makeBed({ id: "b1", name: "Main bed" })], plantings: [planting({ bedId: "b1" })] });
      await openTab("My plants");
      expect(await screen.findByText("Bed: Main bed")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Delete Tomato planting" }));
      expect(getData().gardens[0].plantings).toHaveLength(1);
      await user.click(screen.getByRole("button", { name: "Yes, delete" }));
      expect(getData().gardens[0].plantings).toEqual([]);
    });

    it("links to the library when there are no plantings", async () => {
      setup({ plantings: [] });
      await openTab("My plants");
      expect(await screen.findByRole("link", { name: "Browse plants" })).toHaveAttribute("href", "/plants");
    });
  });

  describe("Reminders", () => {
    it("creates a repeating reminder tied to a planting", async () => {
      const user = userEvent.setup();
      const { getData } = setup();
      await openTab("Reminders");
      await user.type(await screen.findByLabelText("Title"), "Stake tomatoes");
      fireEvent.change(screen.getByLabelText("Due date"), { target: { value: inDays(5) } });
      await user.type(screen.getByLabelText("Repeat every (days)"), "14");
      await user.selectOptions(screen.getByLabelText("Plant (optional)"), "p1");
      await user.click(screen.getByRole("button", { name: "Add reminder" }));

      expect(getData().gardens[0].reminders).toMatchObject([
        { title: "Stake tomatoes", dueDate: inDays(5), repeatDays: 14, plantingId: "p1", done: false },
      ]);
      expect(screen.getByText("Repeats every 14 days")).toBeInTheDocument();
    });

    it("validates the title", async () => {
      const user = userEvent.setup();
      setup();
      await openTab("Reminders");
      await user.click(await screen.findByRole("button", { name: "Add reminder" }));
      expect(screen.getByText("Give the reminder a title.")).toBeInTheDocument();
    });

    it("toggles done, edits and deletes", async () => {
      const user = userEvent.setup();
      const { getData } = setup({
        plantings: [],
        reminders: [{ id: "r1", title: "Buy seeds", dueDate: inDays(2), done: false }],
      });
      await openTab("Reminders");

      await user.click(await screen.findByLabelText("Done: Buy seeds"));
      expect(getData().gardens[0].reminders[0].done).toBe(true);

      await user.click(screen.getByRole("button", { name: "Edit Buy seeds" }));
      const editForm = within(screen.getByRole("list", { name: "Reminders" }));
      const title = editForm.getByLabelText("Title");
      await user.clear(title);
      await user.type(title, "Buy bulbs");
      await user.click(screen.getByRole("button", { name: "Save reminder" }));
      expect(getData().gardens[0].reminders[0].title).toBe("Buy bulbs");

      await user.click(screen.getByRole("button", { name: "Delete Buy bulbs" }));
      await user.click(screen.getByRole("button", { name: "Yes, delete" }));
      expect(getData().gardens[0].reminders).toEqual([]);
    });
  });

  describe("Care log", () => {
    const log = [
      { id: "l1", plantingId: "p1", type: "water" as const, date: daysAgo(3), note: "Deep soak" },
      { id: "l2", plantingId: "p1", type: "prune" as const, date: daysAgo(1) },
    ];

    it("lists history newest first and filters by type", async () => {
      const user = userEvent.setup();
      setup({ careLog: log });
      await openTab("Care log");
      const list = await screen.findByRole("list", { name: "Care log" });
      const items = within(list).getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("Prune");
      expect(items[1]).toHaveTextContent("Deep soak");

      await user.selectOptions(screen.getByLabelText("Filter by type"), "water");
      expect(within(screen.getByRole("list", { name: "Care log" })).getAllByRole("listitem")).toHaveLength(1);
    });

    it("filters by plant", async () => {
      const user = userEvent.setup();
      setup({
        plantings: [planting(), planting({ id: "p2", plantId: "basil" })],
        careLog: [...log, { id: "l3", plantingId: "p2", type: "water", date: today }],
      });
      await openTab("Care log");
      await user.selectOptions(await screen.findByLabelText("Filter by plant"), "p2");
      expect(within(screen.getByRole("list", { name: "Care log" })).getAllByRole("listitem")).toHaveLength(1);
    });

    it("adds a manual entry", async () => {
      const user = userEvent.setup();
      const { getData } = setup();
      await openTab("Care log");
      await user.selectOptions(await screen.findByLabelText("Care type"), "prune");
      await user.selectOptions(screen.getByLabelText("Plant (optional)"), "p1");
      fireEvent.change(screen.getByLabelText("Date"), { target: { value: daysAgo(2) } });
      await user.type(screen.getByLabelText("Note (optional)"), "Removed suckers");
      await user.click(screen.getByRole("button", { name: "Add log entry" }));

      expect(getData().gardens[0].careLog).toMatchObject([
        { type: "prune", plantingId: "p1", date: daysAgo(2), note: "Removed suckers" },
      ]);
    });

    it("deletes an entry after confirming", async () => {
      const user = userEvent.setup();
      const { getData } = setup({ careLog: [log[0]] });
      await openTab("Care log");
      await user.click(await screen.findByRole("button", { name: /Delete Water entry/ }));
      await user.click(screen.getByRole("button", { name: "Yes, delete" }));
      expect(getData().gardens[0].careLog).toEqual([]);
    });
  });

  describe("Journal", () => {
    it("creates entries, newest first", async () => {
      const user = userEvent.setup();
      const { getData } = setup({ journal: [{ id: "j0", date: daysAgo(30), title: "Old note", text: "" }] });
      await openTab("Journal");
      await user.type(await screen.findByLabelText("Entry title"), "First sprouts");
      await user.type(screen.getByLabelText("Entry text"), "Tomatoes are up.");
      await user.click(screen.getByRole("button", { name: "Add entry" }));

      expect(getData().gardens[0].journal).toHaveLength(2);
      const items = within(screen.getByRole("list", { name: "Journal entries" })).getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("First sprouts");
      expect(items[0]).toHaveTextContent("Tomatoes are up.");
      expect(items[1]).toHaveTextContent("Old note");
    });

    it("requires a title", async () => {
      const user = userEvent.setup();
      setup();
      await openTab("Journal");
      await user.click(await screen.findByRole("button", { name: "Add entry" }));
      expect(screen.getByText("Give the entry a title.")).toBeInTheDocument();
    });

    it("edits and deletes an entry", async () => {
      const user = userEvent.setup();
      const { getData } = setup({ journal: [{ id: "j1", date: daysAgo(1), title: "Aphids", text: "Found some" }] });
      await openTab("Journal");
      await user.click(await screen.findByRole("button", { name: "Edit Aphids" }));
      const text = within(screen.getByRole("list", { name: "Journal entries" })).getByLabelText("Entry text");
      await user.clear(text);
      await user.type(text, "Sprayed with soap");
      await user.click(screen.getByRole("button", { name: "Save entry" }));
      expect(getData().gardens[0].journal[0].text).toBe("Sprayed with soap");

      await user.click(screen.getByRole("button", { name: "Delete Aphids" }));
      await user.click(screen.getByRole("button", { name: "Yes, delete" }));
      expect(getData().gardens[0].journal).toEqual([]);
    });
  });
});
