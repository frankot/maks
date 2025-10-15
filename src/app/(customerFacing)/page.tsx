import Hero from './_components/Hero';
import Mission from './_components/Mission';
import Marquee from './_components/Marquee';
import FeaturedProductsServer from './_components/FeaturedProductsServer';
import type { Category } from '@/app/generated/prisma';
import CTA from './_components/CTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />

      <FeaturedProductsServer category={'RINGS' as Category} title="Rings" />

      <FeaturedProductsServer category={'NECKLACES' as Category} title="Necklaces" />
      <Mission />

      <FeaturedProductsServer category={'EARRINGS' as Category} title="Earrings" />

      <CTA />
    </main>
  );
}
