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
import { CustomerActionsDropdown } from "./CustomerActionsDropdown";
import { CustomerDetailsModal } from "./CustomerDetailsModal";
import {
  formatCustomerName,
  calculateTotalSpent,
  formatPrice,
} from "@/lib/customers";
import type { User, Order } from "@/app/generated/prisma";

interface CustomerWithOrders extends User {
  orders: Order[];
  _count: {
    orders: number;
  };
}

interface CustomersTableProps {
  customers: CustomerWithOrders[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleCloseModal = () => {
    setSelectedCustomerId(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {formatCustomerName(customer.firstName, customer.lastName)}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phoneNumber || "-"}</TableCell>
                  <TableCell>{customer._count.orders}</TableCell>
                  <TableCell>
                    {formatPrice(calculateTotalSpent(customer.orders))}
                  </TableCell>
                  <TableCell>
                    {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <CustomerActionsDropdown
                      customerId={customer.id}
                      onViewDetails={handleViewDetails}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomerId && (
        <CustomerDetailsModal
          customerId={selectedCustomerId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
