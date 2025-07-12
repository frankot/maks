import { getOrders } from "@/lib/orders";
import { OrdersTable } from "./components/OrdersTable";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="text-sm text-gray-600">
          Total: {orders.length} orders
        </div>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
