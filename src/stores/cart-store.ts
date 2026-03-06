import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/lib/cart'
import { calculateCartTotals } from '@/lib/cart'
import { CART_STORAGE_KEY } from '@/lib/constants'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  totalItems: () => number
  totalPriceInGrosz: () => number
  totalPriceInCents: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (newItem) =>
        set((state) => {
          if (state.items.some((i) => i.productId === newItem.productId)) return state
          return { items: [...state.items, newItem] }
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clearCart: () => set({ items: [] }),
      isInCart: (productId) => get().items.some((i) => i.productId === productId),
      totalItems: () => get().items.length,
      totalPriceInGrosz: () => calculateCartTotals(get().items).totalPriceInGrosz,
      totalPriceInCents: () => calculateCartTotals(get().items).totalPriceInCents,
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted: unknown, version: number) => {
        if (version === 0) {
          const state = persisted as { items?: CartItem[] }
          const items = (state.items || []).map((item) => ({
            ...item,
            priceInGrosz: item.priceInGrosz || 0,
            priceInCents: item.priceInCents || 0,
          }))
          return { items }
        }
        return persisted as { items: CartItem[] }
      },
    }
  )
)
