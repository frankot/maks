import Image from 'next/image';
import Link from 'next/link';
// ShoppingCart removed — not used anymore
import { Product } from '@prisma/client';

type ProductWithMaterials = Omit<Product, 'materials'> & {
  materials?: string | null;
};

interface ProductCardProps {
  product: ProductWithMaterials;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Convert price from grosz to PLN
  const priceInPLN = (product.priceInGrosz / 100).toFixed(2);

  // Get a very short materials description — prefer `materials` field
  const materials =
    product.materials && product.materials.length > 0
      ? product.materials
      : product.description
          ?.split(/\.|,|;|\n/)
          .map((s) => s.trim())
          .find(Boolean)
          ?.slice(0, 80);

  return (
    <div className={`w-full`}>
      {/* Image section - clickable */}
      <Link href={`/shop/${product.slug || product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.imagePaths?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="360px"
            unoptimized={product.imagePaths?.[0]?.includes('res.cloudinary.com') ?? false}
          />
        </div>
      </Link>

      {/* Product info */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div>
          <Link href={`/shop/${product.slug || product.id}`} className="block">
            <h3 className="w-full truncate text-left text-sm font-semibold text-gray-900 uppercase">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs leading-tight text-gray-500 capitalize">
            {materials || 'White gold, sterling silver, crystal base'}
          </p>
        </div>
        <div className="mt-1 mr-6 flex items-center justify-between whitespace-nowrap">
          <p className="text-xs text-gray-600">{priceInPLN} zł </p>
        </div>
      </div>
    </div>
  );
}
