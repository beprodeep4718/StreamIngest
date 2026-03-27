"use client";

import { useRef } from "react";

type DropZoneProps = {
  file: File | null;
  onFileSelect: (file: File) => void;
  onDragStateChange?: (isDragging: boolean) => void;
};

export default function DropZone({
  file,
  onFileSelect,
  onDragStateChange,
}: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange?.(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "text/csv") {
      onFileSelect(dropped);
    }
  };

  return (
    <div
      className={`drop-zone ${file ? "has-file" : ""}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        onDragStateChange?.(true);
      }}
      onDragLeave={() => onDragStateChange?.(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      <div className="drop-icon">
        {file ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10l4 4 8-8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3v10M6 7l4-4 4 4M4 14h12a1 1 0 001-1v-1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="drop-label">
        {file ? "File ready" : "Drop CSV here or click to browse"}
      </div>
      <div className="drop-sub">
        {file ? "" : "Supports .csv files up to 100MB"}
      </div>
      {file && <div className="file-name">↳ {file.name}</div>}
    </div>
  );
}
