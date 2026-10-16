import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AppData } from "@/domain/types";
import { buildAppData, expect, expectHydrated, makeBed, makePlanting, readStoredData, seedGarden, test } from "./helpers";

test.describe("settings: temperature unit", () => {
  test("switching to °C changes temperatures on a plant detail page", async ({ page }) => {
    await seedGarden(page);
    await page.goto("/plants/tomato");
    await expectHydrated(page);
    const conditions = page.getByRole("region", { name: "Growing conditions" });
    await expect(conditions).toContainText("°F");
    await expect(conditions).not.toContainText("°C");

    await page.goto("/settings");
    await expectHydrated(page);
    await page.getByLabel("Temperature unit").selectOption("C");
    await expect(page.getByLabel("Temperature unit")).toHaveValue("C");
    await expect.poll(async () => (await readStoredData(page))?.settings.temperatureUnit).toBe("C");

    // Client-side navigation keeps the setting...
    await page.goto("/plants/tomato");
    await expectHydrated(page);
    await expect(conditions).toContainText("°C");
    await expect(conditions).not.toContainText("°F");
    // Tomato: ideal 60–85 °F is about 16–29 °C.
    await expect(conditions.getByText(/^Ideal \d+°C – \d+°C/)).toBeVisible();

    // ...and the setup wizard asks for temperatures in °C too.
    await page.goto("/setup");
    await expectHydrated(page);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(/Typical summer high \(°C\)/)).toBeVisible();

    // Switch back.
    await page.goto("/settings");
    await page.getByLabel("Temperature unit").selectOption("F");
    await page.goto("/plants/tomato");
    await expect(conditions).toContainText("°F");
  });
});

test.describe("settings: backup and restore", () => {
  test("exports a valid JSON backup and imports it back after a reset", async ({ page }, testInfo) => {
    const seeded = await seedGarden(page, {
      name: "Backup Garden",
      plantings: [makePlanting("basil")],
    });
    await page.goto("/settings");
    await expectHydrated(page);

    // Export.
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export JSON" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^garden-planner-backup-\d{4}-\d{2}-\d{2}\.json$/);

    const dir = await mkdtemp(path.join(tmpdir(), "garden-e2e-"));
    const file = path.join(dir, download.suggestedFilename());
    await download.saveAs(file);
    const exported = JSON.parse(await readFile(file, "utf8")) as AppData;
    expect(exported.version).toBe(1);
    expect(exported.gardens).toHaveLength(1);
    expect(exported.gardens[0].name).toBe("Backup Garden");
    expect(exported.gardens[0].plantings.map((p) => p.plantId)).toEqual(["basil"]);
    expect(exported.activeGardenId).toBe(seeded.gardens[0].id);
    await testInfo.attach("backup.json", { path: file, contentType: "application/json" });

    // Reset all data (native confirm dialog).
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Erase ALL gardens");
      void dialog.accept();
    });
    await page.getByRole("button", { name: "Reset all data" }).click();
    await expect(page.getByText("No gardens yet")).toBeVisible();
    await expect.poll(async () => (await readStoredData(page))?.gardens.length).toBe(0);

    // Import the exported file: a confirmation step describes it first.
    await page.getByLabel("Import backup file").setInputFiles(file);
    const dialog = page.getByRole("alertdialog", { name: "Confirm import" });
    await expect(dialog).toContainText("1 garden and 0 custom plants");
    await dialog.getByRole("button", { name: "Replace my data" }).click();
    await expect(page.getByText("Backup imported.")).toBeVisible();
    await expect(page.getByRole("list").filter({ hasText: "Backup Garden" }).first()).toBeVisible();

    await expect
      .poll(async () => {
        const data = await readStoredData(page);
        return data?.gardens.map((g) => [g.name, g.plantings.length]);
      })
      .toEqual([["Backup Garden", 1]]);

    // The restored garden is active on the dashboard.
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Backup Garden" })).toBeVisible();
  });

  test("cancelling an import keeps the current data", async ({ page }) => {
    await seedGarden(page, { name: "Keep Me" });
    const other = buildAppData({ name: "Other Garden", id: "garden-other" });
    const dir = await mkdtemp(path.join(tmpdir(), "garden-e2e-"));
    const file = path.join(dir, "other.json");
    await writeFile(file, JSON.stringify(other));

    await page.goto("/settings");
    await expectHydrated(page);
    await page.getByLabel("Import backup file").setInputFiles(file);
    const dialog = page.getByRole("alertdialog", { name: "Confirm import" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
    expect((await readStoredData(page))?.gardens.map((g) => g.name)).toEqual(["Keep Me"]);
  });

  test("rejects a file that is not a backup", async ({ page }) => {
    await seedGarden(page, { name: "Still Here" });
    const dir = await mkdtemp(path.join(tmpdir(), "garden-e2e-"));
    const file = path.join(dir, "nonsense.json");
    await writeFile(file, '{"hello":"world"}');

    await page.goto("/settings");
    await expectHydrated(page);
    await page.getByLabel("Import backup file").setInputFiles(file);
    await expect(page.getByRole("alert").filter({ hasText: /./ })).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    expect((await readStoredData(page))?.gardens.map((g) => g.name)).toEqual(["Still Here"]);
  });
});

test.describe("settings: custom plants", () => {
  test("creates a custom plant that shows up in the library and has a detail page", async ({ page }) => {
    await page.goto("/settings");
    await expectHydrated(page);
    await expect(page.getByText("No custom plants yet")).toBeVisible();

    await page.getByRole("button", { name: "Add custom plant" }).click();
    const form = page.getByRole("form", { name: "New custom plant" });
    await form.getByLabel("Name", { exact: true }).fill("Moonlight Squash");
    await form.getByLabel("Scientific name").fill("Cucurbita lunaris");
    await form.getByLabel("Category").selectOption("vegetable");
    await form.getByLabel("Description").fill("A test squash that glows at night.");
    await form.getByRole("button", { name: "Add plant" }).click();

    // Listed under Custom plants.
    const customCard = page.getByRole("region", { name: "Custom plants" });
    await expect(customCard).toContainText("Moonlight Squash");
    await expect(customCard).toContainText("Cucurbita lunaris");

    const id = (await readStoredData(page))!.customPlants[0].id;
    expect(id).toMatch(/moonlight-squash/);

    // In the library (search by name)...
    await page.goto("/plants");
    await expectHydrated(page);
    await page.getByLabel("Search plants").fill("moonlight");
    const card = page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: "Moonlight Squash" }) });
    await expect(card).toBeVisible();

    // ...and on its own detail page.
    await card.getByRole("link", { name: "Moonlight Squash" }).click();
    await expect(page).toHaveURL(new RegExp(`/plants/${id}$`));
    await expect(page.getByRole("heading", { level: 1, name: "Moonlight Squash" })).toBeVisible();
    // (Next keeps the library page mounted but hidden, so only count what is visible.)
    await expect(page.getByText("A test squash that glows at night.").filter({ visible: true })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Edit in Settings" })).toBeVisible();

    // A fresh load of the detail URL (not prerendered) still resolves the plant client-side.
    await page.goto(`/plants/${id}`);
    await expect(page.getByRole("heading", { level: 1, name: "Moonlight Squash" })).toBeVisible();
  });

  test("validates the custom plant form, then edits and deletes the plant", async ({ page }) => {
    await page.goto("/settings");
    await expectHydrated(page);
    await page.getByRole("button", { name: "Add custom plant" }).click();
    const form = page.getByRole("form", { name: "New custom plant" });
    await form.getByRole("button", { name: "Add plant" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /Please fix 1 problem/ })).toBeVisible();
    await expect(form.getByText("Name is required.")).toBeVisible();

    await form.getByLabel("Name", { exact: true }).fill("Test Thistle");
    await form.getByRole("button", { name: "Add plant" }).click();
    const customCard = page.getByRole("region", { name: "Custom plants" });
    await expect(customCard).toContainText("Test Thistle");

    // Edit.
    await customCard.getByRole("button", { name: "Edit Test Thistle" }).click();
    const edit = page.getByRole("form", { name: "Edit Test Thistle" });
    await edit.getByLabel("Name", { exact: true }).fill("Tall Thistle");
    await edit.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("region", { name: "Custom plants" })).toContainText("Tall Thistle");
    await expect(page.getByRole("region", { name: "Custom plants" })).not.toContainText("Test Thistle");

    // Delete (native confirm).
    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Delete Tall Thistle" }).click();
    await expect(page.getByText("No custom plants yet")).toBeVisible();
    await expect.poll(async () => (await readStoredData(page))?.customPlants.length).toBe(0);
  });

  test("custom plants can be placed in the planner", async ({ page }) => {
    await seedGarden(page, { beds: [makeBed({ columns: 2, rows: 2 })] });
    await page.goto("/settings");
    await expectHydrated(page);
    await page.getByRole("button", { name: "Add custom plant" }).click();
    await page.getByRole("form", { name: "New custom plant" }).getByLabel("Name", { exact: true }).fill("Zebra Bean");
    await page.getByRole("button", { name: "Add plant" }).click();
    await expect(page.getByRole("region", { name: "Custom plants" })).toContainText("Zebra Bean");

    await page.goto("/planner");
    await expectHydrated(page);
    const palette = page.getByRole("complementary", { name: "Plant palette" });
    await palette.getByLabel("Search plants").fill("zebra");
    await palette.getByRole("button", { name: "Zebra Bean" }).click();
    await page.getByRole("button", { name: /^Row 1, column 1:/ }).click();
    await expect(page.getByRole("button", { name: "Row 1, column 1: Zebra Bean" })).toBeVisible();
  });
});

test.describe("settings: gardens and reset", () => {
  test("renames and deletes a garden", async ({ page }) => {
    await seedGarden(page, { name: "Old Name" });
    await page.goto("/settings");
    await expectHydrated(page);

    await page.getByRole("button", { name: "Rename Old Name" }).click();
    await page.getByLabel("Garden name").fill("New Name");
    await page.getByRole("button", { name: "Save name" }).click();
    const gardens = page.getByRole("region", { name: "Gardens" });
    await expect(gardens).toContainText("New Name");
    await expect(gardens.getByText("Active")).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Delete New Name" }).click();
    await expect(page.getByText("No gardens yet")).toBeVisible();
    await expect.poll(async () => (await readStoredData(page))?.gardens.length).toBe(0);
  });

  test("declining the reset confirmation keeps the data", async ({ page }) => {
    await seedGarden(page, { name: "Survivor" });
    await page.goto("/settings");
    await expectHydrated(page);
    page.once("dialog", (dialog) => void dialog.dismiss());
    await page.getByRole("button", { name: "Reset all data" }).click();
    await expect(page.getByRole("region", { name: "Gardens" })).toContainText("Survivor");
    expect((await readStoredData(page))?.gardens).toHaveLength(1);
  });

  test("resetting wipes everything and returns the dashboard to its welcome state", async ({ page }) => {
    await seedGarden(page, { name: "Doomed", plantings: [makePlanting("basil")] });
    await page.goto("/settings");
    await expectHydrated(page);
    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Reset all data" }).click();
    await expect(page.getByText("No gardens yet")).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Welcome to Garden Planner" })).toBeVisible();
  });
});
