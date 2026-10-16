"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { BUILTIN_PLANTS } from "@/data/plants";
import { createPlantCatalog } from "@/domain/catalog";
import type { AppData, Garden, PlantCatalog } from "@/domain/types";
import {
  createLocalRepository,
  createUnavailableRepository,
  type AppDataRepository,
  type StorageStatus,
} from "@/storage/repository";
import { createEmptyAppData } from "@/storage/schema";
import { getBrowserStorage } from "@/storage/storage";
import { appReducer, type AppAction } from "./appReducer";

export interface AppDataContextValue {
  data: AppData;
  dispatch: Dispatch<AppAction>;
  /** False until saved data has been read after mount (SSR renders empty data). */
  hydrated: boolean;
  /**
   * What the last read of storage found. "corrupt": saved data was unreadable (a backup was kept);
   * "unavailable": the browser blocks storage, so nothing is saved. Meaningful once `hydrated`.
   */
  storageStatus: StorageStatus;
  activeGarden: Garden | null;
  catalog: PlantCatalog;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function createDefaultRepository(): AppDataRepository {
  const storage = getBrowserStorage();
  return storage ? createLocalRepository(storage) : createUnavailableRepository();
}

/** Internal action: (re)load from storage; flips `hydrated` in the same update as the data. */
const LOAD = "@@load";
type ProviderAction = AppAction | { type: typeof LOAD; data: AppData; status: StorageStatus };
interface ProviderState {
  data: AppData;
  hydrated: boolean;
  storageStatus: StorageStatus;
}

const initialProviderState = (): ProviderState => ({
  data: createEmptyAppData(),
  hydrated: false,
  storageStatus: "empty",
});

function providerReducer(state: ProviderState, action: ProviderAction): ProviderState {
  if (action.type === LOAD) return { data: action.data, hydrated: true, storageStatus: action.status };
  const data = appReducer(state.data, action);
  return data === state.data ? state : { ...state, data };
}

export function AppDataProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: AppDataRepository;
}) {
  const [{ data, hydrated, storageStatus }, dispatch] = useReducer(providerReducer, undefined, initialProviderState);
  /** The repository in use; the default one is created after mount so render never touches storage (SSR-safe). */
  const repoRef = useRef<AppDataRepository | null>(null);
  /** The last object known to match storage; avoids echoing loaded data back. */
  const persisted = useRef<AppData | null>(null);

  // Hydrate after mount so server and first client render agree.
  useEffect(() => {
    const repo = repository ?? createDefaultRepository();
    repoRef.current = repo;
    const loaded = repo.loadWithStatus();
    persisted.current = loaded.data;
    dispatch({ type: LOAD, data: loaded.data, status: loaded.status });
  }, [repository]);

  // Persist every change once hydrated, unless storage could not even be read
  // (writes would fail, or clobber data we never saw).
  useEffect(() => {
    if (!hydrated || storageStatus === "unavailable" || persisted.current === data) return;
    persisted.current = data;
    repoRef.current?.save(data);
  }, [data, hydrated, storageStatus]);

  // Cross-tab sync: another tab wrote to our key (or cleared storage), so reload.
  useEffect(() => {
    if (!hydrated) return;
    const onStorage = (e: StorageEvent) => {
      const repo = repoRef.current;
      if (!repo) return;
      if (e.key !== null && repo.storageKey !== undefined && e.key !== repo.storageKey) return;
      const loaded = repo.loadWithStatus();
      persisted.current = loaded.data;
      dispatch({ type: LOAD, data: loaded.data, status: loaded.status });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated]);

  const catalog = useMemo(() => createPlantCatalog(BUILTIN_PLANTS, data.customPlants), [data.customPlants]);

  const activeGarden = useMemo(
    () => data.gardens.find((g) => g.id === data.activeGardenId) ?? null,
    [data.gardens, data.activeGardenId],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({ data, dispatch, hydrated, storageStatus, activeGarden, catalog }),
    [data, hydrated, storageStatus, activeGarden, catalog],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an <AppDataProvider> (add it to the root layout).");
  return ctx;
}

export function useActiveGarden(): Garden | null {
  return useAppData().activeGarden;
}

export function useCatalog(): PlantCatalog {
  return useAppData().catalog;
}
