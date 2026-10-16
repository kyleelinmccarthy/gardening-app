import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Plant } from "@/domain/types";
import { makePlant } from "@/test/fixtures";
import { CustomPlantForm } from "./CustomPlantForm";

const catalogPlants = [
  { id: "basil", name: "Basil" },
  { id: "fennel", name: "Fennel" },
  { id: "tomato", name: "Tomato" },
];

function setup(props: Partial<React.ComponentProps<typeof CustomPlantForm>> = {}) {
  const onSave = vi.fn<(plant: Plant) => void>();
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(<CustomPlantForm unit="F" catalogPlants={catalogPlants} onSave={onSave} onCancel={onCancel} {...props} />);
  return { user, onSave, onCancel };
}

describe("CustomPlantForm", () => {
  it("groups fields into labelled fieldsets", () => {
    setup();
    for (const name of [
      "Basics",
      "Light & water",
      "Climate",
      "Soil & feeding",
      "Size & timing",
      "Containers",
      "Companions",
      "Insects",
      "Safety",
      "Tools",
      "Goals & tips",
    ]) {
      expect(screen.getByRole("group", { name })).toBeInTheDocument();
    }
  });

  it("blocks saving without a name and shows an error summary", async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole("button", { name: "Add plant" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Please fix 1 problem/)).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInvalid();
    await user.type(screen.getByLabelText("Name"), "Purple Basil");
    expect(screen.queryByText(/Please fix/)).not.toBeInTheDocument();
  });

  it("creates a plant with a generated custom id from the entered values", async () => {
    const { user, onSave } = setup();
    await user.type(screen.getByLabelText("Name"), "Purple Basil");
    await user.type(screen.getByLabelText("Scientific name"), "Ocimum basilicum");
    await user.selectOptions(screen.getByLabelText("Category"), "herb");
    await user.click(screen.getByRole("checkbox", { name: "Edible" }));
    await user.selectOptions(screen.getByLabelText("Toxicity to cats"), "mild");
    await user.type(screen.getByLabelText("Care tips"), "Pinch flowers{Enter}Water at the base");
    await user.click(screen.getByRole("button", { name: "Add plant" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const plant = onSave.mock.calls[0][0];
    expect(plant.id).toMatch(/^custom-purple-basil-[a-z0-9]{6}$/);
    expect(plant).toMatchObject({
      name: "Purple Basil",
      scientificName: "Ocimum basilicum",
      category: "herb",
      edible: true,
      custom: true,
      careTips: ["Pinch flowers", "Water at the base"],
    });
    expect(plant.toxicity.cat).toBe("mild");
    expect(plant.toxicity.dog).toBe("non-toxic");
  });

  it("reveals indoor light choices only for indoor plants", async () => {
    const { user } = setup();
    expect(screen.queryByRole("group", { name: "Indoor light levels" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Indoor" }));
    expect(screen.getByRole("group", { name: "Indoor light levels" })).toBeInTheDocument();
  });

  it("enters temperatures in the user's unit and stores °F", async () => {
    const { user, onSave } = setup({ unit: "C" });
    await user.type(screen.getByLabelText("Name"), "Frosty");
    const min = screen.getByLabelText("Minimum survivable (°C)");
    expect(min).toHaveValue(0);
    await user.clear(min);
    await user.type(min, "-5");
    await user.click(screen.getByRole("button", { name: "Add plant" }));
    expect(onSave.mock.calls[0][0].temperature).toEqual({ minF: 23, idealMinF: 60, idealMaxF: 80, maxF: 95 });
  });

  it("blocks saving while a temperature field is cleared", async () => {
    const { user, onSave } = setup();
    await user.type(screen.getByLabelText("Name"), "X");
    const max = screen.getByLabelText("Heat stress above (°F)");
    await user.clear(max);
    expect(max).toHaveValue(null);
    await user.click(screen.getByRole("button", { name: "Add plant" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Enter all four temperatures/)).toBeInTheDocument();
  });

  it("reports out-of-order temperatures", async () => {
    const { user, onSave } = setup();
    await user.type(screen.getByLabelText("Name"), "X");
    const min = screen.getByLabelText("Minimum survivable (°F)");
    await user.clear(min);
    await user.type(min, "70");
    await user.click(screen.getByRole("button", { name: "Add plant" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Temperatures must increase/)).toBeInTheDocument();
  });

  it("selects companions from the catalog with a filter", async () => {
    const { user, onSave } = setup();
    await user.type(screen.getByLabelText("Name"), "Marigold");
    const companions = screen.getByRole("group", { name: "Companion plants" });
    expect(within(companions).getByText("None selected")).toBeInTheDocument();
    await user.click(within(companions).getByRole("button", { name: "Choose Companion plants" }));
    await user.type(within(companions).getByLabelText("Filter Companion plants"), "bas");
    expect(within(companions).queryByRole("checkbox", { name: "Tomato" })).not.toBeInTheDocument();
    await user.click(within(companions).getByRole("checkbox", { name: "Basil" }));
    expect(within(companions).getByText("Basil", { selector: "p" })).toBeInTheDocument();

    const antagonists = screen.getByRole("group", { name: "Antagonist plants" });
    await user.click(within(antagonists).getByRole("button", { name: "Choose Antagonist plants" }));
    await user.click(within(antagonists).getByRole("checkbox", { name: "Fennel" }));
    await user.click(screen.getByRole("button", { name: "Add plant" }));
    expect(onSave.mock.calls[0][0]).toMatchObject({ companions: ["basil"], antagonists: ["fennel"] });
  });

  it("rejects a plant listed as both companion and antagonist", async () => {
    const { user, onSave } = setup();
    await user.type(screen.getByLabelText("Name"), "Marigold");
    for (const label of ["Companion plants", "Antagonist plants"]) {
      const group = screen.getByRole("group", { name: label });
      await user.click(within(group).getByRole("button", { name: `Choose ${label}` }));
      await user.click(within(group).getByRole("checkbox", { name: "Basil" }));
    }
    await user.click(screen.getByRole("button", { name: "Add plant" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/both a companion and an antagonist/)).toBeInTheDocument();
  });

  it("pre-fills when editing, keeps the id, and excludes the plant from its own companion list", async () => {
    const existing = makePlant({ id: "tomato", name: "Tomato", custom: true, careTips: ["Pinch"] });
    const { user, onSave } = setup({ initial: existing });
    expect(screen.getByLabelText("Name")).toHaveValue("Tomato");
    expect(screen.getByLabelText("Care tips")).toHaveValue("Pinch");
    const companions = screen.getByRole("group", { name: "Companion plants" });
    await user.click(within(companions).getByRole("button", { name: "Choose Companion plants" }));
    expect(within(companions).getAllByRole("checkbox").map((c) => (c as HTMLInputElement).labels?.[0]?.textContent)).toEqual(["Basil", "Fennel"]);
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Sweet Tomato");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave.mock.calls[0][0]).toMatchObject({ id: "tomato", name: "Sweet Tomato", careTips: ["Pinch"] });
  });

  it("calls onCancel", async () => {
    const { user, onCancel } = setup();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
