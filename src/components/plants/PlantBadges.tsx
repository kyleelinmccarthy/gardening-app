import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import type { Plant } from "@/domain/types";
import { cn } from "@/lib/cn";
import { plantBadges } from "./plantCardModel";

export interface PlantBadgesProps {
  plant: Plant;
  /** Extra badges rendered after the shared set (e.g. water need, edibility, pet safety). */
  children?: ReactNode;
  className?: string;
}

/** The badge row shared by the plant card and the plant detail header. */
export function PlantBadges({ plant, children, className }: PlantBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {plantBadges(plant).map(({ key, label, tone }) => (
        <Badge key={key} tone={tone}>
          {label}
        </Badge>
      ))}
      {children}
    </div>
  );
}
