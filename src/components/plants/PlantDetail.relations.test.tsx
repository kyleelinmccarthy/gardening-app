import { screen, within } from "@testing-library/react";
import { makeAppData, makeGarden, makePlant } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { PlantDetail } from "./PlantDetail";

// Relations are declared one-way in the source data: only "walnut" lists "tomato" as an antagonist,
// and only "basil" lists "tomato" as a companion. The catalog mirrors both so each page shows them.
vi.mock("@/data/plants", async () => {
  const { makePlant } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return {
    BUILTIN_PLANTS: [
      makePlant({ id: "tomato", name: "Tomato" }),
      makePlant({ id: "walnut", name: "Walnut", antagonists: ["tomato"] }),
      makePlant({ id: "basil", name: "Basil", companions: ["tomato"] }),
    ],
  };
});

const companions = () => within(screen.getByRole("region", { name: "Companions" }));

describe("PlantDetail companions", () => {
  it("shows an antagonist declared only by the other plant", async () => {
    renderWithAppData(<PlantDetail id="tomato" />);
    expect(await screen.findByRole("heading", { level: 1, name: /Tomato/ })).toBeInTheDocument();
    const apart = companions().getByText("Keep apart").parentElement!;
    expect(within(apart).getByRole("link", { name: /Walnut/ })).toHaveAttribute("href", "/plants/walnut");
  });

  it("shows the same pair from the declaring plant's page", async () => {
    renderWithAppData(<PlantDetail id="walnut" />);
    await screen.findByRole("heading", { level: 1, name: /Walnut/ });
    const apart = companions().getByText("Keep apart").parentElement!;
    expect(within(apart).getByRole("link", { name: /Tomato/ })).toBeInTheDocument();
  });

  it("shows a companion declared only by the other plant", async () => {
    renderWithAppData(<PlantDetail id="tomato" />);
    await screen.findByRole("heading", { level: 1, name: /Tomato/ });
    const good = companions().getByText("Good neighbours").parentElement!;
    expect(within(good).getByRole("link", { name: /Basil/ })).toBeInTheDocument();
  });

  it("ignores relations to plants that are not in the catalog", async () => {
    const fern = makePlant({ id: "my-fern", name: "My Fern", companions: ["deleted-plant"] });
    renderWithAppData(<PlantDetail id="my-fern" />, { data: makeAppData([makeGarden()], { customPlants: [fern] }) });
    await screen.findByRole("heading", { level: 1, name: /My Fern/ });
    expect(companions().getByText("No particular companions noted.")).toBeInTheDocument();
  });
});
