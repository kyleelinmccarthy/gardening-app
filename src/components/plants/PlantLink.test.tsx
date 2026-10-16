import { screen } from "@testing-library/react";
import { renderWithAppData } from "@/test/render";
import { PlantLink } from "./PlantLink";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("./test-plants")>("./test-plants");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

describe("PlantLink", () => {
  it("renders emoji and name linking to the plant page", async () => {
    renderWithAppData(<PlantLink plantId="tomato" />);
    const link = await screen.findByRole("link", { name: /Tomato/ });
    expect(link).toHaveAttribute("href", "/plants/tomato");
    expect(link).toHaveTextContent("🍅");
  });

  it("falls back to a readable name for unknown plants", () => {
    renderWithAppData(<PlantLink plantId="mystery-plant" />);
    expect(screen.getByRole("link", { name: "mystery plant" })).toHaveAttribute("href", "/plants/mystery-plant");
  });
});
