import { describe, expect, it } from "vitest";
import { createPlantCatalog } from "./catalog";
import { makePlant } from "@/test/fixtures";
import type { Plant } from "./types";

const plant = (id: string, name: string, extra: Partial<Plant> = {}): Plant => makePlant({ id, name, ...extra });

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

  it("returns the same plant objects from all() and get()", () => {
    const catalog = createPlantCatalog([plant("a", "Arugula")]);
    expect(catalog.get("a")).toBe(catalog.all()[0]);
  });
});

describe("createPlantCatalog relation normalization", () => {
  it("makes one-way antagonists symmetric", () => {
    const catalog = createPlantCatalog([
      plant("fennel", "Fennel", { antagonists: ["tomato"] }),
      plant("tomato", "Tomato"),
    ]);
    expect(catalog.get("tomato")?.antagonists).toEqual(["fennel"]);
    expect(catalog.get("fennel")?.antagonists).toEqual(["tomato"]);
  });

  it("makes one-way companions symmetric and keeps declaration order first", () => {
    const catalog = createPlantCatalog([
      plant("tomato", "Tomato", { companions: ["basil"] }),
      plant("basil", "Basil", { companions: ["carrot"] }),
      plant("carrot", "Carrot"),
      plant("marigold", "Marigold", { companions: ["tomato"] }),
    ]);
    expect(catalog.get("tomato")?.companions).toEqual(["basil", "marigold"]);
    expect(catalog.get("basil")?.companions).toEqual(["carrot", "tomato"]);
    expect(catalog.get("carrot")?.companions).toEqual(["basil"]);
    expect(catalog.get("marigold")?.companions).toEqual(["tomato"]);
  });

  it("lets antagonism win when a pair is listed as both, removing the companion link on both sides", () => {
    const catalog = createPlantCatalog([
      plant("a", "A", { companions: ["b"] }),
      plant("b", "B", { antagonists: ["a"] }),
      plant("c", "C", { companions: ["a"] }),
    ]);
    expect(catalog.get("a")?.companions).toEqual(["c"]);
    expect(catalog.get("b")?.companions).toEqual([]);
    expect(catalog.get("a")?.antagonists).toEqual(["b"]);
    expect(catalog.get("b")?.antagonists).toEqual(["a"]);
  });

  it("ignores ids that are not in the catalog and self references", () => {
    const catalog = createPlantCatalog([
      plant("a", "A", { companions: ["ghost", "a"], antagonists: ["phantom"] }),
    ]);
    expect(catalog.get("a")?.companions).toEqual([]);
    expect(catalog.get("a")?.antagonists).toEqual([]);
  });

  it("applies to custom plants too", () => {
    const catalog = createPlantCatalog([plant("tomato", "Tomato")], [plant("mine", "Mine", { companions: ["tomato"] })]);
    expect(catalog.get("tomato")?.companions).toEqual(["mine"]);
  });

  it("does not mutate the input plants", () => {
    const fennel = plant("fennel", "Fennel", { antagonists: ["tomato"] });
    const tomato = plant("tomato", "Tomato");
    const catalog = createPlantCatalog([fennel, tomato]);
    expect(tomato.antagonists).toEqual([]);
    expect(catalog.get("tomato")).not.toBe(tomato);
    expect(fennel.antagonists).toEqual(["tomato"]);
  });
});
