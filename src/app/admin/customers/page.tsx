import { getCustomers } from "@/lib/customers";
import { CustomersTable } from "./_components/CustomersTable";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="text-sm text-gray-600">
          Total: {customers.length} customers
        </div>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
