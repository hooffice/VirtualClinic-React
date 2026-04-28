import { Controller, useFormContext, FieldValues, Path } from "react-hook-form";
import { Input, FormGroup, Label, FormFeedback } from "reactstrap";

interface Props<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: any;
  placeholder?: string;
  disabled?: boolean;
}

export function RHFInput<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
}: Props<T>) {
  const { control, formState: { errors } } = useFormContext<T>();

  const error = errors[name];

  return (
    <FormGroup>
      <Label>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value ?? ""}
            invalid={!!error}
          />
        )}
      />

      {error && (
        <FormFeedback style={{ display: "block" }}>
          {error.message as string}
        </FormFeedback>
      )}
    </FormGroup>
  );
}