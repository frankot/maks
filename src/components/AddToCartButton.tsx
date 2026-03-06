'use client'

import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Check, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    priceInGrosz: number
    priceInCents: number
    imagePath?: string
    slug: string
  }
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export default function AddToCartButton({
  product,
  className = '',
  size = 'default',
  variant = 'default',
}: AddToCartButtonProps) {
  const { addItem, openCart, isInCart } = useCartStore()
  const [added, setAdded] = useState(false)
  const alreadyInCart = isInCart(product.id)

  const handleAddToCart = () => {
    if (alreadyInCart) {
      // Just open cart to show it's already there
      openCart()
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      priceInGrosz: product.priceInGrosz,
      priceInCents: product.priceInCents,
      imagePath: product.imagePath,
      slug: product.slug,
    })

    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      openCart()
    }, 800)
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={className}
      size={size}
      variant={alreadyInCart ? 'outline' : variant}
      disabled={added}
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : alreadyInCart ? (
        <>
          <ShoppingBag className="mr-2 h-4 w-4" />
          In Cart
        </>
      ) : (
        'Add to Cart'
      )}
    </Button>
  )
}
