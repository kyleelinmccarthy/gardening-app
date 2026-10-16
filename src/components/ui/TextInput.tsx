"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { controlClasses } from "./field-styles";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

/** Text `<input>`; picks up id/aria from a surrounding `Field`. */
export function TextInput({ className, type = "text", ...rest }: TextInputProps) {
  return <input type={type} {...useFieldControl()} className={cn(controlClasses, className)} {...rest} />;
}
