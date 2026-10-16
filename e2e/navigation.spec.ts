import { expect, expectHydrated, navigateTo, openNav, seedGarden, test } from "./helpers";

const PAGES = [
  { link: "Dashboard", path: "/", h1: "Welcome to Garden Planner" },
  { link: "Garden Setup", path: "/setup", h1: "Set up a new garden" },
  { link: "Recommendations", path: "/recommendations", h1: "Recommended for you" },
  { link: "Plant Library", path: "/plants", h1: "Plant library" },
  { link: "Planner", path: "/planner", h1: "Garden planner" },
  { link: "Calendar", path: "/calendar", h1: "Planting calendar" },
  { link: "Care", path: "/care", h1: "Care hub" },
  { link: "Guides", path: "/guides", h1: "Gardening guides" },
  { link: "Settings", path: "/settings", h1: "Settings" },
] as const;

test.describe("navigation (no garden yet)", () => {
  test("every nav link loads its page with the right heading", async ({ page }) => {
    await page.goto("/plants");
    await expectHydrated(page);

    for (const { link, path, h1 } of PAGES) {
      await navigateTo(page, link);
      await expect(page).toHaveURL(path === "/" ? /\/$/ : new RegExp(`${path}$`));
      // Exactly one h1 per page.
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      await expectHydrated(page);
    }
  });

  test("garden-scoped pages prompt for setup when there is no garden", async ({ page }) => {
    for (const path of ["/planner", "/calendar", "/care"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "Set up your garden first" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Set up my garden" })).toHaveAttribute("href", "/setup");
    }
  });

  test("the current page is marked in the navigation", async ({ page }) => {
    await page.goto("/guides");
    await expectHydrated(page);
    const nav = await openNav(page);
    await expect(nav.getByRole("link", { name: "Guides" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Settings" })).not.toHaveAttribute("aria-current", "page");
  });
});

test.describe("navigation (with a garden)", () => {
  test.beforeEach(async ({ page }) => {
    await seedGarden(page, { name: "Nav Garden" });
  });

  test("every nav link loads its page with the right heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Nav Garden" })).toBeVisible();

    const expectations = PAGES.map((p) =>
      p.link === "Dashboard"
        ? { ...p, h1: "Nav Garden" }
        : p.link === "Garden Setup"
          ? { ...p, h1: "Edit setup: Nav Garden" }
          : p,
    );
    for (const { link, path, h1 } of expectations) {
      await navigateTo(page, link);
      await expect(page).toHaveURL(path === "/" ? /\/$/ : new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      await expectHydrated(page);
    }
  });

  test("unknown routes show the friendly not-found page", async ({ page, consoleErrors }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    // The browser logs the 404 document load itself; that is the only error we expect here.
    await expect(page.getByRole("heading", { level: 1, name: "This page has wilted" })).toBeVisible();
    expect(consoleErrors.splice(0)).toEqual(["console.error: Failed to load resource: the server responded with a status of 404 (Not Found)"]);
    await expect(page.getByRole("heading", { level: 1, name: "This page has wilted" })).toBeVisible();
    await page.getByRole("link", { name: "Back to the dashboard" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("an unknown plant id shows a not-found message", async ({ page }) => {
    await page.goto("/plants/definitely-not-a-plant");
    await expect(page.getByRole("heading", { level: 1, name: "Plant not found" })).toBeVisible();
  });
});
