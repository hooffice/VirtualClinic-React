import React, { useRef, useEffect, useState } from "react";
import { useFormContext, get } from "react-hook-form";
import { FormGroup, Label, FormFeedback } from "reactstrap";
import avatarPlaceholder from "@/assets/images/avatar-placeholder.png";

interface Props {
  label?: string;
  name: string;
  alt?: string;
  imageUrl?: string | null;
  isEdit?: boolean;
  required?: boolean;
  showUploadButton?: boolean;
  className?: string;
  containerStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const RHFProfileImage: React.FC<Props> = ({
  label,
  name,
  imageUrl,
  alt = "Profile",
  isEdit = true,
  required = false,
  showUploadButton = false,
  className = "avatar-lg",
  style,
  containerStyle,
}) => {
  const {
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext();

  const fileRef = useRef<HTMLInputElement>(null);
  const file = watch(name);

  // ✅ Safe error access
  const error = get(errors, name);

  // ✅ Handle preview safely (avoid memory leak)
  const [preview, setPreview] = useState<string>(avatarPlaceholder);

  useEffect(() => {
    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl); // 🔥 cleanup
    } else {
      setPreview(imageUrl || avatarPlaceholder);
    }
  }, [file, imageUrl]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (selected) {
      setValue(name, selected, {
        shouldDirty: true,
        shouldValidate: true, // 🔥 trigger validation
      });

      // 🔥 manually trigger validation (acts like blur)
      trigger(name);
    }
  };

  const openFileDialog = () => {
    if (isEdit) {
      fileRef.current?.click();
    }
  };

  return (
    <FormGroup className="text-center">
      {/* Label */}
      {label && (
        <Label style={{ fontSize: "12px", fontWeight: 500 }} className="d-block">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Label>
      )}

      {/* Image Preview */}
      <div
        onClick={openFileDialog}
        style={{
          overflow: "hidden",
          border: `1px solid ${error ? "red" : "#ccc"}`, // 🔥 error highlight
          margin: "0 auto",
          cursor: isEdit ? "pointer" : "default",
          borderRadius: "6px",
          ...containerStyle,
        }}
      >
        <img
          src={preview}
          alt={alt}
          className={className}
          style={style}
        />
      </div>

      {/* Upload Button */}
      {isEdit && showUploadButton && (
        <button
          type="button"
          className="btn btn-sm btn-primary mt-2"
          onClick={openFileDialog}
        >
          Upload
        </button>
      )}

      {/* Hidden Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleSelect}
      />

      {/* ✅ Error */}
      {error && (
        <FormFeedback style={{ display: "block" }}>
          {error.message as string}
        </FormFeedback>
      )}
    </FormGroup>
  );
};