"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderActionsDropdown } from "./OrderActionsDropdown";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { formatPrice, getStatusVariant, getStatusLabel } from "@/lib/orders";
import type { Order } from "@/app/generated/prisma";

interface OrderWithUser extends Order {
  user: {
    email: string;
    phoneNumber: string | null;
  };
}

interface OrdersTableProps {
  orders: OrderWithUser[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Customer Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(order.pricePaid)}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{order.user.email}</TableCell>
                  <TableCell>{order.user.phoneNumber || "-"}</TableCell>
                  <TableCell className="text-right">
                    <OrderActionsDropdown
                      orderId={order.id}
                      onViewDetails={handleViewDetails}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
