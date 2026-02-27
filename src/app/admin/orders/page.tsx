export const dynamic = 'force-dynamic'

import { getOrdersPaginated } from '@/lib/orders'
import { OrdersTable } from './_components/OrdersTable'
import AdminPageWrapper from '../components/AdminPageWrapper'
import { PaginationControls } from '@/components/ui/pagination-controls'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>
}) {
  const { cursor } = await searchParams
  const { items: orders, nextCursor, hasMore } = await getOrdersPaginated({ cursor })

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <OrdersTable orders={orders} />

      <PaginationControls
        basePath="/admin/orders"
        nextCursor={nextCursor}
        hasMore={hasMore}
        hasPrev={!!cursor}
      />
    </AdminPageWrapper>
  )
}
