"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Panel content, shown only while the tab is selected. */
  content: ReactNode;
}

export interface TabsProps {
  tabs: readonly TabItem[];
  /** Accessible name for the tab list. */
  label: string;
  /** Controlled selected tab id. */
  value?: string;
  /** Initial tab id when uncontrolled (defaults to the first tab). */
  defaultValue?: string;
  onChange?: (id: string) => void;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation):
 * Left/Right arrows move between tabs, Home/End jump to first/last.
 */
export function Tabs({ tabs, label, value, defaultValue, onChange }: TabsProps) {
  const baseId = useId();
  const [inner, setInner] = useState(defaultValue ?? tabs[0]?.id);
  // A value (controlled or stale) that matches no tab resolves to the first tab, so one tab is always tabbable.
  const requested = value ?? inner;
  const selected = tabs.some((t) => t.id === requested) ? requested : tabs[0]?.id;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function select(id: string) {
    setInner(id);
    onChange?.(id);
    refs.current[id]?.focus();
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const target =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (target === null) return;
    e.preventDefault();
    select(tabs[target].id);
  }

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;
  const active = tabs.find((t) => t.id === selected);

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t, i) => {
          const isSelected = t.id === selected;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={tabId(t.id)}
              aria-selected={isSelected}
              aria-controls={panelId(t.id)}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div role="tabpanel" id={panelId(active.id)} aria-labelledby={tabId(active.id)} tabIndex={0} className="pt-4">
          {active.content}
        </div>
      )}
    </div>
  );
}
