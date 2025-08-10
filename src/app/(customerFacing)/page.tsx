import Hero from './_components/Hero';
import FeaturedProducts from './_components/FeaturedProducts';
import Title from './_components/Title';
import Sections from './_components/Sections';
import Link from 'next/link';

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


    </main>
  );
}
