export const dynamic = 'force-dynamic'

import { getDiscountCodesPaginated } from '@/lib/discounts'
import { DiscountsTable } from './_components/DiscountsTable'
import { DiscountCodeForm } from './_components/DiscountCodeForm'
import AdminPageWrapper from '../components/AdminPageWrapper'
import { PaginationControls } from '@/components/ui/pagination-controls'

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>
}) {
  const { cursor } = await searchParams
  const { items: discountCodes, nextCursor, hasMore } = await getDiscountCodesPaginated({ cursor })

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <DiscountCodeForm />
      </div>

      <DiscountsTable discountCodes={discountCodes} />

      <PaginationControls
        basePath="/admin/discounts"
        nextCursor={nextCursor}
        hasMore={hasMore}
        hasPrev={!!cursor}
      />
    </AdminPageWrapper>
  )
}
