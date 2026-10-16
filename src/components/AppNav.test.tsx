import { render, screen } from "@testing-library/react";
import { AppNav } from "./AppNav";
import { NAV_ITEMS } from "./nav-items";

const usePathname = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => usePathname() }));

describe("AppNav", () => {
  it("renders a link for every nav item", () => {
    usePathname.mockReturnValue("/");
    render(<AppNav />);
    for (const item of NAV_ITEMS) {
      const links = screen.getAllByRole("link", { name: new RegExp(item.label) });
      expect(links[0]).toHaveAttribute("href", item.href);
    }
  });

  it("marks only the current route with aria-current=page", () => {
    usePathname.mockReturnValue("/plants");
    render(<AppNav />);
    for (const link of screen.getAllByRole("link", { name: /Plant Library/ })) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
    for (const link of screen.getAllByRole("link", { name: /Dashboard/ })) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("keeps a parent active on nested routes, and Dashboard only on /", () => {
    usePathname.mockReturnValue("/plants/tomato");
    render(<AppNav />);
    expect(screen.getAllByRole("link", { name: /Plant Library/ })[0]).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: /Dashboard/ })[0]).not.toHaveAttribute("aria-current");
  });

  it("does not treat /plantsfoo as /plants", () => {
    usePathname.mockReturnValue("/plantsfoo");
    render(<AppNav />);
    expect(screen.getAllByRole("link", { name: /Plant Library/ })[0]).not.toHaveAttribute("aria-current");
  });

  it("offers a mobile menu disclosure", () => {
    usePathname.mockReturnValue("/");
    render(<AppNav />);
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });
});
