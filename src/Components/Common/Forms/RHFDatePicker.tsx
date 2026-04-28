import {
  Controller,
  FieldValues,
  Path,
  useFormContext
} from "react-hook-form";
import DatePicker from "react-datepicker";
import {
  FormGroup,
  Label,
  FormFeedback
} from "reactstrap";

interface RHFDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
}

export function RHFDatePicker<T extends FieldValues>({
  name,
  label,
  placeholder = "Select date",
  disabled = false,
  dateFormat = "dd/MM/yyyy",
  showTimeSelect = false,
}: RHFDatePickerProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <FormGroup>
      <Label>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date)}
            placeholderText={placeholder}
            dateFormat={dateFormat}
            showTimeSelect={showTimeSelect}
            disabled={disabled}
            className={`form-control ${error ? "is-invalid" : ""}`}
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