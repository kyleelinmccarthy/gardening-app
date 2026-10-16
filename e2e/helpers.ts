import { expect, test as base, type Locator, type Page } from "@playwright/test";
import { createBed, createDefaultProfile, createGarden } from "@/domain/defaults";
import type { AppData, Bed, CareLogEntry, Garden, GardenProfile, Planting, Reminder } from "@/domain/types";
import { createEmptyAppData } from "@/storage/schema";

export const STORAGE_KEY = "garden-planner:v1";

// ---------------------------------------------------------------------------
// Console error collection
// ---------------------------------------------------------------------------

/**
 * `test` with an automatic fixture that records `pageerror` events and
 * `console.error` messages for every page in the test, and fails the test
 * if any were logged.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
      });
      await use(errors);
      expect(errors, "no uncaught exceptions or console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Local ISO date (YYYY-MM-DD), `daysAgo` days before today. */
export function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

export interface SeedGardenOptions {
  id?: string;
  name?: string;
  profile?: Partial<GardenProfile>;
  beds?: Bed[];
  plantings?: Planting[];
  careLog?: CareLogEntry[];
  reminders?: Reminder[];
  /** Overrides applied to the top-level AppData (e.g. settings). */
  app?: Partial<AppData>;
}

/** A schema-valid AppData with one active garden. */
export function buildAppData(options: SeedGardenOptions = {}): AppData {
  const profile: GardenProfile = createDefaultProfile({
    interests: [],
    goals: ["edible"],
    tools: ["hand-trowel", "watering-can", "garden-gloves"],
    ...options.profile,
  });
  const garden: Garden = {
    ...createGarden(options.name ?? "Seeded Garden", profile, options.id ?? "garden-seed"),
    beds: options.beds ?? [],
    plantings: options.plantings ?? [],
    careLog: options.careLog ?? [],
    reminders: options.reminders ?? [],
  };
  return { ...createEmptyAppData(), gardens: [garden], activeGardenId: garden.id, ...options.app };
}

export function makeBed(overrides: Partial<Bed> = {}): Bed {
  return { ...createBed({ name: "Seed bed", kind: "raised-bed", columns: 4, rows: 3, sun: "full-sun" }, "bed-seed"), ...overrides };
}

export function makePlanting(plantId: string, overrides: Partial<Planting> = {}): Planting {
  return {
    id: `planting-${plantId}`,
    plantId,
    quantity: 1,
    plantedOn: isoDaysAgo(0),
    status: "growing",
    inContainer: false,
    ...overrides,
  };
}

/**
 * Writes AppData into localStorage before the app boots, so a test can skip the
 * setup wizard. Only writes when nothing is stored yet, so reloads within the
 * test keep (and do not clobber) whatever the app has saved since.
 */
export async function seedAppData(page: Page, data: AppData): Promise<void> {
  await page.addInitScript(
    ([key, json]) => {
      if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, json);
    },
    [STORAGE_KEY, JSON.stringify(data)] as const,
  );
}

/** Seeds a single outdoor (by default) garden. */
export async function seedGarden(page: Page, options: SeedGardenOptions = {}): Promise<AppData> {
  const data = buildAppData(options);
  await seedAppData(page, data);
  return data;
}

/** Reads the saved AppData back out of the page's localStorage. */
export async function readStoredData(page: Page): Promise<AppData | null> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  return raw === null ? null : (JSON.parse(raw) as AppData);
}

// ---------------------------------------------------------------------------
// Generic UI helpers
// ---------------------------------------------------------------------------

/** Waits until the app has hydrated (the layout's client provider replaces loading placeholders). */
export async function expectHydrated(page: Page): Promise<void> {
  await expect(page.getByText("Loading…")).toHaveCount(0);
}

/** Opens the mobile menu when the desktop nav is hidden, and returns the visible main navigation. */
export async function openNav(page: Page): Promise<Locator> {
  const desktop = page.getByRole("navigation", { name: "Main", exact: true });
  if (await desktop.isVisible()) return desktop;
  // Only toggle the menu when it is closed (clicking the summary of an open menu would close it).
  const menu = page.locator("details", { has: page.locator("summary", { hasText: "Menu" }) });
  if ((await menu.getAttribute("open")) === null) await menu.locator("summary").click();
  const mobile = page.getByRole("navigation", { name: "Main (mobile)" });
  await expect(mobile).toBeVisible();
  return mobile;
}

/** Navigates with the main navigation (desktop links or the mobile menu). */
export async function navigateTo(page: Page, linkName: string): Promise<void> {
  const nav = await openNav(page);
  await nav.getByRole("link", { name: linkName }).click();
}

/** Ensures a toggle chip (aria-pressed button) inside a labelled group is in the wanted state. */
export async function setChip(page: Page, groupName: string | RegExp, chipName: string | RegExp, pressed = true): Promise<void> {
  const chip = page.getByRole("group", { name: groupName }).getByRole("button", { name: chipName });
  await expect(chip).toBeVisible();
  if ((await chip.getAttribute("aria-pressed")) !== String(pressed)) await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", String(pressed));
}

// ---------------------------------------------------------------------------
// Setup wizard
// ---------------------------------------------------------------------------

export interface SetupOptions {
  name: string;
  setting?: "outdoor" | "indoor";
  /** USDA zone number (outdoor and indoor gardens both ask for it). */
  zone?: number;
  /** Outdoor: label of the sun exposure card, e.g. "Full sun". */
  sun?: string;
  /** Indoor: label of the light level, e.g. "Low light". */
  indoorLight?: string;
  /** Tool names to turn on, e.g. ["Pruners"]. Default tools stay selected unless listed in `withoutTools`. */
  tools?: string[];
  withoutTools?: string[];
  /** Category labels, e.g. ["Vegetables", "Herbs"]. */
  interests?: string[];
  /** Goal labels. When given, replaces nothing: only adds. */
  goals?: string[];
  experience?: "Beginner" | "Intermediate" | "Advanced";
  pets?: string[];
  allergies?: string[];
  children?: boolean;
  containersOnly?: boolean;
}

async function next(page: Page, expectedStep: string): Promise<void> {
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { level: 2, name: expectedStep })).toBeVisible();
}

/** Walks the whole setup wizard on /setup and submits it; resolves once /recommendations has loaded. */
export async function completeSetup(page: Page, options: SetupOptions): Promise<void> {
  const setting = options.setting ?? "outdoor";
  await page.goto("/setup");
  await expect(page.getByRole("heading", { level: 1, name: "Set up a new garden" })).toBeVisible();

  // 1. Basics
  await page.getByLabel("Garden name").fill(options.name);
  await page.getByRole("radio", { name: setting === "indoor" ? /Indoor garden/ : /Outdoor garden/ }).check();
  await next(page, "Climate");

  // 2. Climate
  if (options.zone !== undefined) {
    await page.getByLabel("USDA hardiness zone").selectOption(String(options.zone));
  }
  if (setting === "indoor" && options.indoorLight) {
    await page.getByLabel("Indoor light level").selectOption({ label: options.indoorLight });
  }
  await next(page, "Space & soil");

  // 3. Space & soil
  if (setting === "outdoor" && options.sun) {
    await page.getByRole("radio", { name: new RegExp(options.sun) }).check();
  }
  if (options.containersOnly) await page.getByLabel("Containers only").check();
  await next(page, "Tools");

  // 4. Tools
  for (const tool of options.tools ?? []) {
    await setChip(page, /: I have$/, new RegExp(`^${tool}`), true);
  }
  for (const tool of options.withoutTools ?? []) {
    await setChip(page, /: I have$/, new RegExp(`^${tool}`), false);
  }
  await next(page, "What to grow");

  // 5. What to grow
  for (const interest of options.interests ?? []) await setChip(page, "What do you want to grow?", interest, true);
  for (const goal of options.goals ?? []) await setChip(page, "Your goals", goal, true);
  if (options.experience) await page.getByRole("radio", { name: new RegExp(options.experience) }).check();
  await next(page, "Household");

  // 6. Household
  for (const pet of options.pets ?? []) await setChip(page, "Pets that can reach the garden", pet, true);
  for (const allergy of options.allergies ?? []) await setChip(page, "Allergies or sensitivities", new RegExp(`^${allergy}`), true);
  if (options.children) await page.getByLabel("Young children in the household").check();
  await next(page, "Review");

  // 7. Review & create
  await expect(page.getByRole("region", { name: "Basics" })).toContainText(options.name);
  await page.getByRole("button", { name: "Create garden" }).click();
  await expect(page).toHaveURL(/\/recommendations$/);
  await expect(page.getByRole("heading", { level: 1, name: "Recommended for you" })).toBeVisible();
}
