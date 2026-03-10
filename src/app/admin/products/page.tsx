export const dynamic = 'force-dynamic'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getProductsPaginated } from '@/lib/products'
import { ProductsTable } from './_components/ProductsTable'
import Link from 'next/link'
import AdminPageWrapper from '../components/AdminPageWrapper'
import { EditCollectionsClient } from './_components/EditCollectionsClient'
import { PaginationControls } from '@/components/ui/pagination-controls'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; q?: string }>
}) {
  const { cursor, q } = await searchParams
  const searchQuery = q?.trim() || undefined
  const { items: products, nextCursor, hasMore } = await getProductsPaginated({
    cursor,
    searchQuery,
  })

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Products</h1>
        <form action="/admin/products" method="get" className="flex flex-1 gap-2">
          <Input
            name="q"
            defaultValue={searchQuery ?? ''}
            placeholder="Search by product name"
            aria-label="Search by product name"
            className="max-w-md"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
          {searchQuery ? (
            <Button asChild variant="ghost">
              <Link href="/admin/products">Clear</Link>
            </Button>
          ) : null}
        </form>
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
        queryParams={searchQuery ? { q: searchQuery } : undefined}
        nextCursor={nextCursor}
        hasMore={hasMore}
        hasPrev={!!cursor}
      />
    </AdminPageWrapper>
  )
}
