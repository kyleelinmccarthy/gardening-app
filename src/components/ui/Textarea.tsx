"use client";

import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlClasses } from "./field-styles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Multi-line text input; picks up id/aria from a surrounding `Field`. */
export function Textarea({ className, rows = 3, ...rest }: TextareaProps) {
  return <textarea rows={rows} {...useFieldControl()} className={cn(controlClasses, className)} {...rest} />;
}
