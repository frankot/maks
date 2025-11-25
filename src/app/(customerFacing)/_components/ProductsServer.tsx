import type { Category } from '@/app/generated/prisma';
import { getProductsByCategory } from '@/lib/products';
import Products from './Products';

interface ProductsServerProps {
  category: Category;
  title: string;
}

export default async function ProductsServer({ category, title }: ProductsServerProps) {
  const products = await getProductsByCategory(category);

  return <Products title={title} products={products} />;
}
