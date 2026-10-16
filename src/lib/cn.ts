/** Falsy values are skipped, so `cn("a", cond && "b")` works. */
export type ClassValue = string | number | false | null | undefined;

/** Join class names, ignoring falsy values. Tiny stand-in for clsx. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
