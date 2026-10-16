import type { Metadata } from "next";
import { CalendarPage } from "@/components/calendar/CalendarPage";

export const metadata: Metadata = {
  title: "Planting calendar",
  description: "When to start seeds, sow, transplant and harvest, based on your frost dates.",
};

export default function Page() {
  return <CalendarPage />;
}
