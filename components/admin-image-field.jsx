"use client";

import { useRef, useState } from "react";

export default function AdminImageField({ label, image, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function chooseImage(event) {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Images must be 5 MB or smaller.");
      return;
    }

    setError("");
    setUploading(true);
    try {
      await onUpload(file);
    } catch (issue) {
      setError(issue.message || "The image could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-preview">
        {image?.url
          ? <img src={image.url} alt={`${label} preview`} />
          : <span>No image selected</span>}
      </div>
      <div className="admin-image-controls">
        <strong>{label}</strong>
        <p>JPG, PNG, or WebP · up to 5 MB</p>
        <div>
          <button type="button" className="text-link" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : image?.url ? "Replace image" : "Add image"}
          </button>
          {image?.url && (
            <button type="button" className="admin-remove-image" onClick={onRemove} disabled={uploading}>
              Remove
            </button>
          )}
        </div>
        {error && <p className="admin-image-error" role="alert">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={chooseImage}
        hidden
      />
    </div>
  );
}
