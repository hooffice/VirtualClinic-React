import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
  get,
} from "react-hook-form";
import Select from "react-select";
import { FormGroup, Label, FormFeedback } from "reactstrap";

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

  // ✅ Safe error access
  const error = get(errors, name);
  const value = watch(name);

  // 🔹 View mode
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
            <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
            <div>
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

                // ✅ VALUE
                value={
                  isMulti
                    ? options.filter((o) =>
                        ((field.value as (string | number)[]) || []).some(
                          (v) => v == o.value,
                        ),
                      )
                    : options.find((o) => o.value == field.value) || null
                }

                // ✅ CHANGE
                onChange={(option) => {
                  let finalValue: BaseValue | MultiValueType;

                  if (isMulti) {
                    finalValue =
                      (option as SelectOption[] | null)?.map((o) => o.value) ||
                      [];
                  } else {
                    finalValue =
                      (option as SelectOption | null)?.value ?? null;
                  }

                  field.onChange(finalValue);

                  // 🔥 trigger validation immediately
                  field.onBlur();

                  onChange?.(finalValue as TValue);
                }}

                // 🔥 CRITICAL: BLUR
                onBlur={field.onBlur}

                // ✅ STYLES (error support)
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "34px",
                    height: "34px",
                    fontSize: "11px",
                    borderColor: error ? "#dc3545" : base.borderColor,
                    boxShadow: error ? "0 0 0 1px #dc3545" : base.boxShadow,
                    "&:hover": {
                      borderColor: error ? "#dc3545" : base.borderColor,
                    },
                  }),

                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                    fontSize: "11px",
                  }),

                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                    fontSize: "11px",
                  }),

                  placeholder: (base) => ({
                    ...base,
                    fontSize: "11px",
                    color: "#adb5bd",
                  }),

                  valueContainer: (base) => ({
                    ...base,
                    height: "34px",
                    padding: "0 8px",
                  }),

                  input: (base) => ({
                    ...base,
                    margin: 0,
                    padding: 0,
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
              />

              {/* ✅ Error */}
              {error && (
                <FormFeedback style={{ display: "block" }}>
                  {error.message as string}
                </FormFeedback>
              )}
            </div>
          )}
        />
      )}
    </FormGroup>
  );
}