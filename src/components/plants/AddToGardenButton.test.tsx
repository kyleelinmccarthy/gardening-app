import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultProfile } from "@/domain/defaults";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { AddToGardenButton } from "./AddToGardenButton";

vi.mock("@/data/plants", async () => {
  const { makeTestPlants } = await vi.importActual<typeof import("./test-plants")>("./test-plants");
  return { BUILTIN_PLANTS: makeTestPlants() };
});

describe("AddToGardenButton", () => {
  it("is disabled with a hint when there is no garden", async () => {
    renderWithAppData(<AddToGardenButton plantId="tomato" />);
    const button = await screen.findByRole("button", { name: /add to my garden/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/set up a garden first/i)).toBeInTheDocument();
  });

  it("adds a planned planting dated today and then shows it is in the garden", async () => {
    const { getData } = renderWithAppData(<AddToGardenButton plantId="tomato" />, {
      data: makeAppData([makeGarden()]),
    });
    await userEvent.click(await screen.findByRole("button", { name: /add to my garden/i }));
    expect(await screen.findByText(/in your garden/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add to my garden/i })).not.toBeInTheDocument();
    await waitFor(() => expect(getData().gardens[0].plantings).toHaveLength(1));
    const planting = getData().gardens[0].plantings[0];
    expect(planting).toMatchObject({ plantId: "tomato", status: "planned", quantity: 1, inContainer: false });
    expect(planting.plantedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("marks the planting as container-grown for container-only or indoor gardens", async () => {
    const indoor = makeGarden({ profile: createDefaultProfile({ setting: "indoor" }) });
    const { getData } = renderWithAppData(<AddToGardenButton plantId="basil" />, { data: makeAppData([indoor]) });
    await userEvent.click(await screen.findByRole("button", { name: /add to my garden/i }));
    await waitFor(() => expect(getData().gardens[0].plantings[0]?.inContainer).toBe(true));
  });

  it("shows the added state when a growing planting already exists", async () => {
    const garden = makeGarden({
      plantings: [
        { id: "p1", plantId: "tomato", quantity: 2, plantedOn: "2026-04-20", status: "growing", inContainer: false },
      ],
    });
    renderWithAppData(<AddToGardenButton plantId="tomato" />, { data: makeAppData([garden]) });
    expect(await screen.findByText(/in your garden/i)).toBeInTheDocument();
  });

  it("still offers adding when the only planting was removed", async () => {
    const garden = makeGarden({
      plantings: [{ id: "p1", plantId: "tomato", quantity: 1, plantedOn: "2026-04-20", status: "removed", inContainer: false }],
    });
    renderWithAppData(<AddToGardenButton plantId="tomato" />, { data: makeAppData([garden]) });
    expect(await screen.findByRole("button", { name: /add to my garden/i })).toBeEnabled();
  });
});
