// Cart types and utilities
export type CartItem = {
  productId: string;
  name: string;
  priceInCents: number;
  imagePath?: string;
  quantity: number;
  slug: string | null;
};

export type Cart = {
  items: CartItem[];
  totalItems: number;
  totalPriceInCents: number;
};

export const CART_STORAGE_KEY = 'maks-cart';

// Calculate cart totals
export function calculateCartTotals(items: CartItem[]): {
  totalItems: number;
  totalPriceInCents: number;
} {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPriceInCents: acc.totalPriceInCents + item.priceInCents * item.quantity,
    }),
    { totalItems: 0, totalPriceInCents: 0 }
  );
}

// Format price for display
export function formatCartPrice(priceInCents: number): string {
  return `${(priceInCents / 100).toFixed(2)} zł`;
}
