import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
} from "lucide-react";
import {
  DashboardStats as DashboardStatsType,
  formatPrice,
  getStatusColor,
} from "@/lib/dashboard";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const totalOrdersCount = Object.values(stats.ordersByStatus).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-muted-foreground text-xs">
              From {stats.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-muted-foreground flex items-center text-xs">
              {stats.recentOrdersGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {Math.abs(stats.recentOrdersGrowth)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-muted-foreground text-xs">
              {stats.availableProducts} available (
              {stats.productAvailabilityPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-muted-foreground text-xs">
              {stats.totalCustomers > 0
                ? (stats.totalOrders / stats.totalCustomers).toFixed(1)
                : 0}{" "}
              orders per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Product Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available Products</span>
                <span>
                  {stats.availableProducts} / {stats.totalProducts}
                </span>
              </div>
              <Progress
                value={stats.productAvailabilityPercentage}
                className="h-2"
              />
            </div>
            <div className="text-muted-foreground text-sm">
              {stats.productAvailabilityPercentage}% of products are currently
              available
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const percentage =
                  totalOrdersCount > 0 ? (count / totalOrdersCount) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Badge
                          variant="secondary"
                          className={`mr-2 ${getStatusColor(status)}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <span>{count}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topSellingProducts.length > 0 ? (
              stats.topSellingProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {product.totalSold} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(product.revenue)}
                    </p>
                    <p className="text-muted-foreground text-sm">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No sales data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
