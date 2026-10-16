import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createLocalRepository } from "@/storage/repository";
import { createEmptyAppData } from "@/storage/schema";
import { createMemoryStorage } from "@/storage/storage";
import { makeAppData, makeGarden, makePlant } from "@/test/fixtures";
import { AppDataProvider, useActiveGarden, useAppData, useCatalog } from "./AppDataProvider";

vi.mock("@/data/plants", () => ({ BUILTIN_PLANTS: [] }));

function setup(initial = createEmptyAppData()) {
  const storage = createMemoryStorage();
  const repository = createLocalRepository(storage);
  repository.save(initial);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDataProvider repository={repository}>{children}</AppDataProvider>
  );
  return { storage, repository, wrapper };
}

describe("AppDataProvider", () => {
  it("hydrates from the repository after mount", () => {
    const stored = makeAppData([makeGarden({ name: "Stored" })]);
    const { wrapper } = setup(stored);
    const { result } = renderHook(() => useAppData(), { wrapper });
    // effects are flushed by renderHook's act()
    expect(result.current.hydrated).toBe(true);
    expect(result.current.data).toEqual(stored);
    expect(result.current.activeGarden?.name).toBe("Stored");
  });

  it("renders empty, un-hydrated data on the very first render (no SSR mismatch)", () => {
    const stored = makeAppData([makeGarden({ name: "Stored" })]);
    const { wrapper } = setup(stored);
    const seen: Array<{ hydrated: boolean; gardens: number }> = [];
    renderHook(
      () => {
        const { hydrated, data } = useAppData();
        seen.push({ hydrated, gardens: data.gardens.length });
      },
      { wrapper },
    );
    expect(seen[0]).toEqual({ hydrated: false, gardens: 0 });
    expect(seen.at(-1)).toEqual({ hydrated: true, gardens: 1 });
  });

  it("starts with empty data when the repository is empty", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.data).toEqual(createEmptyAppData());
    expect(result.current.activeGarden).toBeNull();
  });

  it("persists after a dispatch", () => {
    const { wrapper, repository } = setup();
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => result.current.dispatch({ type: "garden/create", garden: makeGarden({ id: "g9", name: "Fresh" }) }));
    expect(result.current.activeGarden?.id).toBe("g9");
    expect(repository.load().gardens.map((g) => g.name)).toEqual(["Fresh"]);
  });

  it("does not overwrite stored data before hydration completes", () => {
    const stored = makeAppData([makeGarden({ name: "Keep me" })]);
    const { wrapper, repository } = setup(stored);
    const save = vi.spyOn(repository, "save");
    renderHook(() => useAppData(), { wrapper });
    expect(repository.load()).toEqual(stored);
    // hydrated data is not redundantly re-saved
    expect(save).not.toHaveBeenCalled();
  });

  it("provides a catalog of built-in plus custom plants", () => {
    const { wrapper } = setup(makeAppData([makeGarden()], { customPlants: [makePlant({ id: "mine", name: "Mine" })] }));
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.catalog.get("mine")?.custom).toBe(true);
    expect(result.current.catalog.all()).toHaveLength(1);
  });

  it("updates the catalog when custom plants change", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.catalog.all()).toHaveLength(0);
    act(() => result.current.dispatch({ type: "customPlant/upsert", plant: makePlant({ id: "p1" }) }));
    expect(result.current.catalog.get("p1")).toBeDefined();
  });

  it("keeps a stable catalog when unrelated data changes", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAppData(), { wrapper });
    const before = result.current.catalog;
    act(() => result.current.dispatch({ type: "settings/update", changes: { temperatureUnit: "C" } }));
    expect(result.current.catalog).toBe(before);
  });

  it("reloads when another tab changes storage", () => {
    const { wrapper, repository } = setup();
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.data.gardens).toHaveLength(0);

    repository.save(makeAppData([makeGarden({ name: "From other tab" })]));
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "garden-planner:v1" }));
    });
    expect(result.current.activeGarden?.name).toBe("From other tab");
  });

  it("does not echo reloaded data back to storage", () => {
    const { wrapper, repository } = setup();
    renderHook(() => useAppData(), { wrapper });
    repository.save(makeAppData([makeGarden()]));
    const save = vi.spyOn(repository, "save");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "garden-planner:v1" }));
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("stops listening for storage events after unmount", () => {
    const { wrapper, repository } = setup();
    const { unmount } = renderHook(() => useAppData(), { wrapper });
    const load = vi.spyOn(repository, "load");
    unmount();
    window.dispatchEvent(new StorageEvent("storage", { key: "garden-planner:v1" }));
    expect(load).not.toHaveBeenCalled();
  });

  it("falls back to a default repository when none is provided", () => {
    const { result } = renderHook(() => useAppData(), {
      wrapper: ({ children }: { children: ReactNode }) => <AppDataProvider>{children}</AppDataProvider>,
    });
    expect(result.current.hydrated).toBe(true);
    act(() => result.current.dispatch({ type: "garden/create", garden: makeGarden({ name: "Default repo" }) }));
    expect(window.localStorage.getItem("garden-planner:v1")).toContain("Default repo");
  });

  it("renders its children", () => {
    const { wrapper } = setup();
    render(<div>hello</div>, { wrapper });
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});

describe("convenience hooks", () => {
  it("useActiveGarden returns the active garden", () => {
    const { wrapper } = setup(makeAppData([makeGarden({ name: "Active" })]));
    const { result } = renderHook(() => useActiveGarden(), { wrapper });
    expect(result.current?.name).toBe("Active");
  });

  it("useCatalog returns the catalog", () => {
    const { wrapper } = setup(makeAppData([makeGarden()], { customPlants: [makePlant({ id: "c" })] }));
    const { result } = renderHook(() => useCatalog(), { wrapper });
    expect(result.current.get("c")).toBeDefined();
  });
});

describe("outside the provider", () => {
  it.each([
    ["useAppData", useAppData],
    ["useActiveGarden", useActiveGarden],
    ["useCatalog", useCatalog],
  ] as const)("%s throws a helpful error", (name, hook) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => hook())).toThrow(/AppDataProvider/);
    expect(name).toBeTruthy();
    spy.mockRestore();
  });
});
