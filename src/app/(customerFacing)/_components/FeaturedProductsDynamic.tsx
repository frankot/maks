'use client';

import React, { useMemo, useRef, useState } from 'react';
import type { Category, Product } from '@prisma/client';
import ProductCard from './ProductCard';

// Hardcoded demo data switcher: supply three categories and their products.
// In a real app, you'd fetch products per category; here we accept them via props or stub.

interface FeaturedProductsDynamicProps {
  // Initial category to display
  initialCategory: Category;
  // A map of categories to their products for cycling
  categoryProducts: Record<Category, Product[]>;
  // Optional alternative title text per category (fallback to category name)
  categoryTitles?: Partial<Record<Category, string>>;
}

const categoryOrder: Category[] = [
  'RINGS' as Category,
  'NECKLACES' as Category,
  'EARRINGS' as Category,
];

function RefreshCategoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

export default function FeaturedProductsDynamic({
  initialCategory,
  categoryProducts,
  categoryTitles,
}: FeaturedProductsDynamicProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = categoryOrder.indexOf(initialCategory);
    return idx >= 0 ? idx : 0;
  });

  const currentCategory = categoryOrder[currentIndex] as Category;
  const products = categoryProducts[currentCategory] || [];
  const titleText = categoryTitles?.[currentCategory] ?? currentCategory;

  const scrollerRef = useRef<HTMLDivElement>(null);

  const cardWidth = 300; // approximate min card width in px
  const gap = 16; // tailwind gap-4

  const scrollBy = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const vw = Math.min(window.innerWidth, 1280);
    return Math.max(cardWidth + gap, Math.floor(vw * 0.8));
  }, []);

  const handlePrev = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: -scrollBy, behavior: 'smooth' });
  };

  const handleNext = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: scrollBy, behavior: 'smooth' });
  };

  const handleCategoryNext = () => {
    setCurrentIndex((i) => (i + 1) % categoryOrder.length);
  };

  const Header = (
    <div className="mx-auto px-4">
      <div className="py-6 md:py-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCategoryNext}
            aria-label="Next category"
            title={`Switch to ${categoryOrder[(currentIndex + 1) % categoryOrder.length]}`}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-black text-white transition-transform hover:scale-110 hover:bg-black/90 flex-shrink-0"
          >
            <RefreshCategoryIcon />
          </button>
          <h2 className="text-4xl leading-[0.9] font-extrabold text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            {titleText}
          </h2>
        </div>
      </div>
    </div>
  );

  if (!products?.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        {Header}
        <div className="py-8 text-center text-gray-500">No products found.</div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-10 py-10">
      {Header}
      <div className="relative w-full overflow-x-hidden">
        <div
          ref={scrollerRef}
          className="relative w-full touch-pan-x overflow-x-auto overflow-y-hidden [-ms-overflow-style:'none'] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${titleText} product list`}
        >
          <div className="flex w-max snap-x snap-mandatory items-stretch gap-4 px-4 md:px-0">
            {products.map((p) => (
              <div
                key={p.id}
                className="min-w-[280px] snap-start md:min-w-[300px] lg:min-w-[320px]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom right controls */}
        <div className="flex items-center justify-end gap-3 px-4 pt-6 md:gap-4">
          {/* Scroll controls */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Scroll left"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 text-black transition-colors hover:bg-black hover:text-white"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Scroll right"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 text-black transition-colors hover:bg-black hover:text-white"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className ?? 'h-5 w-5'}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
