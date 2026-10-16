import { expect, expectHydrated, makeBed, makePlanting, seedGarden, test } from "./helpers";

test.describe("dashboard", () => {
  test("shows the welcome page with calls to action when there is no garden", async ({ page }) => {
    await page.goto("/");
    await expectHydrated(page);
    await expect(page.getByRole("heading", { level: 1, name: "Welcome to Garden Planner" })).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Set up my garden" }).click();
    await expect(page).toHaveURL(/\/setup$/);
  });

  test("summarises the active garden", async ({ page }) => {
    await seedGarden(page, {
      name: "Summary Garden",
      profile: { pets: ["cat"] },
      beds: [
        makeBed({
          name: "Mixed bed",
          columns: 3,
          rows: 2,
          placements: [
            { plantId: "tomato", x: 0, y: 0 },
            { plantId: "fennel", x: 1, y: 0 },
          ],
        }),
      ],
      plantings: [
        makePlanting("tomato", { bedId: "bed-seed" }),
        makePlanting("fennel", { bedId: "bed-seed" }),
        makePlanting("asiatic-lily", { status: "planned" }),
      ],
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Summary Garden" })).toBeVisible();

    const summary = page.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("Plants growing");
    await expect(summary).toContainText("1 planned");
    await expect(summary).toContainText("Companion conflicts");

    // The bed holds an antagonist pair.
    const conflicts = page.getByRole("region", { name: "Companion conflicts" });
    await expect(conflicts).toContainText("neighbours in Mixed bed");
    await expect(conflicts.getByRole("link", { name: "Open planner" })).toBeVisible();

    // The cat-toxic lily raises a safety alert.
    const safety = page.getByRole("region", { name: "Safety alerts" });
    await expect(safety.getByRole("link", { name: "Asiatic Lily" })).toBeVisible();
    await expect(safety).toContainText("Severely toxic to cats");
    await expect(safety.getByText("High risk")).toBeVisible();

    // Quick links work.
    await page.getByRole("navigation", { name: "Quick links" }).getByRole("link", { name: /Planner/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Garden planner" })).toBeVisible();
  });

  test("switches between gardens", async ({ page }) => {
    await seedGarden(page, { name: "First Garden" });
    // A second garden is added through the setup wizard's "new garden" mode.
    await page.goto("/setup?new=1");
    await expectHydrated(page);
    await expect(page.getByRole("heading", { level: 1, name: "Set up a new garden" })).toBeVisible();
    await page.getByLabel("Garden name").fill("Second Garden");
    for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Create garden" }).click();
    await expect(page).toHaveURL(/\/recommendations$/);

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Second Garden" })).toBeVisible();
    await page.getByLabel("Active garden").selectOption({ label: "First Garden" });
    await expect(page.getByRole("heading", { level: 1, name: "First Garden" })).toBeVisible();
  });
});
