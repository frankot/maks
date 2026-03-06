import type { Currency } from '@/stores/currency-store'

// Cart types and utilities
export type CartItem = {
  productId: string
  name: string
  priceInGrosz: number
  priceInCents: number
  imagePath?: string
  slug: string | null
}

export type Cart = {
  items: CartItem[]
  totalItems: number
  totalPriceInGrosz: number
  totalPriceInCents: number
}

export { CART_STORAGE_KEY } from './constants'

// Calculate cart totals
export function calculateCartTotals(items: CartItem[]): {
  totalItems: number
  totalPriceInGrosz: number
  totalPriceInCents: number
} {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + 1,
      totalPriceInGrosz: acc.totalPriceInGrosz + (item.priceInGrosz || 0),
      totalPriceInCents: acc.totalPriceInCents + (item.priceInCents || 0),
    }),
    { totalItems: 0, totalPriceInGrosz: 0, totalPriceInCents: 0 }
  )
}

// Format price for display
export function formatCartPrice(amount: number, currency: Currency = 'PLN'): string {
  if (currency === 'EUR') {
    return `${(amount / 100).toFixed(2)} €`
  }
  return `${(amount / 100).toFixed(2)} zł`
}

// Get the correct price from a cart item based on currency
export function getItemPrice(item: CartItem, currency: Currency): number {
  return currency === 'EUR' ? (item.priceInCents || 0) : (item.priceInGrosz || 0)
}
