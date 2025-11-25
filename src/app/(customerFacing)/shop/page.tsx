import type { Category } from '@prisma/client';
import Image from 'next/image';
import ProductsServer from '../_components/ProductsServer';
import CollectionsBar from '../_components/CollectionsBar';
import Nav from '../_components/Nav';
import { Suspense } from 'react';

interface ShopPageProps {
  searchParams: Promise<{ collection?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { collection } = await searchParams;

  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <main className="pt-[var(--nav-height)]">
      {/* Hero Image */}
      <div className="relative h-[300px] w-full lg:h-[400px]">
        <div className='bg-black/10 absolute inset-0 z-10'></div>
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
      <ProductsServer category={'RINGS' as Category} title="Rings" collectionSlug={collection} />
      <ProductsServer
        category={'NECKLACES' as Category}
        title="Necklaces"
        collectionSlug={collection}
      />
      <ProductsServer
        category={'EARRINGS' as Category}
        title="Earrings"
        collectionSlug={collection}
      />
      </main>
    </>
  );
}
