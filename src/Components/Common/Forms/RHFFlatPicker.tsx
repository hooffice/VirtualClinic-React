import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { FormGroup, Label, FormFeedback } from "reactstrap";
import './RHFFlatPicker.css'

interface RHFFlatpickrProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  mode?: "date" | "datetime" | "time";
  isEdit?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export function RHFFlatpickr<T extends FieldValues>({
  name,
  label,
  mode = "date",
  isEdit = true,
  required = false,
  disabled = false,
}: RHFFlatpickrProps<T>) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<T>();

  const error = errors[name];
  const value = watch(name);

  // Helper function to safely parse dates from various formats
  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }
    if (typeof val === "string") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const getOptions = () => {
    switch (mode) {
      case "datetime":
        return {
          enableTime: true,
          dateFormat: "m/d/Y h:i K",
        };
      case "time":
        return {
          enableTime: true,
          noCalendar: true,
          dateFormat: "h:i K",
        };
      default:
        return {
          dateFormat: "m/d/Y",
        };
    }
  };

  const formatDisplay = () => {
    const d = parseDate(value);
    if (!d) return "";

    if (mode === "datetime") return d.toLocaleString();
    if (mode === "time") return d.toLocaleTimeString();
    return d.toLocaleDateString();
  };

  return (
    <FormGroup>
      <Label style={{ fontSize: "12px", fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "red" }}> *</span>}
      </Label>

      {!isEdit ? (
        <div
          style={{
            padding: "8px 12px",
            minHeight: "38px",
            border: "1px solid #ced4da",
            borderRadius: "6px",
            backgroundColor: "#f8f9fa",
            fontSize: "12px",
          }}
        >
          {formatDisplay()}
        </div>
      ) : (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selectedDate = parseDate(field.value);
            return (
            <div style={{ position: "relative" }}>
              <Flatpickr
                style={{ fontSize: "11px" }}
                value={selectedDate}
                onChange={([date]) => field.onChange(date)}
                options={{
                  ...getOptions(),
                  time_24hr: false,
                  minuteIncrement: 5,
                }}
                className={`form-control fp-small ${error ? "is-invalid" : ""}`}
                disabled={disabled}
              />
              <span
                onClick={(e) => {
                  // focus input to open picker
                  const input = e.currentTarget
                    .previousSibling as HTMLInputElement;
                  input?.focus();
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#7ab4e7",
                  fontSize: "11px",
                }}
              >
                <i
                  className={
                    mode === "time" ? "fas fa-clock" : "fas fa-calendar"
                  }
                ></i>
              </span>
            </div>
            );
          }}
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
