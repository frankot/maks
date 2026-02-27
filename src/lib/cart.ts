// Cart types and utilities
export type CartItem = {
  productId: string
  name: string
  priceInCents: number
  imagePath?: string
  slug: string | null
}

export type Cart = {
  items: CartItem[]
  totalItems: number
  totalPriceInCents: number
}

export { CART_STORAGE_KEY } from './constants'

// Calculate cart totals
export function calculateCartTotals(items: CartItem[]): {
  totalItems: number
  totalPriceInCents: number
} {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + 1,
      totalPriceInCents: acc.totalPriceInCents + item.priceInCents,
    }),
    { totalItems: 0, totalPriceInCents: 0 }
  )
}

// Format price for display
export function formatCartPrice(priceInCents: number): string {
  return `${(priceInCents / 100).toFixed(2)} zł`
}
