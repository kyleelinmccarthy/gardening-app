import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportAppData } from "@/storage/repository";
import { makeAppData, makeBed, makeGarden, makePlant, makePlanting } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { SettingsPage } from "./SettingsPage";

vi.mock("@/data/plants", async () => {
  const { makePlant } = await vi.importActual<typeof import("@/test/fixtures")>("@/test/fixtures");
  return {
    BUILTIN_PLANTS: [makePlant({ id: "basil", name: "Basil" }), makePlant({ id: "tomato", name: "Tomato" })],
  };
});

const custom = makePlant({ id: "custom-moss-abc123", name: "Moss", emoji: "🌿", category: "houseplant", custom: true });

let confirmSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => vi.restoreAllMocks());

const twoGardens = () =>
  makeAppData([makeGarden({ id: "g1", name: "Backyard" }), makeGarden({ id: "g2", name: "Balcony" })], {
    customPlants: [custom],
  });

describe("SettingsPage", () => {
  it("renders every section", async () => {
    renderWithAppData(<SettingsPage />);
    expect(await screen.findByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    for (const name of ["Preferences", "Gardens", "Custom plants", "Backup & restore", "Danger zone"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });

  describe("preferences", () => {
    it("changes the temperature unit", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />);
      await user.selectOptions(await screen.findByLabelText("Temperature unit"), "C");
      expect(getData().settings.temperatureUnit).toBe("C");
    });
  });

  describe("gardens", () => {
    it("lists gardens, marks the active one and links to add a new garden", async () => {
      renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const region = await screen.findByRole("region", { name: "Gardens" });
      expect(within(region).getByText("Backyard")).toBeInTheDocument();
      expect(within(region).getByText("Active")).toBeInTheDocument();
      expect(within(region).getByRole("link", { name: "Add garden" })).toHaveAttribute("href", "/setup?new=1");
    });

    it("sets another garden active", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      await user.click(await screen.findByRole("button", { name: "Set Balcony active" }));
      expect(getData().activeGardenId).toBe("g2");
      expect(screen.queryByRole("button", { name: "Set Balcony active" })).not.toBeInTheDocument();
    });

    it("renames a garden and can cancel", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      await user.click(await screen.findByRole("button", { name: "Rename Backyard" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.getByText("Backyard")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Rename Backyard" }));
      const input = screen.getByLabelText("Garden name");
      await user.clear(input);
      expect(screen.getByRole("button", { name: "Save name" })).toBeDisabled();
      await user.type(input, "Front yard");
      await user.click(screen.getByRole("button", { name: "Save name" }));
      expect(getData().gardens[0].name).toBe("Front yard");
      expect(screen.getByText("Front yard")).toBeInTheDocument();
    });

    it("deletes a garden only after confirmation", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      confirmSpy.mockReturnValueOnce(false);
      await user.click(await screen.findByRole("button", { name: "Delete Balcony" }));
      expect(getData().gardens).toHaveLength(2);

      await user.click(screen.getByRole("button", { name: "Delete Balcony" }));
      expect(confirmSpy).toHaveBeenLastCalledWith(expect.stringContaining("Balcony"));
      expect(getData().gardens.map((g) => g.id)).toEqual(["g1"]);
    });

    it("shows an empty state with a link to setup when there are no gardens", async () => {
      renderWithAppData(<SettingsPage />);
      const region = await screen.findByRole("region", { name: "Gardens" });
      expect(within(region).getByRole("link", { name: "Set up my garden" })).toHaveAttribute("href", "/setup");
    });
  });

  describe("backup", () => {
    it("exports JSON through a download named with today's date", async () => {
      const user = userEvent.setup();
      const create = vi.fn(() => "blob:x");
      Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
      const names: string[] = [];
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
        names.push(this.download);
      });
      const data = twoGardens();
      renderWithAppData(<SettingsPage />, { data });
      await user.click(await screen.findByRole("button", { name: "Export JSON" }));
      expect(names).toHaveLength(1);
      expect(names[0]).toMatch(/^garden-planner-backup-\d{4}-\d{2}-\d{2}\.json$/);
      const blob = (create.mock.calls[0] as unknown as [Blob])[0];
      expect(await blob.text()).toBe(exportAppData(data));
    });

    it("imports a valid file after confirmation", async () => {
      const user = userEvent.setup();
      const incoming = makeAppData([makeGarden({ id: "imp", name: "Imported" })]);
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const input = await screen.findByLabelText("Import backup file");
      fireEvent.change(input, { target: { files: [new File([exportAppData(incoming)], "b.json", { type: "application/json" })] } });

      const dialog = await screen.findByRole("alertdialog", { name: "Confirm import" });
      expect(dialog).toHaveTextContent("1 garden and 0 custom plants");
      expect(getData().gardens).toHaveLength(2); // nothing replaced yet
      await user.click(within(dialog).getByRole("button", { name: "Replace my data" }));

      expect(getData().gardens.map((g) => g.name)).toEqual(["Imported"]);
      expect(await screen.findByText("Backup imported.")).toBeInTheDocument();
    });

    it("can cancel an import", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const input = await screen.findByLabelText("Import backup file");
      fireEvent.change(input, { target: { files: [new File([exportAppData(makeAppData([]))], "b.json")] } });
      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(getData().gardens).toHaveLength(2);
    });

    const chooseValidFile = async () => {
      const input = await screen.findByLabelText("Import backup file");
      fireEvent.change(input, { target: { files: [new File([exportAppData(makeAppData([]))], "b.json")] } });
      return { input, dialog: await screen.findByRole("alertdialog") };
    };

    it("moves focus to Cancel when the import confirmation appears", async () => {
      renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const { dialog } = await chooseValidFile();
      await waitFor(() => expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus());
    });

    it("cancels the import with Escape and returns focus to the file input", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const { input } = await chooseValidFile();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(input).toHaveFocus();
      expect(getData().gardens).toHaveLength(2);
    });

    it("returns focus to the file input after clicking Cancel", async () => {
      const user = userEvent.setup();
      renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const { input, dialog } = await chooseValidFile();
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
      expect(input).toHaveFocus();
    });

    it("rejects a file over 5 MB with a friendly message and no confirmation", async () => {
      renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const input = await screen.findByLabelText("Import backup file");
      const big = new File(["{}"], "big.json");
      Object.defineProperty(big, "size", { value: 5_000_001 });
      fireEvent.change(input, { target: { files: [big] } });
      expect(await screen.findByRole("alert")).toHaveTextContent(/too large/i);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("shows an error for invalid files and keeps existing data", async () => {
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const input = await screen.findByLabelText("Import backup file");
      fireEvent.change(input, { target: { files: [new File(["definitely not json"], "bad.json")] } });
      expect(await screen.findByRole("alert")).toHaveTextContent(/valid JSON/i);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(getData().gardens).toHaveLength(2);
    });
  });

  describe("custom plants", () => {
    it("lists custom plants", async () => {
      renderWithAppData(<SettingsPage />, { data: twoGardens() });
      const region = await screen.findByRole("region", { name: "Custom plants" });
      expect(within(region).getByText("Moss")).toBeInTheDocument();
      expect(within(region).getByText("Houseplants")).toBeInTheDocument();
    });

    it("creates a custom plant from the form", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />);
      await user.click(await screen.findByRole("button", { name: "Add custom plant" }));
      await user.type(screen.getByLabelText("Name"), "Lemon Balm");
      await user.click(screen.getByRole("button", { name: "Add plant" }));

      await waitFor(() => expect(getData().customPlants).toHaveLength(1));
      const saved = getData().customPlants[0];
      expect(saved).toMatchObject({ name: "Lemon Balm", custom: true });
      expect(saved.id).toMatch(/^custom-lemon-balm-/);
      // back to the list
      const region = await screen.findByRole("region", { name: "Custom plants" });
      expect(within(region).getByText("Lemon Balm")).toBeInTheDocument();
    });

    it("edits a custom plant in place", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      await user.click(await screen.findByRole("button", { name: "Edit Moss" }));
      const name = screen.getByLabelText("Name");
      expect(name).toHaveValue("Moss");
      await user.clear(name);
      await user.type(name, "Irish Moss");
      await user.click(screen.getByRole("button", { name: "Save changes" }));
      await waitFor(() => expect(getData().customPlants[0].name).toBe("Irish Moss"));
      expect(getData().customPlants).toHaveLength(1);
      expect(getData().customPlants[0].id).toBe("custom-moss-abc123");
    });

    it("cancels editing without changes", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      await user.click(await screen.findByRole("button", { name: "Edit Moss" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.getByRole("region", { name: "Custom plants" })).toBeInTheDocument();
      expect(getData().customPlants[0].name).toBe("Moss");
    });

    it("deletes after confirmation", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      confirmSpy.mockReturnValueOnce(false);
      await user.click(await screen.findByRole("button", { name: "Delete Moss" }));
      expect(getData().customPlants).toHaveLength(1);
      await user.click(screen.getByRole("button", { name: "Delete Moss" }));
      expect(getData().customPlants).toHaveLength(0);
    });

    it("warns that plantings and bed placements are removed, and removes them", async () => {
      const user = userEvent.setup();
      const data = twoGardens();
      data.gardens[0].beds = [makeBed({ placements: [{ plantId: data.customPlants[0].id, x: 0, y: 0 }] })];
      data.gardens[0].plantings = [makePlanting({ plantId: data.customPlants[0].id })];
      const { getData } = renderWithAppData(<SettingsPage />, { data });
      await user.click(await screen.findByRole("button", { name: "Delete Moss" }));
      expect(confirmSpy).toHaveBeenLastCalledWith(expect.stringMatching(/plantings and bed placements will be removed/));
      expect(getData().gardens[0].plantings).toEqual([]);
      expect(getData().gardens[0].beds[0].placements).toEqual([]);
    });
  });

  describe("danger zone", () => {
    it("resets all data after confirmation", async () => {
      const user = userEvent.setup();
      const { getData } = renderWithAppData(<SettingsPage />, { data: twoGardens() });
      confirmSpy.mockReturnValueOnce(false);
      await user.click(await screen.findByRole("button", { name: "Reset all data" }));
      expect(getData().gardens).toHaveLength(2);

      await user.click(screen.getByRole("button", { name: "Reset all data" }));
      expect(getData()).toMatchObject({ gardens: [], customPlants: [], activeGardenId: null });
    });
  });
});
