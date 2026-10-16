"use client";

import Link from "next/link";
import { useAppData } from "@/state/AppDataProvider";

export interface PlantLinkProps {
  plantId: string;
  className?: string;
}

/** Emoji + name link to a plant's detail page; unknown ids degrade to a readable slug. */
export function PlantLink({ plantId, className }: PlantLinkProps) {
  const { catalog } = useAppData();
  const plant = catalog.get(plantId);
  return (
    <Link
      href={`/plants/${plantId}`}
      className={className ?? "inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"}
    >
      {plant && <span aria-hidden="true">{plant.emoji}</span>}
      {plant ? plant.name : plantId.replace(/-/g, " ")}
    </Link>
  );
}
