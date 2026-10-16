import { expect, expectHydrated, readStoredData, seedGarden, test } from "./helpers";

test.describe("plant library", () => {
  test("search and category filters narrow the list", async ({ page }) => {
    await page.goto("/plants");
    await expectHydrated(page);

    const count = page.getByText(/^\d+ plants?$/);
    await expect(count).toHaveText(/^\d{3} plants$/); // the full catalog (100+)

    await page.getByLabel("Search plants").fill("basil");
    await expect(page.getByRole("heading", { level: 3, name: "Basil", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Tomato", exact: true })).toHaveCount(0);
    await expect(count).toHaveText(/^\d{1,2} plants?$/);

    // Category chips combine with the search: Basil is a herb, not a flower.
    const categories = page.getByRole("group", { name: "Category" });
    await categories.getByRole("button", { name: /Flowers/ }).click();
    await expect(page.getByRole("heading", { name: "No plants match these filters" })).toBeVisible();
    await categories.getByRole("button", { name: /Flowers/ }).click();
    await categories.getByRole("button", { name: /Herbs/ }).click();
    await expect(categories.getByRole("button", { name: /Herbs/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { level: 3, name: "Basil", exact: true })).toBeVisible();

    // Clear everything again.
    await page.getByRole("button", { name: /^Clear filters/ }).click();
    await expect(page.getByLabel("Search plants")).toHaveValue("");
    await expect(count).toHaveText(/^\d{3} plants$/);
  });

  test("filtering by category alone lists only that category", async ({ page }) => {
    await page.goto("/plants");
    await expectHydrated(page);
    await page.getByRole("group", { name: "Category" }).getByRole("button", { name: /Succulents/ }).click();
    await expect(page.getByRole("heading", { level: 3, name: "Aloe Vera", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Basil", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 3, name: "Tomato", exact: true })).toHaveCount(0);
  });

  test("opens a plant's detail page with companions and toxicity", async ({ page }) => {
    await page.goto("/plants");
    await expectHydrated(page);
    await page.getByLabel("Search plants").fill("basil");
    await page.getByRole("link", { name: "Basil", exact: true }).click();

    await expect(page).toHaveURL(/\/plants\/basil$/);
    await expect(page.getByRole("heading", { level: 1, name: "Basil" })).toBeVisible();
    // Next keeps the previous route mounted but hidden, so only count visible text.
    await expect(page.getByText("Ocimum basilicum").filter({ visible: true })).toHaveCount(1);

    const companions = page.getByRole("region", { name: "Companions" });
    await expect(companions.getByText("Good neighbours")).toBeVisible();
    await expect(companions.getByText("Keep apart")).toBeVisible();
    await expect(companions.getByRole("link", { name: /Tomato/ }).first()).toBeVisible();

    const safety = page.getByRole("region", { name: "Safety" });
    const toxicity = safety.getByRole("table", { name: "Toxicity of Basil by species" });
    await expect(toxicity).toBeVisible();
    for (const species of ["Cat", "Dog", "Horse", "Bird", "Rabbit", "Humans"]) {
      await expect(toxicity.getByRole("rowheader", { name: new RegExp(species) })).toBeVisible();
    }
    await expect(toxicity.getByText("Non-toxic").first()).toBeVisible();

    // Other sections are present too.
    await expect(page.getByRole("region", { name: "Growing conditions" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Soil & fertilizer" })).toBeVisible();

    // Following a companion link navigates to that plant.
    await companions.getByRole("link", { name: /Tomato/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Tomato" })).toBeVisible();
  });

  test("toxicity table highlights the household's pets", async ({ page }) => {
    await seedGarden(page, { profile: { pets: ["cat"] } });
    await page.goto("/plants/asiatic-lily");
    await expectHydrated(page);
    const toxicity = page.getByRole("table", { name: "Toxicity of Asiatic Lily by species" });
    const catRow = toxicity.getByRole("row", { name: /Cat/ });
    await expect(catRow).toContainText("Your pet");
    await expect(catRow).toContainText("Severely toxic");
    await expect(page.getByText("Severely toxic to cats").first()).toBeVisible();
  });

  test("Add to my garden needs a garden first", async ({ page }) => {
    await page.goto("/plants/basil");
    await expectHydrated(page);
    await expect(page.getByRole("button", { name: /Add to my garden/ })).toBeDisabled();
    await expect(page.getByText("Set up a garden first")).toBeVisible();
  });

  test("adding a plant puts it in the garden", async ({ page }) => {
    await seedGarden(page, { name: "Plant Test Garden" });
    await page.goto("/plants/basil");
    await expectHydrated(page);

    await page.getByRole("button", { name: /Add to my garden/ }).click();
    await expect(page.getByText("In your garden")).toBeVisible();
    await expect(page.getByRole("button", { name: /Add to my garden/ })).toHaveCount(0);

    // Saved as a "planned" planting in the active garden.
    await expect
      .poll(async () => {
        const data = await readStoredData(page);
        return data?.gardens[0].plantings.map((p) => [p.plantId, p.status]);
      })
      .toEqual([["basil", "planned"]]);

    // The library card shows the same state.
    await page.goto("/plants");
    await page.getByLabel("Search plants").fill("basil");
    const basilCard = page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: "Basil", exact: true }) });
    await expect(basilCard.getByText("In your garden")).toBeVisible();

    // The dashboard and care hub reflect it.
    await page.goto("/");
    await expect(page.getByText("1 planned")).toBeVisible();
    await page.goto("/care");
    await page.getByRole("tab", { name: "My plants" }).click();
    await expect(page.getByRole("list", { name: "Your plantings" }).getByRole("link", { name: /Basil/ })).toBeVisible();
  });

  test("library cards from a recommendation list can be added too", async ({ page }) => {
    await seedGarden(page, { name: "Rec Garden", profile: { interests: ["herb"] } });
    await page.goto("/recommendations");
    await expectHydrated(page);
    const basilCard = page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: "Basil", exact: true }) });
    await basilCard.getByRole("button", { name: /Add to my garden/ }).click();
    await expect(basilCard.getByText("In your garden")).toBeVisible();
  });
});
