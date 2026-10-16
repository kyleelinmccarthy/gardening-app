import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { AppDataProvider } from "@/state/AppDataProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s · Garden Planner", default: "Garden Planner" },
  description:
    "Plan your garden: get plant recommendations for your space, climate, pets and goals, then schedule planting and care.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#111a13" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <AppDataProvider>
          <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="text-lg font-bold text-primary">
                🌱 Garden Planner
              </Link>
              <AppNav />
            </div>
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-border py-4 text-center text-xs text-muted">
            Your data is stored locally in this browser.
          </footer>
        </AppDataProvider>
      </body>
    </html>
  );
}
