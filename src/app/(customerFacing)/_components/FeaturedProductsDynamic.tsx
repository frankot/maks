'use client';

import React, { useState } from 'react';
import type { Category, Product } from '@prisma/client';
import FeaturedProductsBase from './FeaturedProductsBase';

interface FeaturedProductsDynamicProps {
  initialCategory: Category;
  categoryProducts: Record<Category, Product[]>;
  categoryTitles?: Partial<Record<Category, string>>;
}

const categoryOrder: Category[] = [
  'RINGS' as Category,
  'NECKLACES' as Category,
  'EARRINGS' as Category,
];

function RefreshCategoryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
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

  const handleCategoryNext = () => {
    setCurrentIndex((i) => (i + 1) % categoryOrder.length);
  };

  const header = (
    <div className="mx-auto px-4">
      <div className="py-6 md:py-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCategoryNext}
            aria-label="Next category"
            title={`Switch to ${categoryOrder[(currentIndex + 1) % categoryOrder.length]}`}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110 hover:bg-black/90"
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

  return (
    <FeaturedProductsBase
      products={products}
      header={header}
      ariaLabel={`${titleText} product list`}
    />
  );
}
