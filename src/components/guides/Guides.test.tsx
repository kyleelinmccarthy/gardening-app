import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultProfile } from "@/domain/defaults";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { Guides } from "./Guides";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  window.history.replaceState(null, "", "/guides");
});

/** Heading levels in document order, assuming the page supplies an h1 above the guides. */
const headingLevels = () => screen.getAllByRole("heading").map((h) => Number(h.tagName[1]));
const expectNoSkippedLevels = (levels: number[]) =>
  levels.reduce((previous, level) => {
    expect(level).toBeLessThanOrEqual(previous + 1);
    return level;
  }, 1);

describe("Guides", () => {
  it("opens on pests & wildlife with plants affected (reverse lookup)", async () => {
    renderWithAppData(<Guides />);
    expect(screen.getByRole("tab", { name: /pests & wildlife/i })).toHaveAttribute("aria-selected", "true");
    const card = document.getElementById("insect-aphids")!;
    expect(card).toBeInTheDocument();
    const affected = within(card).getByText("Plants affected").parentElement!;
    expect(within(affected).getByRole("link", { name: /Tomato/ })).toHaveAttribute("href", "/plants/tomato");
    expect(within(affected).getByRole("link", { name: /Basil/ })).toBeInTheDocument();
    expect(within(card).getAllByRole("listitem").length).toBeGreaterThan(3);
  });

  it("searches pests", async () => {
    renderWithAppData(<Guides />);
    await userEvent.type(screen.getByRole("searchbox", { name: /search pests/i }), "hornworm");
    expect(document.getElementById("insect-tomato-hornworm")).toBeInTheDocument();
    expect(document.getElementById("insect-aphids")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "zzzzzz");
    expect(screen.getByText(/nothing matches/i)).toBeInTheDocument();
  });

  it("opens the right tab and scrolls to the item for a deep link", async () => {
    window.history.replaceState(null, "", "/guides#insect-honeybees");
    renderWithAppData(<Guides />);
    expect(await screen.findByRole("tab", { name: /beneficials/i, selected: true })).toBeInTheDocument();
    const card = document.getElementById("insect-honeybees")!;
    expect(card).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(card);
    const attractors = within(card).getByText("Plants that attract them").parentElement!;
    expect(within(attractors).getByRole("link", { name: /Basil/ })).toBeInTheDocument();
  });

  it("reacts to hash changes and writes the hash when a tab is chosen", async () => {
    renderWithAppData(<Guides />);
    await userEvent.click(screen.getByRole("tab", { name: /soil/i }));
    expect(window.location.hash).toBe("#soil");
    expect(document.getElementById("soil-clay")).toBeInTheDocument();
    act(() => {
      window.history.replaceState(null, "", "/guides#tool-hand-trowel");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(await screen.findByRole("tab", { name: /tools/i, selected: true })).toBeInTheDocument();
    expect(document.getElementById("tool-hand-trowel")).toBeInTheDocument();
  });

  it("marks the user's soil and tools", async () => {
    const garden = makeGarden({ profile: createDefaultProfile({ soilType: "clay", tools: ["hand-trowel"] }) });
    renderWithAppData(<Guides />, { data: makeAppData([garden]) });
    await userEvent.click(screen.getByRole("tab", { name: /soil/i }));
    expect(await within(document.getElementById("soil-clay")!).findByText("Your soil")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /tools/i }));
    expect(within(document.getElementById("tool-hand-trowel")!).getByText(/you have this/i)).toBeInTheDocument();
    expect(within(document.getElementById("tool-pruners")!).queryByText(/you have this/i)).not.toBeInTheDocument();
  });

  it("shows fertilizer badges and an NPK explainer", async () => {
    renderWithAppData(<Guides />);
    await userEvent.click(screen.getByRole("tab", { name: /fertilizers/i }));
    expect(screen.getByRole("heading", { name: /reading the npk/i })).toBeInTheDocument();
    const compost = within(document.getElementById("fertilizer-compost")!);
    expect(compost.getByText("Organic")).toBeInTheDocument();
    expect(compost.getByText("Pet-safe")).toBeInTheDocument();
  });

  it("looks up companions and antagonists for a plant", async () => {
    renderWithAppData(<Guides />);
    await userEvent.click(screen.getByRole("tab", { name: /companion/i }));
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Plant" }), "tomato");
    const good = screen.getByText("Good companions").parentElement!;
    expect(within(good).getByRole("link", { name: /Basil/ })).toBeInTheDocument();
    const bad = screen.getByText("Keep apart").parentElement!;
    expect(within(bad).getByRole("link", { name: /Lily/ })).toBeInTheDocument();
  });

  it("highlights the user's zone and shows temperatures in their unit", async () => {
    const data = makeAppData([makeGarden()], { settings: { temperatureUnit: "C" } });
    renderWithAppData(<Guides />, { data });
    await userEvent.click(screen.getByRole("tab", { name: /climate zones/i }));
    const row = (await screen.findByText("Your zone")).closest("tr")!;
    expect(row).toHaveAttribute("aria-current", "true");
    expect(row).toHaveTextContent("-18°C to -12°C");
    expect(row).toHaveTextContent("Apr 15");
  });

  it("gives every tab panel an h2 so cards never skip a heading level", async () => {
    renderWithAppData(<Guides />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(7);
    for (const tab of tabs) {
      await userEvent.click(tab);
      const panel = within(screen.getByRole("tabpanel"));
      expect(panel.getAllByRole("heading", { level: 2 })).toHaveLength(1);
      expect(panel.getAllByRole("heading", { level: 3 }).length).toBeGreaterThan(0);
      expectNoSkippedLevels(headingLevels());
    }
  });

  it("nests tool cards under their category heading", async () => {
    renderWithAppData(<Guides />);
    await userEvent.click(screen.getByRole("tab", { name: /tools/i }));
    const card = document.getElementById("tool-hand-trowel")!;
    expect(within(card).getByRole("heading", { level: 4, name: /hand trowel/i })).toBeInTheDocument();
  });
});
