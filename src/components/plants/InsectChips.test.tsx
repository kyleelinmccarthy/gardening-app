import { render, screen } from "@testing-library/react";
import { InsectChips } from "./InsectChips";

describe("InsectChips", () => {
  it("links each insect to its guide entry", () => {
    render(<InsectChips ids={["aphids", "honeybees"]} />);
    expect(screen.getByRole("link", { name: /Aphids/ })).toHaveAttribute("href", "/guides#insect-aphids");
    expect(screen.getByRole("link", { name: /Honeybees/i })).toHaveAttribute("href", "/guides#insect-honeybees");
  });

  it("shows the empty text when there is nothing to list", () => {
    render(<InsectChips ids={[]} emptyText="None noted" />);
    expect(screen.getByText("None noted")).toBeInTheDocument();
  });

  it("renders nothing for an empty list without empty text", () => {
    const { container } = render(<InsectChips ids={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
