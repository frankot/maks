"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import type { HeroContent, Product } from "@/app/generated/prisma";
import HeroPreview from "./HeroPreview";
import HeroImagesManager from "./HeroImagesManager";
import HeroTextEditor from "./HeroTextEditor";
import FeaturedProductsManager from "./FeaturedProductsManager";

export default function Cms() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 mt-16">
  

      <div className="flex  overflow-y-auto">
        {/* LEFT SIDE - LIVE PREVIEW (2/3) */}
        <div className="w-2/3 pl-4 bg-white">
          <HeroPreview
            heroContent={heroContent}
            featuredProducts={featuredProducts}
          />
        </div>

        {/* RIGHT SIDE - EDITING CONTROLS (1/3) */}
        <div className="w-1/3 pr-4 border-l border-gray-200 bg-gray-50">
          <div className="sticky top-0 z-10 border-b border-stone-800 ml-4 bg-gray-50 p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-bold">Edit Content</h2>
            </div>
          </div>

          <div className="space-y-6 p-4">
            <HeroImagesManager heroContent={heroContent} onUpdate={fetchData} />

            <HeroTextEditor heroContent={heroContent} onUpdate={fetchData} />

            <FeaturedProductsManager
              allProducts={allProducts}
              featuredProducts={featuredProducts}
              setFeaturedProducts={setFeaturedProducts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
