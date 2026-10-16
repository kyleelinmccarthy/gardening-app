import type { Metadata } from "next";
import { PlantLibrary } from "@/components/plants/PlantLibrary";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Plant Library",
  description: "Browse and filter vegetables, herbs, fruit, flowers, houseplants and succulents.",
};

export default function PlantsPage() {
  return (
    <>
      <PageHeader
        title="Plant library"
        description="Search every plant by sun, water, difficulty, climate, pet safety and more, then add the ones you like to your garden."
      />
      <PlantLibrary />
    </>
  );
}
