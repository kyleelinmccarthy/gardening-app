import { render, screen, within } from "@testing-library/react";
import { makePlant } from "@/test/fixtures";
import { ToxicityTable } from "./ToxicityTable";

const plant = makePlant({
  toxicity: { cat: "severe", dog: "non-toxic", horse: "mild", bird: "moderate", rabbit: "non-toxic", human: "mild", notes: "Bulbs are the worst part." },
});

describe("ToxicityTable", () => {
  it("lists every species with its toxicity label", () => {
    render(<ToxicityTable plant={plant} />);
    const row = screen.getByRole("row", { name: /cat/i });
    expect(within(row).getByText("Severely toxic")).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /dog/i })).getByText("Non-toxic")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(7); // header + 6
  });

  it("highlights the user's pets", () => {
    render(<ToxicityTable plant={plant} pets={["cat"]} />);
    expect(within(screen.getByRole("row", { name: /cat/i })).getByText("Your pet")).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /dog/i })).queryByText("Your pet")).not.toBeInTheDocument();
  });

  it("shows toxicity notes", () => {
    render(<ToxicityTable plant={plant} />);
    expect(screen.getByText(/Bulbs are the worst part/)).toBeInTheDocument();
  });
});
