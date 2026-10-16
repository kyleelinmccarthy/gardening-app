import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { TOOLS } from "@/data/tools";
import type { GardenProfile, Plant } from "@/domain/types";
import { toolStatus, type ToolStatus } from "../plantDetailModel";
import { SubHeading } from "./shared";

const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));

function ToolList({ title, items, showOwnership, required }: { title: string; items: ToolStatus[]; showOwnership: boolean; required: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <SubHeading>{title}</SubHeading>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map(({ id, owned }) => {
          const tool = TOOL_BY_ID.get(id);
          return (
            <li key={id} className="flex flex-wrap items-center gap-2">
              <Link href={`/guides#tool-${id}`} className="text-primary hover:underline">
                <span aria-hidden="true">{tool?.emoji}</span> {tool?.name ?? id}
              </Link>
              {showOwnership && owned && <Badge tone="success">✓ You have this</Badge>}
              {showOwnership && !owned && required && <Badge tone="warning">You&apos;ll need this</Badge>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ToolsSection({ plant, profile }: { plant: Plant; profile: GardenProfile | null }) {
  const { required, helpful } = toolStatus(plant, profile?.tools ?? []);
  const showOwnership = profile !== null;
  return (
    <Card title="Tools">
      {required.length === 0 && helpful.length === 0 ? (
        <p className="text-sm text-muted">No special tools needed.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <ToolList title="Required" items={required} showOwnership={showOwnership} required />
          <ToolList title="Helpful" items={helpful} showOwnership={showOwnership} required={false} />
        </div>
      )}
    </Card>
  );
}
