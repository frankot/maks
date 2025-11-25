// Client-safe order utilities (no Prisma dependencies)

export type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export function formatPrice(priceInGrosz: number, currency: string = 'PLN'): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceInGrosz / 100);
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(priceInGrosz / 100);
}

export function formatPricePLN(priceInGrosz: number): string {
  return formatPrice(priceInGrosz, 'PLN');
}

export function formatPriceEUR(priceInCents: number): string {
  return formatPrice(priceInCents, 'EUR');
}

export function getStatusVariant(status: string): StatusVariant {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'outline';
    case 'processing':
      return 'default';
    case 'shipped':
      return 'secondary';
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
