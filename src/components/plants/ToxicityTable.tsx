import { Badge, type BadgeTone } from "@/components/ui";
import type { Pet, Plant, ToxicityLevel } from "@/domain/types";
import { cn } from "@/lib/cn";
import { PET_EMOJI, PET_LABELS, TOXICITY_LABELS } from "@/lib/labels";

const TONES: Record<ToxicityLevel, BadgeTone> = {
  "non-toxic": "success",
  mild: "warning",
  moderate: "danger",
  severe: "danger",
};

const SPECIES: readonly { key: Pet | "human"; label: string; emoji: string }[] = [
  { key: "cat", label: PET_LABELS.cat, emoji: PET_EMOJI.cat },
  { key: "dog", label: PET_LABELS.dog, emoji: PET_EMOJI.dog },
  { key: "horse", label: PET_LABELS.horse, emoji: PET_EMOJI.horse },
  { key: "bird", label: PET_LABELS.bird, emoji: PET_EMOJI.bird },
  { key: "rabbit", label: PET_LABELS.rabbit, emoji: PET_EMOJI.rabbit },
  { key: "human", label: "Humans", emoji: "🧑" },
];

export interface ToxicityTableProps {
  plant: Plant;
  /** The household's pets; their rows are highlighted. */
  pets?: readonly Pet[];
}

/** Toxicity by species, with the user's pets highlighted and the plant's toxicity notes underneath. */
export function ToxicityTable({ plant, pets = [] }: ToxicityTableProps) {
  const { toxicity } = plant;
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Toxicity of {plant.name} by species</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th scope="col" className="py-1.5 pr-3 font-medium">
                Species
              </th>
              <th scope="col" className="py-1.5 font-medium">
                If eaten
              </th>
            </tr>
          </thead>
          <tbody>
            {SPECIES.map(({ key, label, emoji }) => {
              const mine = key !== "human" && pets.includes(key);
              return (
                <tr key={key} className={cn("border-b border-border last:border-0", mine && "bg-accent-soft")}>
                  <th scope="row" className="py-1.5 pr-3 text-left font-medium">
                    <span aria-hidden="true">{emoji}</span> {label}
                    {mine && (
                      <span className="ml-2 text-xs font-semibold text-accent-foreground">Your pet</span>
                    )}
                  </th>
                  <td className="py-1.5">
                    <Badge tone={TONES[toxicity[key]]}>{TOXICITY_LABELS[toxicity[key]]}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {toxicity.notes && <p className="text-sm text-muted">{toxicity.notes}</p>}
    </div>
  );
}
