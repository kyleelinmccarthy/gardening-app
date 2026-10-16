import { screen, within } from "@testing-library/react";
import { createDefaultProfile } from "@/domain/defaults";
import { makeAppData, makeGarden, makePlant } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { PlantDetail } from "./PlantDetail";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("./test-plants")>("./test-plants");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

const section = (name: RegExp | string) => within(screen.getByRole("region", { name }));

describe("PlantDetail", () => {
  it("renders the plant header and growing facts", async () => {
    renderWithAppData(<PlantDetail id="tomato" />);
    expect(await screen.findByRole("heading", { level: 1, name: /Tomato/ })).toBeInTheDocument();
    expect(screen.getByText("Solanum lycopersicum")).toBeInTheDocument();
    const conditions = section(/growing conditions/i);
    expect(conditions.getByText(/Full sun/)).toBeInTheDocument();
    expect(conditions.getByText(/70.*90 days/)).toBeInTheDocument();
    expect(conditions.getByText(/Zones 3.*11/)).toBeInTheDocument();
  });

  it("shows temperatures in the user's unit", async () => {
    const data = makeAppData([makeGarden()], { settings: { temperatureUnit: "C" } });
    renderWithAppData(<PlantDetail id="tomato" />, { data });
    expect(await screen.findByText(/18°C – 29°C/)).toBeInTheDocument();
  });

  it("shows a not-found state for unknown ids", async () => {
    renderWithAppData(<PlantDetail id="nope" />);
    expect(await screen.findByText(/plant not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /plant library/i })).toHaveAttribute("href", "/plants");
  });

  it("finds custom plants and offers editing in settings", async () => {
    const custom = makePlant({ id: "my-fern", name: "My Fern", emoji: "🌿" });
    renderWithAppData(<PlantDetail id="my-fern" />, { data: makeAppData([makeGarden()], { customPlants: [custom] }) });
    expect(await screen.findByRole("heading", { level: 1, name: /My Fern/ })).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit in settings/i })).toHaveAttribute("href", "/settings");
  });

  it("prompts for setup when there is no garden", async () => {
    renderWithAppData(<PlantDetail id="tomato" />);
    const fit = section(/fit for your garden/i);
    expect(await fit.findByRole("link", { name: /set up/i })).toHaveAttribute("href", "/setup");
    expect(screen.getByText(/6 weeks before last spring frost/i)).toBeInTheDocument();
  });

  it("evaluates the fit with reasons and dates the timeline for the garden's climate", async () => {
    renderWithAppData(<PlantDetail id="tomato" />, { data: makeAppData([makeGarden()]) });
    const fit = section(/fit for your garden/i);
    expect(await fit.findByText(/Score/)).toBeInTheDocument();
    expect(fit.getByText(/Thrives in full sun/i)).toBeInTheDocument();
    const timeline = section(/planting timeline/i);
    expect(timeline.getByText("Transplant")).toBeInTheDocument();
    expect(timeline.getByText(/Apr 29 – May 12/)).toBeInTheDocument();
  });

  it("highlights the user's pets and allergies in the safety section", async () => {
    const garden = makeGarden({ profile: createDefaultProfile({ pets: ["cat"], allergies: ["nightshade"] }) });
    renderWithAppData(<PlantDetail id="tomato" />, { data: makeAppData([garden]) });
    const safety = section(/safety/i);
    expect(await safety.findByText("Your pet")).toBeInTheDocument();
    expect(safety.getByText(/Leaves and stems are mildly toxic/)).toBeInTheDocument();
    expect(safety.getByText(/Nightshade family/)).toHaveTextContent(/you're sensitive/i);
  });

  it("marks which tools the user already has and links missing ones to the guides", async () => {
    const garden = makeGarden({ profile: createDefaultProfile({ tools: ["hand-trowel"] }) });
    renderWithAppData(<PlantDetail id="tomato" />, { data: makeAppData([garden]) });
    const tools = section(/tools/i);
    const cage = await tools.findByRole("link", { name: /tomato cage/i });
    expect(cage).toHaveAttribute("href", "/guides#tool-tomato-cage");
    expect(tools.getByText(/hand trowel/i).closest("li")).toHaveTextContent(/you have this/i);
    expect(cage.closest("li")).not.toHaveTextContent(/you have this/i);
  });

  it("links companions, soil, fertilizer and insects", async () => {
    renderWithAppData(<PlantDetail id="tomato" />);
    expect(await screen.findByRole("link", { name: /Basil/ })).toHaveAttribute("href", "/plants/basil");
    expect(screen.getByRole("link", { name: "Loam" })).toHaveAttribute("href", "/guides#soil-loam");
    expect(screen.getByRole("link", { name: "Compost" })).toHaveAttribute("href", "/guides#fertilizer-compost");
    expect(screen.getByRole("link", { name: /Aphids/ })).toHaveAttribute("href", "/guides#insect-aphids");
  });
});
