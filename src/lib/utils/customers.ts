// Client-safe customer utilities (no Prisma dependencies)

export function formatPrice(priceInGrosz: number): string {
  return `${(priceInGrosz / 100).toFixed(2)} zł`;
}

export function formatCustomerName(firstName: string | null, lastName: string | null): string {
  if (!firstName && !lastName) return 'N/A';
  return `${firstName || ''} ${lastName || ''}`.trim();
}

export function calculateTotalSpent(orders: Array<{ pricePaid: number }>): number {
  return orders.reduce((sum, order) => sum + order.pricePaid, 0);
}
