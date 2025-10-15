'use client';

import React, { useMemo, useRef } from 'react';
import type { Product } from '@/app/generated/prisma';
import ProductCard from './ProductCard';
import Title from './Title';

interface FeaturedProductsProps {
  title: string;
  products: Product[];
}

export default function FeaturedProducts({ title, products }: FeaturedProductsProps) {
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

  if (!products?.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <Title text={title} onPrev={handlePrev} onNext={handleNext} />
        <div className="py-8 text-center text-gray-500">No products found.</div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-10 py-10">
      <Title text={title} onPrev={handlePrev} onNext={handleNext} />
      {/* Horizontal scroller like Hero */}
      <div className="relative w-full overflow-x-hidden">
        <div
          ref={scrollerRef}
          className="relative w-full touch-pan-x overflow-x-auto overflow-y-hidden [-ms-overflow-style:'none'] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} product list`}
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
      </div>
    </section>
  );
}
