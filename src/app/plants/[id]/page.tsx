import type { Metadata } from "next";
import { Suspense } from "react";
import { PlantDetail } from "@/components/plants/PlantDetail";
import { LoadingState } from "@/components/ui";
import { BUILTIN_PLANTS } from "@/data/plants";

type PlantPageProps = { params: Promise<{ id: string }> };

/**
 * Built-in plants are prerendered. Custom plants live only in the browser's
 * localStorage, so any other id renders the app shell and `PlantDetail`
 * resolves it client-side (showing "not found" when it does not exist).
 */
export function generateStaticParams() {
  return BUILTIN_PLANTS.map((plant) => ({ id: plant.id }));
}

export async function generateMetadata({ params }: PlantPageProps): Promise<Metadata> {
  const { id } = await params;
  const plant = BUILTIN_PLANTS.find((p) => p.id === id);
  return plant
    ? { title: plant.name, description: plant.description }
    : { title: "Plant", description: "Plant details" };
}

async function PlantContent({ params }: PlantPageProps) {
  const { id } = await params;
  return <PlantDetail id={id} />;
}

export default function PlantPage({ params }: PlantPageProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <PlantContent params={params} />
    </Suspense>
  );
}
