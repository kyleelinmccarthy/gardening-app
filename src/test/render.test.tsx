import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/plants", () => ({ BUILTIN_PLANTS: [] }));
import { screen } from "@testing-library/react";
import { useAppData } from "@/state/AppDataProvider";
import { makeAppData } from "./fixtures";
import { renderWithAppData } from "./render";

function GardenName() {
  const { activeGarden, hydrated } = useAppData();
  return <p>{hydrated ? activeGarden?.name ?? "none" : "loading"}</p>;
}

describe("renderWithAppData", () => {
  it("hydrates the provider with the given data", async () => {
    const data = makeAppData();
    renderWithAppData(<GardenName />, { data });
    expect(await screen.findByText(data.gardens[0].name)).toBeInTheDocument();
  });
});
