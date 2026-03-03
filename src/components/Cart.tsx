'use client'

import { useCartStore } from '@/stores/cart-store'
import { formatCartPrice } from '@/lib/cart'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import CartItemList from '@/components/CartItemList'

export default function Cart() {
  const { items, isOpen, closeCart, totalPriceInCents } = useCartStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex w-full flex-col border-l bg-stone-100 p-0 sm:max-w-lg"
      >
        <div className="mx-2 border-b px-6 py-4">
          <SheetTitle className="text-2xl font-bold tracking-tight uppercase">Cart</SheetTitle>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="mt-2 text-xs text-gray-500">Add items to get started</p>
              </div>
            </div>
          ) : (
            <CartItemList onNavigate={closeCart} />
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="mx-2 space-y-4 border-t px-6 pt-6 pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium tracking-wide uppercase">Subtotal</span>
              <span className="font-bold">{formatCartPrice(totalPriceInCents())}</span>
            </div>
            <Button
              className="h-12 w-full bg-black text-xs font-medium tracking-wider text-white uppercase hover:bg-gray-900"
              asChild
            >
              <a href="/checkout">Checkout</a>
            </Button>
            <button
              onClick={closeCart}
              className="w-full py-3 text-xs font-medium tracking-wider text-gray-600 uppercase transition-colors hover:text-black"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
