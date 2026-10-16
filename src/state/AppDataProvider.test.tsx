import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createLocalRepository, type AppDataRepository } from "@/storage/repository";
import { createEmptyAppData } from "@/storage/schema";
import { createMemoryStorage, type KeyValueStorage } from "@/storage/storage";
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

  it("ignores storage events for unrelated keys", () => {
    const { wrapper, repository } = setup();
    renderHook(() => useAppData(), { wrapper });
    const load = vi.spyOn(repository, "loadWithStatus");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "some-other-app" }));
    });
    expect(load).not.toHaveBeenCalled();
  });

  it("reloads when storage is cleared (event key is null)", () => {
    const { wrapper, repository } = setup();
    const { result } = renderHook(() => useAppData(), { wrapper });
    repository.save(makeAppData([makeGarden({ name: "After clear" })]));
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: null }));
    });
    expect(result.current.activeGarden?.name).toBe("After clear");
  });

  it("does not touch storage while rendering (server render is side-effect free)", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const html = renderToString(
      <AppDataProvider>
        <p>ssr</p>
      </AppDataProvider>,
    );
    expect(html).toContain("ssr");
    expect(setItem).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
    setItem.mockRestore();
    getItem.mockRestore();
  });

  it("renders its children", () => {
    const { wrapper } = setup();
    render(<div>hello</div>, { wrapper });
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});

describe("storageStatus", () => {
  const providerFor = (repository: AppDataRepository) =>
    function Wrapper({ children }: { children: ReactNode }) {
      return <AppDataProvider repository={repository}>{children}</AppDataProvider>;
    };

  it("is ok for readable saved data and empty for a fresh browser", () => {
    const { wrapper } = setup(makeAppData([makeGarden()]));
    expect(renderHook(() => useAppData(), { wrapper }).result.current.storageStatus).toBe("ok");

    const fresh = providerFor(createLocalRepository(createMemoryStorage()));
    expect(renderHook(() => useAppData(), { wrapper: fresh }).result.current.storageStatus).toBe("empty");
  });

  it("is corrupt for unreadable data, and the first edit still saves (a backup was kept)", () => {
    const storage = createMemoryStorage();
    storage.setItem("garden-planner:v1", "{bad");
    const repository = createLocalRepository(storage);
    const { result } = renderHook(() => useAppData(), { wrapper: providerFor(repository) });
    expect(result.current.storageStatus).toBe("corrupt");
    act(() => result.current.dispatch({ type: "garden/create", garden: makeGarden({ name: "New" }) }));
    expect(repository.load().gardens[0].name).toBe("New");
    const keys = Array.from({ length: storage.length! }, (_, i) => storage.key!(i)!);
    expect(keys.some((k) => k.startsWith("garden-planner:v1:corrupt-backup:"))).toBe(true);
  });

  it("is unavailable when reading throws, and nothing is saved", () => {
    const setItem = vi.fn();
    const storage: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem,
      removeItem: () => {},
    };
    const { result } = renderHook(() => useAppData(), { wrapper: providerFor(createLocalRepository(storage)) });
    expect(result.current.storageStatus).toBe("unavailable");
    act(() => result.current.dispatch({ type: "garden/create", garden: makeGarden() }));
    expect(result.current.data.gardens).toHaveLength(1);
    expect(setItem).not.toHaveBeenCalled();
  });

  it("is unavailable with the default repository when the browser has no usable storage", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useAppData(), {
      wrapper: ({ children }: { children: ReactNode }) => <AppDataProvider>{children}</AppDataProvider>,
    });
    expect(result.current.storageStatus).toBe("unavailable");
    spy.mockRestore();
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
