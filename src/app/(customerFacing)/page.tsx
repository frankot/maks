import Hero from './_components/Hero';
import FeaturedProducts from './_components/FeaturedProducts';
import Title from './_components/Title';
import Sections from './_components/Sections';
import Link from 'next/link';
import StudioStatement from '@/components/ui/StudioStatement';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Title text="Jewelry" imagePath="./bg1.jpg" />
      <Sections />
      <Link className="mx-auto w-full" href="/products">
        <h4 className="mx-auto my-4 w-fit border-b border-black pb-1 text-center text-sm font-semibold">
          ALL PRODUCTS
        </h4>
      </Link>
            <FeaturedProducts />

      <FeaturedProducts />
      <Title text="GALLERY" imagePath="./title2.jpg" />
      <StudioStatement
text="In 06.33.11 we believe that jewelry should be one of a kind, just as our audience is. Jewelry should be celebrated, and wearing it should make you feel special. So in our studio you will not find two identical pieces."      />

    </main>
  );
}
