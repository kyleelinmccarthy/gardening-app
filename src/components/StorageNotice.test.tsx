import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppDataProvider } from "@/state/AppDataProvider";
import { createLocalRepository, createUnavailableRepository, type AppDataRepository } from "@/storage/repository";
import { createMemoryStorage } from "@/storage/storage";
import { makeAppData } from "@/test/fixtures";
import { StorageNotice } from "./StorageNotice";

const renderWith = (repository: AppDataRepository) =>
  render(
    <AppDataProvider repository={repository}>
      <StorageNotice />
    </AppDataProvider>,
  );

describe("StorageNotice", () => {
  it("renders nothing for empty or readable storage", () => {
    renderWith(createLocalRepository(createMemoryStorage()));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing when saved data is fine", () => {
    const repo = createLocalRepository(createMemoryStorage());
    repo.save(makeAppData());
    renderWith(repo);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("warns and names the backup key when saved data is corrupt", () => {
    const storage = createMemoryStorage();
    storage.setItem("garden-planner:v1", "{broken");
    renderWith(createLocalRepository(storage));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/couldn't read your saved garden data/i);
    expect(alert).toHaveTextContent("garden-planner:v1:corrupt-backup:");
  });

  it("warns that changes won't be saved when storage is unavailable", () => {
    renderWith(createUnavailableRepository());
    expect(screen.getByRole("alert")).toHaveTextContent(/blocking local storage.*won't be saved/i);
  });
});
