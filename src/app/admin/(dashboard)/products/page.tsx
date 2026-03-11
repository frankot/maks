export const dynamic = 'force-dynamic'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProductsPaginated } from '@/lib/products'
import { ProductsTable } from './_components/ProductsTable'
import Link from 'next/link'
import AdminPageWrapper from '../../components/AdminPageWrapper'
import { AdminSearchBar } from '../../components/AdminSearchBar'
import { EditCollectionsClient } from './_components/EditCollectionsClient'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ADMIN_PAGE_SIZE_OPTIONS } from '@/lib/constants'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>
}) {
  const { page: pageParam, pageSize: pageSizeParam, q } = await searchParams
  const searchQuery = q?.trim() || undefined
  const page = Math.max(1, Number(pageParam) || 1)
  const rawSize = Number(pageSizeParam) || ADMIN_PAGE_SIZE_OPTIONS[0]
  const pageSize = ADMIN_PAGE_SIZE_OPTIONS.includes(
    rawSize as (typeof ADMIN_PAGE_SIZE_OPTIONS)[number]
  )
    ? rawSize
    : ADMIN_PAGE_SIZE_OPTIONS[0]

  const {
    items: products,
    totalPages,
    page: currentPage,
    pageSize: currentPageSize,
  } = await getProductsPaginated({
    page,
    pageSize,
    searchQuery,
  })

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Products</h1>
        <AdminSearchBar
          basePath="/admin/products"
          searchQuery={searchQuery}
          placeholder="Search by product name"
        />
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
        page={currentPage}
        totalPages={totalPages}
        pageSize={currentPageSize}
      />
    </AdminPageWrapper>
  )
}
