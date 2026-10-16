import { expect, expectHydrated, test } from "./helpers";

test.describe("guides", () => {
  test("a deep link opens the pests tab and highlights Aphids", async ({ page }) => {
    await page.goto("/guides#insect-aphids");
    await expectHydrated(page);

    await expect(page.getByRole("tab", { name: /Pests & wildlife/ })).toHaveAttribute("aria-selected", "true");
    const aphids = page.locator("#insect-aphids");
    await expect(aphids).toBeVisible();
    await expect(aphids).toHaveAttribute("data-targeted", "true");
    await expect(aphids.getByRole("heading", { level: 3, name: "Aphids" })).toBeVisible();
    await expect(aphids).toContainText("Signs to look for");
    await expect(aphids).toContainText("How to manage it");
    await expect(aphids.getByText("Pest", { exact: true })).toBeVisible();
    await expect(aphids).toBeInViewport();
  });

  test("a deep link to a beneficial insect opens the beneficials tab", async ({ page }) => {
    await page.goto("/guides#insect-ladybugs");
    await expectHydrated(page);
    await expect(page.getByRole("tab", { name: /Beneficials & pollinators/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#insect-ladybugs").getByRole("heading", { level: 3 })).toContainText("Lady");
    await expect(page.locator("#insect-ladybugs")).toContainText("Plants that attract them");
  });

  test("soil and fertilizer tabs render their entries and update the URL hash", async ({ page }) => {
    await page.goto("/guides");
    await expectHydrated(page);
    await expect(page.getByRole("tab", { name: /Pests & wildlife/ })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: /Soil/ }).click();
    await expect(page.getByRole("tab", { name: /Soil/ })).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#soil$/);
    await expect(page.getByRole("heading", { level: 3, name: "Understanding pH" })).toBeVisible();
    await expect(page.locator("#soil-loam").getByRole("heading", { level: 3 })).toBeVisible();
    await expect(page.locator("#soil-clay")).toContainText("How to identify:");

    await page.getByRole("tab", { name: /Fertilizers/ }).click();
    await expect(page).toHaveURL(/#fertilizers$/);
    await expect(page.getByRole("heading", { level: 3, name: "Reading the NPK numbers" })).toBeVisible();
    await expect(page.locator("#fertilizer-compost")).toContainText("How to apply:");
    await expect(page.locator("#fertilizer-compost").getByText(/^NPK /)).toBeVisible();

    // The remaining tabs render too.
    for (const [tab, heading] of [
      [/Tools/, "Tools"],
      [/Companion planting/, "Companion planting"],
      [/Climate zones/, "Climate zones"],
    ] as const) {
      await page.getByRole("tab", { name: tab }).click();
      await expect(page.getByRole("tab", { name: tab })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel").getByRole("heading", { level: 2, name: heading })).toBeAttached();
    }
  });

  test("deep links to soil and fertilizer entries select the right tab", async ({ page }) => {
    await page.goto("/guides#soil-sandy");
    await expectHydrated(page);
    await expect(page.getByRole("tab", { name: /Soil/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#soil-sandy")).toHaveAttribute("data-targeted", "true");

    await page.goto("/guides#fertilizer-fish-emulsion");
    await expect(page.getByRole("tab", { name: /Fertilizers/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#fertilizer-fish-emulsion")).toHaveAttribute("data-targeted", "true");
  });

  test("pest search filters the list", async ({ page }) => {
    await page.goto("/guides");
    await expectHydrated(page);
    await page.getByLabel("Search pests & wildlife").fill("aphid");
    await expect(page.locator("#insect-aphids")).toBeVisible();
    await expect(page.locator("#insect-spider-mites")).toHaveCount(0);
    await page.getByLabel("Search pests & wildlife").fill("zzzzzz");
    await expect(page.getByText(/Nothing matches/)).toBeVisible();
  });

  test("plant detail links into the soil guide", async ({ page }) => {
    await page.goto("/plants/basil");
    await expectHydrated(page);
    await page.getByRole("region", { name: "Soil & fertilizer" }).getByRole("link", { name: "Loam" }).click();
    await expect(page).toHaveURL(/\/guides#soil-loam$/);
    await expect(page.getByRole("tab", { name: /Soil/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#soil-loam")).toHaveAttribute("data-targeted", "true");
  });
});
