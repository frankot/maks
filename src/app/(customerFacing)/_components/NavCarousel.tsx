'use client';

import React from 'react';

const carouselTexts = [
  'Handmade jewelry — natural stones & gold vermeil',
  'Free shipping in Poland over 300 zł — worldwide shipping available',
  'Limited editions — small batches, sustainably made',
];

export default function NavCarousel() {
  return (
    <div
      id="nav-carousel"
      role="region"
      aria-label="Studio announcements carousel"
      className="relative h-6 w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1734215330444-679ebd7150ba?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* Carousel Text */}
      <div className="absolute inset-0  flex items-center">
        <div className="animate-scroll flex whitespace-nowrap">
          {/* Repeat the text 3 times to ensure seamless loop */}
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex">
              {carouselTexts.map((text, index) => (
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
  );
}
