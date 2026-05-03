import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormGroup, Label } from "reactstrap";
import avatarPlaceholder from "@/assets/images/avatar-placeholder.png"; // adjust path

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
  style?:  React.CSSProperties;
  
}

export const RHFProfileImage: React.FC<Props> = ({
  label,
  name,
  imageUrl,
  alt="Profile",
  isEdit = true,
  required = false,
  showUploadButton = false, 
  className="avatar-lg",
  style,
  containerStyle
}) => {
  const { setValue, watch } = useFormContext();
  const fileRef = useRef<HTMLInputElement>(null);

  const file = watch(name);

  const preview =
    file instanceof File
      ? URL.createObjectURL(file)
      : imageUrl || avatarPlaceholder;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setValue(name, selected, { shouldDirty: true });
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

      {/* Image Preview (Clickable) */}
      <div        
        onClick={openFileDialog}
        style={{
          overflow: "hidden",
          border: "1px solid #ccc",
          margin: "0 auto",
          cursor: isEdit ? "pointer" : "default",
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

      {/* Optional Upload Button */}
      {isEdit && showUploadButton && (
        <button
          type="button"
          className="btn btn-sm btn-primary mt-2"
          onClick={openFileDialog}
        >
          Upload
        </button>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleSelect}
      />
    </FormGroup>
  );
};