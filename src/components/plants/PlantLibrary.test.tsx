import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultProfile } from "@/domain/defaults";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { PlantLibrary } from "./PlantLibrary";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("./test-plants")>("./test-plants");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

const cards = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent?.replace(/^\S+\s/, ""));

describe("PlantLibrary", () => {
  it("shows every plant with a count", async () => {
    renderWithAppData(<PlantLibrary />);
    expect(await screen.findByText("4 plants")).toBeInTheDocument();
    expect(cards()).toEqual(["Basil", "Lily", "Pothos", "Tomato"]);
  });

  it("filters by search text", async () => {
    renderWithAppData(<PlantLibrary />);
    await userEvent.type(await screen.findByRole("searchbox", { name: /search plants/i }), "bas");
    expect(cards()).toEqual(["Basil"]);
    expect(screen.getByText("1 plant")).toBeInTheDocument();
  });

  it("filters by category chip and clears all filters", async () => {
    renderWithAppData(<PlantLibrary />);
    const categories = within(await screen.findByRole("group", { name: "Category" }));
    await userEvent.click(categories.getByRole("button", { name: /Herbs/ }));
    expect(cards()).toEqual(["Basil"]);
    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(cards()).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument();
  });

  it("shows a friendly empty state when nothing matches", async () => {
    renderWithAppData(<PlantLibrary />);
    await userEvent.type(await screen.findByRole("searchbox"), "zzzz");
    expect(screen.getByText(/no plants match/i)).toBeInTheDocument();
  });

  it("filters to plants safe for the active garden's pets", async () => {
    const garden = makeGarden({ profile: createDefaultProfile({ pets: ["cat"] }) });
    renderWithAppData(<PlantLibrary />, { data: makeAppData([garden]) });
    await userEvent.click(await screen.findByRole("checkbox", { name: /safe for my pets/i }));
    expect(cards()).toEqual(["Basil"]);
  });

  it("excludes plants with the user's allergens", async () => {
    const garden = makeGarden({ profile: createDefaultProfile({ allergies: ["pollen"] }) });
    renderWithAppData(<PlantLibrary />, { data: makeAppData([garden]) });
    await userEvent.click(await screen.findByRole("checkbox", { name: /exclude my allergens/i }));
    expect(cards()).not.toContain("Lily");
    expect(cards()).toHaveLength(3);
  });

  it("disables the personal toggles when there is no garden", async () => {
    renderWithAppData(<PlantLibrary />);
    expect(await screen.findByRole("checkbox", { name: /safe for my pets/i })).toBeDisabled();
  });

  it("offers sorting by best match only with a garden", async () => {
    const { unmount } = renderWithAppData(<PlantLibrary />);
    const noGarden = await screen.findByRole("combobox", { name: /sort/i });
    expect(within(noGarden).queryByRole("option", { name: /best match/i })).not.toBeInTheDocument();
    unmount();
    renderWithAppData(<PlantLibrary />, { data: makeAppData([makeGarden()]) });
    const select = await screen.findByRole("combobox", { name: /sort/i });
    expect(within(select).getByRole("option", { name: /best match/i })).toBeInTheDocument();
    await userEvent.selectOptions(select, "match");
    expect(cards()).toHaveLength(4);
  });
});
