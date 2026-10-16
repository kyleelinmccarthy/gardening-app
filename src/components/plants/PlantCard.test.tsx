import { screen, within } from "@testing-library/react";
import { createDefaultProfile } from "@/domain/defaults";
import { evaluatePlant } from "@/domain/recommendation";
import { makeAppData, makeGarden, makePlant } from "@/test/fixtures";
import { renderWithAppData } from "@/test/render";
import { PlantCard } from "./PlantCard";

vi.mock("@/data/plants", () => ({ BUILTIN_PLANTS: [] }));

const lily = makePlant({
  id: "lily",
  name: "Lily",
  emoji: "🌸",
  scientificName: "Lilium",
  category: "flower",
  environments: ["outdoor", "indoor"],
  toxicity: { cat: "severe", dog: "non-toxic", horse: "mild", bird: "mild", rabbit: "mild", human: "mild" },
  allergens: ["pollen"],
  container: { suitable: true, minGallons: 3 },
});

function gardenData(profile = {}) {
  return makeAppData([makeGarden({ profile: createDefaultProfile(profile) })]);
}

describe("PlantCard", () => {
  it("shows the key facts and links to the plant page", () => {
    renderWithAppData(<PlantCard plant={lily} actions={<button>Do thing</button>} />);
    const link = screen.getByRole("link", { name: /Lily/ });
    expect(link).toHaveAttribute("href", "/plants/lily");
    expect(screen.getByText("Lilium")).toBeInTheDocument();
    expect(screen.getByText("Flowers")).toBeInTheDocument();
    expect(screen.getByText(/Full sun/)).toBeInTheDocument();
    expect(screen.getByText(/Container-friendly/)).toBeInTheDocument();
    expect(screen.getByText(/Indoor-capable/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do thing" })).toBeInTheDocument();
  });

  it("warns about toxicity to the garden's pets and matching allergens", async () => {
    renderWithAppData(<PlantCard plant={lily} />, { data: gardenData({ pets: ["cat"], allergies: ["pollen"] }) });
    expect(await screen.findByText(/Toxic to cats/)).toBeInTheDocument();
    expect(screen.getByText(/Allergen: Pollen/)).toBeInTheDocument();
  });

  it("shows a pet-safe badge when no pet is at risk", async () => {
    renderWithAppData(<PlantCard plant={lily} />, { data: gardenData({ pets: ["dog"] }) });
    expect(await screen.findByText("Safe for 🐶")).toBeInTheDocument();
  });

  it("shows no safety badges without pets or allergies", () => {
    renderWithAppData(<PlantCard plant={lily} />);
    expect(screen.queryByText(/Toxic to/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Safe for/)).not.toBeInTheDocument();
  });

  it("marks custom plants", () => {
    renderWithAppData(<PlantCard plant={{ ...lily, custom: true }} />);
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("shows verdict, score and only the top two reasons, with the rest expandable", () => {
    const profile = createDefaultProfile({ goals: ["edible"], tools: ["hand-trowel"] });
    const plant = makePlant({ id: "tomato", name: "Tomato", requiredTools: ["tomato-cage"], goals: ["edible"], helpfulTools: ["hand-trowel"] });
    const recommendation = evaluatePlant(plant, profile);
    expect(recommendation.reasons.length).toBeGreaterThan(2);
    renderWithAppData(<PlantCard plant={plant} recommendation={recommendation} expandable />);
    const card = screen.getByRole("link", { name: /Tomato/ }).closest("section")!;
    expect(within(card).getByText(new RegExp(String(recommendation.score)))).toBeInTheDocument();
    expect(within(card).getByText(/Great match|Good match|Possible/)).toBeInTheDocument();
    const shown = within(card).getAllByRole("listitem");
    // two summarised reasons (full list lives inside <details>, which is closed)
    expect(shown.length).toBe(2 + recommendation.reasons.length);
    expect(within(card).getByText(/All \d+ reasons/)).toBeInTheDocument();
    // the top reason is the warning about the missing required tool
    expect(within(card).getAllByText(/tomato cage/i).length).toBeGreaterThan(0);
  });
});
