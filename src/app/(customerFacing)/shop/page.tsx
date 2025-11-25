'use client';

import type { Category, Product, Collection } from '@prisma/client';
import Image from 'next/image';
import CollectionsBar from '../_components/CollectionsBar';
import Nav from '../_components/Nav';
import { Suspense, useEffect, useState } from 'react';
import Products from '../_components/Products';
import { useSearchParams } from 'next/navigation';

type ProductWithCollection = Product & {
  collection: Collection | null;
};

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<ProductWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const collectionSlug = searchParams?.get('collection');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filterProductsByCategory = (category: Category) => {
    return allProducts.filter((p) => {
      const matchesCategory = p.category === category;
      const matchesCollection = collectionSlug
        ? p.collection?.slug === collectionSlug
        : true;
      return matchesCategory && matchesCollection && p.isAvailable && p.productStatus === 'SHOP';
    });
  };

  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <main className="pt-[var(--nav-height)]">
        {/* Hero Image */}
        <div className="relative h-[300px] w-full lg:h-[400px]">
          <div className="bg-black/10 absolute inset-0 z-10"></div>
          <Image
            src="/shop_main.jpg"
            alt="Shop"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Sticky Collections Bar */}
        <Suspense fallback={null}>
          <CollectionsBar />
        </Suspense>

        {/* Products Sections */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading products...</div>
        ) : (
          <>
            <Products
              title="Rings"
              products={filterProductsByCategory('RINGS' as Category)}
              key={`rings-${collectionSlug || 'all'}`}
            />
            <Products
              title="Necklaces"
              products={filterProductsByCategory('NECKLACES' as Category)}
              key={`necklaces-${collectionSlug || 'all'}`}
            />
            <Products
              title="Earrings"
              products={filterProductsByCategory('EARRINGS' as Category)}
              key={`earrings-${collectionSlug || 'all'}`}
            />
          </>
        )}
      </main>
    </>
  );
}
