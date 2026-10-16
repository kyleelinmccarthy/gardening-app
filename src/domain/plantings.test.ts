import { describe, expect, it } from "vitest";
import { makePlanting, makeProfile } from "@/test/fixtures";
import { applyStatusChange, defaultPlanting } from "./plantings";

describe("defaultPlanting", () => {
  it("is a planned single plant dated today, with the given id", () => {
    expect(defaultPlanting("tomato", makeProfile(), "2026-05-01", "planting-9")).toEqual({
      id: "planting-9",
      plantId: "tomato",
      quantity: 1,
      plantedOn: "2026-05-01",
      status: "planned",
      inContainer: false,
    });
  });

  it("uses a container for containers-only gardens", () => {
    const profile = makeProfile({ containersOnly: true });
    expect(defaultPlanting("tomato", profile, "2026-05-01", "p").inContainer).toBe(true);
  });

  it("uses a container for indoor gardens", () => {
    const profile = makeProfile({ setting: "indoor" });
    expect(defaultPlanting("pothos", profile, "2026-05-01", "p").inContainer).toBe(true);
  });
});

describe("applyStatusChange", () => {
  const planned = makePlanting({ status: "planned", plantedOn: "2026-01-01" });

  it("stamps today as the planting date when a planned planting starts growing", () => {
    expect(applyStatusChange(planned, "growing", "2026-05-10")).toEqual({ status: "growing", plantedOn: "2026-05-10" });
  });

  it("only changes the status for every other transition", () => {
    expect(applyStatusChange(makePlanting({ status: "growing" }), "harvested", "2026-05-10")).toEqual({
      status: "harvested",
    });
    expect(applyStatusChange(planned, "removed", "2026-05-10")).toEqual({ status: "removed" });
    expect(applyStatusChange(makePlanting({ status: "harvested" }), "growing", "2026-05-10")).toEqual({
      status: "growing",
    });
  });

  it("does not mutate the planting", () => {
    const copy = { ...planned };
    applyStatusChange(planned, "growing", "2026-05-10");
    expect(planned).toEqual(copy);
  });
});
