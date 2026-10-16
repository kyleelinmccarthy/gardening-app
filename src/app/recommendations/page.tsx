import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { Recommendations } from "@/components/recommendations/Recommendations";

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Plants matched to your space, climate, tools, pets and goals.",
};

export default function RecommendationsPage() {
  return (
    <>
      <PageHeader
        title="Recommended for you"
        description="Plants ranked by how well they fit your garden, with the reasons behind every score."
      />
      <Recommendations />
    </>
  );
}
