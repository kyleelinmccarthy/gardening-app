/** Turns a kebab-case id into readable words: "bright-indirect" -> "bright indirect". */
export function humanizeId(id: string): string {
  return id.replace(/-/g, " ");
}
