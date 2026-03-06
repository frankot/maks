'use client'

import { formatCartPrice, getItemPrice } from '@/lib/cart'
import { useCartStore } from '@/stores/cart-store'
import { useCurrencyStore } from '@/stores/currency-store'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'

interface CartItemListProps {
  compact?: boolean
  onNavigate?: () => void
}

export default function CartItemList({ compact = false, onNavigate }: CartItemListProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const currency = useCurrencyStore((s) => s.currency)

  if (items.length === 0) return null

  return (
    <div className={compact ? 'space-y-3' : 'space-y-6'}>
      {items.map((item) => (
        <div
          key={item.productId}
          className={`flex border-b last:border-b-0 ${compact ? 'gap-3 pb-3' : 'gap-4 pb-6'}`}
        >
          <Link
            href={`/shop/${item.slug ?? item.productId}`}
            onClick={onNavigate}
            className={`relative flex-shrink-0 bg-gray-100 ${compact ? 'h-14 w-14' : 'h-20 w-20'}`}
          >
            {item.imagePath ? (
              <Image src={item.imagePath} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag
                  className={`text-gray-300 ${compact ? 'h-4 w-4' : 'h-6 w-6'}`}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/shop/${item.slug ?? item.productId}`}
                onClick={onNavigate}
                className={`font-medium tracking-wide uppercase hover:underline ${compact ? 'text-[11px]' : 'text-xs'}`}
              >
                {item.name}
              </Link>
              <button
                onClick={() => removeItem(item.productId)}
                className="flex-shrink-0 text-gray-400 transition-colors hover:text-black"
                aria-label="Remove item"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className={`text-gray-600 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {formatCartPrice(getItemPrice(item, currency), currency)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
