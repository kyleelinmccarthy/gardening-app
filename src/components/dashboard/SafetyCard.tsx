"use client";

import Link from "next/link";
import { Badge, Card, ReasonList } from "@/components/ui";
import type { SafetyAlert } from "@/domain/gardenSummary";

export function SafetyCard({ alerts }: { alerts: readonly SafetyAlert[] }) {
  return (
    <Card title="Safety alerts" description="Plants in your garden that conflict with your household." className="lg:col-span-2">
      {alerts.length === 0 ? (
        <p className="text-sm text-muted">No pet, allergy or child-safety concerns for your current plants.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {alerts.map((a) => (
            <li key={a.plant.id} className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <span aria-hidden="true">{a.plant.emoji}</span>
                <Link href={`/plants/${a.plant.id}`} className="text-primary underline-offset-2 hover:underline">
                  {a.plant.name}
                </Link>
                {a.severe && <Badge tone="danger">High risk</Badge>}
              </p>
              <ReasonList reasons={a.issues} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
