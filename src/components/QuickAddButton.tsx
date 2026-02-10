'use client';

import { useCartStore } from '@/stores/cart-store';
import { ShoppingBag, Check } from 'lucide-react';

interface QuickAddButtonProps {
  product: {
    id: string;
    name: string;
    priceInGrosz: number;
    imagePath?: string;
    slug: string;
  };
  className?: string;
}

/**
 * Quick Add button for product listings/grids
 * Adds item to cart without opening the cart panel
 */
export default function QuickAddButton({ product, className = '' }: QuickAddButtonProps) {
  const { addItem, isInCart } = useCartStore();
  const alreadyInCart = isInCart(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();

    if (alreadyInCart) {
      return; // Don't add if already in cart
    }

    addItem({
      productId: product.id,
      name: product.name,
      priceInCents: product.priceInGrosz,
      imagePath: product.imagePath,
      slug: product.slug,
    });
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={alreadyInCart}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
        alreadyInCart
          ? 'cursor-not-allowed bg-gray-200 text-gray-600'
          : 'bg-black text-white hover:bg-gray-800'
      } ${className}`}
      aria-label={alreadyInCart ? `${product.name} is in cart` : `Add ${product.name} to cart`}
    >
      {alreadyInCart ? (
        <>
          <Check className="h-3 w-3" />
          In Cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-3 w-3" />
          Quick Add
        </>
      )}
    </button>
  );
}
