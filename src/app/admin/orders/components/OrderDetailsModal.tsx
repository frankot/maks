"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DetailsModal } from "@/app/admin/components/DetailsModal";
import { formatPrice, getStatusVariant, getStatusLabel } from "@/lib/orders";
import type { Order, OrderItem, Address } from "@/app/generated/prisma";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  ShoppingBag,
  Truck,
} from "lucide-react";

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

  const title = order
    ? `Order #${order.id.slice(0, 8)}`
    : "Loading Order Details";

  const formatCustomerName = (
    firstName: string | null,
    lastName: string | null,
  ) => {
    if (!firstName && !lastName) return "N/A";
    return `${firstName || ""} ${lastName || ""}`.trim();
  };

  return (
    <DetailsModal
      isOpen={true}
      onClose={onClose}
      title={title}
      loading={loading}
      error={error}
      size="full"
    >
      {order && (
        <>
          {/* Top Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-500 p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatPrice(order.pricePaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-green-500 p-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Items</p>
                  <p className="text-2xl font-bold text-green-900">
                    {order.orderItems.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-500 p-3">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Status</p>
                  <div className="mt-1">
                    <Badge
                      variant={getStatusVariant(order.status)}
                      className="text-sm"
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6">
              <div className="flex items-center">
                <div className="rounded-lg bg-amber-500 p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-amber-600">
                    Order Date
                  </p>
                  <p className="text-lg font-bold text-amber-900">
                    {format(new Date(order.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* Column 1: Order & Customer Info */}
            <div className="space-y-6">
              {/* Order Information */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <ShoppingBag className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Order Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Package className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Truck className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="mt-1"
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(order.subtotal)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Truck className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Shipping</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(order.shippingCost)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {format(
                          new Date(order.createdAt),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <User className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Customer
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {formatCustomerName(
                          order.user.firstName,
                          order.user.lastName,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {order.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">
                        {order.user.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Products */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center">
                <Package className="mr-3 h-6 w-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Products
                </h3>
                <span className="ml-auto text-sm text-gray-500">
                  {order.orderItems.length} items
                </span>
              </div>

              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">
                        {item.product.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        ×{item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {formatPrice(item.priceInGrosz, item.currency)} each
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(
                          item.priceInGrosz * item.quantity,
                          item.currency,
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="mt-6 border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(order.pricePaid)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Addresses */}
            <div className="space-y-6">
              {/* Billing Address */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <MapPin className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Billing Address
                  </h3>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">{order.billingAddress.street}</p>
                    <p>
                      {order.billingAddress.city}{" "}
                      {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center">
                  <Truck className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Shipping Address
                  </h3>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">
                      {order.shippingAddress.street}
                    </p>
                    <p>
                      {order.shippingAddress.city}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DetailsModal>
  );
}
