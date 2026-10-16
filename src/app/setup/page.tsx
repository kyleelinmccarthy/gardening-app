import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupWizard } from "@/components/setup/SetupWizard";

export const metadata: Metadata = { title: "Garden setup" };

export default function SetupPage() {
  return (
    // useSearchParams (for ?new=1) needs a Suspense boundary under cacheComponents.
    <Suspense fallback={<p role="status" className="animate-pulse text-muted">Loading…</p>}>
      <SetupWizard />
    </Suspense>
  );
}
