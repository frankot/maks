'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@prisma/client';

interface FeaturedProductsManagerProps {
  allProducts: Product[];
  featuredProducts: Product[];
  setFeaturedProducts: (products: Product[]) => void;
}

export default function FeaturedProductsManager({
  allProducts,
  featuredProducts,
  setFeaturedProducts,
}: FeaturedProductsManagerProps) {
  const toggleFeaturedProduct = (productId: string) => {
    const isFeatured = featuredProducts.some((p) => p.id === productId);

    if (isFeatured) {
      setFeaturedProducts(featuredProducts.filter((p) => p.id !== productId));
    } else {
      if (featuredProducts.length >= 4) {
        toast.error('Maximum 4 featured products');
        return;
      }
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        setFeaturedProducts([...featuredProducts, product]);
      }
    }
  };

  return (
    <>
      <Separator />
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Featured Products</h3>
          <Badge variant="outline">{featuredProducts.length}/4</Badge>
        </div>

        {/* Selected Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Selected:</p>
            <div className="space-y-2">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded border bg-white p-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative h-8 w-8">
                      <Image
                        src={product.imagePaths[0] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                    <div>
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        {(product.priceInGrosz / 100).toFixed(2)} zł
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeaturedProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Products */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Available Products:</p>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {allProducts
              .filter(
                (p) =>
                  p.isAvailable &&
                  p.productStatus === 'SHOP' &&
                  !featuredProducts.some((fp) => fp.id === p.id)
              )
              .map((product) => (
                <div
                  key={product.id}
                  className="flex cursor-pointer items-center justify-between rounded border bg-white p-2 transition-colors hover:border-gray-300"
                  onClick={() => toggleFeaturedProduct(product.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative h-8 w-8">
                      <Image
                        src={product.imagePaths[0] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                    <div>
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        {(product.priceInGrosz / 100).toFixed(2)} zł
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" disabled={featuredProducts.length >= 4}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
