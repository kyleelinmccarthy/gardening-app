import { ButtonLink, Card } from "@/components/ui";

const FEATURES = [
  { icon: "✨", title: "Recommendations that fit you", text: "Plants scored for your climate, light, soil, tools, time and experience." },
  { icon: "🐾", title: "Safe for your household", text: "Pets, allergies and children are checked for every plant, with clear warnings." },
  { icon: "🗺️", title: "Companion-aware bed planner", text: "Drag plants onto a grid and see friends and foes at a glance." },
  { icon: "📅", title: "Planting calendar", text: "When to start seeds, transplant and harvest, built from your frost dates." },
  { icon: "💧", title: "Care schedule", text: "Watering, fertilizing and pest checks adjusted for containers, heat and season." },
  { icon: "📖", title: "Pest, soil & fertilizer guides", text: "Plain-language help for the problems every gardener meets." },
];

/** First-run landing content shown when no garden exists yet. */
export function WelcomeHero() {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-border bg-surface-muted px-5 py-10 text-center sm:px-10">
        <p aria-hidden="true" className="text-5xl">
          🌱
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome to Garden Planner</h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted">
          Plan an indoor or outdoor garden around your climate, tools, household and interests, then keep it thriving
          with a calendar and care schedule.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/setup">Set up my garden</ButtonLink>
          <ButtonLink href="/plants" variant="secondary">
            Browse the plant library
          </ButtonLink>
        </div>
        <p className="mt-3 text-xs text-muted">Takes about two minutes. Everything stays in your browser.</p>
      </section>

      <section aria-label="What you can do">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <Card className="h-full" title={<span><span aria-hidden="true">{f.icon} </span>{f.title}</span>} headingLevel="h2">
                <p className="text-sm text-muted">{f.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
