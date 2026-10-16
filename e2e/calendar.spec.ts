import { expect, expectHydrated, makePlanting, seedGarden, test } from "./helpers";

// Fix "today" in the browser so the Upcoming tab and the "Today" marker are deterministic.
const TODAY = new Date(2026, 4, 4, 12, 0, 0); // 4 May 2026

test.describe("planting calendar", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
    await seedGarden(page, {
      name: "Calendar Garden",
      // Zone 7 default: last frost Apr 15, first frost Oct 25.
      plantings: [
        makePlanting("tomato", { plantedOn: "2026-05-01" }),
        makePlanting("bush-bean", { plantedOn: "2026-05-01" }),
      ],
    });
  });

  test("timeline shows a row of bars per planted vegetable and the frost markers", async ({ page }) => {
    await page.goto("/calendar");
    await expectHydrated(page);

    await expect(page.getByRole("tab", { name: "Timeline" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("group", { name: "Tomato schedule" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Bush Bean schedule" })).toBeVisible();

    // Bars are exposed as images with a description of the window.
    const tomatoBars = page.getByRole("group", { name: "Tomato schedule" }).getByRole("img");
    await expect(tomatoBars.first()).toBeVisible();
    expect(await tomatoBars.count()).toBeGreaterThanOrEqual(2);
    await expect(page.getByRole("group", { name: "Tomato schedule" }).getByRole("img", { name: /Tomato: Start seeds indoors/ })).toBeVisible();
    await expect(page.getByRole("group", { name: "Tomato schedule" }).getByRole("img", { name: /Tomato: Transplant/ })).toBeVisible();
    await expect(page.getByRole("group", { name: "Tomato schedule" }).getByRole("img", { name: /Tomato: Harvest/ })).toBeVisible();

    // Frost markers and the today marker are described in text, and drawn as titled lines.
    await expect(page.getByText(/Last frost Apr 15 · First frost Oct 25/)).toBeVisible();
    await expect(page.getByText(/Today May 4/)).toBeVisible();
    await expect(page.locator('[title="Last frost Apr 15"]').first()).toBeAttached();
    await expect(page.locator('[title="First frost Oct 25"]').first()).toBeAttached();

    // The legend lists every kind of window.
    const legend = page.getByRole("list", { name: "Legend" });
    for (const label of ["Start seeds indoors", "Transplant", "Direct sow", "Fall sowing", "Harvest"]) {
      await expect(legend).toContainText(label);
    }
  });

  test("the By month tab lists each month's events", async ({ page }) => {
    await page.goto("/calendar");
    await expectHydrated(page);
    await page.getByRole("tab", { name: "By month" }).click();
    await expect(page.getByRole("tab", { name: "By month" })).toHaveAttribute("aria-selected", "true");

    const may = page.getByRole("region", { name: "May 2026" });
    await expect(may).toBeVisible();
    await expect(may.getByRole("link", { name: /Tomato/ }).first()).toBeVisible();
    await expect(may).toContainText("Transplant");
    // Twelve month cards, and winter months have nothing planned.
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(12);
    await expect(page.getByRole("region", { name: "January 2026" })).toContainText("Nothing scheduled.");
  });

  test("the Upcoming tab lists what is open now or starts soon", async ({ page }) => {
    await page.goto("/calendar");
    await expectHydrated(page);
    await page.getByRole("tab", { name: "Upcoming" }).click();

    const upcoming = page.getByRole("list", { name: "Next 30 days" });
    await expect(upcoming).toBeVisible();
    await expect(upcoming.getByRole("listitem").first()).toBeVisible();
    await expect(upcoming.getByRole("link", { name: /Tomato|Bush Bean/ }).first()).toBeVisible();
    await expect(upcoming).toContainText(/Open now, until|Starts (today|tomorrow|in \d+ days)/);
  });

  test("plants can be toggled, added and the year changed", async ({ page }) => {
    await page.goto("/calendar");
    await expectHydrated(page);

    const chips = page.getByRole("group", { name: "Calendar plants" });
    await expect(chips.getByRole("button", { name: "Tomato" })).toHaveAttribute("aria-pressed", "true");

    // Remove a plant from the calendar.
    await chips.getByRole("button", { name: "Bush Bean" }).click();
    await expect(page.getByRole("group", { name: "Bush Bean schedule" })).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Tomato schedule" })).toBeVisible();

    // Add another plant from the select.
    await page.getByLabel("Add another plant").selectOption({ label: "🥕 Carrot" });
    await expect(page.getByRole("group", { name: "Carrot schedule" })).toBeVisible();

    // Next year's calendar has no "today" marker.
    await page.getByLabel("Year").selectOption("2027");
    await expect(page.getByText(/Today May 4/)).toHaveCount(0);
    await expect(page.getByText(/Last frost Apr 15/)).toBeVisible();
  });
});

test.describe("planting calendar (frost-free climate)", () => {
  test("has no frost markers", async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
    await seedGarden(page, {
      name: "Tropical",
      profile: { climate: { hardinessZone: 11, lastFrost: null, firstFrost: null, summerHighF: 90, winterLowF: 50, humidity: "high" } },
      plantings: [makePlanting("basil", { plantedOn: "2026-05-01" })],
    });
    await page.goto("/calendar");
    await expectHydrated(page);
    await expect(page.getByText(/Frost-free climate: no frost markers/)).toBeVisible();
    await expect(page.getByRole("group", { name: "Basil schedule" })).toBeVisible();
  });
});
