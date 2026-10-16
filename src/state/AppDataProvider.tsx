"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { BUILTIN_PLANTS } from "@/data/plants";
import { createPlantCatalog } from "@/domain/catalog";
import type { AppData, Garden, PlantCatalog } from "@/domain/types";
import { createLocalRepository, type AppDataRepository } from "@/storage/repository";
import { createEmptyAppData } from "@/storage/schema";
import { createMemoryStorage, getBrowserStorage } from "@/storage/storage";
import { appReducer, type AppAction } from "./appReducer";

export interface AppDataContextValue {
  data: AppData;
  dispatch: Dispatch<AppAction>;
  /** False until saved data has been read after mount (SSR renders empty data). */
  hydrated: boolean;
  activeGarden: Garden | null;
  catalog: PlantCatalog;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function createDefaultRepository(): AppDataRepository {
  return createLocalRepository(getBrowserStorage() ?? createMemoryStorage());
}

/** Internal action: first load from storage; flips `hydrated` in the same update as the data. */
const HYDRATE = "@@hydrate";
type ProviderAction = AppAction | { type: typeof HYDRATE; data: AppData };
interface ProviderState {
  data: AppData;
  hydrated: boolean;
}

const initialProviderState = (): ProviderState => ({ data: createEmptyAppData(), hydrated: false });

function providerReducer(state: ProviderState, action: ProviderAction): ProviderState {
  if (action.type === HYDRATE) return { data: action.data, hydrated: true };
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
  // Lazily created once; the default touches localStorage only via load/save in effects.
  const [defaultRepository] = useState(() => (repository ? null : createDefaultRepository()));
  const repo = repository ?? defaultRepository!;

  const [{ data, hydrated }, dispatch] = useReducer(providerReducer, undefined, initialProviderState);
  /** The last object known to match storage; avoids echoing loaded data back. */
  const persisted = useRef<AppData | null>(null);

  // Hydrate after mount so server and first client render agree.
  useEffect(() => {
    const loaded = repo.load();
    persisted.current = loaded;
    dispatch({ type: HYDRATE, data: loaded });
  }, [repo]);

  // Persist every change once hydrated.
  useEffect(() => {
    if (!hydrated || persisted.current === data) return;
    persisted.current = data;
    repo.save(data);
  }, [data, hydrated, repo]);

  // Cross-tab sync: another tab wrote to storage, so reload.
  useEffect(() => {
    if (!hydrated) return;
    const onStorage = () => {
      const loaded = repo.load();
      persisted.current = loaded;
      dispatch({ type: "data/replace", data: loaded });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated, repo]);

  const catalog = useMemo(() => createPlantCatalog(BUILTIN_PLANTS, data.customPlants), [data.customPlants]);

  const activeGarden = useMemo(
    () => data.gardens.find((g) => g.id === data.activeGardenId) ?? null,
    [data.gardens, data.activeGardenId],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({ data, dispatch, hydrated, activeGarden, catalog }),
    [data, hydrated, activeGarden, catalog],
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
