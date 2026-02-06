'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Product, Category, Collection } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import Products from './Products';
import ProductsSkeleton from './ProductsSkeleton';

const MAX_PRODUCTS_PER_CATEGORY = 10;

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

  const categoryGroups = useMemo(() => {
    const grouped = new Map<Category, ProductWithCollection[]>();

    for (const p of allProducts) {
      if (!p.isAvailable || p.productStatus !== 'SHOP') continue;
      if (collectionSlug && p.collection?.slug !== collectionSlug) continue;

      const existing = grouped.get(p.category) || [];
      existing.push(p);
      grouped.set(p.category, existing);
    }

    return Array.from(grouped.entries())
      .filter(([, products]) => products.length > 0)
      .map(([category, products]) => ({
        category,
        title: category.charAt(0) + category.slice(1).toLowerCase(),
        products: products.slice(0, MAX_PRODUCTS_PER_CATEGORY),
      }));
  }, [allProducts, collectionSlug]);

  if (loading) {
    return <ProductsSkeleton />;
  }

  return (
    <>
      {categoryGroups.map(({ category, title, products }) => (
        <Products
          key={`${category}-${collectionSlug || 'all'}`}
          title={title}
          category={category}
          products={products}
        />
      ))}
    </>
  );
}
