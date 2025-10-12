import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/generated/prisma";

interface ProductCardProps {
  product: Product;
  isLast?: boolean;
}

export default function ProductCard({
  product,
  isLast = false,
}: ProductCardProps) {
  // Convert price from grosz to PLN
  const priceInPLN = (product.priceInGrosz / 100).toFixed(2);

  return (
    <div
      className={`h-[460px] w-full overflow-hidden  bg-[#F1F1F1] `}
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        {/* Image section - 80% height */}
        <div className="relative h-[380px] overflow-hidden">
          <Image
            src={product.imagePaths[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="360px"
            unoptimized={product.imagePaths[0]?.includes("res.cloudinary.com")}
          />
        </div>

        {/* Product info section - 20% height */}
        <div className="flex h-[75px] flex-col items-center justify-center px-4">
          <h3 className="mb-1 w-full truncate text-center uppercase text-sm font-semibold text-gray-900">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600">{priceInPLN} zł</p>
        </div>
      </Link>
    </div>
  );
}
