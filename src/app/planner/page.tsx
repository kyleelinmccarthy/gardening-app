import type { Metadata } from "next";
import { PlannerPage } from "@/components/planner/PlannerPage";

export const metadata: Metadata = {
  title: "Garden planner",
  description: "Lay out your beds, containers and windowsills and check companion planting.",
};

export default function Page() {
  return <PlannerPage />;
}
