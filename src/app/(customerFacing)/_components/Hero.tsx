'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { HeroContent } from '@prisma/client';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchHeroContent();
  }, []);

  // number of pairs to rotate through (fallback to local pairs when no content)
  useEffect(() => {
    const fallbackPairsCount = 2; // ['/hero1.jpg','/hero2.jpg'], ['/hero3.png','/maxHor2.jpg']
    const pairCount =
      heroContent && heroContent.imagePaths.length >= 2
        ? Math.floor(heroContent.imagePaths.length / 2)
        : fallbackPairsCount;

    if (pairCount > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % pairCount);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroContent]);

  const fetchHeroContent = async () => {
    try {
      const response = await fetch('/api/hero');
      if (response.ok) {
        const data = await response.json();
        setHeroContent(data);
      } else {
        console.error('Failed to fetch hero content:', response.status);
        setHeroContent(null);
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      setHeroContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative flex h-[635px] w-full overflow-hidden bg-gray-50">
        <div className="relative w-1/2 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
        <div className="relative w-1/2 animate-pulse bg-gradient-to-br from-gray-200 to-gray-100" />
      </div>
    );
  }

  // Build image pairs: prefer CMS content; fallback to two local pairs
  const imagePairs: string[][] = (() => {
    const fallback: string[][] = [
      ['/hero1.jpg', '/hero2.jpg'],
      ['/hero3.png', '/maxvert3.jpg'],
    ];
    if (!heroContent || heroContent.imagePaths.length < 2) return fallback;
    const pairs: string[][] = [];
    for (let i = 0; i < heroContent.imagePaths.length; i += 2) {
      if (i + 1 < heroContent.imagePaths.length) {
        pairs.push([heroContent.imagePaths[i]!, heroContent.imagePaths[i + 1]!]);
      }
    }
    return pairs.length > 0 ? pairs : fallback;
  })();

  return (
    <>
      <div className="relative flex h-[635px] w-full overflow-hidden">
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-black/5" />

        {imagePairs.map((pair, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="relative w-1/2">
              <Image
                src={pair[0]}
                alt="Hero Image 1"
                fill
                className="object-cover"
                priority={index === 0}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
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
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                unoptimized={true}
              />
            </div>
          </div>
        ))}
      </div>

      {heroContent?.description ? (
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-4 text-center text-[32px] leading-9 font-[500] uppercase">
            {heroContent.description}
          </h2>
        </div>
      ) : null}
    </>
  );
}
