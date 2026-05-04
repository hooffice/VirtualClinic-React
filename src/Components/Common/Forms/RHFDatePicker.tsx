import { useRef } from "react";
import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
  get,
} from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RHFDatePicker.css";
import { FormGroup, Label, FormFeedback } from "reactstrap";

interface RHFDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  isEdit?: boolean;
  required?: boolean;
}

export function RHFDatePicker<T extends FieldValues>({
  name,
  label,
  placeholder = "Select date",
  disabled = false,
  dateFormat = "MM/dd/yyyy",
  showTimeSelect = false,
  isEdit = true,
  required = false,
}: RHFDatePickerProps<T>) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<T>();

  // ✅ Safe error access (supports nested fields)
  const error = get(errors, name);

  const value = watch(name);
  const dateRef = useRef<DatePicker>(null);

  // ✅ Safe date parser
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

  // ✅ Display format for view mode
  const formatDisplayDate = () => {
    const date = parseDate(value);
    if (!date) return "";

    return showTimeSelect
      ? date.toLocaleString()
      : date.toLocaleDateString();
  };

  return (
    <FormGroup>
      <Label style={{ fontSize: "12px", fontWeight: 500 }}>
        {label}
        {required && (
          <span style={{ color: "red", marginLeft: 4 }}>*</span>
        )}
      </Label>

      {!isEdit ? (
        // 🔹 VIEW MODE
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
          {formatDisplayDate()}
        </div>
      ) : (
        // 🔹 EDIT MODE
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selectedDate = parseDate(field.value);

            return (
              <div style={{ position: "relative" }}>
                <DatePicker
                  ref={dateRef}
                  selected={selectedDate}
                  onChange={(date) => field.onChange(date)}
                  onBlur={field.onBlur}  // 🔥 CRITICAL FIX
                  placeholderText={placeholder}
                  dateFormat={dateFormat}
                  showTimeSelect={showTimeSelect}
                  disabled={disabled}
                  className={`form-control rhf-datepicker ${
                    error ? "is-invalid" : ""
                  }`}
                />

                {/* Calendar Icon */}
                <span
                  onClick={() => dateRef.current?.setOpen(true)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#7ab4e7",
                  }}
                >
                  <i className="fas fa-calendar"></i>
                </span>
              </div>
            );
          }}
        />
      )}

      {/* ✅ Error Message */}
      {error && (
        <FormFeedback style={{ display: "block" }}>
          {error.message as string}
        </FormFeedback>
      )}
    </FormGroup>
  );
}