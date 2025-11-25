'use client';
import Image from 'next/image';
import CollectionsBar from '../_components/CollectionsBar';
import Nav from '../_components/Nav';
import { Suspense } from 'react';
import ProductsClient from '../_components/ProductsClient';

export default function ShopPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <main className="pt-[var(--nav-height)]">
        {/* Hero Image */}
        <div className="relative h-[300px] w-full lg:h-[400px]">
          <div className="bg-black/10 absolute inset-0 z-10"></div>
          <Image src="/shop_main.jpg" alt="Shop" fill className="object-cover" priority />
        </div>

        {/* Sticky Collections Bar */}
        <Suspense fallback={null}>
          <CollectionsBar />
        </Suspense>

        {/* Client-rendered products list (handles collection filtering smoothly) */}
        <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading products...</div>}>
          <ProductsClient />
        </Suspense>
      </main>
    </>
  );
}
