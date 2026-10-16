import { Card } from "@/components/ui";

const FACTORS: readonly { title: string; text: string }[] = [
  { title: "Sun & light", text: "Outdoor sun exposure, or the light in your home for indoor gardens (a grow light can make up for dim rooms)." },
  { title: "Climate & hardiness zone", text: "Perennials must survive your winters; annuals are checked against summer heat." },
  { title: "Season length", text: "Your frost-free days versus the days a plant needs to mature." },
  { title: "Containers & soil", text: "Whether the plant copes with pots, and how well your soil suits it." },
  { title: "Tools", text: "Gear the plant needs that you do not own yet, and helpful tools you do." },
  { title: "Experience & time", text: "Challenging plants are flagged for beginners and small time budgets." },
  { title: "Interests & goals", text: "Plant categories you care about and goals such as food, pollinators or low maintenance." },
  { title: "Pets, children & allergies", text: "Toxicity to your pets and kids, and allergens you react to. Moderate or severe pet toxicity rules a plant out." },
];

/** Short explainer of the factors behind a recommendation score. */
export function HowWeScore() {
  return (
    <Card
      title="How we score"
      description="Every plant starts at 60 out of 100. Each factor below adds or subtracts points, and anything that would not survive or would be unsafe caps the score and marks the plant as not recommended."
    >
      <ul className="grid gap-3 text-sm sm:grid-cols-2">
        {FACTORS.map((f) => (
          <li key={f.title}>
            <strong className="text-foreground">{f.title}.</strong> <span className="text-muted">{f.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">
        80+ is a great match, 60+ a good match, and anything lower is possible with some extra care.
      </p>
    </Card>
  );
}
