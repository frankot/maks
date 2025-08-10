"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { HeroContent } from "@/app/generated/prisma";
import StudioStatement from "@/components/ui/StudioStatement";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setHeroContent(data);
      } else {
        setError(`Failed to fetch hero content: ${response.status}`);
        setHeroContent(null);
      }
    } catch {
      setError("Error fetching hero content. Please try again later.");
      setHeroContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative mt-16 flex h-[635px] w-full items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="relative mt-16 flex h-[635px] w-full items-center justify-center bg-white">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  // Show fallback if no hero content exists
  if (!heroContent || heroContent.imagePaths.length === 0) {
    return (
      <div className="relative mt-16 flex h-[635px] w-full overflow-hidden">
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-black/5" />

        {/* Fallback to static images */}
        <div className="absolute inset-0 flex">
          <div className="relative w-1/2">
            <Image
              src="/hero1.jpg"
              alt="Hero Image 1"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative w-1/2">
            <Image
              src="/hero2.jpg"
              alt="Hero Image 2"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <StudioStatement
          text="06.33.11 Studio. A jewelry brand founded by Maks Michalak in 2024, based in Warsaw, Poland. In our studio we make thinks organic yet bold, as we hope our audience to be. Natural forms, raw and cut stones, molten designs and sparkle of luxury on yourself."
        />
      </div>
    );
  }

  // Group images into pairs for display
  const imagePairs = [];
  for (let i = 0; i < heroContent.imagePaths.length; i += 2) {
    if (i + 1 < heroContent.imagePaths.length) {
      imagePairs.push([
        heroContent.imagePaths[i],
        heroContent.imagePaths[i + 1],
      ]);
    }
  }

  return (
    <>
      <div className="relative mt-16 flex h-[635px] w-full overflow-hidden">
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
                priority={index === 0}
                unoptimized={true}
              />
            </div>
            <div className="relative w-1/2">
              <Image
                src={pair[1]}
                alt="Hero Image 2"
                fill
                className="object-cover"
                priority={index === 0}
                unoptimized={true}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-4 text-center text-[32px] leading-9 font-[500] uppercase">
          {heroContent.description}
        </h2>
        <div className="flex justify-center">
          <a
            href={heroContent.href || "#"}
            className="group relative pb-1 text-sm tracking-wider uppercase"
          >
            {heroContent.textHref || "CHECK US OUT ;)"}
            <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0"></span>
          </a>
        </div>
      </div>
    </>
  );
}
