'use client'

import React from 'react'
import type { Product } from '@prisma/client'
import FeaturedProductsBase from './FeaturedProductsBase'

interface FeaturedProductsProps {
  title?: string
  products: Product[]
}

export default function FeaturedProducts({ title, products }: FeaturedProductsProps) {
  const header = title ? (
    <div className="mx-auto px-4">
      <div className="py-6 md:py-8">
        <h2 className="text-4xl leading-[0.9] font-extrabold text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h2>
      </div>
    </div>
  ) : null

  return (
    <FeaturedProductsBase
      products={products}
      header={header}
      ariaLabel={title ? `${title} product list` : 'product list'}
    />
  )
}
