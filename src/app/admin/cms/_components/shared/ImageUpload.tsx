"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Plus, X } from "lucide-react";

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  isUploading?: boolean;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({
  onFilesSelected,
  maxFiles = 2,
  accept = "image/*",
  isUploading = false,
  multiple = true,
  placeholder,
  className = "",
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelection(files);
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const updatedPending = [...pendingFiles, ...newFiles].slice(0, maxFiles);

    if (newFiles.length + pendingFiles.length > maxFiles) {
      // Could show toast here - for now just trim
    }

    setPendingFiles(updatedPending);
  };

  const handleConfirm = () => {
    onFilesSelected(pendingFiles);
    setPendingFiles([]);
  };

  const handleCancel = () => {
    setPendingFiles([]);
  };

  const defaultPlaceholder = multiple
    ? `Drag & drop ${maxFiles > 1 ? `up to ${maxFiles} images` : "an image"}`
    : "Drag & drop an image";

  return (
    <div className={className}>
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-300 ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block cursor-pointer">
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={(e) => handleFileSelection(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />

          {pendingFiles.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-center space-x-2">
                {Array.from({ length: maxFiles }).map((_, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-24 overflow-hidden rounded border-2 transition-all duration-300 ${
                      pendingFiles[index]
                        ? "border-blue-300 bg-white"
                        : isDragOver
                          ? "border-blue-500 bg-blue-100"
                          : "border-dashed border-gray-300 bg-gray-50"
                    }`}
                  >
                    {pendingFiles[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(pendingFiles[index])}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Plus
                          className={`h-4 w-4 transition-colors ${
                            isDragOver ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p
                className={`text-xs transition-colors ${
                  isDragOver ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {pendingFiles.length < maxFiles
                  ? isDragOver
                    ? `Drop here to add ${maxFiles - pendingFiles.length} more`
                    : `Drop ${maxFiles - pendingFiles.length} more or click to browse`
                  : `${pendingFiles.length} files ready - confirm below`}
              </p>
            </div>
          ) : (
            <div>
              <div className={`relative ${isDragOver ? "animate-pulse" : ""}`}>
                <div
                  className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isDragOver
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-400 bg-gray-100"
                  }`}
                />

                <Upload
                  className={`absolute inset-0 m-auto h-5 w-5 transition-colors ${
                    isDragOver ? "text-blue-600" : "text-gray-500"
                  }`}
                />
              </div>

              <p
                className={`text-sm font-medium ${isDragOver ? "text-blue-600" : "text-gray-600"}`}
              >
                {isDragOver ? "Drop images here" : placeholder || defaultPlaceholder}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                or{" "}
                <span className="text-blue-600 underline hover:text-blue-700">
                  browse files
                </span>
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Confirm/Cancel Actions */}
      {pendingFiles.length > 0 && (
        <div className="mt-3 flex space-x-2">
          <Button
            onClick={handleConfirm}
            size="sm"
            className="flex-1"
            disabled={isUploading || pendingFiles.length === 0}
          >
            <Upload className="mr-1 h-4 w-4" />
            {isUploading ? "Uploading..." : "Confirm Upload"}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
