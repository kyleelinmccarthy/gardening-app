import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";
import { StatTile } from "./StatTile";

describe("display primitives", () => {
  it("Badge applies tone styling", () => {
    render(<Badge tone="danger">Toxic</Badge>);
    expect(screen.getByText("Toxic")).toHaveClass("text-danger");
  });

  it("Card is a region labelled by its title and shows actions", () => {
    render(
      <Card title="Beds" description="Your beds" actions={<button>Add</button>}>
        content
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Beds" })).toHaveTextContent("content");
    expect(screen.getByRole("heading", { level: 2, name: "Beds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("PageHeader renders h1, description and actions", () => {
    render(<PageHeader title="Plants" description="Browse" actions={<button>New</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Plants" })).toBeInTheDocument();
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("EmptyState renders title, description and action", () => {
    render(<EmptyState icon="🌱" title="Nothing yet" description="Add one" action={<button>Add</button>} />);
    expect(screen.getByRole("heading", { name: "Nothing yet" })).toBeInTheDocument();
    expect(screen.getByText("Add one")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("EmptyState renders an h2 by default and honours headingLevel", () => {
    const { rerender } = render(<EmptyState title="Nothing" />);
    expect(screen.getByRole("heading", { level: 2, name: "Nothing" })).toBeInTheDocument();
    rerender(<EmptyState title="Nothing" headingLevel="h1" />);
    expect(screen.getByRole("heading", { level: 1, name: "Nothing" })).toBeInTheDocument();
    rerender(<EmptyState title="Nothing" headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Nothing" })).toBeInTheDocument();
  });

  it("StatTile shows label, value and hint", () => {
    render(<StatTile label="Plants" value={12} hint="3 growing" />);
    expect(screen.getByText("Plants")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3 growing")).toBeInTheDocument();
  });
});
