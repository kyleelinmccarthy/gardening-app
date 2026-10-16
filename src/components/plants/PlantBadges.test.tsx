import { render, screen } from "@testing-library/react";
import { makePlant } from "@/test/fixtures";
import { PlantBadges } from "./PlantBadges";

describe("PlantBadges", () => {
  it("renders the shared plant facts", () => {
    render(<PlantBadges plant={makePlant({ custom: true })} />);
    for (const text of ["Vegetables", "Custom", /Full sun/, "Easy", /Container-friendly/, /Indoor-capable/]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it("omits badges that do not apply", () => {
    render(<PlantBadges plant={makePlant({ environments: ["outdoor"], container: { suitable: false } })} />);
    expect(screen.queryByText("Custom")).not.toBeInTheDocument();
    expect(screen.queryByText(/Container-friendly/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Indoor-capable/)).not.toBeInTheDocument();
  });

  it("appends extra badges after the shared ones", () => {
    render(<PlantBadges plant={makePlant()}>{<span>Extra</span>}</PlantBadges>);
    expect(screen.getByText("Extra")).toBeInTheDocument();
  });
});
