import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Shop handmade jewelry by MAMI. Browse unique rings, necklaces, earrings, bracelets, and chains — each piece one-of-a-kind, crafted in Warsaw.',
  alternates: { canonical: 'https://mami.com.pl/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
