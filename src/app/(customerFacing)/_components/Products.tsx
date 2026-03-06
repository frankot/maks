'use client'

import React from 'react'
import type { Product, Category } from '@prisma/client'
import Link from 'next/link'
import ProductCard from './ProductCard'

interface ProductsProps {
  title: string
  category: Category
  products: Product[]
}

export default function Products({ title, category, products }: ProductsProps) {
  const sectionId = title.toLowerCase()
  const categorySlug = category.toLowerCase()

  if (!products?.length) {
    return null
  }

  return (
    <section id={sectionId} className="animate-in fade-in mx-auto px-4 py-10 duration-500">
      {/* Title */}
      <div className="mx-auto">
        <div className="py-6 md:py-8">
          <Link href={`/shop/${categorySlug}`}>
            <h2 className="text-4xl leading-[0.9] font-extrabold whitespace-nowrap text-black/90 uppercase transition-all duration-200 hover:translate-x-[1px] sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </h2>
          </Link>
        </div>
      </div>

      {/* 4-column grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
