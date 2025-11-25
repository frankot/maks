// Client-safe product utilities (no Prisma dependencies)

export function formatPrice(priceInGrosz: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  }).format(priceInGrosz / 100);
}

export function formatPriceEur(priceInCents: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(priceInCents / 100);
}

export function formatPriceUsd(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(priceInCents / 100);
}

export function getAvailabilityBadgeVariant(isAvailable: boolean) {
  return isAvailable ? 'default' : 'destructive';
}

export function getAvailabilityLabel(isAvailable: boolean) {
  return isAvailable ? 'Available' : 'Unavailable';
}
