import { render, screen } from "@testing-library/react";
import { makeGarden } from "@/test/fixtures";
import { GardenGate } from "./GardenGate";

type AppDataStub = { hydrated: boolean; activeGarden: ReturnType<typeof makeGarden> | null };
let appData: AppDataStub;

vi.mock("@/state/AppDataProvider", () => ({ useAppData: () => appData }));

describe("GardenGate", () => {
  it("shows a loading status until saved data has hydrated", () => {
    appData = { hydrated: false, activeGarden: makeGarden() };
    const body = vi.fn(() => <p>Body</p>);
    render(<GardenGate>{body}</GardenGate>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    expect(body).not.toHaveBeenCalled();
  });

  it("prompts to set up a garden when none is active", () => {
    appData = { hydrated: true, activeGarden: null };
    const body = vi.fn(() => <p>Body</p>);
    render(<GardenGate>{body}</GardenGate>);
    expect(screen.getByText("Set up your garden first")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Set up my garden" })).toHaveAttribute("href", "/setup");
    expect(body).not.toHaveBeenCalled();
  });

  it("renders the body with the active garden once ready", () => {
    const garden = makeGarden({ name: "Roof" });
    appData = { hydrated: true, activeGarden: garden };
    render(<GardenGate>{(g) => <p>Garden: {g.name}</p>}</GardenGate>);
    expect(screen.getByText("Garden: Roof")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
