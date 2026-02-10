export const dynamic = 'force-dynamic';

import { getCustomersPaginated } from '@/lib/customers';
import { CustomersTable } from './_components/CustomersTable';
import AdminPageWrapper from '../components/AdminPageWrapper';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const { items: customers, nextCursor, hasMore } = await getCustomersPaginated({ cursor });

  return (
    <AdminPageWrapper>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      <CustomersTable customers={customers} />

      <PaginationControls
        basePath="/admin/customers"
        nextCursor={nextCursor}
        hasMore={hasMore}
        hasPrev={!!cursor}
      />
    </AdminPageWrapper>
  );
}
