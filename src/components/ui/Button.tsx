import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonStyleProps } from "./button-styles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;

/**
 * Native `<button>` with design-system styling. Defaults to `type="button"`
 * so it never submits a form by accident; pass `type="submit"` when needed.
 */
export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...rest} />;
}
