import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonStyleProps } from "./button-styles";

export type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

/** A `next/link` that looks like a `Button` — use for navigation, not actions. */
export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...rest} />;
}
