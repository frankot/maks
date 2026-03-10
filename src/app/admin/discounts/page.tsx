export const dynamic = 'force-dynamic'

import { getDiscountCodesPaginated } from '@/lib/discounts'
import { DiscountsTable } from './_components/DiscountsTable'
import { DiscountCodeForm } from './_components/DiscountCodeForm'
import AdminPageWrapper from '../components/AdminPageWrapper'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ADMIN_PAGE_SIZE_OPTIONS } from '@/lib/constants'

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const rawSize = Number(pageSizeParam) || ADMIN_PAGE_SIZE_OPTIONS[0]
  const pageSize = ADMIN_PAGE_SIZE_OPTIONS.includes(rawSize as (typeof ADMIN_PAGE_SIZE_OPTIONS)[number])
    ? rawSize
    : ADMIN_PAGE_SIZE_OPTIONS[0]

  const {
    items: discountCodes,
    totalPages,
    page: currentPage,
    pageSize: currentPageSize,
  } = await getDiscountCodesPaginated({ page, pageSize })

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <DiscountCodeForm />
      </div>

      <DiscountsTable discountCodes={discountCodes} />

      <PaginationControls
        basePath="/admin/discounts"
        page={currentPage}
        totalPages={totalPages}
        pageSize={currentPageSize}
      />
    </AdminPageWrapper>
  )
}
