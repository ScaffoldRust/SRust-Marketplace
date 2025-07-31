"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "../../ui/button";
import Image from "next/image";

interface FileUploadProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({
  value,
  onChange,
  accept = "image/*",
  maxSize = 800,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the value prop to set initial preview if available
  useEffect(() => {
    if (value) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    }
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Set file
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        aria-label="Upload file"
      />

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              isDragging
                ? "border-white bg-white/10"
                : "border-zinc-700 hover:border-white/50 bg-zinc-900"
            }`}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 rounded-full bg-zinc-800">
              <Upload className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop your logo here or click to browse
              </p>
              <p className="text-xs text-zinc-500">
                PNG, JPG or GIF (max {maxSize}x{maxSize}px)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-zinc-800">
          <Image
            src={preview || "/placeholder.svg"}
            alt="Preview"
            width={400}
            height={160}
            className="w-full h-40 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      )}
    </div>
  );
}
