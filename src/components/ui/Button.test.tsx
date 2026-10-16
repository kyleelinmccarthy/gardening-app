import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";
import { ButtonLink } from "./ButtonLink";

describe("Button", () => {
  it("defaults to type=button and primary styling", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass("bg-primary");
  });

  it.each([
    ["secondary", "border-border"],
    ["ghost", "hover:bg-surface-muted"],
    ["danger", "bg-danger"],
  ] as const)("applies the %s variant", (variant, cls) => {
    render(<Button variant={variant}>x</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it("supports the sm size and extra classes", () => {
    render(
      <Button size="sm" className="extra">
        x
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveClass("text-sm", "extra", "min-h-8");
  });

  it("forwards native props and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("ButtonLink", () => {
  it("renders a link with button styling", () => {
    render(
      <ButtonLink href="/setup" variant="secondary">
        Setup
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Setup" });
    expect(link).toHaveAttribute("href", "/setup");
    expect(link).toHaveClass("border-border");
  });
});
