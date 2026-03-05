'use client'

import React, { useEffect, useState } from 'react'
import type { Product, Collection } from '@prisma/client'
import ProductCard from '@/app/(customerFacing)/_components/ProductCard'

type ProductWithCollection = Product & { collection: Collection | null }

interface CollectionPageProps {
  collectionSlug: string
  collectionName: string
}

export default function CollectionPage({ collectionSlug, collectionName }: CollectionPageProps) {
  const [products, setProducts] = useState<ProductWithCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = (await res.json()) as ProductWithCollection[]
          const filtered = data.filter(
            (p) =>
              p.collection?.slug === collectionSlug && p.isAvailable && p.productStatus === 'SHOP'
          )
          setProducts(filtered)
        }
      } catch (err) {
        console.error('Failed to fetch products', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [collectionSlug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="py-6 md:py-8">
          <div className="h-12 w-48 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="animate-in fade-in mx-auto px-4 py-10 duration-500">
      <div className="mx-auto">
        <div className="py-6 md:py-8">
          <h2 className="text-4xl leading-[0.9] font-extrabold whitespace-nowrap text-black/90 uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            {collectionName}
          </h2>
        </div>
      </div>
      {products.length === 0 ? (
        <p className="px-4 text-sm text-gray-500">No products found in this collection.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
