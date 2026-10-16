import { render, screen } from "@testing-library/react";
import { SCORE_CONFIG } from "@/domain/recommendation";
import { HowWeScore } from "./HowWeScore";

describe("HowWeScore", () => {
  it("quotes the baseline and verdict thresholds from the scoring config", () => {
    render(<HowWeScore />);
    expect(screen.getByText(new RegExp(`starts at ${SCORE_CONFIG.baseline} out of 100`))).toBeInTheDocument();
    expect(
      screen.getByText(`${SCORE_CONFIG.greatMin}+ is a great match, ${SCORE_CONFIG.goodMin}+ a good match, and anything lower is possible with some extra care.`),
    ).toBeInTheDocument();
  });
});
