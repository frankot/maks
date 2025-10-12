"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { HeroContent } from "@/app/generated/prisma";

export default function Hero() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchHeroContent();
  }, []);

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

  // Resolve images to render (fallback to local images if none)
  const defaultFallbackImages = [
    "/hero1.jpg",
    "/hero2.jpg",
    "/title2.jpg",
    "/heroImg.png",
  ];

  const images: string[] =
    heroContent?.imagePaths?.length
      ? heroContent.imagePaths
      : defaultFallbackImages; // extended fallback list

  return (
    <>
      {/* Outer wrapper hides the horizontal overflow edges */}
      <div className="relative  h-[635px] w-full overflow-x-hidden">
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-full " />

        {/* Scrollable row of vertical images with padding and snap */}
        <div
          aria-label="Horizontal image gallery"
          tabIndex={0}
          className="relative h-full w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:'none'] [&::-webkit-scrollbar]:hidden touch-pan-x [-webkit-overflow-scrolling:touch]"
        >
          <div className="flex h-full w-max items-stretch gap-6 md:gap-8 lg:gap-10 px-6 md:px-10 lg:p-12 snap-x snap-mandatory">
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-full snap-start aspect-[3/4] min-w-[260px] sm:min-w-[300px] md:min-w-[340px] lg:min-w-[380px]"
              >
                <Image
                  src={src}
                  alt={`Hero image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index < 2}
                  unoptimized={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description (marquee) + CTA */}
      <div className="mx-auto py-10">
        {/* Marquee description */}
        <div className="relative mb-4 w-full overflow-hidden">
          {/* Optional gradient edges for a subtle fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-hero-marquee flex whitespace-nowrap">
            {Array.from({ length: 3 }).map((_, groupIndex) => (
              <span
                key={groupIndex}
                className="mx-8 text-5xl leading-9 font-[500] uppercase"
                aria-hidden={groupIndex !== 0}
              >
                {heroContent?.description ??
                  "06.33.11 Studio. A jewelry brand founded by Maks Michalak in 2024, based in Warsaw, Poland."}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <a
            href={heroContent?.href || "#"}
            className="group relative pb-1 text-sm tracking-wider uppercase"
          >
            {heroContent?.textHref || "CHECK US OUT ;)"}
            <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0"></span>
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes hero-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-hero-marquee {
          animation: hero-marquee 30s linear infinite;
        }
      `}</style>
    </>
  );
}
