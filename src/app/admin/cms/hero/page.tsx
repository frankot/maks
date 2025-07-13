"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Upload, Eye, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { HeroContent } from "@/app/generated/prisma";

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    href: "",
    textHref: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  useEffect(() => {
    if (heroContent && heroContent.imagePaths.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(
          (prev) => (prev + 1) % Math.ceil(heroContent.imagePaths.length / 2),
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroContent]);

  const fetchHeroContent = async () => {
    try {
      const response = await fetch("/api/hero");
      if (response.ok) {
        const data = await response.json();
        // data will be null if no hero content exists, which is expected
        setHeroContent(data);
      } else {
        // Only log error if it's not a 404 (which would be expected for no content)
        if (response.status !== 404) {
          console.error("Failed to fetch hero content:", response.status);
        }
        setHeroContent(null);
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
      setHeroContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndSetFiles(files);
    }
  };

  const validateAndSetFiles = (files: File[]) => {
    const errors: string[] = [];

    // Check if exactly 2 files are selected
    if (files.length !== 2) {
      errors.push("Please select exactly 2 images for a slide pair");
    }

    // Check file sizes (9MB = 9 * 1024 * 1024 bytes)
    const maxSize = 9 * 1024 * 1024;
    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(
          `Image ${index + 1} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 9MB.`,
        );
      }
    });

    // Check file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/tif",
      "image/svg+xml",
      "image/avif",
      "image/heic",
      "image/heif",
    ];
    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(
          `Image ${index + 1} must be a valid image file (JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC)`,
        );
      }
    });

    setFileErrors(errors);

    if (errors.length === 0) {
      setSelectedFiles(files);
      toast.success("Images selected successfully!");
    } else {
      setSelectedFiles([]);
      // Show first error as toast
      toast.error(errors[0]);
    }
  };

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

    const files = Array.from(e.dataTransfer.files);
    validateAndSetFiles(files);
  };

  const handleUploadSlide = async () => {
    if (selectedFiles.length !== 2) {
      toast.error("Please select exactly 2 images");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading images...");

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/hero", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
        return response.json();
      });

      const uploadResults = await Promise.all(uploadPromises);
      const imagePaths = uploadResults.map((result) => result.url);
      const imagePublicIds = uploadResults.map((result) => result.publicId);

      // Add images to existing hero content or create new one
      if (heroContent) {
        const newImagePaths = [...heroContent.imagePaths, ...imagePaths];
        const newImagePublicIds = [
          ...(heroContent.imagePublicIds || []),
          ...imagePublicIds,
        ];
        const response = await fetch("/api/hero", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: heroContent.id,
            imagePaths: newImagePaths,
            imagePublicIds: newImagePublicIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update hero content");
        }
      } else {
        // Create new hero content with default description
        const response = await fetch("/api/hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: "Enter your hero description here...",
            imagePaths,
            imagePublicIds,
            href: "#",
            textHref: "CHECK US OUT ;)",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create hero content");
        }
      }

      // Reset form
      setSelectedFiles([]);
      setFileErrors([]);

      // Refresh data
      fetchHeroContent();
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
      toast.dismiss();
    }
  };

  const handleUpdateContent = async () => {
    if (!heroContent) return;

    try {
      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: heroContent.id,
          description: formData.description,
          href: formData.href,
          textHref: formData.textHref,
        }),
      });

      if (response.ok) {
        fetchHeroContent();
        setIsEditModalOpen(false);
        toast.success("Hero content updated successfully!");
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update failed. Please try again.");
    }
  };

  const handleDeleteImagePair = async (startIndex: number) => {
    if (!heroContent) return;

    setDeleteTargetIndex(startIndex);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!heroContent || deleteTargetIndex === null) return;

    try {
      // Get the public IDs of images to delete
      const publicIdsToDelete = [
        (heroContent.imagePublicIds || [])[deleteTargetIndex],
        (heroContent.imagePublicIds || [])[deleteTargetIndex + 1],
      ].filter(Boolean);

      // Delete images from Cloudinary
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
          // Continue with other images even if one fails
        }
      }

      // Update database - remove the images from arrays
      const newImagePaths = heroContent.imagePaths.filter(
        (_, index) =>
          index !== deleteTargetIndex && index !== deleteTargetIndex + 1,
      );
      const newImagePublicIds = (heroContent.imagePublicIds || []).filter(
        (_, index) =>
          index !== deleteTargetIndex && index !== deleteTargetIndex + 1,
      );

      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: heroContent.id,
          imagePaths: newImagePaths,
          imagePublicIds: newImagePublicIds,
        }),
      });

      if (response.ok) {
        fetchHeroContent();
        toast.success("Image pair deleted successfully!");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetIndex(null);
    }
  };

  const openEditModal = () => {
    if (heroContent) {
      setFormData({
        description: heroContent.description,
        href: heroContent.href || "",
        textHref: heroContent.textHref || "",
      });
      setIsEditModalOpen(true);
    }
  };

  const SkeletonPreview = () => (
    <div className="space-y-6">
      <div className="relative h-[400px] overflow-hidden rounded-lg bg-gray-100">
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-black/5" />

        {/* Image pairs skeleton */}
        <div className="flex h-full">
          <div className="flex w-1/2 items-center justify-center bg-gray-200">
            <div className="text-sm text-gray-400">Image 1</div>
          </div>
          <div className="flex w-1/2 items-center justify-center bg-gray-300">
            <div className="text-sm text-gray-400">Image 2</div>
          </div>
        </div>
      </div>

      {/* Static content skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        </div>

        <div className="flex justify-center">
          <div className="h-6 w-32 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );

  const HeroPreview = ({ content }: { content: HeroContent }) => {
    // Group images into pairs for display
    const imagePairs = [];
    for (let i = 0; i < content.imagePaths.length; i += 2) {
      if (i + 1 < content.imagePaths.length) {
        imagePairs.push([content.imagePaths[i], content.imagePaths[i + 1]]);
      }
    }

    return (
      <div className="space-y-6">
        {/* Image carousel */}
        <div className="relative h-[400px] overflow-hidden rounded-lg">
          <div className="absolute top-0 left-0 z-10 h-full w-full bg-black/5" />

          {imagePairs.map((pair, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative w-1/2">
                <Image
                  src={pair[0]}
                  alt="Hero Image 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative w-1/2">
                <Image
                  src={pair[1]}
                  alt="Hero Image 2"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Static content below */}
        <div className="space-y-4">
          <p className="text-center text-lg leading-relaxed uppercase line-clamp-3">
            {content.description}
          </p>

          {content.textHref && (
            <div className="flex justify-center">
              <a
                href={content.href || "#"}
                className="group relative pb-1 text-sm tracking-wider uppercase"
              >
                {content.textHref}
                <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0"></span>
              </a>
            </div>
          )}
        </div>

        {/* Slide indicators */}
        {imagePairs.length > 1 && (
          <div className="flex justify-center space-x-2">
            {imagePairs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hero Content Management</h1>
        <div className="flex gap-2">
          <Button onClick={openEditModal} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Text Content
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Image Slide</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">Select 2 Images</Label>

                  {/* Drag and Drop Zone */}
                  <div
                    className={`relative mt-1 rounded-lg border-2 border-dashed p-8 transition-all duration-300 ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {/* Pulsing Circle Indicator */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div
                        className={`relative ${isDragOver ? "animate-pulse" : ""}`}
                      >
                        <div
                          className={`h-16 w-16 rounded-full border-2 transition-all duration-300 ${
                            isDragOver
                              ? "border-blue-500 bg-blue-100"
                              : "border-gray-400 bg-gray-100"
                          }`}
                        />
                        {isDragOver && (
                          <>
                            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
                            <div className="absolute inset-2 animate-ping rounded-full bg-blue-400 opacity-40" />
                          </>
                        )}
                        <Upload
                          className={`absolute inset-0 m-auto h-6 w-6 transition-colors ${
                            isDragOver ? "text-blue-600" : "text-gray-500"
                          }`}
                        />
                      </div>

                      <div className="text-center">
                        <p
                          className={`text-lg font-medium ${isDragOver ? "text-blue-600" : "text-gray-700"}`}
                        >
                          {isDragOver
                            ? "Drop images here"
                            : "Drag & drop 2 images here"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          or{" "}
                          <label
                            htmlFor="images"
                            className="cursor-pointer text-blue-600 underline hover:text-blue-700"
                          >
                            browse files
                          </label>
                        </p>
                      </div>
                    </div>

                    {/* Hidden file input */}
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Select exactly 2 images (JPEG, PNG, or WebP). Maximum size:
                    9MB per image.
                  </p>

                  {fileErrors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {fileErrors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-red-600"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFiles.length > 0 && fileErrors.length === 0 && (
                    <div className="mt-2 space-y-1">
                      <Badge variant="secondary">
                        {selectedFiles.length} files selected
                      </Badge>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUploadSlide}
                  disabled={isUploading || selectedFiles.length !== 2}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Slide
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!heroContent ? (
              <SkeletonPreview />
            ) : (
              <HeroPreview content={heroContent} />
            )}
          </CardContent>
        </Card>

        {/* Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>Image Slides</CardTitle>
          </CardHeader>
          <CardContent>
            {!heroContent || heroContent.imagePaths.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No images uploaded yet. Add your first image pair to get
                started.
              </p>
            ) : (
              <div className="space-y-4  grid grid-cols-2 gap-4">
                {Array.from(
                  { length: Math.ceil(heroContent.imagePaths.length / 2) },
                  (_, index) => {
                    const startIndex = index * 2;
                    const imagePair = heroContent.imagePaths.slice(
                      startIndex,
                      startIndex + 2,
                    );

                    return (
                      <div
                        key={index}
                        className="space-y-3 rounded-lg border p-4 h-[200px]"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">
                            Slide {index + 1}  
                          </h3>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteImagePair(startIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex space-x-2">
                          {imagePair.map((imagePath, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="relative size-32 overflow-hidden rounded"
                            >
                              <Image
                                src={imagePath}
                                alt={`Pair ${index + 1} Image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hero Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value.toUpperCase() })
                }
                placeholder="Enter hero description..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="textHref">Link Text</Label>
              <Input
                id="textHref"
                value={formData.textHref}
                onChange={(e) =>
                  setFormData({ ...formData, textHref: e.target.value })
                }
                placeholder="e.g., CHECK US OUT ;)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={formData.href}
                onChange={(e) =>
                  setFormData({ ...formData, href: e.target.value })
                }
                placeholder="e.g., #products"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateContent}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image pair? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTargetIndex(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
