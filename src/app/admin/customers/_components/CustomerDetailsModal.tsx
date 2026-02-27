'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DetailsModal } from '@/app/admin/components/DetailsModal'
import { formatCustomerName, calculateTotalSpent, formatPrice } from '@/lib/utils/customers'
import { getStatusVariant, getStatusLabel } from '@/lib/utils/orders'
import { OrderDetailsModal } from '../../orders/_components/OrderDetailsModal'
import type { User, Order, OrderItem, Address } from '@prisma/client'
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  MapPin,
  Package,
} from 'lucide-react'

interface CustomerDetailsModalProps {
  customerId: string
  onClose: () => void
}

interface CustomerWithDetails extends User {
  orders: (Order & {
    orderItems: (OrderItem & {
      product: {
        name: string
        priceInGrosz: number
        priceInCents: number
      }
    })[]
    billingAddress: Address
    shippingAddress: Address
  })[]
  addresses: Address[]
  _count: {
    orders: number
  }
}

export function CustomerDetailsModal({ customerId, onClose }: CustomerDetailsModalProps) {
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId)
  }

  const handleCloseOrderModal = () => {
    setSelectedOrderId(null)
  }

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/customers/${customerId}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const customerData = await response.json()
        setCustomer(customerData as CustomerWithDetails)
      } catch (err) {
        setError('Failed to fetch customer details')
        console.error('Error fetching customer details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

  const title = customer
    ? `${formatCustomerName(customer.firstName, customer.lastName)}`
    : 'Loading Customer Details'

  return (
    <>
      <DetailsModal
        isOpen={true}
        onClose={onClose}
        title={title}
        loading={loading}
        error={error}
        size="full"
      >
        {customer && (
          <>
            {/* Top Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-blue-500 p-3">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-900">{customer._count.orders}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-green-500 p-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatPrice(calculateTotalSpent(customer.orders))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-purple-500 p-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Avg Order</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {customer._count.orders > 0
                        ? formatPrice(calculateTotalSpent(customer.orders) / customer._count.orders)
                        : formatPrice(0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6">
                <div className="flex items-center">
                  <div className="rounded-lg bg-amber-500 p-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-amber-600">Member Since</p>
                    <p className="text-xl font-bold text-amber-900">
                      {format(new Date(customer.createdAt), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              {/* Column 1: Customer Information */}
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center">
                    <UserIcon className="mr-3 h-6 w-6 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-900">
                          {formatCustomerName(customer.firstName, customer.lastName)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-3 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-3 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {customer.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {customer.addresses.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center">
                      <MapPin className="mr-3 h-6 w-6 text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Addresses</h3>
                    </div>
                    <div className="space-y-4">
                      {customer.addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium text-gray-900 capitalize">
                              {address.addressType.toLowerCase()}
                            </span>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>{address.street}</p>
                            <p>
                              {address.city} {address.postalCode}
                            </p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2 & 3: Order History */}
              <div className="xl:col-span-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center">
                    <ShoppingBag className="mr-3 h-6 w-6 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Order History</h3>
                    <span className="ml-auto text-sm text-gray-500">
                      {customer.orders.length} orders
                    </span>
                  </div>

                  {customer.orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <p className="text-lg text-gray-500">No orders found</p>
                      <p className="text-sm text-gray-400">
                        This customer hasn&apos;t placed any orders yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-4 text-left font-semibold text-gray-900">
                              Order ID
                            </th>
                            <th className="px-4 py-4 text-left font-semibold text-gray-900">
                              Status
                            </th>
                            <th className="px-4 py-4 text-right font-semibold text-gray-900">
                              Total
                            </th>
                            <th className="px-4 py-4 text-right font-semibold text-gray-900">
                              Date
                            </th>
                            <th className="px-4 py-4 text-right font-semibold text-gray-900">
                              Items
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {customer.orders.map((order) => (
                            <tr
                              key={order.id}
                              className="group cursor-pointer transition-colors hover:bg-gray-50"
                              onClick={() => handleOrderClick(order.id)}
                            >
                              <td className="px-4 py-4">
                                <div className="font-mono text-sm text-blue-600 group-hover:text-blue-800">
                                  #{order.id.slice(0, 8)}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <Badge variant={getStatusVariant(order.status)}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                {formatPrice(order.pricePaid)}
                              </td>
                              <td className="px-4 py-4 text-right text-gray-600">
                                {format(new Date(order.createdAt), 'dd MMM yyyy')}
                              </td>
                              <td className="px-4 py-4 text-right text-gray-600">
                                {order.orderItems.length} items
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DetailsModal>

      {selectedOrderId && (
        <OrderDetailsModal orderId={selectedOrderId} onClose={handleCloseOrderModal} />
      )}
    </>
  )
}
