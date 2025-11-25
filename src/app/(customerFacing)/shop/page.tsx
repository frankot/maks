import type { Category } from '@prisma/client';
import ProductsServer from '../_components/ProductsServer';

interface ShopPageProps {
  searchParams: Promise<{ collection?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { collection } = await searchParams;

  return (
    <main>
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
  );
}
