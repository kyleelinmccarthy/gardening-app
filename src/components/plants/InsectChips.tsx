import Link from "next/link";
import { INSECTS } from "@/data/insects";
import type { InsectId } from "@/domain/types";

export interface InsectChipsProps {
  ids: readonly InsectId[];
  /** Shown instead of nothing when the list is empty. */
  emptyText?: string;
}

const BY_ID = new Map(INSECTS.map((i) => [i.id, i]));

/** Chips linking each insect to its entry in the guides (`/guides#insect-<id>`). */
export function InsectChips({ ids, emptyText }: InsectChipsProps) {
  const insects = ids.flatMap((id) => BY_ID.get(id) ?? []);
  if (insects.length === 0) return emptyText ? <p className="text-sm text-muted">{emptyText}</p> : null;
  return (
    <ul className="flex flex-wrap gap-2">
      {insects.map((i) => (
        <li key={i.id}>
          <Link
            href={`/guides#insect-${i.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-sm text-foreground hover:bg-surface-muted"
          >
            <span aria-hidden="true">{i.emoji}</span>
            {i.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
