'use client'

import { useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'

interface ProductActionsProps {
  product: {
    id: string
    name: string
    priceInGrosz: number
    priceInCents: number
    imagePath?: string
    slug: string
    sizes: string[]
    collectionName?: string | null
  }
  isSold: boolean
}

export default function ProductActions({ product, isSold }: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const hasSizes = product.sizes.length > 0

  return (
    <div className="space-y-4">
      {hasSizes && (
        <div className="space-y-2">
          <span className="text-xs">Size:</span>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full border border-gray-900 px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
          >
            <option value="">Select size</option>
            {product.sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-center">
        {isSold ? (
          <div className="cursor-not-allowed border border-black bg-white px-6 py-2 text-xs tracking-wider text-black uppercase">
            SOLD
          </div>
        ) : (
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              priceInGrosz: product.priceInGrosz,
              priceInCents: product.priceInCents,
              imagePath: product.imagePath,
              slug: product.slug,
              selectedSize: selectedSize || null,
              collectionName: product.collectionName,
            }}
            isDisabled={hasSizes && !selectedSize}
            className="bg-black px-6 py-2 text-xs tracking-wider text-white uppercase transition-colors hover:bg-gray-800"
          />
        )}
      </div>
    </div>
  )
}
