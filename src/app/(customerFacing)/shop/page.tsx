'use client';
import CollectionsBar from '../_components/CollectionsBar';
import CollectionsBarSkeleton from '../_components/CollectionsBarSkeleton';
import PageWithHeroBar from '../_components/PageWithHeroBar';
import { Suspense } from 'react';
import ProductsClient from '../_components/ProductsClient';
import ProductsSkeleton from '../_components/ProductsSkeleton';

export default function ShopPage() {
  return (
    <>
      {/* Hero + Collections Bar Wrapper */}
      <PageWithHeroBar imagePath="/shop_main.jpg" imageAlt="Shop">
        <Suspense fallback={<CollectionsBarSkeleton />}>
          <CollectionsBar />
        </Suspense>
      </PageWithHeroBar>

      {/* Client-rendered products list (handles collection filtering smoothly) */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsClient />
      </Suspense>
    </>
  );
}
