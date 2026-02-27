import { prisma } from './prisma'
import { DEFAULT_PAGE_SIZE } from './constants'

export async function getCustomers() {
  try {
    const customers = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            pricePaid: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Failed to fetch customers')
  }
}

export async function getCustomersPaginated(params: { cursor?: string; pageSize?: number }) {
  const { cursor, pageSize = DEFAULT_PAGE_SIZE } = params

  const customers = await prisma.user.findMany({
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: { deletedAt: null },
    include: {
      orders: {
        select: {
          id: true,
          status: true,
          pricePaid: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = customers.length > pageSize
  const items = hasMore ? customers.slice(0, -1) : customers
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

  return { items, nextCursor, hasMore }
}

export async function getCustomerById(customerId: string) {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    priceInGrosz: true,
                    priceInCents: true,
                  },
                },
              },
            },
            billingAddress: true,
            shippingAddress: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        addresses: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })
    return customer
  } catch (error) {
    console.error('Error fetching customer by ID:', error)
    throw new Error('Failed to fetch customer details')
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    await prisma.user.update({
      where: { id: customerId },
      data: { deletedAt: new Date() },
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw new Error('Failed to delete customer')
  }
}

export function formatCustomerName(firstName: string | null, lastName: string | null): string {
  if (!firstName && !lastName) return 'N/A'
  return `${firstName || ''} ${lastName || ''}`.trim()
}

export function calculateTotalSpent(orders: Array<{ pricePaid: number }>): number {
  return orders.reduce((total, order) => total + order.pricePaid, 0)
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
