"use client";

import React, { useEffect, useState } from 'react';
import type { Product, Category, Collection } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import Products from './Products';
import ProductsSkeleton from './ProductsSkeleton';

type ProductWithCollection = Product & { collection: Collection | null };

export default function ProductsClient() {
  const [allProducts, setAllProducts] = useState<ProductWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const collectionSlug = searchParams?.get('collection');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = (await res.json()) as ProductWithCollection[];
          setAllProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterProductsByCategory = (category: Category) => {
    return allProducts.filter((p) => {
      const matchesCategory = p.category === category;
      const matchesCollection = collectionSlug ? p.collection?.slug === collectionSlug : true;
      return matchesCategory && matchesCollection && p.isAvailable && p.productStatus === 'SHOP';
    });
  };

  if (loading) {
    return <ProductsSkeleton />;
  }

  return (
    <>
      <Products title="Rings" products={filterProductsByCategory('RINGS' as Category)} key={`rings-${collectionSlug || 'all'}`} />
      <Products title="Necklaces" products={filterProductsByCategory('NECKLACES' as Category)} key={`necklaces-${collectionSlug || 'all'}`} />
      <Products title="Earrings" products={filterProductsByCategory('EARRINGS' as Category)} key={`earrings-${collectionSlug || 'all'}`} />
    </>
  );
}
