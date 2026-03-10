export const dynamic = 'force-dynamic'

import { getOrdersPaginated } from '@/lib/orders'
import { OrdersTable } from './_components/OrdersTable'
import AdminPageWrapper from '../components/AdminPageWrapper'
import { AdminSearchBar } from '../components/AdminSearchBar'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ADMIN_PAGE_SIZE_OPTIONS } from '@/lib/constants'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>
}) {
  const { page: pageParam, pageSize: pageSizeParam, q } = await searchParams
  const searchQuery = q?.trim() || undefined
  const page = Math.max(1, Number(pageParam) || 1)
  const rawSize = Number(pageSizeParam) || ADMIN_PAGE_SIZE_OPTIONS[0]
  const pageSize = ADMIN_PAGE_SIZE_OPTIONS.includes(rawSize as (typeof ADMIN_PAGE_SIZE_OPTIONS)[number])
    ? rawSize
    : ADMIN_PAGE_SIZE_OPTIONS[0]

  const {
    items: orders,
    totalPages,
    page: currentPage,
    pageSize: currentPageSize,
  } = await getOrdersPaginated({ page, pageSize, searchQuery })

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Orders</h1>
        <AdminSearchBar
          basePath="/admin/orders"
          searchQuery={searchQuery}
          placeholder="Search by customer name or email"
        />
      </div>

      <OrdersTable orders={orders} />

      <PaginationControls
        basePath="/admin/orders"
        queryParams={searchQuery ? { q: searchQuery } : undefined}
        page={currentPage}
        totalPages={totalPages}
        pageSize={currentPageSize}
      />
    </AdminPageWrapper>
  )
}
