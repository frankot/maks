'use client';

import { useCart } from '@/contexts/CartContext';
import { formatCartPrice } from '@/lib/cart';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, isOpen, closeCart, removeItem } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l bg-stone-100 p-0 sm:max-w-lg"
      >
        <div className="mx-2 border-b px-6 py-4">
          <SheetTitle className="text-2xl font-bold tracking-tight uppercase">Cart</SheetTitle>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="mt-2 text-xs text-gray-500">Add items to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b pb-6 last:border-b-0">
                  {/* Product Image */}
                  <Link
                    href={`/shop/${item.slug ?? item.productId}`}
                    onClick={closeCart}
                    className="relative h-20 w-20 flex-shrink-0 bg-gray-100"
                  >
                    {item.imagePath ? (
                      <Image src={item.imagePath} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/${item.slug ?? item.productId}`}
                        onClick={closeCart}
                        className="text-xs font-medium tracking-wide uppercase hover:underline"
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

                    <div className="text-xs text-gray-600">
                      {formatCartPrice(item.priceInCents)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cart.items.length > 0 && (
          <div className="mx-2 space-y-4 border-t px-6 pt-6 pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium tracking-wide uppercase">Subtotal</span>
              <span className="font-bold">{formatCartPrice(cart.totalPriceInCents)}</span>
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
  );
}
