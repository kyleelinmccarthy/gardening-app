import type { CSSProperties } from "react";
import type { CalendarEventType } from "@/domain/types";

/** Bar colours per event type (Tailwind classes); the legend and bars share this map. */
export const EVENT_BAR_CLASSES: Record<CalendarEventType, string> = {
  "start-indoors": "bg-sky-500",
  transplant: "bg-emerald-600",
  "direct-sow": "bg-lime-500",
  "fall-sow": "bg-amber-600",
  harvest: "bg-rose-500",
};

const OVERLAY = "rgba(255, 255, 255, 0.55)";

/**
 * A pattern per event type so bars differ by more than colour (WCAG 1.4.1).
 * Transplant stays solid; every other type has its own overlay.
 */
export const EVENT_PATTERN_STYLES: Record<CalendarEventType, CSSProperties> = {
  "start-indoors": {
    backgroundImage: `repeating-linear-gradient(45deg, ${OVERLAY} 0 2px, transparent 2px 6px)`,
  },
  transplant: {},
  "direct-sow": {
    backgroundImage: `radial-gradient(${OVERLAY} 1.2px, transparent 1.6px)`,
    backgroundSize: "6px 6px",
  },
  "fall-sow": {
    backgroundImage: `repeating-linear-gradient(90deg, ${OVERLAY} 0 2px, transparent 2px 6px)`,
  },
  harvest: {
    backgroundImage: `repeating-linear-gradient(45deg, ${OVERLAY} 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, ${OVERLAY} 0 2px, transparent 2px 6px)`,
  },
};

/** Short names that fit inside a bar (the full names live in `CALENDAR_EVENT_LABELS`). */
export const EVENT_SHORT_LABELS: Record<CalendarEventType, string> = {
  "start-indoors": "Indoors",
  transplant: "Transplant",
  "direct-sow": "Sow",
  "fall-sow": "Fall sow",
  harvest: "Harvest",
};

export const EVENT_TYPE_ORDER: readonly CalendarEventType[] = [
  "start-indoors",
  "direct-sow",
  "transplant",
  "fall-sow",
  "harvest",
];
