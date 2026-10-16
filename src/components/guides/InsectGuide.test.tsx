import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithAppData } from "@/test/render";
import * as lookups from "./guideLookups";
import { InsectGuide } from "./InsectGuide";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

vi.mock("./guideLookups", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./guideLookups")>();
  return { ...actual, indexPlantsByInsect: vi.fn(actual.indexPlantsByInsect) };
});

beforeEach(() => {
  vi.mocked(lookups.indexPlantsByInsect).mockClear();
});

describe("InsectGuide", () => {
  it("lists affected and repelling plants for a pest", async () => {
    renderWithAppData(<InsectGuide group="pests" />);
    await screen.findByRole("searchbox");
    const card = document.getElementById("insect-aphids")!;
    const affected = within(card).getByText("Plants affected").parentElement!;
    expect(within(affected).getByRole("link", { name: /Basil/ })).toBeInTheDocument();
    const repelling = within(document.getElementById("insect-whiteflies")!).getByText("Plants that help deter it").parentElement!;
    expect(within(repelling).getByRole("link", { name: /Basil/ })).toBeInTheDocument();
  });

  it("builds the plant index once per catalog, not on every search keystroke", async () => {
    renderWithAppData(<InsectGuide group="pests" />);
    const search = await screen.findByRole("searchbox");
    const builtBeforeTyping = vi.mocked(lookups.indexPlantsByInsect).mock.calls.length;
    expect(builtBeforeTyping).toBeGreaterThan(0);
    await userEvent.type(search, "hornworm");
    expect(document.getElementById("insect-tomato-hornworm")).toBeInTheDocument();
    expect(lookups.indexPlantsByInsect).toHaveBeenCalledTimes(builtBeforeTyping);
  });
});
