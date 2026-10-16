import type { CalendarEventType } from "@/domain/types";

/** Bar colours per event type (Tailwind classes); the legend and bars share this map. */
export const EVENT_BAR_CLASSES: Record<CalendarEventType, string> = {
  "start-indoors": "bg-sky-500",
  transplant: "bg-emerald-600",
  "direct-sow": "bg-lime-500",
  "fall-sow": "bg-amber-600",
  harvest: "bg-rose-500",
};

export const EVENT_TYPE_ORDER: readonly CalendarEventType[] = [
  "start-indoors",
  "direct-sow",
  "transplant",
  "fall-sow",
  "harvest",
];
