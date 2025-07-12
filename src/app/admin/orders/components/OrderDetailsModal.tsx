"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getStatusVariant, getStatusLabel } from "@/lib/orders";
import type { Order, OrderItem, Address } from "@/app/generated/prisma";

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

interface OrderWithDetails extends Order {
  user: {
    email: string;
    phoneNumber: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  orderItems: (OrderItem & {
    product: {
      name: string;
      priceInGrosz: number;
      priceInCents: number;
    };
  })[];
  billingAddress: Address;
  shippingAddress: Address;
}

export function OrderDetailsModal({
  orderId,
  onClose,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orderData = await response.json();
        setOrder(orderData as OrderWithDetails);
      } catch (err) {
        setError("Failed to fetch order details");
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Order Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !order) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-red-600">{error || "Order not found"}</p>
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
            <span>Order Details #{order.id.slice(0, 8)}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span className="font-medium">
                    {formatPrice(order.pricePaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>
                    {new Date(order.createdAt).toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Customer</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{order.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>First Name:</span>
                  <span>{order.user.firstName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Name:</span>
                  <span>{order.user.lastName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{order.user.phoneNumber || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="mb-2 font-semibold">Products</h3>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Price per item</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.product.name}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">
                        {formatPrice(item.priceInGrosz, item.currency)}
                      </td>
                      <td className="p-3 text-right">
                        {formatPrice(
                          item.priceInGrosz * item.quantity,
                          item.currency,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Billing Address</h3>
              <div className="space-y-1 text-sm">
                <div>{order.billingAddress.street}</div>
                <div>
                  {order.billingAddress.city} {order.billingAddress.postalCode}
                </div>
                <div>{order.billingAddress.country}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Shipping Address</h3>
              <div className="space-y-1 text-sm">
                <div>{order.shippingAddress.street}</div>
                <div>
                  {order.shippingAddress.city}{" "}
                  {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
