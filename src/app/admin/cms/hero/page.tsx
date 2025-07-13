"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Upload, Edit2, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { HeroContent, Product } from "@/app/generated/prisma";

export default function HeroCms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingSlideIndex, setDeletingSlideIndex] = useState<number | null>(
    null,
  );
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [textForm, setTextForm] = useState({
    description: "",
    href: "",
    textHref: "",
  });

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      const [heroResponse, productsResponse, featuredResponse] =
        await Promise.all([
          fetch("/api/hero"),
          fetch("/api/products"),
          fetch("/api/products?featured=true"),
        ]);

      if (heroResponse.ok) {
        const heroData = await heroResponse.json();
        setHeroContent(heroData);
        if (heroData) {
          setTextForm({
            description: heroData.description,
            href: heroData.href || "",
            textHref: heroData.textHref || "",
          });
        }
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setAllProducts(productsData);
      }

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        setFeaturedProducts(featuredData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
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
    const files = e.dataTransfer.files;
    handleImageSelection(files);
  };

  const handleImageSelection = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);

    // Add new files to pending, but limit to 2 total
    const updatedPending = [...pendingImages, ...newFiles].slice(0, 2);

    if (updatedPending.length > 2) {
      toast.error("Maximum 2 images allowed per slide");
      return;
    }

    setPendingImages(updatedPending);
  };

  const handleConfirmUpload = async () => {
    if (pendingImages.length !== 2) return;

    setIsUploading(true);
    toast.loading("Uploading images...");

    const uploadPromises = pendingImages.map(async (file) => {
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

      fetchData();
      toast.success("Images uploaded!");
      setPendingImages([]); // Clear pending images
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      toast.dismiss();
    }
  };

  const handleCancelUpload = () => {
    setPendingImages([]);
  };

  const handleTextSave = async () => {
    if (!heroContent) return;

    try {
      await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: heroContent.id,
          ...textForm,
        }),
      });
      setIsEditingText(false);
      fetchData();
      toast.success("Text updated!");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDeleteSlide = async (index: number) => {
    if (!heroContent) return;

    try {
      // Set the slide as being deleted for immediate visual feedback
      setDeletingSlideIndex(index);

      // Get the public IDs of images to delete from Cloudinary
      const publicIdsToDelete = [
        (heroContent.imagePublicIds || [])[index * 2],
        (heroContent.imagePublicIds || [])[index * 2 + 1],
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

      fetchData();
      toast.success("Slide deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    } finally {
      setDeletingSlideIndex(null);
    }
  };

  const toggleFeaturedProduct = (productId: string) => {
    const isFeatured = featuredProducts.some((p) => p.id === productId);

    if (isFeatured) {
      setFeaturedProducts(featuredProducts.filter((p) => p.id !== productId));
    } else {
      if (featuredProducts.length >= 4) {
        toast.error("Maximum 4 featured products");
        return;
      }
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        setFeaturedProducts([...featuredProducts, product]);
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

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

  return (
    <div className="mt-5 flex  h-screen">
      {/* LEFT SIDE - LIVE PREVIEW (2/3) */}
      <div className="w-2/3 overflow-y-auto bg-white">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
          <h1 className="text-2xl font-bold">Landing Page Preview</h1>
          <p className="text-gray-600">Homepage as it appears to visitors</p>
        </div>

        <div className="p-6">
          {/* HERO SECTION PREVIEW */}
          <div className="mb-8">
            {/* Hero Images */}
            <div className="relative h-96 overflow-hidden rounded-lg bg-gray-100">
              {imagePairs.length > 0 ? (
                <>
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
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative w-1/2">
                        <Image
                          src={pair[1]}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Loading overlay for new slide */}
                  {isUploading && (
                    <div className="absolute inset-0 flex bg-black/20">
                      <div className="relative flex w-1/2 animate-pulse items-center justify-center bg-gray-300">
                        <Upload className="h-8 w-8 animate-bounce text-gray-500" />
                      </div>
                      <div className="relative flex w-1/2 animate-pulse items-center justify-center bg-gray-400">
                        <Upload className="h-8 w-8 animate-bounce text-gray-500" />
                      </div>
                    </div>
                  )}

                  {/* Slide indicators */}
                  {imagePairs.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                      {imagePairs.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-3 w-3 rounded-full transition-colors ${
                            index === currentSlide ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                      {/* Loading indicator for new slide */}
                      {isUploading && (
                        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-400"></div>
                      )}
                    </div>
                  )}
                </>
              ) : isUploading ? (
                <div className="flex h-full">
                  <div className="relative flex w-1/2 animate-pulse items-center justify-center bg-gray-300">
                    <Upload className="h-8 w-8 animate-bounce text-gray-500" />
                  </div>
                  <div className="relative flex w-1/2 animate-pulse items-center justify-center bg-gray-400">
                    <Upload className="h-8 w-8 animate-bounce text-gray-500" />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No hero images yet
                </div>
              )}
            </div>

            {/* Hero Text */}
            <div className="p-8 text-center">
              <h2 className="mb-4 line-clamp-4 text-3xl leading-tight font-medium uppercase">
                {heroContent?.description || "Your hero description here..."}
              </h2>
              <div>
                <a
                  href={heroContent?.href || "#"}
                  className="inline-block border-b border-black pb-1 text-sm tracking-wider uppercase transition-all hover:border-b-0"
                >
                  {heroContent?.textHref || "CHECK US OUT ;)"}
                </a>
              </div>
            </div>
          </div>

          {/* FEATURED PRODUCTS PREVIEW */}
          <div className="grid grid-cols-4 gap-0 overflow-hidden rounded-lg border border-gray-200">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`relative h-80 bg-gray-100 ${index < 3 ? "border-r border-gray-200" : ""}`}
              >
                <div className="relative h-64">
                  <Image
                    src={product.imagePaths[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-white p-3 text-center">
                  <h3 className="truncate text-sm font-medium">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {(product.priceInGrosz / 100).toFixed(2)} zł
                  </p>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 4 - featuredProducts.length }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className={`flex h-80 items-center justify-center bg-gray-50 ${
                    featuredProducts.length + index < 3
                      ? "border-r border-gray-200"
                      : ""
                  }`}
                >
                  <div className="text-center text-gray-400">
                    <Plus className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">Empty Slot</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - EDITING CONTROLS (1/3) */}
      <div className="w-1/3 overflow-y-auto border-l border-gray-200 bg-gray-50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="text-xl font-bold">Edit Content</h2>
          <p className="text-gray-600">Manage your homepage content</p>
        </div>

        <div className="space-y-6 p-4">
          {/* HERO IMAGES CONTROL */}
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

                {/* Preview Squares or Upload Indicator */}
                {pendingImages.length > 0 ? (
                  <div className="space-y-3">
                    {/* Preview squares - smaller when images are present */}
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
                    {/* Original upload indicator when no images */}
                    <div
                      className={`relative ${isDragOver ? "animate-pulse" : ""}`}
                    >
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
                <p className="text-sm font-medium text-gray-700">
                  Current Slides:
                </p>

                {/* Existing slides */}
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

                      {/* Small preview of the slide pair */}
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
                            Are you sure you want to delete Slide {index + 1}?
                            This action cannot be undone and will permanently
                            remove both images from this slide.
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

                      {/* Pulsing skeleton previews */}
                      <div className="flex space-x-1">
                        <div className="h-8 w-12 animate-pulse rounded bg-gray-300"></div>
                        <div className="h-8 w-12 animate-pulse rounded bg-gray-300"></div>
                      </div>

                      <span className="text-sm text-gray-500">
                        Uploading...
                      </span>
                    </div>
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* HERO TEXT CONTROL */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Hero Text</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingText(!isEditingText)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            {isEditingText ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    value={textForm.description}
                    onChange={(e) =>
                      setTextForm({
                        ...textForm,
                        description: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Hero description..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Link Text
                  </label>
                  <Input
                    value={textForm.textHref}
                    onChange={(e) =>
                      setTextForm({ ...textForm, textHref: e.target.value })
                    }
                    placeholder="CHECK US OUT ;)"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Link URL
                  </label>
                  <Input
                    value={textForm.href}
                    onChange={(e) =>
                      setTextForm({ ...textForm, href: e.target.value })
                    }
                    placeholder="#products"
                    className="text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleTextSave} size="sm" className="flex-1">
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingText(false)}
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="group cursor-pointer rounded border bg-white p-3 transition-colors hover:bg-gray-50"
                onClick={() => setIsEditingText(true)}
                title="Click to edit hero text"
              >
                <p className="mb-2 text-sm text-gray-800 transition-colors group-hover:text-blue-600">
                  {heroContent?.description || "No description set"}
                </p>
                <p className="text-xs text-gray-600 transition-colors group-hover:text-blue-500">
                  Link: {heroContent?.textHref || "No link text"} →{" "}
                  {heroContent?.href || "#"}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* FEATURED PRODUCTS CONTROL */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Featured Products</h3>
              <Badge variant="outline">{featuredProducts.length}/4</Badge>
            </div>

            {/* Selected Products */}
            {featuredProducts.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Selected:
                </p>
                <div className="space-y-2">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded border bg-white p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="relative h-8 w-8">
                          <Image
                            src={product.imagePaths[0] || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                        <div>
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(product.priceInGrosz / 100).toFixed(2)} zł
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeaturedProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Products */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Available Products:
              </p>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {allProducts
                  .filter(
                    (p) =>
                      p.isAvailable &&
                      p.productStatus === "SHOP" &&
                      !featuredProducts.some((fp) => fp.id === p.id),
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex cursor-pointer items-center justify-between rounded border bg-white p-2 transition-colors hover:border-gray-300"
                      onClick={() => toggleFeaturedProduct(product.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="relative h-8 w-8">
                          <Image
                            src={product.imagePaths[0] || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                        <div>
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(product.priceInGrosz / 100).toFixed(2)} zł
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={featuredProducts.length >= 4}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
