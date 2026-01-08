'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    priceInGrosz: number;
    imagePath?: string;
    slug: string;
  };
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export default function AddToCartButton({ 
  product, 
  className = '',
  size = 'default',
  variant = 'default'
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      priceInCents: product.priceInGrosz,
      imagePath: product.imagePath,
      slug: product.slug,
    });
    
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 800);
  };

  return (
    <Button
      onClick={handleAddToCart}
      className={className}
      size={size}
      variant={variant}
      disabled={added}
    >
      {added ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added
        </>
      ) : (
        'Add to Cart'
      )}
    </Button>
  );
}
