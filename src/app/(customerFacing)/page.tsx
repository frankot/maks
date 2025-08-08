import Hero from "./_components/Hero";
import FeaturedProducts from "./_components/FeaturedProducts";
import Title from "./_components/Title";
import Sections from "./_components/Sections";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Title text="Jewelry" imagePath="./bg1.jpg" />
      <Sections/>
    </main>
  );
}
