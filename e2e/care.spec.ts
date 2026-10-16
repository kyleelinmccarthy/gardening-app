import type { Page } from "@playwright/test";
import { expect, expectHydrated, isoDaysAgo, makePlanting, readStoredData, seedGarden, test } from "./helpers";

async function openCareTab(page: Page, tab: string) {
  await page.goto("/care");
  await expectHydrated(page);
  await page.getByRole("tab", { name: tab }).click();
  await expect(page.getByRole("tab", { name: tab })).toHaveAttribute("aria-selected", "true");
}

test.describe("care hub", () => {
  test("a plant added from the library and marked growing gets care tasks; Done logs it", async ({ page }) => {
    await seedGarden(page, { name: "Care Garden" });

    // Add Basil to the garden from its detail page.
    await page.goto("/plants/basil");
    await expectHydrated(page);
    await page.getByRole("button", { name: /Add to my garden/ }).click();
    await expect(page.getByText("In your garden")).toBeVisible();

    // A planned plant has no tasks yet.
    await page.goto("/care");
    await expectHydrated(page);
    await expect(page.getByText(/No tasks yet\. Mark a planting as “Growing”/)).toBeVisible();

    // Mark it growing, planted a month ago, so watering is overdue.
    await page.getByRole("tab", { name: "My plants" }).click();
    await page.getByLabel("Status of Basil").selectOption("growing");
    await expect(page.getByLabel("Status of Basil")).toHaveValue("growing");
    await page.getByLabel("Planted date of Basil").fill(isoDaysAgo(30));
    await expect(page.getByLabel("Planted date of Basil")).toHaveValue(isoDaysAgo(30));

    // Today shows the tasks.
    await page.getByRole("tab", { name: "Today" }).click();
    const due = page.getByRole("region", { name: "Due today" });
    await expect(due.getByRole("region", { name: "Water" })).toBeVisible();
    const done = due.getByRole("button", { name: /^Done: Water Basil/ });
    await expect(done).toBeVisible();
    await expect(due.getByRole("button", { name: /^Done: Inspect Basil for pests/ })).toBeVisible();
    await expect(due.getByText(/overdue/i).first()).toBeVisible();

    // Mark watering done: the task leaves the due list...
    await done.click();
    await expect(due.getByRole("button", { name: /^Done: Water Basil/ })).toHaveCount(0);

    // ...and is logged in the care log.
    await page.getByRole("tab", { name: "Care log" }).click();
    const log = page.getByRole("list", { name: "Care log" });
    await expect(log.getByRole("listitem")).toHaveCount(1);
    await expect(log.getByRole("listitem").first()).toContainText("Water");
    await expect(log.getByRole("listitem").first()).toContainText("Basil");

    await expect
      .poll(async () => (await readStoredData(page))?.gardens[0].careLog.map((e) => [e.type, e.date]))
      .toEqual([["water", isoDaysAgo(0)]]);

    // My plants reports the last watering.
    await page.getByRole("tab", { name: "My plants" }).click();
    await expect(page.getByText("Last watered").locator("xpath=following-sibling::dd")).not.toHaveText("not logged yet");
  });

  test("logs care manually and from a planting, and filters the history", async ({ page }) => {
    await seedGarden(page, { plantings: [makePlanting("basil", { plantedOn: isoDaysAgo(5) })] });
    await openCareTab(page, "My plants");
    await page.getByRole("button", { name: "Log watering for Basil" }).click();
    await page.getByRole("button", { name: "Log feeding for Basil" }).click();

    await page.getByRole("tab", { name: "Care log" }).click();
    const log = page.getByRole("list", { name: "Care log" });
    await expect(log.getByRole("listitem")).toHaveCount(2);

    // Manual entry for the whole garden.
    await page.getByLabel("Care type").selectOption("prune");
    await page.getByLabel("Note (optional)").fill("Trimmed the lower leaves");
    await page.getByRole("button", { name: "Add log entry" }).click();
    await expect(log.getByRole("listitem")).toHaveCount(3);
    await expect(log).toContainText("Trimmed the lower leaves");

    // Filter by type.
    await page.getByLabel("Filter by type").selectOption("prune");
    await expect(log.getByRole("listitem")).toHaveCount(1);
    await page.getByLabel("Filter by type").selectOption("");
    await expect(log.getByRole("listitem")).toHaveCount(3);

    // Delete an entry (inline confirmation).
    await log.getByRole("button", { name: /^Delete Prune entry/ }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();
    await expect(log.getByRole("listitem")).toHaveCount(2);
  });

  test("creates a repeating reminder, which shows up today and reschedules when done", async ({ page }) => {
    await seedGarden(page);
    await openCareTab(page, "Reminders");
    await expect(page.getByText("No reminders yet.")).toBeVisible();

    await page.getByLabel("Title").fill("Prune the roses");
    await page.getByLabel("Repeat every (days)").fill("7");
    await page.getByRole("button", { name: "Add reminder" }).click();

    const list = page.getByRole("list", { name: "Reminders" });
    await expect(list.getByRole("listitem")).toHaveCount(1);
    await expect(list).toContainText("Prune the roses");
    await expect(list).toContainText("Repeats every 7 days");
    // The form is reset for the next reminder.
    await expect(page.getByLabel("Title")).toHaveValue("");

    // It is due today.
    await page.getByRole("tab", { name: "Today" }).click();
    const due = page.getByRole("region", { name: "Due today" });
    await expect(due.getByText("Prune the roses")).toBeVisible();
    await due.getByRole("button", { name: "Done: Prune the roses" }).click();
    await expect(due.getByText("Prune the roses")).toHaveCount(0);

    // A repeating reminder is not finished: it moves a week ahead and appears under Upcoming.
    const upcoming = page.getByRole("list", { name: "Upcoming tasks" });
    await expect(upcoming).toContainText("Prune the roses");
    await expect
      .poll(async () => {
        const r = (await readStoredData(page))?.gardens[0].reminders[0];
        return r && { done: r.done, repeatDays: r.repeatDays, moved: r.dueDate > isoDaysAgo(0) };
      })
      .toEqual({ done: false, repeatDays: 7, moved: true });
  });

  test("a one-off reminder can be completed, edited and deleted", async ({ page }) => {
    await seedGarden(page);
    await openCareTab(page, "Reminders");
    await page.getByLabel("Title").fill("Buy mulch");
    await page.getByRole("button", { name: "Add reminder" }).click();
    const list = page.getByRole("list", { name: "Reminders" });
    await expect(list).toContainText("Buy mulch");

    await list.getByRole("button", { name: "Edit Buy mulch" }).click();
    await list.getByLabel("Title").fill("Buy cedar mulch");
    await list.getByRole("button", { name: "Save reminder" }).click();
    await expect(list).toContainText("Buy cedar mulch");

    await list.getByRole("checkbox", { name: "Done: Buy cedar mulch" }).check();
    await expect(list.getByRole("checkbox", { name: "Done: Buy cedar mulch" })).toBeChecked();

    await list.getByRole("button", { name: "Delete Buy cedar mulch" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();
    await expect(page.getByText("No reminders yet.")).toBeVisible();
  });

  test("a reminder needs a title", async ({ page }) => {
    await seedGarden(page);
    await openCareTab(page, "Reminders");
    await page.getByRole("button", { name: "Add reminder" }).click();
    await expect(page.getByText("Give the reminder a title.")).toBeVisible();
  });

  test("adds, edits and deletes a journal entry", async ({ page }) => {
    await seedGarden(page, { plantings: [makePlanting("tomato", { plantedOn: isoDaysAgo(10) })] });
    await openCareTab(page, "Journal");
    await expect(page.getByText(/No journal entries yet/)).toBeVisible();

    await page.getByLabel("Entry title").fill("First tomatoes!");
    await page.getByLabel("Entry text").fill("Three green fruits on the lowest truss.");
    await page.getByLabel("Plant (optional)").selectOption({ label: "Tomato" });
    await page.getByRole("button", { name: "Add entry" }).click();

    const entries = page.getByRole("list", { name: "Journal entries" });
    await expect(entries.getByRole("heading", { name: "First tomatoes!" })).toBeVisible();
    await expect(entries).toContainText("Three green fruits on the lowest truss.");
    await expect(entries.getByRole("link", { name: /Tomato/ })).toBeVisible();
    // The form is reset.
    await expect(page.getByLabel("Entry title")).toHaveValue("");

    await entries.getByRole("button", { name: "Edit First tomatoes!" }).click();
    await entries.getByLabel("Entry title").fill("First tomatoes ripen");
    await entries.getByRole("button", { name: "Save entry" }).click();
    await expect(entries.getByRole("heading", { name: "First tomatoes ripen" })).toBeVisible();

    await expect
      .poll(async () => (await readStoredData(page))?.gardens[0].journal.map((j) => j.title))
      .toEqual(["First tomatoes ripen"]);

    await entries.getByRole("button", { name: "Delete First tomatoes ripen" }).click();
    await page.getByRole("button", { name: "Yes, delete" }).click();
    await expect(page.getByText(/No journal entries yet/)).toBeVisible();
  });

  test("a journal entry needs a title", async ({ page }) => {
    await seedGarden(page);
    await openCareTab(page, "Journal");
    await page.getByRole("button", { name: "Add entry" }).click();
    await expect(page.getByText("Give the entry a title.")).toBeVisible();
  });

  test("the dashboard shows due tasks and can complete them", async ({ page }) => {
    await seedGarden(page, { name: "Dash Garden", plantings: [makePlanting("basil", { plantedOn: isoDaysAgo(30) })] });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Dash Garden" })).toBeVisible();
    await expect(page.getByLabel("Summary")).toContainText("Plants growing");
    const done = page.getByRole("button", { name: /^Mark done: Water Basil/ });
    await expect(done).toBeVisible();
    await done.click();
    await expect(page.getByRole("button", { name: /^Mark done: Water Basil/ })).toHaveCount(0);
    await expect.poll(async () => (await readStoredData(page))?.gardens[0].careLog.length).toBe(1);
  });
});
