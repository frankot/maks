import { prisma } from './prisma'
import { OrderStatus } from '@prisma/client'
import { DEFAULT_PAGE_SIZE } from './constants'

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return orders
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }
}

export async function getOrdersPaginated(params: {
  page?: number
  pageSize?: number
  status?: OrderStatus
  searchQuery?: string
}) {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, status, searchQuery } = params
  const skip = (page - 1) * pageSize

  const where = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(searchQuery
      ? {
          user: {
            OR: [
              { firstName: { contains: searchQuery, mode: 'insensitive' as const } },
              { lastName: { contains: searchQuery, mode: 'insensitive' as const } },
              { email: { contains: searchQuery, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      where,
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return { items, total, page, pageSize, totalPages }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })
    return updatedOrder
  } catch (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status')
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date() },
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    throw new Error('Failed to delete order')
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                imagePaths: true,
                priceInGrosz: true,
                priceInCents: true,
              },
            },
          },
        },
        billingAddress: true,
        shippingAddress: true,
      },
    })
    return order
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    throw new Error('Failed to fetch order details')
  }
}

export function formatPrice(priceInGrosz: number, currency: string = 'PLN'): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceInGrosz / 100)
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(priceInGrosz / 100)
}

export function formatPricePLN(priceInGrosz: number): string {
  return formatPrice(priceInGrosz, 'PLN')
}

export function formatPriceEUR(priceInCents: number): string {
  return formatPrice(priceInCents, 'EUR')
}

export function getStatusVariant(
  status: OrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'outline'
    case 'PROCESSING':
      return 'secondary'
    case 'SHIPPED':
      return 'default'
    case 'DELIVERED':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'PROCESSING':
      return 'Processing'
    case 'SHIPPED':
      return 'Shipped'
    case 'DELIVERED':
      return 'Delivered'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}
