import { describe, expect, it } from "vitest";
import { createPlantCatalog } from "./catalog";
import type { Plant } from "./types";

const plant = (id: string, name: string): Plant => ({ id, name } as Plant);

describe("createPlantCatalog", () => {
  it("lists plants sorted by name and looks them up by id", () => {
    const catalog = createPlantCatalog([plant("b", "Basil"), plant("a", "Arugula")]);
    expect(catalog.all().map((p) => p.id)).toEqual(["a", "b"]);
    expect(catalog.get("b")?.name).toBe("Basil");
    expect(catalog.get("missing")).toBeUndefined();
  });

  it("marks custom plants and lets them override built-ins", () => {
    const catalog = createPlantCatalog([plant("a", "Arugula")], [plant("a", "My Arugula")]);
    expect(catalog.all()).toHaveLength(1);
    expect(catalog.get("a")).toMatchObject({ name: "My Arugula", custom: true });
  });
});
