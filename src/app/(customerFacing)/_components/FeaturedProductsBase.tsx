'use client'

import React, { useMemo, useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@prisma/client'
import ProductCard from './ProductCard'

interface FeaturedProductsBaseProps {
  products: Product[]
  header: React.ReactNode
  emptyMessage?: string
  ariaLabel: string
  href?: string
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
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function FeaturedProductsBase({
  products,
  header,
  emptyMessage = 'No products found.',
  ariaLabel,
  href,
}: FeaturedProductsBaseProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const cardWidth = 300 // approximate min card width in px
  const gap = 16 // tailwind gap-4

  const scrollBy = useMemo(() => {
    if (typeof window === 'undefined') return 0
    const vw = Math.min(window.innerWidth, 1280)
    return Math.max(cardWidth + gap, Math.floor(vw * 0.8))
  }, [])

  const handlePrev = () => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: -scrollBy, behavior: 'smooth' })
  }

  const handleNext = () => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: scrollBy, behavior: 'smooth' })
  }

  if (!products?.length) {
    return (
      <section className="mx-auto max-w-7xl py-10 md:px-4">
        {header}
        <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
      </section>
    )
  }

  const mobileProducts = products.slice(0, 3)

  return (
    <section className="mx-auto">
      {header}

      {/* Mobile: grid limited to 3 items (hidden on md+) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:hidden">
        {mobileProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {href && (
          <div className="flex items-center justify-center py-4 sm:col-span-2">
            <Link
              href={href}
              className="inline-block text-2xl font-extrabold tracking-wide text-black/80 uppercase transition-transform duration-200 hover:translate-x-[1px]"
            >
              More
            </Link>
          </div>
        )}
      </div>

      {/* md+: horizontal scroll carousel (hidden below md) */}
      <div className="relative hidden w-full overflow-x-hidden md:block">
        <div
          ref={scrollerRef}
          className="relative w-full touch-pan-x overflow-x-auto overflow-y-hidden [-ms-overflow-style:'none'] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={ariaLabel}
        >
          <div className="flex w-max snap-x snap-mandatory items-start gap-4">
            {products.map((p) => (
              <div key={p.id} className="min-w-[300px] snap-start lg:min-w-[320px]">
                <ProductCard product={p} />
              </div>
            ))}
            {href && (
              <div className="flex min-w-[200px] snap-start items-center justify-center self-stretch">
                <Link
                  href={href}
                  className="inline-block text-4xl font-extrabold tracking-wide text-black/80 uppercase transition-transform duration-200 hover:translate-x-[1px] lg:text-5xl"
                >
                  More
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom right controls */}
        {products.length > 4 && (
          <div className="flex items-center justify-end gap-3 px-4 pt-6 md:gap-4">
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
        )}
      </div>
    </section>
  )
}
