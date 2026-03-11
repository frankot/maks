'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import ProductDetailsTabs from './ProductDetailsTabs'
import { useCurrencyStore } from '@/stores/currency-store'
import { formatCartPrice } from '@/lib/cart'

interface MobileProductViewProps {
  product: {
    id: string
    name: string
    description: string
    priceInGrosz: number
    priceInCents: number
    imagePaths: string[]
    slug: string | null
    productStatus: string
    materials: string | null
    sizes: string[]
    collectionName?: string | null
  }
  isSold: boolean
}

export default function MobileProductView({ product, isSold }: MobileProductViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [selectedSize, setSelectedSize] = useState('')
  const currency = useCurrencyStore((s) => s.currency)
  const amount = currency === 'EUR' ? product.priceInCents : product.priceInGrosz

  return (
    <div className="lg:hidden">
      {/* Main Product Image */}
      <div className="relative aspect-square w-full">
        {product.imagePaths[selectedImageIndex] ? (
          <Image
            key={selectedImageIndex}
            src={product.imagePaths[selectedImageIndex]}
            alt={product.name}
            fill
            className="object-contain p-8"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-lg font-medium text-gray-400">LOADING</span>
          </div>
        )}

        {/* Back button - top left corner */}
        <Link
          href="/shop"
          className="absolute bottom-3 left-4 z-20 flex items-center gap-1 text-black transition-colors hover:text-gray-600"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-180"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="-ml-1 text-xs">BACK</span>
        </Link>
      </div>

      {/* Thumbnail Gallery - Always show */}
      <div className="grid grid-cols-4 gap-2 border-b border-gray-200 p-4">
        {product.imagePaths.map((imagePath, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative aspect-square overflow-hidden border transition-all ${
              selectedImageIndex === index ? 'border-black' : 'border-gray-200'
            }`}
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-gray-400">-</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Product Info Section */}
      <div className="mx-4 border-b border-gray-200 pt-6 pb-8">
        {/* Title & Price */}
        <div className="mb-6">
          <h1 className="text-lg font-normal tracking-wide uppercase">{product.name}</h1>
          {product.materials && (
            <p className="-mt-1 mb-1 text-xs text-gray-600">{product.materials}</p>
          )}
          <p className="text-base font-light text-gray-900">{formatCartPrice(amount, currency)}</p>
        </div>

        {/* Size Display */}
        {product.sizes.length > 0 && (
          <div className="relative mb-4">
            <div className="mb-2">
              <span className="text-xs">Size:</span>
            </div>
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full appearance-none border border-gray-900 bg-white px-3 py-2.5 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="">Select size</option>
                {product.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-900">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mb-4 space-y-3">
          {isSold ? (
            <button
              disabled
              className="w-full cursor-not-allowed border border-gray-300 bg-gray-100 py-3.5 text-sm tracking-wider text-gray-500 uppercase"
            >
              SOLD OUT
            </button>
          ) : (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                priceInGrosz: product.priceInGrosz,
                priceInCents: product.priceInCents,
                imagePath: product.imagePaths[0],
                slug: product.slug ?? product.id,
                selectedSize: selectedSize || null,
                collectionName: product.collectionName,
              }}
                            isDisabled={product.sizes.length > 0 && !selectedSize}
              className="w-full bg-black py-3.5 text-sm tracking-wider text-white uppercase transition-colors hover:bg-gray-800"
            />
          )}
        </div>

        {/* Product Description */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-xs leading-relaxed text-gray-700">{product.description}</p>
        </div>

        {/* Product Details Accordion/Tabs */}
        <div className="mt-6">
          <ProductDetailsTabs
            details={
              <p className="text-xs leading-relaxed">
                Each piece is handmade in Warsaw, Poland as a limited edition creation. Your jewelry
                comes with an authenticity certificate and is beautifully presented in a gift box.
                We provide a 1-year warranty for your peace of mind.
              </p>
            }
            material={
              <ul className="space-y-1 text-xs">
                <li>• 925 Sterling Silver</li>
                <li>• Natural gemstones</li>
                <li>• Hypoallergenic materials</li>
                <li>• Ethically sourced</li>
                <li>• Tarnish resistant coating</li>
              </ul>
            }
            care={
              <p className="text-xs leading-relaxed">
                Clean gently with a soft cloth and avoid contact with chemicals or water. Store your
                jewelry in the provided pouch when not wearing it. Remove before swimming or
                exercising. Professional cleaning is recommended annually.
              </p>
            }
          />
        </div>
      </div>
    </div>
  )
}
