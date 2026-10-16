import type { Page } from "@playwright/test";
import { expect, expectHydrated, makeBed, readStoredData, seedGarden, test } from "./helpers";

const palette = (page: Page) => page.getByRole("complementary", { name: "Plant palette" });
const cell = (page: Page, row: number, column: number) =>
  page.getByRole("button", { name: new RegExp(`^Row ${row}, column ${column}:`) });

async function pickPlant(page: Page, name: string) {
  await palette(page).getByLabel("Search plants").fill(name);
  await palette(page).getByRole("button", { name, exact: true }).click();
  await expect(palette(page).getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
}

test.describe("planner", () => {
  test("creates a bed from the form", async ({ page }) => {
    await seedGarden(page, { name: "Planner Garden" });
    await page.goto("/planner");
    await expectHydrated(page);

    // With no beds the "New bed" form is open straight away.
    await expect(page.getByText("No beds yet")).toBeVisible();
    await page.getByLabel("Bed name").fill("Veggie Patch");
    await page.getByLabel("Columns").fill("5");
    await page.getByLabel("Rows").fill("3");
    await page.getByRole("button", { name: "Create bed" }).click();

    const list = page.getByRole("list", { name: "Your beds" });
    await expect(list.getByRole("heading", { name: "Veggie Patch" })).toBeVisible();
    await expect(list).toContainText("5×3 cells");
    await expect(page.getByRole("heading", { level: 2, name: "Veggie Patch" })).toBeVisible();

    const grid = page.getByRole("group", { name: "Veggie Patch layout, 5 columns by 3 rows" });
    await expect(grid.getByRole("button")).toHaveCount(15);
    await expect(cell(page, 1, 1)).toHaveAccessibleName("Row 1, column 1: empty");

    await expect.poll(async () => (await readStoredData(page))?.gardens[0].beds.map((b) => [b.name, b.columns, b.rows])).toEqual([
      ["Veggie Patch", 5, 3],
    ]);
  });

  test("validates the bed form", async ({ page }) => {
    await seedGarden(page);
    await page.goto("/planner");
    await expectHydrated(page);
    await page.getByRole("button", { name: "Create bed" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByLabel("Bed name")).toHaveAttribute("aria-invalid", "true");
  });

  test("places plants, warns about an antagonist neighbour, and erases a cell", async ({ page }) => {
    await seedGarden(page, { name: "Planner Garden", beds: [makeBed({ name: "Test bed", columns: 4, rows: 3 })] });
    await page.goto("/planner");
    await expectHydrated(page);
    await expect(page.getByRole("heading", { level: 2, name: "Test bed" })).toBeVisible();
    await expect(page.getByText("No conflicts — nothing here dislikes its neighbours.")).toBeVisible();

    // Place a tomato in row 2, column 2.
    await pickPlant(page, "Tomato");
    await cell(page, 2, 2).click();
    await expect(cell(page, 2, 2)).toHaveAccessibleName("Row 2, column 2: Tomato");
    await expect(page.getByRole("region", { name: "Plants in this bed" })).toContainText("Tomato × 1");

    // Fennel is a known antagonist of tomato. Focusing a neighbouring cell previews the warning...
    await pickPlant(page, "Fennel");
    await cell(page, 2, 3).focus();
    await expect(page.getByText("Fennel conflicts with Tomato next to it")).toBeVisible();

    // ...and placing it surfaces the conflict in the analysis and on both cells.
    await cell(page, 2, 3).click();
    const conflicts = page.getByRole("region", { name: "Conflicts" });
    await expect(conflicts.getByRole("heading", { name: "Conflicts (1)" })).toBeVisible();
    await expect(conflicts).toContainText("Fennel ✕ Tomato");
    await expect(conflicts).not.toContainText("No conflicts");
    await expect(cell(page, 2, 3)).toHaveAccessibleName(/Row 2, column 3: Fennel — next to a plant it should be kept apart from/);
    await expect(cell(page, 2, 2)).toHaveAccessibleName(/Tomato — next to a plant it should be kept apart from/);

    // Fennel is still selected: a plant that is not adjacent to the tomato does not conflict.
    await cell(page, 1, 4).click();
    await expect(cell(page, 1, 4)).toHaveAccessibleName("Row 1, column 4: Fennel");

    // The eraser clears a cell, which resolves the conflict.
    await palette(page).getByRole("button", { name: "Eraser" }).click();
    await expect(page.getByText("Eraser: click a cell to clear it.")).toBeVisible();
    await cell(page, 2, 3).click();
    await expect(cell(page, 2, 3)).toHaveAccessibleName("Row 2, column 3: empty");
    await expect(conflicts.getByRole("heading", { name: "Conflicts (0)" })).toBeVisible();
    await expect(cell(page, 2, 2)).toHaveAccessibleName("Row 2, column 2: Tomato");

    await expect
      .poll(async () => (await readStoredData(page))?.gardens[0].beds[0].placements.map((p) => `${p.plantId}@${p.x},${p.y}`).sort())
      .toEqual(["fennel@3,0", "tomato@1,1"]);
  });

  test("shows good pairings for companion plants", async ({ page }) => {
    await seedGarden(page, { beds: [makeBed({ columns: 3, rows: 2 })] });
    await page.goto("/planner");
    await expectHydrated(page);

    await pickPlant(page, "Tomato");
    // The analysis suggests companions for the selected plant.
    const suggestions = page.getByRole("region", { name: "Good companions to add" });
    await expect(suggestions.getByRole("button", { name: "Use Basil" })).toBeVisible();
    await cell(page, 1, 1).click();
    await suggestions.getByRole("button", { name: "Use Basil" }).click();
    await cell(page, 1, 2).click();

    const benefits = page.getByRole("region", { name: "Benefits" });
    await expect(benefits.getByRole("heading", { name: "✓ Good pairings (1)" })).toBeVisible();
    await expect(benefits).toContainText("Basil ♥ Tomato");
    await expect(cell(page, 1, 2)).toHaveAccessibleName(/Basil — good companions nearby/);
  });

  test("clears and deletes a bed", async ({ page }) => {
    await seedGarden(page, { beds: [makeBed({ name: "Scratch bed", columns: 3, rows: 2 })] });
    await page.goto("/planner");
    await expectHydrated(page);

    await pickPlant(page, "Basil");
    await cell(page, 1, 1).click();
    await expect(cell(page, 1, 1)).toHaveAccessibleName(/Basil/);

    await page.getByRole("button", { name: "Clear bed" }).click();
    await page.getByRole("button", { name: "Yes, clear" }).click();
    await expect(cell(page, 1, 1)).toHaveAccessibleName("Row 1, column 1: empty");

    await page.getByRole("button", { name: "Delete bed" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();
    await expect(page.getByText("No beds yet")).toBeVisible();
  });

  test("placements persist across a reload", async ({ page }) => {
    await seedGarden(page, { beds: [makeBed({ columns: 3, rows: 2 })] });
    await page.goto("/planner");
    await expectHydrated(page);
    await pickPlant(page, "Basil");
    await cell(page, 2, 3).click();
    await expect(cell(page, 2, 3)).toHaveAccessibleName(/Basil/);
    await expect.poll(async () => (await readStoredData(page))?.gardens[0].beds[0].placements.length).toBe(1);

    await page.reload();
    await expectHydrated(page);
    await expect(cell(page, 2, 3)).toHaveAccessibleName(/Row 2, column 3: Basil/);
  });
});
