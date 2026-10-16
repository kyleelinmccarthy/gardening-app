"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, vertical }: { pathname: string; vertical?: boolean }) {
  return (
    <ul className={cn("flex gap-1", vertical ? "flex-col" : "flex-wrap items-center")}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Escape closes the open mobile menu and returns focus to its toggle. */
function closeOnEscape(e: KeyboardEvent<HTMLDetailsElement>) {
  const details = e.currentTarget;
  if (e.key !== "Escape" || !details.open) return;
  details.open = false;
  details.querySelector("summary")?.focus();
}

/**
 * Main navigation. Desktop: inline links. Mobile: a `<details>` disclosure
 * that re-mounts (and so closes) whenever the route changes.
 */
export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Main" className="hidden md:block">
        <NavLinks pathname={pathname} />
      </nav>
      <details key={pathname} onKeyDown={closeOnEscape} className="group relative md:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true">☰</span> Menu
        </summary>
        <nav
          aria-label="Main (mobile)"
          className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-lg"
        >
          <NavLinks pathname={pathname} vertical />
        </nav>
      </details>
    </>
  );
}
