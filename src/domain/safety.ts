import type { Allergen, GardenProfile, Pet, Plant, Reason, ToxicityLevel } from "./types";
import { TOXICITY_LEVELS } from "./types";

type SafetyProfile = Pick<GardenProfile, "pets" | "allergies" | "hasChildren">;

const SEVERITY_ADVERB: Record<Exclude<ToxicityLevel, "non-toxic">, string> = {
  mild: "Mildly",
  moderate: "Moderately",
  severe: "Severely",
};

const PET_PLURAL: Record<Pet, string> = {
  cat: "cats",
  dog: "dogs",
  horse: "horses",
  bird: "birds",
  rabbit: "rabbits",
};

const ALLERGEN_LABEL: Record<Allergen, string> = {
  pollen: "pollen",
  "contact-dermatitis": "contact dermatitis (skin irritation)",
  latex: "latex-like sap",
  "strong-fragrance": "strong fragrance",
  asteraceae: "daisy-family (Asteraceae) cross-reactivity",
  nightshade: "nightshade sensitivity",
  "mold-spores": "mold spores",
};

/** Numeric rank of a toxicity level (0 = non-toxic … 3 = severe). */
export function toxicityRank(level: ToxicityLevel): number {
  return TOXICITY_LEVELS.indexOf(level);
}

/** True when the plant is non-toxic to every listed pet. */
export function isPetSafe(plant: Plant, pets: Pet[]): boolean {
  return pets.every((pet) => plant.toxicity[pet] === "non-toxic");
}

function withNotes(message: string, notes?: string): string {
  return notes ? `${message} — ${notes}` : message;
}

/*
 * Toxicity rubric (how the levels are used when rating plants and when grading issues):
 *   mild     - GI or oral irritation that is self-limiting (drooling, brief vomiting) -> warning
 *   moderate - significant systemic symptoms; a vet visit is likely                 -> blocker (pets)
 *   severe   - potentially fatal or organ damage                                     -> blocker (pets)
 * Human toxicity is rated by the part people commonly handle or eat, and is always
 * only a warning (children); toxic leaves or green parts are described in `notes`.
 */
function petIssues(plant: Plant, pets: Pet[]): Reason[] {
  const issues: Reason[] = [];
  for (const pet of pets) {
    const level = plant.toxicity[pet];
    if (level === "non-toxic") continue;
    issues.push({
      kind: toxicityRank(level) >= toxicityRank("moderate") ? "blocker" : "warning",
      topic: "pets",
      message: withNotes(`${SEVERITY_ADVERB[level]} toxic to ${PET_PLURAL[pet]}`, plant.toxicity.notes),
    });
  }
  return issues;
}

function childIssues(plant: Plant, hasChildren: boolean): Reason[] {
  const level = plant.toxicity.human;
  if (!hasChildren || level === "non-toxic") return [];
  const { notes } = plant.toxicity;
  const message = notes
    ? withNotes(`Parts of this plant are ${SEVERITY_ADVERB[level].toLowerCase()} toxic if eaten`, notes)
    : `${SEVERITY_ADVERB[level]} toxic if eaten — keep out of reach of children`;
  return [{ kind: "warning", topic: "children", message }];
}

function allergyIssues(plant: Plant, allergies: Allergen[]): Reason[] {
  return plant.allergens
    .filter((allergen) => allergies.includes(allergen))
    .map((allergen) => ({
      kind: "warning" as const,
      topic: "allergy" as const,
      message: withNotes(`May trigger your ${ALLERGEN_LABEL[allergen]} allergy`, plant.allergyNotes),
    }));
}

/** Pet, child and allergy concerns for growing this plant. Pet toxicity (moderate+) blocks; the rest warn. */
export function getSafetyIssues(plant: Plant, profile: SafetyProfile): Reason[] {
  return [
    ...petIssues(plant, profile.pets),
    ...childIssues(plant, profile.hasChildren),
    ...allergyIssues(plant, profile.allergies),
  ];
}
