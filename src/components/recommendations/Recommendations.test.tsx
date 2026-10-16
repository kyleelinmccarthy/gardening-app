import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultProfile } from "@/domain/defaults";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { Recommendations } from "./Recommendations";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

const withGarden = () => ({ data: makeAppData([makeGarden({ profile: createDefaultProfile() })]) });
const names = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent?.replace(/^\S+\s/, ""));

describe("Recommendations", () => {
  it("asks for a garden when there is none", async () => {
    renderWithAppData(<Recommendations />);
    expect(await screen.findByText(/set up your garden/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /set up/i })).toHaveAttribute("href", "/setup");
  });

  it("summarises great matches and groups cards by verdict, hiding blocked plants by default", async () => {
    renderWithAppData(<Recommendations />, withGarden());
    expect(await screen.findByText("2 great matches for your Zone 7 outdoor garden")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Great match/ })).toBeInTheDocument();
    expect(names()).toEqual(expect.arrayContaining(["Tomato", "Basil"]));
    expect(names()).not.toContain("Pothos"); // indoor-only: blocked in an outdoor garden
  });

  it("reveals plants that aren't a good fit, with reasons, via the toggle", async () => {
    renderWithAppData(<Recommendations />, withGarden());
    await userEvent.click(await screen.findByRole("checkbox", { name: /aren't a good fit/i }));
    expect(names()).toContain("Pothos");
    expect(screen.getAllByText(/Not suited to outdoor growing/i).length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    renderWithAppData(<Recommendations />, withGarden());
    const categories = within(await screen.findByRole("group", { name: "Category" }));
    await userEvent.click(categories.getByRole("button", { name: /Herbs/ }));
    expect(names()).toEqual(["Basil"]);
    await userEvent.click(categories.getByRole("button", { name: /^All/ }));
    expect(names().length).toBeGreaterThan(1);
  });

  it("explains how plants are scored and offers add-to-garden", async () => {
    renderWithAppData(<Recommendations />, withGarden());
    expect(await screen.findByRole("heading", { name: /how we score/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /add to my garden/i }).length).toBeGreaterThan(0);
  });
});
