import type { Metadata } from "next";
import { ButtonLink, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <EmptyState
      icon="🥀"
      title="This page has wilted"
      description="We could not find what you were looking for. It may have moved, or the link might be mistyped."
      action={<ButtonLink href="/">Back to the dashboard</ButtonLink>}
    />
  );
}
