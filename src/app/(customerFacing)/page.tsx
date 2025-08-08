import Hero from "./_components/Hero";
import FeaturedProducts from "./_components/FeaturedProducts";
import Title from "./_components/Title";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Title text="Jewelry" imagePath="./bg1.jpg" />
    </main>
  );
}
