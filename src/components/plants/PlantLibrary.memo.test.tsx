import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultProfile } from "@/domain/defaults";
import * as recommendation from "@/domain/recommendation";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { PlantLibrary } from "./PlantLibrary";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

vi.mock("@/domain/recommendation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/domain/recommendation")>();
  return { ...actual, evaluatePlant: vi.fn(actual.evaluatePlant) };
});

const evaluations = () => vi.mocked(recommendation.evaluatePlant).mock.calls.length;

describe("PlantLibrary performance", () => {
  it("scores plants for the match sort once, not on every search keystroke or filter change", async () => {
    const data = makeAppData([makeGarden({ profile: createDefaultProfile() })]);
    renderWithAppData(<PlantLibrary />, { data });
    await userEvent.selectOptions(await screen.findByRole("combobox", { name: /sort/i }), "match");
    const scored = evaluations();
    expect(scored).toBeGreaterThan(0);

    await userEvent.type(screen.getByRole("searchbox", { name: /search plants/i }), "bas");
    await userEvent.click(screen.getByRole("checkbox", { name: /edible only/i }));
    expect(evaluations()).toBe(scored);
  });

  it("does not score anything while sorting by name", async () => {
    const data = makeAppData([makeGarden({ profile: createDefaultProfile() })]);
    renderWithAppData(<PlantLibrary />, { data });
    await userEvent.type(await screen.findByRole("searchbox", { name: /search plants/i }), "bas");
    expect(evaluations()).toBe(0);
  });
});
