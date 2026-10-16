import type { Metadata } from "next";
import { Guides } from "@/components/guides/Guides";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Guides",
  description: "Pests, beneficial insects, soil, fertilizer, tools, companion planting and hardiness zones explained.",
};

export default function GuidesPage() {
  return (
    <>
      <PageHeader
        title="Gardening guides"
        description="Everything behind the recommendations: identify pests and helpers, understand your soil and feeds, choose tools and plan companions."
      />
      <Guides />
    </>
  );
}
