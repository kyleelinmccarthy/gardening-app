import { ButtonLink, Card, PageHeader } from "@/components/ui";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome to Garden Planner"
        description="Tell us about your space, climate and goals, and we will suggest plants that will thrive."
      />
      <Card title="Get started" description="Set up your garden profile to unlock tailored recommendations.">
        <ButtonLink href="/setup">Set up my garden</ButtonLink>
      </Card>
    </>
  );
}
