import type { Metadata } from "next";
import { CarePage } from "@/components/care/CarePage";

export const metadata: Metadata = {
  title: "Care hub",
  description: "Daily care tasks, reminders, care log and garden journal.",
};

export default function Page() {
  return <CarePage />;
}
