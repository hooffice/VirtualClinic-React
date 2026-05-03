import { Controller, useFormContext, FieldValues, Path } from "react-hook-form";
import { Input, FormGroup, Label, FormFeedback } from "reactstrap";

interface Props<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  type?: any;
  placeholder?: string;
  disabled?: boolean;
  isEdit?: boolean;
  required?: boolean; 
}

export function RHFInput<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
  isEdit = true,
  required = false, // default false
}: Props<T>) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<T>();

  const error = errors[name];
  const value = watch(name);

  return (
    <FormGroup>
      {label && (
        <Label style={{ fontSize: "12px", fontWeight: 500 }}>
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: 4, fontSize: "12px" }}>*</span>
          )}
        </Label>
      )}

      {!isEdit ? (
        // VIEW MODE
        <div style={{ padding: "8px 0", minHeight: "38px", fontSize: "12px" }}>
          {value || ""}
        </div>
      ) : (
        // EDIT MODE
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
              style={{fontSize: "11px"}}
            />
          )}
        />
      )}

      {error && (
        <FormFeedback style={{ display: "block" }}>
          {error.message as string}
        </FormFeedback>
      )}
    </FormGroup>
  );
}