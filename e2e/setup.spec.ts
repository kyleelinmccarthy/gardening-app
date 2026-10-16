import { completeSetup, expect, expectHydrated, readStoredData, test } from "./helpers";
import type { Page } from "@playwright/test";

const SHOW_ALL = "Show plants that aren't a good fit (with reasons)";

/** The recommendation card (list item) for a plant, found by its heading. */
const card = (page: Page, plantName: string) =>
  page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: plantName, exact: true }) });

test.describe("setup wizard: outdoor garden", () => {
  test("creates a garden and lands on recommendations that respect the household", async ({ page }) => {
    await completeSetup(page, {
      name: "Sunny Backyard",
      setting: "outdoor",
      zone: 6,
      sun: "Full sun",
      tools: ["Pruners", "Garden hose", "Stakes"],
      interests: ["Vegetables", "Herbs"],
      experience: "Beginner",
      pets: ["Cat"],
      allergies: ["Pollen"],
    });

    // The garden was saved with what we entered.
    await expect
      .poll(async () => {
        const data = await readStoredData(page);
        return data?.gardens[0]?.profile;
      })
      .toMatchObject({
        setting: "outdoor",
        sunExposure: "full-sun",
        interests: ["vegetable", "herb"],
        pets: ["cat"],
        allergies: ["pollen"],
        climate: { hardinessZone: 6 },
      });
    const saved = (await readStoredData(page))!;
    expect(saved.gardens).toHaveLength(1);
    expect(saved.gardens[0].name).toBe("Sunny Backyard");
    expect(saved.gardens[0].profile.tools).toEqual(expect.arrayContaining(["pruners", "garden-hose", "stakes"]));
    expect(saved.activeGardenId).toBe(saved.gardens[0].id);

    // Recommendations are shown, with a summary and verdict groups.
    await expectHydrated(page);
    await expect(page.getByText(/^\d+ great matches for your Zone 6 outdoor garden$/).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /^Great match/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
    // Vegetables and herbs are in the user's interests, and safe for cats.
    await expect(card(page, "Basil")).toBeVisible();
    await expect(card(page, "Basil").getByRole("button", { name: "Add to my garden" })).toBeVisible();

    // Plants severely/moderately toxic to cats are hidden by default...
    for (const hidden of ["Asiatic Lily", "Garlic", "Onion", "Chives"]) {
      await expect(page.getByRole("heading", { level: 3, name: hidden, exact: true })).toHaveCount(0);
    }

    // ...and shown, with a blocker reason, when asking for plants that aren't a good fit.
    await page.getByRole("checkbox", { name: SHOW_ALL }).check();
    const lily = card(page, "Asiatic Lily");
    await expect(lily).toBeVisible();
    await expect(lily.getByText("Not recommended")).toBeVisible();
    await expect(lily.locator('li[data-kind="blocker"]').first()).toContainText("Severely toxic to cats");
    await expect(page.getByRole("heading", { level: 2, name: /^Not recommended/ })).toBeVisible();

    const garlic = card(page, "Garlic");
    await expect(garlic.locator('li[data-kind="blocker"]').first()).toContainText("Moderately toxic to cats");

    // Turning the toggle back off hides them again.
    await page.getByRole("checkbox", { name: SHOW_ALL }).uncheck();
    await expect(page.getByRole("heading", { level: 3, name: "Asiatic Lily", exact: true })).toHaveCount(0);
  });

  test("a pollen allergy is flagged on plants that carry pollen", async ({ page }) => {
    await completeSetup(page, {
      name: "Allergy Garden",
      zone: 6,
      sun: "Full sun",
      interests: ["Flowers"],
      pets: [],
      allergies: ["Pollen"],
    });
    await page.getByRole("checkbox", { name: SHOW_ALL }).check();
    // Any card flagged with the allergen badge proves the allergy is wired through.
    await expect(page.getByText(/Allergen: .*pollen/i).first()).toBeVisible();
  });

  test("validates required fields before moving on", async ({ page }) => {
    await page.goto("/setup");
    await expectHydrated(page);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /name/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Basics" })).toBeVisible();

    await page.getByLabel("Garden name").fill("Named now");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Climate" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByLabel("Garden name")).toHaveValue("Named now");
  });
});

test.describe("setup wizard: indoor garden", () => {
  test("recommends houseplants and excludes plants that cannot be container grown", async ({ page }) => {
    await completeSetup(page, {
      name: "Living Room",
      setting: "indoor",
      zone: 6,
      indoorLight: "Bright, indirect light",
      tools: ["Humidifier"],
      experience: "Beginner",
    });

    await expect
      .poll(async () => (await readStoredData(page))?.gardens[0]?.profile)
      .toMatchObject({
        setting: "indoor",
        containersOnly: true,
        indoor: { light: "bright-indirect" },
      });

    await expectHydrated(page);
    // The houseplant category is offered, and houseplants are listed.
    const categories = page.getByRole("group", { name: "Category" });
    await expect(categories.getByRole("button", { name: /Houseplants \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Spider Plant", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Pothos", exact: true })).toBeVisible();

    // Sweet Corn cannot live in a pot (or indoors): hidden by default, blocked with a reason when shown.
    await expect(page.getByRole("heading", { level: 3, name: "Sweet Corn", exact: true })).toHaveCount(0);
    await page.getByRole("checkbox", { name: SHOW_ALL }).check();
    const corn = card(page, "Sweet Corn");
    await expect(corn).toBeVisible();
    await expect(corn.getByText("Not recommended")).toBeVisible();
    await expect(corn.locator('li[data-kind="blocker"]').first()).toContainText(/Not suited to/);

    // Filtering by the houseplant category narrows the list.
    await categories.getByRole("button", { name: /Houseplants/ }).click();
    await expect(card(page, "Sweet Corn")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 3, name: "Spider Plant", exact: true })).toBeVisible();
  });

  test("the wizard hides outdoor-only questions for an indoor garden", async ({ page }) => {
    await page.goto("/setup");
    await expectHydrated(page);
    await page.getByLabel("Garden name").fill("Windowsill");
    await page.getByRole("radio", { name: /Indoor garden/ }).check();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByLabel("Indoor light level")).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("radio", { name: /Full sun/ })).toHaveCount(0);
    await expect(page.getByLabel("Containers only")).toHaveCount(0);
  });
});
