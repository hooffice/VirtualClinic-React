import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
  get,
} from "react-hook-form";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { FormGroup, Label, FormFeedback } from "reactstrap";
import "./RHFFlatPicker.css";

interface RHFFlatpickrProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  mode?: "date" | "datetime" | "time";
  isEdit?: boolean;
  required?: boolean;
  disabled?: boolean;
  isClear?: boolean; // ✅ NEW
}

export function RHFFlatpickr<T extends FieldValues>({
  name,
  label,
  mode = "date",
  isEdit = true,
  required = false,
  disabled = false,
  isClear = true, // ✅ default false
}: RHFFlatpickrProps<T>) {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContext<T>();

  const error = get(errors, name);
  const value = watch(name);

  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === "string") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const getOptions = () => {
    switch (mode) {
      case "datetime":
        return { enableTime: true, dateFormat: "m/d/Y h:i K" };
      case "time":
        return {
          enableTime: true,
          noCalendar: true,
          dateFormat: "h:i K",
        };
      default:
        return { dateFormat: "m/d/Y" };
    }
  };

  const formatDisplay = () => {
    const d = parseDate(value);
    if (!d) return "";
    if (mode === "datetime") return d.toLocaleString();
    if (mode === "time") return d.toLocaleTimeString();
    return d.toLocaleDateString();
  };

  const handleClear = () => {
    setValue(name, null as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
    trigger(name); // 🔥 ensure validation runs
  };

  return (
    <FormGroup>
      {label && (
        <Label style={{ fontSize: "12px", fontWeight: 500 }}>
          {label}
          {required && <span style={{ color: "red" }}> *</span>}
        </Label>
      )}

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
                  value={selectedDate}
                  onChange={([date]) => field.onChange(date)}
                  onClose={field.onBlur}
                  options={{
                    ...getOptions(),
                    time_24hr: false,
                    minuteIncrement: 5,
                  }}
                  className={`form-control fp-small ${
                    error ? "is-invalid" : ""
                  }`}
                  disabled={disabled}
                  style={{ fontSize: "11px", paddingRight: "60px" }}
                />

                {/* Calendar Icon */}
                <span
                  onClick={(e) => {
                    const input = e.currentTarget
                      .previousSibling as HTMLInputElement;
                    input?.focus();
                  }}
                  style={{
                    position: "absolute",
                    right: isClear ? "30px" : "10px",
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

                {/* ✅ Clear Button */}
                {isClear && selectedDate && !disabled && (
                  <span
                    onClick={handleClear}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#dc3545",
                      fontSize: "12px",
                    }}
                    title="Clear"
                  >
                    <i className="fas fa-times"></i>
                  </span>
                )}
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