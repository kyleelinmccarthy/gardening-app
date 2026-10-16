"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import type { ButtonSize } from "./button-styles";

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

/**
 * A destructive action that asks "are you sure?" inline before running.
 * Focus follows the swap: it moves to the confirm button when the question
 * appears and back to the trigger when the question closes.
 */
export function ConfirmButton({
  label,
  ariaLabel,
  prompt,
  confirmLabel = "Yes, delete",
  size = "sm",
  onConfirm,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  if (!confirming) {
    return (
      <Button ref={triggerRef} variant="secondary" size={size} aria-label={ariaLabel} onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }
  return (
    <span role="group" aria-label={prompt} className="inline-flex flex-wrap items-center gap-2">
      <span className="text-sm text-foreground">{prompt}</span>
      <Button
        ref={confirmRef}
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
