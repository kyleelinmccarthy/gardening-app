/** Test-only helper: render UI inside an AppDataProvider backed by in-memory storage. */
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import type { AppData } from "@/domain/types";
import { AppDataProvider } from "@/state/AppDataProvider";
import { createLocalRepository } from "@/storage/repository";
import { createEmptyAppData } from "@/storage/schema";
import { createMemoryStorage } from "@/storage/storage";

export interface RenderWithAppDataOptions extends Omit<RenderOptions, "wrapper"> {
  /** Initial saved data (defaults to empty app data). */
  data?: AppData;
}

export function renderWithAppData(ui: ReactElement, { data, ...options }: RenderWithAppDataOptions = {}) {
  const repository = createLocalRepository(createMemoryStorage());
  repository.save(data ?? createEmptyAppData());
  const result = render(<AppDataProvider repository={repository}>{ui}</AppDataProvider>, options);
  return {
    ...result,
    repository,
    /** Latest persisted data (the provider saves after each change). */
    getData: () => repository.load(),
  };
}
