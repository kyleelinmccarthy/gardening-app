import { completeSetup, expect, expectHydrated, readStoredData, STORAGE_KEY, test } from "./helpers";

test.describe("persistence", () => {
  test("a garden created in the wizard, with a plant and a journal entry, survives reloads", async ({ page }) => {
    await completeSetup(page, { name: "Persistent Plot", zone: 6, sun: "Full sun", interests: ["Herbs"] });

    // Add a plant, then a reminder.
    await page.goto("/plants/basil");
    await expectHydrated(page);
    await page.getByRole("button", { name: /Add to my garden/ }).click();
    await expect(page.getByText("In your garden")).toBeVisible();

    await page.goto("/care");
    await expectHydrated(page);
    await page.getByRole("tab", { name: "Journal" }).click();
    await page.getByLabel("Entry title").fill("Remember me");
    await page.getByRole("button", { name: "Add entry" }).click();
    await expect(page.getByRole("list", { name: "Journal entries" })).toContainText("Remember me");

    // Saving happens in an effect after the state change, so wait for it to land in localStorage before reloading.
    await expect
      .poll(async () => {
        const data = await readStoredData(page);
        const garden = data?.gardens[0];
        return garden && [garden.name, garden.plantings.length, garden.journal.length];
      })
      .toEqual(["Persistent Plot", 1, 1]);

    await page.reload();
    await expectHydrated(page);
    await expect(page.getByRole("tab", { name: "Today" })).toBeVisible();
    await page.getByRole("tab", { name: "Journal" }).click();
    await expect(page.getByRole("list", { name: "Journal entries" })).toContainText("Remember me");
    await page.getByRole("tab", { name: "My plants" }).click();
    await expect(page.getByRole("list", { name: "Your plantings" })).toContainText("Basil");

    // The dashboard still knows the active garden.
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Persistent Plot" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Garden profile" })).toContainText("Zone 6");

    // And so do the recommendations (the profile is intact).
    await page.goto("/recommendations");
    await expect(page.getByText(/great matches? for your Zone 6 outdoor garden/)).toBeVisible();
  });

  test("the temperature unit persists across reloads", async ({ page }) => {
    await page.goto("/settings");
    await expectHydrated(page);
    await page.getByLabel("Temperature unit").selectOption("C");
    await expect.poll(async () => (await readStoredData(page))?.settings.temperatureUnit).toBe("C");
    await page.reload();
    await expectHydrated(page);
    await expect(page.getByLabel("Temperature unit")).toHaveValue("C");
  });

  test("a fresh browser context starts empty", async ({ page }) => {
    await page.goto("/");
    await expectHydrated(page);
    await expect(page.getByRole("heading", { level: 1, name: "Welcome to Garden Planner" })).toBeVisible();
    expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  });

  test("unreadable saved data is reported, backed up and does not crash the app", async ({ page }) => {
    await page.addInitScript((key) => {
      if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, "{ this is not json");
    }, STORAGE_KEY);
    await page.goto("/");
    await expectHydrated(page);

    await expect(page.getByRole("alert").filter({ hasText: "We couldn't read your saved garden data" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Welcome to Garden Planner" })).toBeVisible();
    const backups = await page.evaluate(
      (key) => Object.keys(window.localStorage).filter((k) => k.startsWith(`${key}:corrupt-backup:`)),
      STORAGE_KEY,
    );
    expect(backups).toHaveLength(1);
  });
});
