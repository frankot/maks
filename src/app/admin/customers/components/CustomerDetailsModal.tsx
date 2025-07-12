"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCustomerName,
  calculateTotalSpent,
  formatPrice,
} from "@/lib/customers";
import { getStatusVariant, getStatusLabel } from "@/lib/orders";
import type { User, Order, OrderItem, Address } from "@/app/generated/prisma";

interface CustomerDetailsModalProps {
  customerId: string;
  onClose: () => void;
}

interface CustomerWithDetails extends User {
  orders: (Order & {
    orderItems: (OrderItem & {
      product: {
        name: string;
        priceInGrosz: number;
        priceInCents: number;
      };
    })[];
    billingAddress: Address;
    shippingAddress: Address;
  })[];
  addresses: Address[];
  _count: {
    orders: number;
  };
}

export function CustomerDetailsModal({
  customerId,
  onClose,
}: CustomerDetailsModalProps) {
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/customers/${customerId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const customerData = await response.json();
        setCustomer(customerData as CustomerWithDetails);
      } catch (err) {
        setError("Failed to fetch customer details");
        console.error("Error fetching customer details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Customer Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !customer) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-red-600">{error || "Customer not found"}</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Customer Details -{" "}
              {formatCustomerName(customer.firstName, customer.lastName)}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Full Name:</span>
                  <span className="font-medium">
                    {formatCustomerName(customer.firstName, customer.lastName)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{customer.phoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Joined:</span>
                  <span>
                    {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Order Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium">{customer._count.orders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spent:</span>
                  <span className="font-medium">
                    {formatPrice(calculateTotalSpent(customer.orders))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Order:</span>
                  <span>
                    {customer._count.orders > 0
                      ? formatPrice(
                          calculateTotalSpent(customer.orders) /
                            customer._count.orders,
                        )
                      : formatPrice(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Addresses */}
          {customer.addresses.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Addresses</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {address.addressType}
                      </span>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{address.street}</div>
                      <div>
                        {address.city} {address.postalCode}
                      </div>
                      <div>{address.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order History */}
          <div>
            <h3 className="mb-2 font-semibold">Order History</h3>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders found</p>
            ) : (
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Order ID</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-3 font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          {formatPrice(order.pricePaid)}
                        </td>
                        <td className="p-3 text-right">
                          {format(new Date(order.createdAt), "dd/MM/yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
