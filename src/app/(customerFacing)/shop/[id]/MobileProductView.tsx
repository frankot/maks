'use client';

import Image from 'next/image';
import { useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductDetailsTabs from './ProductDetailsTabs';

interface MobileProductViewProps {
  product: {
    id: string;
    name: string;
    description: string;
    priceInGrosz: number;
    imagePaths: string[];
    slug: string | null;
    productStatus: string;
  };
  priceInPLN: string;
  isSold: boolean;
}

export default function MobileProductView({ product, priceInPLN, isSold }: MobileProductViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="lg:hidden mt-18">
      {/* Main Product Image */}
      <div className="relative w-full aspect-square bg-gray-50">
        {product.imagePaths[selectedImageIndex] ? (
          <Image
            key={selectedImageIndex}
            src={product.imagePaths[selectedImageIndex]}
            alt={product.name}
            fill
            className="object-contain p-8"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-lg font-medium text-gray-400">LOADING</span>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Always show */}
      <div className="grid grid-cols-4 gap-2 p-4 border-b border-gray-200">
        {product.imagePaths.map((imagePath, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative aspect-square border bg-gray-50  overflow-hidden transition-all ${
              selectedImageIndex === index
                ? ' border-black'
                : ' border-gray-200'
            }`}
          >
            {imagePath ? (
              <Image
                src={imagePath}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-gray-400">-</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Product Info Section */}
      <div className="px-4 pt-6 pb-8">
        {/* Title & Price */}
        <div className="mb-6">
          <h1 className="text-lg font-normal tracking-wide uppercase mb-2">
            {product.name}
          </h1>
          <p className="text-base font-light text-gray-900">{priceInPLN} zł</p>
        </div>

        {/* Add to Cart Button */}
        <div className="space-y-3 mb-4">
          {isSold ? (
            <button
              disabled
              className="w-full border border-gray-300 bg-gray-100 py-3.5 text-sm tracking-wider text-gray-500 uppercase cursor-not-allowed"
            >
              SOLD OUT
            </button>
          ) : (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                priceInGrosz: product.priceInGrosz,
                imagePath: product.imagePaths[0],
                slug: product.slug ?? product.id,
              }}
              className="w-full bg-black py-3.5 text-sm tracking-wider text-white uppercase transition-colors hover:bg-gray-800"
            />
          )}
        </div>

        {/* More Payment Options */}
        <div className="text-center mb-6">
          <button className="text-xs text-gray-600 underline hover:text-black transition-colors">
            More payment options
          </button>
        </div>

        {/* Product Description */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs leading-relaxed text-gray-700">
            {product.description}
          </p>
        </div>

        {/* Product Details Accordion/Tabs */}
        <div className="mt-6">
          <ProductDetailsTabs
            details={
              <p className="text-xs leading-relaxed">
                Each piece is handmade in Warsaw, Poland as a limited edition creation.
                Your jewelry comes with an authenticity certificate and is beautifully
                presented in a gift box. We provide a 1-year warranty for your peace of mind.
              </p>
            }
            material={
              <ul className="space-y-1 text-xs">
                <li>• 925 Sterling Silver</li>
                <li>• Natural gemstones</li>
                <li>• Hypoallergenic materials</li>
                <li>• Ethically sourced</li>
                <li>• Tarnish resistant coating</li>
              </ul>
            }
            care={
              <p className="text-xs leading-relaxed">
                Clean gently with a soft cloth and avoid contact with chemicals or water.
                Store your jewelry in the provided pouch when not wearing it. Remove before
                swimming or exercising. Professional cleaning is recommended annually.
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
}
