"use client";

import { useState } from "react";
import { Plus, Upload, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { HeroContent } from "@/app/generated/prisma";

interface HeroImagesManagerProps {
  heroContent: HeroContent | null;
  onUpdate: () => void;
}

export default function HeroImagesManager({
  heroContent,
  onUpdate,
}: HeroImagesManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingSlideIndex, setDeletingSlideIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const handleImageSelection = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, 2);
    setPendingImages(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).slice(0, 2);
    setPendingImages(files);
  };

  const handleConfirmUpload = async () => {
    if (pendingImages.length !== 2) {
      toast.error("Please select exactly 2 images for a slide");
      return;
    }
    await handleFilesSelected(pendingImages);
    setPendingImages([]);
  };

  const imagePairs = [];
  if (heroContent) {
    for (let i = 0; i < heroContent.imagePaths.length; i += 2) {
      if (i + 1 < heroContent.imagePaths.length) {
        imagePairs.push([
          heroContent.imagePaths[i],
          heroContent.imagePaths[i + 1],
        ]);
      }
    }
  }

  const handleFilesSelected = async (files: File[]) => {
    if (files.length !== 2) {
      toast.error("Please select exactly 2 images for a slide");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading images...");

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/hero", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    });

    try {
      const results = await Promise.all(uploadPromises);
      const imagePaths = results.map((r) => r.url);
      const imagePublicIds = results.map((r) => r.publicId);

      if (heroContent) {
        await fetch("/api/hero", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: heroContent.id,
            imagePaths: [...heroContent.imagePaths, ...imagePaths],
            imagePublicIds: [
              ...(heroContent.imagePublicIds || []),
              ...imagePublicIds,
            ],
          }),
        });
      } else {
        await fetch("/api/hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: "Your hero description here...",
            imagePaths,
            imagePublicIds,
            href: "#",
            textHref: "CHECK US OUT ;)",
          }),
        });
      }

      onUpdate();
      toast.success("Images uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      toast.dismiss();
    }
  };



  const handleCancelUpload = () => {
    setPendingImages([]);
  };

  const handleDeleteSlide = async (index: number) => {
    if (!heroContent) return;

    try {
      setDeletingSlideIndex(index);

      const publicIdsToDelete = [
        (heroContent.imagePublicIds || [])[index * 2],
        (heroContent.imagePublicIds || [])[index * 2 + 1],
      ].filter(Boolean);

      for (const publicId of publicIdsToDelete) {
        try {
          await fetch("/api/upload/hero", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
          });
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary deletion error for publicId:",
            publicId,
            cloudinaryError,
          );
        }
      }

      const newImagePaths = heroContent.imagePaths.filter(
        (_, i) => i !== index * 2 && i !== index * 2 + 1,
      );
      const newImagePublicIds = (heroContent.imagePublicIds || []).filter(
        (_, i) => i !== index * 2 && i !== index * 2 + 1,
      );

      await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: heroContent.id,
          imagePaths: newImagePaths,
          imagePublicIds: newImagePublicIds,
        }),
      });

      onUpdate();
      toast.success("Slide deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    } finally {
      setDeletingSlideIndex(null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Hero Images</h3>
        <Badge variant="outline">{imagePairs.length} slides</Badge>
      </div>

      {/* Upload Button with Drag & Drop */}
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
            multiple
            accept="image/*"
            onChange={(e) => handleImageSelection(e.target.files)}
            className="hidden"
          />

          {pendingImages.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-center space-x-2">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-24 overflow-hidden rounded border-2 transition-all duration-300 ${
                      pendingImages[index]
                        ? "border-blue-300 bg-white"
                        : isDragOver
                          ? "border-blue-500 bg-blue-100"
                          : "border-dashed border-gray-300 bg-gray-50"
                    }`}
                  >
                    {pendingImages[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(pendingImages[index])}
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
                {pendingImages.length === 1
                  ? isDragOver
                    ? "Drop here to add second image"
                    : "Drop 1 more image or click to browse"
                  : "2 images ready - confirm below"}
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
                {isDragOver ? "Drop images here" : "Drag & drop images"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add 1 or 2 images at once, or{" "}
                <span className="text-blue-600 underline hover:text-blue-700">
                  browse files
                </span>
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Confirm/Cancel Actions */}
      {pendingImages.length > 0 && (
        <div className="mt-3 flex space-x-2">
          <Button
            onClick={handleConfirmUpload}
            size="sm"
            className="flex-1"
            disabled={isUploading || pendingImages.length !== 2}
          >
            <Upload className="mr-1 h-4 w-4" />
            {isUploading ? "Uploading..." : "Confirm Upload"}
          </Button>
          <Button
            onClick={handleCancelUpload}
            variant="outline"
            size="sm"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Existing Slides */}
      {(imagePairs.length > 0 || isUploading) && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Current Slides:</p>

          {imagePairs.map((pair, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded border bg-white p-2 transition-all duration-300 ${
                deletingSlideIndex === index
                  ? "pointer-events-none opacity-50 grayscale"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs font-medium">
                  {index + 1}
                </div>

                <div className="flex space-x-1">
                  <div className="relative h-8 w-12 overflow-hidden rounded">
                    <Image
                      src={pair[0]}
                      alt={`Slide ${index + 1} - Image 1`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-8 w-12 overflow-hidden rounded">
                    <Image
                      src={pair[1]}
                      alt={`Slide ${index + 1} - Image 2`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <span className="text-sm">Slide {index + 1}</span>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled={deletingSlideIndex === index}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Slide</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete Slide {index + 1}? This
                      action cannot be undone and will permanently remove both
                      images from this slide.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteSlide(index)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Slide
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {/* Loading skeleton for new slide */}
          {isUploading && (
            <div className="flex animate-pulse items-center justify-between rounded border bg-white p-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs font-medium">
                  {imagePairs.length + 1}
                </div>

                <div className="flex space-x-1">
                  <div className="h-8 w-12 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-8 w-12 animate-pulse rounded bg-gray-300"></div>
                </div>

                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
