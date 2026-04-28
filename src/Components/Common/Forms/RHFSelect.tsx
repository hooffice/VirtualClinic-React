import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { FormGroup, Label } from "reactstrap";

type SelectOption = {
  value: number | string;
  label: string;
};

interface RHFSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: SelectOption[];
  isClearable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
}

export function RHFSelect<T extends FieldValues>({
  name,
  label,
  options,
  isClearable = true,
  isDisabled = false,
  isMulti = false,
}: RHFSelectProps<T>) {
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
          <CreatableSelect
            options={options}
            isClearable={isClearable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            classNamePrefix="react-select"

            value={
              isMulti
                ? options.filter((o) =>
                    ((field.value as (string | number)[]) || []).some(
                      (v) => v == o.value, // string/number
                    ),
                  )
                : options.find((o) => o.value == field.value) || null
            }

            onChange={(option) => {
              if (isMulti) {
                const values =
                  (option as SelectOption[] | null)?.map((o) => o.value) || [];
                field.onChange(values);
              } else {
                field.onChange((option as SelectOption | null)?.value ?? null);
              }
            }}
          />
        )}
      />

      {error && (
        <div className="text-danger small mt-1">{error.message as string}</div>
      )}
    </FormGroup>
  );
}
