/** Pure helpers behind the pet / allergen badges (kept out of the components so they are easy to test). */
import { PET_EMOJI, PET_LABELS } from "@/lib/labels";
import { toxicityRank } from "@/domain/safety";
import type { Allergen, Pet, Plant } from "@/domain/types";
import type { BadgeTone } from "@/components/ui";

export interface SafetyBadge {
  tone: BadgeTone;
  label: string;
}

const plural = (pet: Pet) => `${PET_LABELS[pet].toLowerCase()}s`;

/** "Safe for 🐱🐶" / "⚠ Toxic to cats"; null when the garden has no pets. */
export function petSafetyBadge(plant: Plant, pets: readonly Pet[]): SafetyBadge | null {
  if (pets.length === 0) return null;
  const toxicTo = pets.filter((p) => plant.toxicity[p] !== "non-toxic");
  if (toxicTo.length === 0) {
    return { tone: "success", label: `Safe for ${pets.map((p) => PET_EMOJI[p]).join("")}` };
  }
  const serious = toxicTo.some((p) => toxicityRank(plant.toxicity[p]) >= toxicityRank("moderate"));
  return { tone: serious ? "danger" : "warning", label: `⚠ Toxic to ${toxicTo.map(plural).join(", ")}` };
}

/** Allergens of this plant that the user is sensitive to (in the plant's order). */
export function matchingAllergens(plant: Plant, allergies: readonly Allergen[]): Allergen[] {
  return plant.allergens.filter((a) => allergies.includes(a));
}

/** The pets whose toxicity level is above non-toxic, for highlighting. */
export function toxicPets(plant: Plant, pets: readonly Pet[]): Pet[] {
  return pets.filter((p) => plant.toxicity[p] !== "non-toxic");
}
