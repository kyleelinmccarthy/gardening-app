import { act, renderHook } from "@testing-library/react";
import { createPlantCatalog } from "@/domain/catalog";
import { makeGarden, makePlant, makePlanting, makeTestPlants } from "@/test/fixtures";
import { useCalendarSelection } from "./useCalendarSelection";

const catalog = createPlantCatalog([...makeTestPlants(), makePlant({ id: "fern", name: "Fern", emoji: "🪴" })]);
const growing = (plantId: string) => makePlanting({ id: `p-${plantId}`, plantId, status: "growing" });
const render = (plantIds: string[]) =>
  renderHook(() => useCalendarSelection(makeGarden({ plantings: plantIds.map(growing) }), catalog));

describe("useCalendarSelection", () => {
  it("selects the plants being grown by default", () => {
    const { result } = render(["tomato"]);
    expect(result.current.selectedIds).toEqual(["tomato"]);
    expect(result.current.selectedPlants.map((p) => p.name)).toEqual(["Tomato"]);
    expect(result.current.includeRecommended).toBe(false);
  });

  it("falls back to recommendations when nothing is being grown", () => {
    const { result } = render([]);
    expect(result.current.includeRecommended).toBe(true);
    expect(result.current.selectedIds.length).toBeGreaterThan(0);
  });

  it("applies chip changes as overrides", () => {
    const { result } = render(["tomato"]);
    act(() => result.current.changeSelection(["tomato", "basil"]));
    expect(result.current.selectedIds).toEqual(expect.arrayContaining(["tomato", "basil"]));
    act(() => result.current.changeSelection(["basil"]));
    expect(result.current.selectedIds).not.toContain("tomato");
  });

  it("adds an extra plant to the pool, selected, and removes it from the addable list", () => {
    const { result } = render(["tomato"]);
    const id = result.current.addable[0].value;
    act(() => result.current.addPlant(id));
    expect(result.current.selectedIds).toContain(id);
    expect(result.current.chipOptions.map((o) => o.value)).toContain(id);
    expect(result.current.addable.map((o) => o.value)).not.toContain(id);
  });

  it("ignores an empty plant id", () => {
    const { result } = render(["tomato"]);
    act(() => result.current.addPlant(""));
    expect(result.current.selectedIds).toEqual(["tomato"]);
  });
});
