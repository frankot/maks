'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { HeroContent } from '@/app/generated/prisma';

export default function Hero() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const response = await fetch('/api/hero');
      if (response.ok) {
        const data = await response.json();
        setHeroContent(data);
      } else {
        setError(`Failed to fetch hero content: ${response.status}`);
        setHeroContent(null);
      }
    } catch {
      setError('Error fetching hero content. Please try again later.');
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
        <div className="text-lg font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  // Resolve images to render (fallback to local images if none)
  const defaultFallbackImages = ['/hero1.jpg', '/hero2.jpg', '/title2.jpg', '/heroImg.png'];

  const images: string[] = heroContent?.imagePaths?.length
    ? heroContent.imagePaths
    : defaultFallbackImages; // extended fallback list

  return (
    <>
      {/* Outer wrapper hides the horizontal overflow edges */}
      <div className="relative h-[635px] w-full overflow-x-hidden md:h-[720px]">
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-full" />

        {/* Scrollable row of vertical images with padding and snap */}
        <div
          aria-label="Horizontal image gallery"
          tabIndex={0}
          className="relative h-full w-full touch-pan-x overflow-x-auto overflow-y-hidden [-ms-overflow-style:'none'] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex h-full w-max snap-x snap-mandatory items-stretch gap-4 pr-6 pl-0 md:pr-10 md:pl-0 lg:pr-12 lg:pl-0">
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative aspect-[3/4] h-full min-w-[260px] snap-start sm:min-w-[300px] md:min-w-[340px] lg:min-w-[380px]"
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

      {/* Marquee + CTA moved to separate component */}
    </>
  );
}
