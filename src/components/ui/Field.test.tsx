import { render, screen } from "@testing-library/react";
import { Field } from "./Field";
import { NumberInput } from "./NumberInput";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { TextInput } from "./TextInput";

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="Garden name">
        <TextInput />
      </Field>,
    );
    expect(screen.getByLabelText("Garden name")).toBeInstanceOf(HTMLInputElement);
  });

  it("links hint and error via aria-describedby and flags invalid", () => {
    render(
      <Field label="Hours" hint="Per week" error="Must be positive">
        <NumberInput />
      </Field>,
    );
    const input = screen.getByLabelText("Hours");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Per week Must be positive");
    expect(screen.getByRole("alert")).toHaveTextContent("Must be positive");
  });

  it("is not invalid and has no description without hint/error", () => {
    render(
      <Field label="Notes">
        <Textarea />
      </Field>,
    );
    const el = screen.getByLabelText("Notes");
    expect(el).not.toHaveAttribute("aria-invalid");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("wires Select and renders options and placeholder", () => {
    render(
      <Field label="Soil">
        <Select
          placeholder="Choose…"
          options={[
            { value: "loam", label: "Loam" },
            { value: "clay", label: "Clay" },
          ]}
        />
      </Field>,
    );
    const select = screen.getByLabelText("Soil");
    expect(select).toHaveDisplayValue("Choose…");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("gives each field a distinct id", () => {
    render(
      <>
        <Field label="A">
          <TextInput />
        </Field>
        <Field label="B">
          <TextInput />
        </Field>
      </>,
    );
    expect(screen.getByLabelText("A").id).not.toBe(screen.getByLabelText("B").id);
  });
});
