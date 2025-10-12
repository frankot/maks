import Hero from './_components/Hero';
import FeaturedProductsServer from './_components/FeaturedProductsServer';
import type { Category } from '@/app/generated/prisma';

export default function Home() {
  return (
    <main>
      <Hero />
  <FeaturedProductsServer category={"RINGS" as Category} title="Rings" />
      <FeaturedProductsServer category={"NECKLACES" as Category} title="Necklaces" />
      <FeaturedProductsServer category={"EARRINGS" as Category} title="Earrings" />
   
      
    </main>
  );
}
