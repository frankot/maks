'use client';

import { useCart } from '@/contexts/CartContext';
import { formatCartPrice } from '@/lib/cart';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, isOpen, closeCart, removeItem } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 border-l">
        <div className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-bold uppercase tracking-tight">Cart</SheetTitle>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="text-xs text-gray-500 mt-2">
                  Add items to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 pb-6 border-b last:border-b-0">
                  {/* Product Image */}
                  <Link
                    href={`/shop/${item.slug ?? item.productId}`}
                    onClick={closeCart}
                    className="relative w-20 h-20 flex-shrink-0 bg-gray-100"
                  >
                    {item.imagePath ? (
                      <Image
                        src={item.imagePath}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/shop/${item.slug ?? item.productId}`}
                        onClick={closeCart}
                        className="text-xs uppercase tracking-wide font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-black transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <X className="w-3 h-3" />
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
          <div className="border-t pt-6 px-6 pb-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="uppercase tracking-wide font-medium">Subtotal</span>
              <span className="font-bold">{formatCartPrice(cart.totalPriceInCents)}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout</p>
            <Button 
              className="w-full bg-black text-white h-12 uppercase tracking-wider font-medium text-xs hover:bg-gray-900" 
              asChild
            >
              <a href="/checkout">Checkout</a>
            </Button>
            <button
              onClick={closeCart}
              className="w-full text-xs uppercase tracking-wider font-medium py-3 text-gray-600 hover:text-black transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}