export const dynamic = 'force-dynamic';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { ProductsTable } from './_components/ProductsTable';
import Link from 'next/link';
import AdminPageWrapper from '../components/AdminPageWrapper';
import { AddCollectionClient } from './_components/AddCollectionClient';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">Total: {products.length} products</div>
          <AddCollectionClient />
          <Button asChild>
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductsTable products={products} />
    </AdminPageWrapper>
  );
}
