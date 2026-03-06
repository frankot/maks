'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@prisma/client'
import { useCurrencyStore } from '@/stores/currency-store'
import { formatCartPrice } from '@/lib/cart'

type ProductWithMaterials = Omit<Product, 'materials'> & {
  materials?: string | null
}

interface ProductCardProps {
  product: ProductWithMaterials
  simplified?: boolean // For gallery use - shows only title
  className?: string // Additional classes for the card wrapper
}

export default function ProductCard({
  product,
  simplified = false,
  className = '',
}: ProductCardProps) {
  const currency = useCurrencyStore((s) => s.currency)
  const amount = currency === 'EUR' ? product.priceInCents : product.priceInGrosz

  // Get a very short materials description — prefer `materials` field
  const materials =
    product.materials && product.materials.length > 0
      ? product.materials
      : product.description
          ?.split(/\.|,|;|\n/)
          .map((s) => s.trim())
          .find(Boolean)
          ?.slice(0, 80)

  return (
    <div className={`flex w-full flex-col ${simplified ? 'h-[480px]' : ''} ${className}`}>
      {/* Image section - clickable */}
      <Link href={`/shop/${product.slug || product.id}`} className="block flex-shrink-0">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.imagePaths?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="360px"
            quality={85}
          />
        </div>
      </Link>

      {/* Product info */}
      {simplified ? (
        <div className="flex flex-grow items-center justify-center px-4 py-4">
          <Link href={`/shop/${product.slug || product.id}`} className="block w-full">
            <h3 className="w-full text-center text-lg font-light text-gray-900 capitalize">
              {product.name}
            </h3>
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 pb-3">
          <div>
            <Link href={`/shop/${product.slug || product.id}`} className="block">
              <h3 className="w-full truncate text-left text-sm font-semibold text-gray-900 uppercase">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs leading-tight text-gray-500 capitalize">
              {materials || 'White gold, sterling silver, crystal base'}
            </p>
          </div>
          <div className="mt-1 mr-6 flex items-center justify-between whitespace-nowrap">
            <p className="text-xs text-gray-600">{formatCartPrice(amount, currency)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
