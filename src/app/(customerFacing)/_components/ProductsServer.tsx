import type { Category } from '@prisma/client'
import { getProductsByCategory } from '@/lib/products'
import Products from './Products'

interface ProductsServerProps {
  category: Category
  title: string
  collectionSlug?: string
}

export default async function ProductsServer({
  category,
  title,
  collectionSlug,
}: ProductsServerProps) {
  const products = await getProductsByCategory(category, 24, collectionSlug)

  return <Products title={title} category={category} products={products} />
}
