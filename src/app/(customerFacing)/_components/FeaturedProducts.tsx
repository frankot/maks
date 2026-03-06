'use client'

import React from 'react'
import Link from 'next/link'
import type { Product } from '@prisma/client'
import FeaturedProductsBase from './FeaturedProductsBase'

interface FeaturedProductsProps {
  title?: string
  href?: string
  products: Product[]
}

export default function FeaturedProducts({ title, href, products }: FeaturedProductsProps) {
  const heading = title ? (
    <h2 className="text-4xl leading-[0.9] font-extrabold text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
      {title}
    </h2>
  ) : null

  const header = heading ? (
    <div className="mx-auto px-4">
      <div className="py-6 md:py-8">
        {href ? (
          <Link href={href} className="inline-block transition-transform duration-200 hover:translate-x-[1px]">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </div>
    </div>
  ) : null

  return (
    <FeaturedProductsBase
      products={products}
      header={header}
      ariaLabel={title ? `${title} product list` : 'product list'}
      href={href}
    />
  )
}
