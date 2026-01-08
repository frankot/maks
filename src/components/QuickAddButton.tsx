'use client';

import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

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
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();
    
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
      className={`inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-gray-800 ${className}`}
      aria-label={`Add ${product.name} to cart`}
    >
      <ShoppingBag className="w-3 h-3" />
      Quick Add
    </button>
  );
}
