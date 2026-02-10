export const dynamic = 'force-dynamic';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProductsPaginated } from '@/lib/products';
import { ProductsTable } from './_components/ProductsTable';
import Link from 'next/link';
import AdminPageWrapper from '../components/AdminPageWrapper';
import { EditCollectionsClient } from './_components/EditCollectionsClient';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const { items: products, nextCursor, hasMore } = await getProductsPaginated({ cursor });

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center space-x-4">
          <EditCollectionsClient />
          <Button asChild>
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductsTable products={products} />

      <PaginationControls
        basePath="/admin/products"
        nextCursor={nextCursor}
        hasMore={hasMore}
        hasPrev={!!cursor}
      />
    </AdminPageWrapper>
  );
}
