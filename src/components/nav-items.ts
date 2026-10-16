export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/** Primary navigation — the single source for the header menu. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Dashboard", icon: "🏡" },
  { href: "/setup", label: "Garden Setup", icon: "🧭" },
  { href: "/recommendations", label: "Recommendations", icon: "✨" },
  { href: "/plants", label: "Plant Library", icon: "📚" },
  { href: "/planner", label: "Planner", icon: "🗺️" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/care", label: "Care", icon: "💧" },
  { href: "/guides", label: "Guides", icon: "📖" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];
