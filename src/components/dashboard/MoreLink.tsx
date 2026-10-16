import Link from "next/link";
import type { ReactNode } from "react";

/** "+N more …" link shown under a truncated dashboard list. */
export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <p className="mt-2 text-xs">
      <Link href={href} className="font-medium text-primary underline-offset-2 hover:underline">
        {children}
      </Link>
    </p>
  );
}
