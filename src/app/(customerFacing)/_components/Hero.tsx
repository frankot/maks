'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { HeroContent } from '@prisma/client'

interface HeroProps {
  initialContent: HeroContent | null
}

export default function Hero({ initialContent }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0)

  const heroContent = initialContent

  // Desktop: rotate through pairs
  useEffect(() => {
    const fallbackPairsCount = 2
    const pairCount =
      heroContent && heroContent.imagePaths.length >= 2
        ? Math.floor(heroContent.imagePaths.length / 2)
        : fallbackPairsCount

    if (pairCount > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % pairCount)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [heroContent])

  // Mobile: rotate through individual images
  useEffect(() => {
    const fallbackImagesCount = 4 // total fallback images
    const imagesCount =
      heroContent && heroContent.imagePaths.length > 0
        ? heroContent.imagePaths.length
        : fallbackImagesCount

    if (imagesCount > 0) {
      const interval = setInterval(() => {
        setCurrentMobileSlide((prev) => (prev + 1) % imagesCount)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [heroContent])

  // Build image pairs for desktop: prefer CMS content; fallback to two local pairs
  const imagePairs: string[][] = (() => {
    const fallback: string[][] = [
      ['/hero1.jpg', '/hero2.jpg'],
      ['/hero3.png', '/maxvert3.jpg'],
    ]
    if (!heroContent || heroContent.imagePaths.length < 2) return fallback
    const pairs: string[][] = []
    for (let i = 0; i < heroContent.imagePaths.length; i += 2) {
      if (i + 1 < heroContent.imagePaths.length) {
        pairs.push([heroContent.imagePaths[i]!, heroContent.imagePaths[i + 1]!])
      }
    }
    return pairs.length > 0 ? pairs : fallback
  })()

  // Build individual images array for mobile
  const allImages: string[] = (() => {
    const fallback = ['/hero1.jpg', '/hero2.jpg', '/hero3.png', '/maxvert3.jpg']
    if (!heroContent || heroContent.imagePaths.length === 0) return fallback
    return heroContent.imagePaths
  })()

  return (
    <>
      <div className="relative mt-5 h-[500px] w-full overflow-hidden md:mt-0 md:h-[635px]">
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-black/5" />

        {/* Mobile: Single image slides */}
        <div className="bg-amber-500 md:hidden">
          {allImages.map((image, index) => (
            <div
              key={`mobile-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentMobileSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={image}
                alt={`Hero Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                sizes="100vw"
                quality={85}
              />
            </div>
          ))}
        </div>

        {/* Desktop: Paired image slides */}
        <div className="hidden md:flex">
          {imagePairs.map((pair, index) => (
            <div
              key={`desktop-${index}`}
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
                  sizes="50vw"
                  quality={85}
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
                  sizes="50vw"
                  quality={85}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
