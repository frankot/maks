'use client'

import React, { useEffect, useState } from 'react'

const FALLBACK_TEXTS = [
  'Handmade jewelry — natural stones & gold vermeil',
  'Free shipping in Poland over 300 zł — worldwide shipping available',
  'Limited editions — small batches, sustainably made',
]

export default function NavCarousel() {
  const [texts, setTexts] = useState<string[]>(FALLBACK_TEXTS)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/nav-carousel')
        if (res.ok) {
          const data = await res.json()
          if (data?.texts?.length > 0) {
            setTexts(data.texts)
          }
        }
      } catch {
        // fallbacks will render
      }
    }
    void fetchData()
  }, [])

  return (
    <div
      id="nav-carousel"
      role="region"
      aria-label="Studio announcements carousel"
      className="relative h-6 w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("/nav-bg.webp")',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* Carousel Text */}
      <div className="absolute inset-0 flex items-center">
        <div className="animate-scroll flex whitespace-nowrap">
          {/* Repeat the text 3 times to ensure seamless loop */}
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex">
              {texts.map((text, index) => (
                <span
                  key={`${groupIndex}-${index}`}
                  className="mx-8 mr-32 text-[11px] tracking-wider text-white uppercase"
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
