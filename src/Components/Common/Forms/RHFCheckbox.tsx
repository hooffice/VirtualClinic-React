import { Controller, useFormContext, FieldValues, Path } from "react-hook-form";
import { Input, Label, FormGroup } from "reactstrap";

interface Props<T extends FieldValues> {
  name: Path<T>;
  label: string;
  disabled?: boolean;
}

export function RHFCheckBox<T extends FieldValues>({
  name,
  label,
  disabled = false,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormGroup check>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            type="checkbox"
            checked={!!field.value}
            disabled={disabled}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />

      <Label check className="ms-2" style={{ fontSize: "11px", fontWeight: 300 }}>
        {label}
      </Label>
    </FormGroup>
  );
}