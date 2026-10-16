import { parseJournalForm, parseLogForm, parseReminderForm } from "./formModel";

describe("parseReminderForm", () => {
  const base = { title: " Prune roses ", dueDate: "2026-05-10", repeatDays: "", plantingId: "" };

  it("parses a one-off reminder", () => {
    expect(parseReminderForm(base)).toEqual({
      ok: true,
      value: { title: "Prune roses", dueDate: "2026-05-10", repeatDays: undefined, plantingId: undefined },
    });
  });

  it("parses repeat and planting", () => {
    const r = parseReminderForm({ ...base, repeatDays: "14", plantingId: "p1" });
    expect(r).toMatchObject({ ok: true, value: { repeatDays: 14, plantingId: "p1" } });
  });

  it("requires a title and a valid date", () => {
    const r = parseReminderForm({ ...base, title: " ", dueDate: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["dueDate", "title"]);
  });

  it("rejects bad repeat intervals", () => {
    for (const repeatDays of ["0", "-3", "1.5", "abc"]) {
      expect(parseReminderForm({ ...base, repeatDays }).ok).toBe(false);
    }
  });
});

describe("parseJournalForm", () => {
  it("parses an entry", () => {
    expect(parseJournalForm({ date: "2026-05-10", title: " First sprouts ", text: "Tomatoes up!", plantingId: "" })).toEqual({
      ok: true,
      value: { date: "2026-05-10", title: "First sprouts", text: "Tomatoes up!", plantingId: undefined },
    });
  });

  it("requires a title and date", () => {
    const r = parseJournalForm({ date: "nope", title: "", text: "x", plantingId: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["date", "title"]);
  });
});

describe("parseLogForm", () => {
  it("parses an entry, trimming the note", () => {
    expect(parseLogForm({ type: "water", date: "2026-05-10", plantingId: "p1", note: " deep soak " })).toEqual({
      ok: true,
      value: { type: "water", date: "2026-05-10", plantingId: "p1", note: "deep soak" },
    });
  });

  it("omits empty optional fields and validates the date", () => {
    expect(parseLogForm({ type: "prune", date: "2026-05-10", plantingId: "", note: "" })).toEqual({
      ok: true,
      value: { type: "prune", date: "2026-05-10", plantingId: undefined, note: undefined },
    });
    expect(parseLogForm({ type: "prune", date: "2026-13-40", plantingId: "", note: "" }).ok).toBe(false);
  });
});
