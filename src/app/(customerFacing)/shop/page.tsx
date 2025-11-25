import type { Category } from '@/app/generated/prisma';
import ProductsServer from '../_components/ProductsServer';

export default function ShopPage() {
  return (
    <main>
      <ProductsServer category={'RINGS' as Category} title="Rings" />
      <ProductsServer category={'NECKLACES' as Category} title="Necklaces" />
      <ProductsServer category={'EARRINGS' as Category} title="Earrings" />
    </main>
  );
}
