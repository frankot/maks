import Image from 'next/image';
import Link from 'next/link';
// ShoppingCart removed — not used anymore
import { Product } from '@/app/generated/prisma';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Convert price from grosz to PLN
  const priceInPLN = (product.priceInGrosz / 100).toFixed(2);

  // Get a very short materials description
  // Prefer the real `materials` column; fall back to a short phrase from description
  const materials = (product as unknown as { materials?: string }).materials
    ? (product as unknown as { materials?: string }).materials
    : product.description
        ?.split(/\.|,|;|\n/)
        .map((s) => s.trim())
        .find(Boolean)
        ?.slice(0, 80);

  return (
    <div className={`w-full`}>
      {/* Image section - clickable */}
      <Link href={`/shop/${(product as any).slug || product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.imagePaths[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="360px"
            unoptimized={product.imagePaths[0]?.includes('res.cloudinary.com')}
          />
        </div>
      </Link>

      {/* Product info */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div>
          <Link href={`/shop/${(product as any).slug || product.id}`} className="block">
            <h3 className="w-full truncate text-left text-sm font-semibold text-gray-900 uppercase">
              {product.name}
            </h3>
          </Link>
    <p className="  text-xs leading-tight text-gray-500 capitalize">
          {materials || 'White gold, sterling silver, crystal base'}
        </p>
 
        </div>
             <div className="mt-1 mr-6 flex items-center justify-between">
            <p className="text-xs text-gray-600">{priceInPLN} zł </p>
          </div>
      </div>
    </div>
  );
}
