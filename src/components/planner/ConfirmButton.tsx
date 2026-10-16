"use client";

import { useState } from "react";
import { Button, type ButtonSize } from "@/components/ui";

export interface ConfirmButtonProps {
  /** Visible text of the trigger button. */
  label: string;
  /** Accessible name of the trigger when the visible text is ambiguous (e.g. in lists). */
  ariaLabel?: string;
  /** Question shown while confirming, e.g. "Delete this bed?". */
  prompt: string;
  confirmLabel?: string;
  size?: ButtonSize;
  onConfirm: () => void;
}

/** A destructive action that asks "are you sure?" inline before running. */
export function ConfirmButton({
  label,
  ariaLabel,
  prompt,
  confirmLabel = "Yes, delete",
  size = "sm",
  onConfirm,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="secondary" size={size} aria-label={ariaLabel} onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }
  return (
    <span role="group" aria-label={prompt} className="inline-flex flex-wrap items-center gap-2">
      <span className="text-sm text-foreground">{prompt}</span>
      <Button
        variant="danger"
        size={size}
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </span>
  );
}
