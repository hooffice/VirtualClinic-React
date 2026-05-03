import {
  FieldValues,
  Path,
  useFormContext
} from "react-hook-form";
import {
  FormGroup,
  Label,
  Input,
  FormFeedback
} from "reactstrap";

interface RHFTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  isEdit?: boolean; // NEW
  required?: boolean; 
  
}

export function RHFTextArea<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 3,
  disabled = false,
  isEdit = true,
  required = false, // default false
}: RHFTextAreaProps<T>) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<T>();

  const error = errors[name];
  const value = watch(name); // get current value

  return (
    <FormGroup>
        <Label>
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: 4 }}>*</span>
          )}
        </Label>

      {!isEdit ? (
        // VIEW MODE
        <div
          style={{
            padding: "8px 12px",
            minHeight: `${rows * 24}px`,
            border: "1px solid #ced4da",
            borderRadius: "6px",
            backgroundColor: "#f8f9fa",
            whiteSpace: "pre-wrap", // keeps line breaks
          }}
        >
          {value || "-"}
        </div>
      ) : (
        // EDIT MODE
        <Input
          type="textarea"
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
          invalid={!!error}
        />
      )}

      {error && (
        <FormFeedback>
          {error.message as string}
        </FormFeedback>
      )}
    </FormGroup>
  );
}