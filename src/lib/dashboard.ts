import { prisma } from './prisma';
import type { OrderStatus } from '@prisma/client';

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  availableProducts: number;
  productAvailabilityPercentage: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrdersGrowth: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get basic counts
    const [totalProducts, totalCustomers, totalOrders] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);

    // Get available products count
    const availableProducts = await prisma.product.count({
      where: { isAvailable: true },
    });

    // Calculate product availability percentage
    const productAvailabilityPercentage =
      totalProducts > 0 ? Math.round((availableProducts / totalProducts) * 100) : 0;

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        pricePaid: true,
      },
    });
    const totalRevenue = revenueResult._sum.pricePaid || 0;

    // Get orders by status
    const orderStatusCounts = (await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })) as unknown as Array<{ status: OrderStatus; _count: { status: number } }>;

    const ordersByStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStatusCounts.forEach((item) => {
      const status = item.status.toLowerCase() as keyof typeof ordersByStatus;
      ordersByStatus[status] = item._count.status;
    });

    // Get recent orders growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentOrders, previousOrders] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const recentOrdersGrowth =
      previousOrders > 0 ? Math.round(((recentOrders - previousOrders) / previousOrders) * 100) : 0;

    // Get top selling products (count occurrences since each product is unique)
    const topSellingProducts: Array<{
      productId: string;
      _count: { productId: number };
      _sum: { priceInGrosz: number | null };
    }> = (await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: {
        productId: true,
      },
      _sum: {
        priceInGrosz: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 5,
    })) as unknown as Array<{
      productId: string;
      _count: { productId: number };
      _sum: { priceInGrosz: number | null };
    }>;

    const topSellingProductsWithNames = await Promise.all(
      topSellingProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          id: item.productId,
          name: product?.name || 'Unknown Product',
          totalSold: item._count.productId || 0,
          revenue: item._sum.priceInGrosz || 0,
        };
      })
    );

    return {
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      availableProducts,
      productAvailabilityPercentage,
      ordersByStatus,
      recentOrdersGrowth,
      topSellingProducts: topSellingProductsWithNames,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

export function formatPrice(priceInGrosz: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  }).format(priceInGrosz / 100);
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'processing':
      return 'text-blue-600 bg-blue-50';
    case 'shipped':
      return 'text-purple-600 bg-purple-50';
    case 'delivered':
      return 'text-green-600 bg-green-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
