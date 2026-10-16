import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZONES } from "@/data/zones";
import { climateFromZone, toDisplayTemp } from "@/domain/climate";
import { createDefaultProfile } from "@/domain/defaults";
import { makeAppData, makeGarden } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { SetupWizard } from "./SetupWizard";

vi.mock("@/data/plants", () => ({ BUILTIN_PLANTS: [] }));

const push = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));

async function next(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Next" }));
}

beforeEach(() => {
  push.mockReset();
  search = "";
});

describe("SetupWizard (new garden)", () => {
  it("starts on the basics step with a progress indicator", async () => {
    renderWithAppData(<SetupWizard />);
    expect(await screen.findByRole("heading", { level: 1, name: /set up a new garden/i })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 7/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByLabelText("Garden name")).toBeInTheDocument();
  });

  it("blocks Next until the garden has a name", async () => {
    const user = userEvent.setup();
    renderWithAppData(<SetupWizard />);
    await screen.findByLabelText("Garden name");
    await next(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/name/i);
    expect(screen.getByText(/Step 1 of 7/)).toBeInTheDocument();
    await user.type(screen.getByLabelText("Garden name"), "Patio");
    await next(user);
    expect(screen.getByText(/Step 2 of 7/)).toBeInTheDocument();
  });

  it("walks through every step and creates the garden", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<SetupWizard />);
    await user.type(await screen.findByLabelText("Garden name"), "Sunroom");
    await user.click(screen.getByRole("radio", { name: /indoor garden/i }));
    await next(user);

    // climate
    await user.selectOptions(screen.getByLabelText("USDA hardiness zone"), "5");
    expect(screen.getByLabelText("Indoor light level")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Indoor light level"), "low");
    await next(user);

    // space
    await user.selectOptions(screen.getByLabelText(/potting medium/i), "potting-mix");
    await next(user);

    // tools
    await user.click(screen.getByRole("button", { name: /Grow light/ }));
    await next(user);

    // grow
    await user.click(screen.getByRole("button", { name: "Herbs" }));
    await next(user);

    // safety
    await user.click(screen.getByRole("button", { name: /Cat/ }));
    await user.click(screen.getByRole("button", { name: /Pollen/ }));
    await user.click(screen.getByRole("checkbox", { name: /children/i }));
    await next(user);

    // review
    expect(screen.getByRole("heading", { level: 2, name: "Review" })).toBeInTheDocument();
    expect(screen.getByText("Sunroom")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create garden" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/recommendations"));
    const saved = getData();
    expect(saved.gardens).toHaveLength(1);
    const garden = saved.gardens[0];
    expect(saved.activeGardenId).toBe(garden.id);
    expect(garden.name).toBe("Sunroom");
    expect(garden.profile).toMatchObject({
      setting: "indoor",
      containersOnly: true,
      soilType: "potting-mix",
      interests: ["herb"],
      pets: ["cat"],
      allergies: ["pollen"],
      hasChildren: true,
    });
    expect(garden.profile.climate.hardinessZone).toBe(5);
    expect(garden.profile.indoor.light).toBe("low");
    expect(garden.profile.tools).toContain("grow-light");
  });

  it("lets users jump back from the review step to fix something", async () => {
    const user = userEvent.setup();
    renderWithAppData(<SetupWizard />);
    await user.type(await screen.findByLabelText("Garden name"), "A");
    for (let i = 0; i < 6; i++) await next(user);
    await user.click(screen.getByRole("button", { name: "Edit Basics" }));
    expect(screen.getByLabelText("Garden name")).toHaveValue("A");
  });

  it("honours ?new=1 even when a garden exists", async () => {
    search = "new=1";
    renderWithAppData(<SetupWizard />, { data: makeAppData([makeGarden({ name: "Old" })]) });
    expect(await screen.findByRole("heading", { level: 1, name: /new garden/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Garden name")).toHaveValue("");
  });
});

describe("SetupWizard climate step", () => {
  async function toClimate(options: Parameters<typeof renderWithAppData>[1] = {}, lookupZone?: React.ComponentProps<typeof SetupWizard>["lookupZone"]) {
    const user = userEvent.setup();
    const view = renderWithAppData(<SetupWizard lookupZone={lookupZone} />, options);
    await user.type(await screen.findByLabelText("Garden name"), "G");
    await next(user);
    return { user, ...view };
  }

  it("selecting a zone auto-fills frost dates and temperatures (and the user can override)", async () => {
    const { user } = await toClimate();
    await user.selectOptions(screen.getByLabelText("USDA hardiness zone"), "5");
    expect(screen.getByLabelText("Last spring frost month")).toHaveValue("05");
    expect(screen.getByLabelText("Last spring frost day")).toHaveValue("10");
    expect(screen.getByLabelText("First fall frost month")).toHaveValue("10");
    expect(screen.getByLabelText("Typical winter low (°F)")).toHaveValue(-20);
    expect(screen.getByLabelText("Typical summer high (°F)")).toHaveValue(climateFromZone(5, ZONES).summerHighF);

    await user.selectOptions(screen.getByLabelText("Last spring frost month"), "06");
    expect(screen.getByLabelText("Last spring frost month")).toHaveValue("06");
  });

  it("frost-free disables the frost-date selects", async () => {
    const { user } = await toClimate();
    await user.click(screen.getByRole("checkbox", { name: /frost-free/i }));
    expect(screen.getByLabelText("Last spring frost month")).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("USDA hardiness zone"), "11");
    expect(screen.getByRole("checkbox", { name: /frost-free/i })).toBeChecked();
  });

  it("shows temperatures in the user's unit and stores °F", async () => {
    const data = makeAppData([], { settings: { temperatureUnit: "C" } });
    const { user, getData } = await toClimate({ data });
    const low = screen.getByLabelText("Typical winter low (°C)");
    expect(low).toHaveValue(toDisplayTemp(createDefaultProfile().climate.winterLowF, "C"));
    await user.clear(low);
    await user.type(low, "-20");
    expect(low).toHaveValue(-20);
    for (let i = 0; i < 5; i++) await next(user);
    expect(screen.getByText("-20°C")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create garden" }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(getData().gardens[0].profile.climate.winterLowF).toBe(-4);
  });

  it("zip lookup applies the zone, and shows an error message on failure", async () => {
    const lookup = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, zone: 6, label: "6b" })
      .mockResolvedValueOnce({ ok: false, error: "We couldn't find that ZIP code." });
    const { user } = await toClimate({}, lookup);
    await user.type(screen.getByLabelText(/ZIP code/), "02134");
    await user.click(screen.getByRole("button", { name: "Look up zone" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/zone 6b/);
    expect(lookup).toHaveBeenCalledWith("02134");
    expect(screen.getByLabelText("USDA hardiness zone")).toHaveValue("6");

    await user.click(screen.getByRole("button", { name: "Look up zone" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't find/i);
    expect(screen.getByLabelText("USDA hardiness zone")).toHaveValue("6");
  });

  it("shows an error and blocks continuing when a temperature is cleared", async () => {
    const { user } = await toClimate();
    await user.clear(screen.getByLabelText("Typical summer high (°F)"));
    await next(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a summer high temperature.");
    expect(screen.getByLabelText("Typical summer high (°F)")).toHaveValue(null);
    expect(screen.getByRole("heading", { level: 2, name: /climate/i })).toBeInTheDocument();
  });

  it("rejects an impossible frost combination of temperatures", async () => {
    const { user } = await toClimate();
    const low = screen.getByLabelText("Typical winter low (°F)");
    await user.clear(low);
    await user.type(low, "120");
    await next(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/colder than/i);
  });
});

describe("SetupWizard (editing)", () => {
  const existing = makeGarden({
    id: "g1",
    name: "Backyard",
    profile: createDefaultProfile({ pets: ["dog"], weeklyHours: 6 }),
  });

  it("pre-fills from the active garden and updates it on save", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<SetupWizard />, { data: makeAppData([existing]) });
    const name = await screen.findByLabelText("Garden name");
    expect(name).toHaveValue("Backyard");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Edit setup: Backyard");

    await user.clear(name);
    await user.type(name, "Front yard");
    for (let i = 0; i < 6; i++) await next(user);
    expect(screen.getByText("Dog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/recommendations"));
    const saved = getData();
    expect(saved.gardens).toHaveLength(1);
    expect(saved.gardens[0]).toMatchObject({ id: "g1", name: "Front yard" });
    expect(saved.gardens[0].profile.pets).toEqual(["dog"]);
    expect(saved.gardens[0].profile.weeklyHours).toBe(6);
  });

  it("'Start a new garden instead' switches to a blank form that adds a second garden", async () => {
    const user = userEvent.setup();
    const { getData } = renderWithAppData(<SetupWizard />, { data: makeAppData([existing]) });
    await user.click(await screen.findByRole("button", { name: /start a new garden instead/i }));
    const name = screen.getByLabelText("Garden name");
    expect(name).toHaveValue("");
    await user.type(name, "Balcony");
    for (let i = 0; i < 6; i++) await next(user);
    await user.click(screen.getByRole("button", { name: "Create garden" }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    const saved = getData();
    expect(saved.gardens.map((g) => g.name)).toEqual(["Backyard", "Balcony"]);
    expect(saved.activeGardenId).toBe(saved.gardens[1].id);
  });

  it("offers to switch back to editing", async () => {
    const user = userEvent.setup();
    renderWithAppData(<SetupWizard />, { data: makeAppData([existing]) });
    await user.click(await screen.findByRole("button", { name: /start a new garden instead/i }));
    await user.click(screen.getByRole("button", { name: /edit backyard instead/i }));
    expect(screen.getByLabelText("Garden name")).toHaveValue("Backyard");
  });
});

describe("SetupWizard tools step", () => {
  it("groups tools by category and notes that missing tools never exclude plants", async () => {
    const user = userEvent.setup();
    renderWithAppData(<SetupWizard />);
    await user.type(await screen.findByLabelText("Garden name"), "G");
    await next(user);
    await next(user);
    await next(user);
    expect(screen.getByText(/never exclude/i)).toBeInTheDocument();
    const watering = screen.getByRole("group", { name: /Watering/ });
    expect(within(watering).getByRole("button", { name: /Watering can \(\$\)/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(watering).getByRole("button", { name: /Drip irrigation \(\$\$\$\)/ })).toHaveAttribute("aria-pressed", "false");
  });
});
