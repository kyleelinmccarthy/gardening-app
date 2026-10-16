import type { HTMLAttributes } from "react";
import type { CalendarEventType } from "@/domain/types";
import { cn } from "@/lib/cn";
import { EVENT_BAR_CLASSES, EVENT_PATTERN_STYLES } from "./event-styles";

export interface EventSwatchProps extends HTMLAttributes<HTMLSpanElement> {
  type: CalendarEventType;
}

/** A block in the colour and pattern of an event type; shared by bars, legend and lists. */
export function EventSwatch({ type, className, style, ...rest }: EventSwatchProps) {
  return <span {...rest} className={cn("rounded-sm", EVENT_BAR_CLASSES[type], className)} style={{ ...EVENT_PATTERN_STYLES[type], ...style }} />;
}
