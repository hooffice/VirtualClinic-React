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
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export function RHFTextArea<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 3,
  disabled = false,
}: RHFTextAreaProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <FormGroup>
      <Label>{label}</Label>

      <Input
        type="textarea"
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        invalid={!!error}
      />

      {error && (
        <FormFeedback>
          {error.message as string}
        </FormFeedback>
      )}
    </FormGroup>
  );
}