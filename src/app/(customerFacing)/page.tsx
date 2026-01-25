import Hero from './_components/Hero';
import Mission from './_components/Mission';
import Marquee from './_components/Marquee';
import FeaturedProductsServer from './_components/FeaturedProductsServer';
import FeaturedProductsDynamicServer from './_components/FeaturedProductsDynamicServer';
import type { Category } from '@prisma/client';
import CTA from './_components/CTA';

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
