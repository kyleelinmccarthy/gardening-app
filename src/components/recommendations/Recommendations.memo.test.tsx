import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultProfile } from "@/domain/defaults";
import * as recommendation from "@/domain/recommendation";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { Recommendations } from "./Recommendations";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

vi.mock("@/domain/recommendation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/domain/recommendation")>();
  return { ...actual, recommendPlants: vi.fn(actual.recommendPlants) };
});

const evaluations = () => vi.mocked(recommendation.recommendPlants).mock.calls.length;

describe("Recommendations performance", () => {
  it("ranks the catalog once per garden, not when the filters change", async () => {
    const data = makeAppData([makeGarden({ profile: createDefaultProfile() })]);
    renderWithAppData(<Recommendations />, { data });
    await screen.findByRole("heading", { name: /how we score/i });
    const scored = evaluations();
    expect(scored).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("checkbox", { name: /aren't a good fit/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /aren't a good fit/i }));
    await userEvent.click(screen.getByRole("button", { name: /Herbs/ }));
    expect(evaluations()).toBe(scored);
  });
});
