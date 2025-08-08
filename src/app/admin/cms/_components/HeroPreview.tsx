"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Eye } from "lucide-react";
import type { HeroContent, Product } from "@/app/generated/prisma";

interface HeroPreviewProps {
  heroContent: HeroContent | null;
  featuredProducts: Product[];
}

export default function HeroPreview({
  heroContent,
  featuredProducts,
}: HeroPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-stone-800 mr-4 bg-white p-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-bold">Landing Page Preview</h2>
        </div>
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
                  </div>
                )}
              </>
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
                <h3 className="truncate text-sm font-medium">{product.name}</h3>
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
    </>
  );
}
