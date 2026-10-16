import { render, screen, within } from "@testing-library/react";
import type { Reason } from "@/domain/types";
import { ReasonList } from "./ReasonList";

const reasons: Reason[] = [
  { kind: "positive", topic: "sun", message: "Loves your full sun" },
  { kind: "warning", topic: "pets", message: "Mildly toxic to cats" },
  { kind: "blocker", topic: "zone", message: "Too cold for zone 4" },
];

describe("ReasonList", () => {
  it("renders every reason with its icon and colour class", () => {
    render(<ReasonList reasons={reasons} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("✅");
    expect(items[0]).toHaveClass("text-success");
    expect(items[1]).toHaveTextContent("⚠️");
    expect(items[1]).toHaveClass("text-warning");
    expect(items[2]).toHaveTextContent("⛔");
    expect(items[2]).toHaveClass("text-danger");
    expect(within(items[1]).getByText("Mildly toxic to cats")).toBeInTheDocument();
  });

  it("gives screen readers the kind of each reason", () => {
    render(<ReasonList reasons={reasons} />);
    expect(screen.getByText("Warning:")).toHaveClass("sr-only");
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<ReasonList reasons={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
