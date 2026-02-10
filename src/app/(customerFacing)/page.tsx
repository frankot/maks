import type { Metadata } from 'next';
import Hero from './_components/Hero';
import Mission from './_components/Mission';
import Marquee from './_components/Marquee';
import FeaturedProductsServer from './_components/FeaturedProductsServer';
import FeaturedProductsDynamicServer from './_components/FeaturedProductsDynamicServer';
import type { Category } from '@prisma/client';
import CTA from './_components/CTA';

export const metadata: Metadata = {
  title: 'MAMI — Handmade Jewelry from Warsaw',
  description:
    'Discover one-of-a-kind handmade jewelry by MAMI. Organic yet bold — natural forms, raw and cut stones, molten designs. Based in Warsaw, Poland.',
  alternates: { canonical: 'https://mami.com.pl' },
};

export default function Home() {
  return (
    <>
      <main className="pt-[var(--nav-height)]">
        <Hero />
        <Marquee />

        <FeaturedProductsServer category={'RINGS' as Category} title="Rings" />

        <FeaturedProductsServer category={'NECKLACES' as Category} title="Necklaces" />
        <Mission />

        <FeaturedProductsDynamicServer initialCategory={'EARRINGS' as Category} />

        <CTA />
      </main>
    </>
  );
}
