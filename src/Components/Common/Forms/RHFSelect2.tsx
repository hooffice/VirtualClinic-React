import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import Select from "react-select";
import { FormGroup, Label } from "reactstrap";

type SelectOption = {
  value: string | number;
  label: string;
};

type BaseValue = string | number | null;
type MultiValueType = (string | number)[];

interface RHFSelectProps<
  T extends FieldValues,
  TValue = BaseValue | MultiValueType,
> {
  name: Path<T>;
  label?: string;
  options: SelectOption[];
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  isEdit?: boolean;
  required?: boolean;
  isLoading?: boolean;
  maxheight?: number;
  onChange?: (value: TValue) => void;
}

export function RHFSelect2<
  T extends FieldValues,
  TValue = BaseValue | MultiValueType,
>({
  name,
  label,
  options,
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  isMulti = false,
  isEdit = true,
  required = false,
  isLoading = false,
  maxheight = 150,
  onChange,
}: RHFSelectProps<T, TValue>) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<T>();

  const error = errors[name];
  const value = watch(name);

  // ✅ View mode
  const getDisplayValue = () => {
    if (isMulti) {
      if (!Array.isArray(value)) return "";
      return options
        .filter((o) => value.includes(o.value))
        .map((o) => o.label)
        .join(", ");
    } else {
      const option = options.find((o) => o.value == value);
      return option?.label || "";
    }
  };

  return (
    <FormGroup>
      {label && (
        <Label style={{ fontSize: "12px", fontWeight: 500 }}>
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: 4, fontSize: "12px" }}>
              *
            </span>
          )}
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
          {getDisplayValue()}
        </div>
      ) : (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              options={options}
              isSearchable={isSearchable}
              isClearable={isClearable}
              isDisabled={isDisabled}
              isMulti={isMulti}
              isLoading={isLoading}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              maxMenuHeight={maxheight}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                  fontSize: "11px",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  backgroundColor: "#fff",
                  fontSize: "11px",
                }),

                control: (base, state) => ({
                  ...base,
                  minHeight: "34px", // reduce height here
                  height: "34px",
                  fontSize: "11px",
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: "11px",
                  color: "#adb5bd", // softer gray
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: "34px",
                  padding: "0 8px", // reduce vertical padding
                }),

                input: (base) => ({
                  ...base,
                  margin: "0px",
                  padding: "0px",
                  fontSize: "11px",
                }),

                indicatorsContainer: (base) => ({
                  ...base,
                  height: "34px",
                }),

                singleValue: (base) => ({
                  ...base,
                  fontSize: "11px",
                }),

                multiValue: (base) => ({
                  ...base,
                  fontSize: "11px",
                }),
              }}
              value={
                isMulti
                  ? options.filter((o) =>
                      ((field.value as (string | number)[]) || []).some(
                        (v) => v == o.value,
                      ),
                    )
                  : options.find((o) => o.value == field.value) || null
              }
              onChange={(option) => {
                let finalValue: BaseValue | MultiValueType;

                if (isMulti) {
                  finalValue =
                    (option as SelectOption[] | null)?.map((o) => o.value) ||
                    [];
                } else {
                  finalValue = (option as SelectOption | null)?.value ?? null;
                }

                field.onChange(finalValue);
                onChange?.(finalValue as TValue);
              }}
            />
          )}
        />
      )}

      {error && (
        <div className="text-danger small mt-1">{error.message as string}</div>
      )}
    </FormGroup>
  );
}
