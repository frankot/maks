'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { Product, Category, Collection } from '@prisma/client'
import Products from './Products'
import ProductsSkeleton from './ProductsSkeleton'
import { shuffle } from '@/lib/utils/shuffle'

const MAX_PRODUCTS_PER_CATEGORY = 8

type ProductWithCollection = Product & { collection: Collection | null }

export default function ProductsClient() {
  const [allProducts, setAllProducts] = useState<ProductWithCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = (await res.json()) as ProductWithCollection[]
          setAllProducts(data)
        }
      } catch (err) {
        console.error('Failed to fetch products', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categoryGroups = useMemo(() => {
    const grouped = new Map<Category, ProductWithCollection[]>()

    for (const p of allProducts) {
      if (!p.isAvailable || p.productStatus !== 'SHOP') continue

      const existing = grouped.get(p.category) || []
      existing.push(p)
      grouped.set(p.category, existing)
    }

    return Array.from(grouped.entries())
      .filter(([, products]) => products.length > 0)
      .map(([category, products]) => ({
        category,
        title: category.charAt(0) + category.slice(1).toLowerCase(),
        products: shuffle(products).slice(0, MAX_PRODUCTS_PER_CATEGORY),
      }))
  }, [allProducts])

  if (loading) {
    return <ProductsSkeleton />
  }

  return (
    <>
      {categoryGroups.map(({ category, title, products }) => (
        <Products key={category} title={title} category={category} products={products} />
      ))}
    </>
  )
}
