import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeAppData, makeBed, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { PlannerPage } from "./PlannerPage";

vi.mock("@/data/plants", async () => {
  const { makePlant } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return {
    BUILTIN_PLANTS: [
      makePlant({ id: "tomato", name: "Tomato", emoji: "🍅", companions: ["basil"], antagonists: ["fennel"], companionNotes: "Basil repels tomato pests." }),
      makePlant({ id: "basil", name: "Basil", emoji: "🌿", companions: ["tomato"], spacingInches: 6, sun: ["full-sun", "partial-sun"] }),
      makePlant({ id: "fennel", name: "Fennel", emoji: "🌱", antagonists: ["tomato"], spacingInches: 12, sun: ["full-sun"] }),
      makePlant({ id: "fern", name: "Fern", emoji: "🪴", sun: ["full-shade"], spacingInches: 12 }),
    ],
  };
});

const bed = (overrides = {}) => makeBed({ id: "bed-1", name: "Main bed", columns: 3, rows: 2, ...overrides });
const withBed = (b = bed(), garden = {}) => makeAppData([makeGarden({ beds: [b], ...garden })]);

describe("PlannerPage", () => {
  it("shows Loading… and then the planner", async () => {
    renderWithAppData(<PlannerPage />, { data: withBed() });
    expect(await screen.findByRole("group", { name: /Main bed layout/ })).toBeInTheDocument();
  });

  it("asks to set up a garden when none is active", async () => {
    renderWithAppData(<PlannerPage />);
    expect(await screen.findByRole("link", { name: /set up my garden/i })).toHaveAttribute("href", "/setup");
  });

  it("creates a bed with the New bed form and selects it", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<PlannerPage />, { data: makeAppData([makeGarden()]) });
    await user.type(await screen.findByLabelText("Bed name"), "Herb box");
    await user.clear(screen.getByLabelText("Columns"));
    await user.type(screen.getByLabelText("Columns"), "5");
    await user.click(screen.getByRole("button", { name: "Create bed" }));

    expect(await screen.findByRole("group", { name: /Herb box layout, 5 columns by 4 rows/ })).toBeInTheDocument();
    const saved = getData().gardens[0].beds;
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ name: "Herb box", columns: 5, rows: 4, cellSizeInches: 12, kind: "raised-bed" });
  });

  it("defaults new beds to a windowsill for indoor gardens", async () => {
    const indoor = makeGarden();
    indoor.profile = { ...indoor.profile, setting: "indoor" };
    renderWithAppData(<PlannerPage />, { data: makeAppData([indoor]) });
    expect(await screen.findByLabelText("Kind")).toHaveValue("windowsill");
  });

  it("validates the form", async () => {
    const user = userEvent.setup();
    renderWithAppData(<PlannerPage />, { data: makeAppData([makeGarden()]) });
    await user.click(await screen.findByRole("button", { name: "Create bed" }));
    expect(screen.getByText("Give the bed a name.")).toBeInTheDocument();
  });

  it("places a plant on a cell and shows the density hint", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<PlannerPage />, { data: withBed() });
    await user.click(await screen.findByRole("button", { name: "Basil" }));
    expect(screen.getByText("4 per square")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Row 1, column 2: empty" }));

    expect(screen.getByRole("button", { name: "Row 1, column 2: Basil" })).toBeInTheDocument();
    expect(getData().gardens[0].beds[0].placements).toEqual([{ plantId: "basil", x: 1, y: 0 }]);
  });

  it("says when a plant needs several squares", async () => {
    const user = userEvent.setup();
    renderWithAppData(<PlannerPage />, { data: withBed() });
    await user.click(await screen.findByRole("button", { name: "Tomato" }));
    expect(screen.getByText("needs 2×2 squares")).toBeInTheDocument();
  });

  it("warns live about a conflicting neighbour before placing", async () => {
    const user = userEvent.setup();
    renderWithAppData(<PlannerPage />, {
      data: withBed(bed({ placements: [{ plantId: "tomato", x: 0, y: 0 }] })),
    });
    await user.click(await screen.findByRole("button", { name: "Fennel" }));
    await user.hover(screen.getByRole("button", { name: "Row 1, column 2: empty" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Fennel conflicts with Tomato next to it");

    await user.unhover(screen.getByRole("button", { name: "Row 1, column 2: empty" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // Far from the tomato there is no conflict.
    await user.hover(screen.getByRole("button", { name: "Row 2, column 3: empty" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("warns when the plant's sun does not suit the bed", async () => {
    const user = userEvent.setup();
    renderWithAppData(<PlannerPage />, { data: withBed(bed({ sun: "full-sun" })) });
    await user.click(await screen.findByRole("button", { name: "Fern" }));
    expect(screen.getByText(/Fern prefers full shade/i)).toBeInTheDocument();
  });

  it("lists conflicts and benefits in the analysis panel", async () => {
    renderWithAppData(<PlannerPage />, {
      data: withBed(
        bed({
          placements: [
            { plantId: "tomato", x: 0, y: 0 },
            { plantId: "fennel", x: 1, y: 0 },
            { plantId: "basil", x: 0, y: 1 },
          ],
        }),
      ),
    });
    const conflicts = await screen.findByRole("region", { name: "Conflicts" });
    expect(within(conflicts).getByText("Fennel ✕ Tomato")).toBeInTheDocument();
    const benefits = screen.getByRole("region", { name: "Benefits" });
    expect(within(benefits).getByText("Basil ♥ Tomato")).toBeInTheDocument();
    expect(within(benefits).getByText("Basil repels tomato pests.")).toBeInTheDocument();
  });

  it("suggests good companions for the selected plant", async () => {
    const user = userEvent.setup();
    renderWithAppData(<PlannerPage />, { data: withBed() });
    await user.click(await screen.findByRole("button", { name: "Tomato" }));
    const region = screen.getByRole("region", { name: "Good companions to add" });
    await user.click(within(region).getByRole("button", { name: "Use Basil" }));
    expect(screen.getByRole("button", { name: "Basil" })).toHaveAttribute("aria-pressed", "true");
  });

  it("filters the palette with search", async () => {
    const user = userEvent.setup();
    renderWithAppData(<PlannerPage />, { data: withBed() });
    await user.type(await screen.findByLabelText("Search plants"), "fenn");
    expect(screen.getByRole("button", { name: "Fennel" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Basil" })).not.toBeInTheDocument();
  });

  it("groups palette plants that are already in the garden", async () => {
    renderWithAppData(<PlannerPage />, {
      data: withBed(bed(), {
        plantings: [{ id: "p1", plantId: "basil", quantity: 1, plantedOn: "2026-05-01", status: "growing", inContainer: false }],
      }),
    });
    const section = await screen.findByRole("region", { name: "In your garden" });
    expect(within(section).getByRole("button", { name: "Basil" })).toBeInTheDocument();
  });

  it("erases a cell with the eraser", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<PlannerPage />, {
      data: withBed(bed({ placements: [{ plantId: "basil", x: 0, y: 0 }] })),
    });
    await user.click(await screen.findByRole("button", { name: "Eraser" }));
    await user.click(screen.getByRole("button", { name: "Row 1, column 1: Basil" }));
    expect(screen.getByRole("button", { name: "Row 1, column 1: empty" })).toBeInTheDocument();
    expect(getData().gardens[0].beds[0].placements).toEqual([]);
  });

  it("clears the bed only after confirming", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<PlannerPage />, {
      data: withBed(bed({ placements: [{ plantId: "basil", x: 0, y: 0 }] })),
    });
    await user.click(await screen.findByRole("button", { name: "Clear bed" }));
    expect(getData().gardens[0].beds[0].placements).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Yes, clear" }));
    expect(getData().gardens[0].beds[0].placements).toEqual([]);
  });

  it("edits the bed name and size", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<PlannerPage />, { data: withBed() });
    await user.click(await screen.findByRole("button", { name: "Edit bed" }));
    const name = screen.getByLabelText("Bed name");
    await user.clear(name);
    await user.type(name, "Renamed");
    await user.click(screen.getByRole("button", { name: "Save bed" }));
    expect(getData().gardens[0].beds[0]).toMatchObject({ name: "Renamed", columns: 3, rows: 2 });
    expect(await screen.findByRole("heading", { name: "Renamed", level: 2 })).toBeInTheDocument();
  });

  it("deletes the bed after confirming", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<PlannerPage />, { data: withBed() });
    await user.click(await screen.findByRole("button", { name: "Delete bed" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(getData().gardens[0].beds).toEqual([]);
    expect(await screen.findByText(/No beds yet/)).toBeInTheDocument();
  });
});
