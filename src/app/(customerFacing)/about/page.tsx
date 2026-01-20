import Image from 'next/image';
import Link from 'next/link';
import Nav from '../_components/Nav';
import PageWithHeroBar from '../_components/PageWithHeroBar';
import FeaturedProducts from '../_components/FeaturedProducts';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { getShopProducts } from '@/lib/products';

export default async function AboutPage() {
  const brandText = `06.33.11 STUDIO. A JEWELRY BRAND FOUNDED BY MAKS MICHALAK IN 2024, BASED IN WARSAW, POLAND. IN OUR STUDIO WE MAKE THINKS ORGANIC YET BOLD, AS WE HOPE OUR AUDIENCE TO BE. NATURAL FORMS, RAW AND CUT STONES, MOLTEN DESIGNS AND SPARKLE OF LUXURY ON YOURSELF.`;

  // Fetch 10 most recent SHOP products (excludes SOLD and ORDERED)
  const allProducts = await getShopProducts();
  const recentProducts = allProducts.slice(0, 10);

  return (
    <>
      <Suspense fallback={null}>
        <Nav />
      </Suspense>

      {/* Hero + Bar Wrapper */}
      <PageWithHeroBar imagePath="/about_bg.jpg" title='About' imageAlt="About">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          ABOUT
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs tracking-widest whitespace-nowrap uppercase font-bold text-black">
          SPLOT STUDIO
        </span>
      </PageWithHeroBar>

      <div className="relative h-[80vh] w-full">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/about.png"
          alt="About 06.33.11 Studio"
          fill
          className="object-cover"
          priority
        />
        <div 
          className="absolute inset-0" 
          style={{
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.2) 100%)'
          }}
        />
      </div>

      {/* Content Section */}
      <div className="relative mx-auto flex h-[656px] max-w-[1440px] flex-row items-center justify-between gap-[206px] px-20 py-20">
        {/* Left Box - Black Background with Image-Clipped Text */}
        <div className="flex h-[476px] w-[524px] flex-none flex-col items-center justify-center gap-2.5 bg-black px-[30px] py-10">
          <p 
            className="flex-grow self-stretch font-['Inter'] text-[32px] font-medium uppercase leading-9"
            style={{
              backgroundImage: 'url(/about.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}
          >
            {brandText}
          </p>
        </div>

        {/* Right Box - Transparent Background with Black Text */}
        <div className="flex h-[476px] w-[520px] flex-none flex-col items-center justify-center gap-2.5 px-[30px] py-10">
          <p className="flex-grow self-stretch font-['Inter'] text-[32px] font-medium uppercase leading-9 text-black">
            {brandText}
          </p>
        </div>
      </div>
      </div>

      {/* Bottom Section - Belief Statement */}
      <div className="flex flex-col items-center justify-center gap-2.5 px-[30px] py-10">
        <p className="max-w-[1380px] text-center py-10 font-['Inter'] text-[32px] font-medium uppercase leading-9 text-black">
          In 06.33.11 we believe that jewelry should be one of a kind, just as our audience is. Jewelry should be celebrated, and wearing it should make you feel special. So in our studio you will not find two identical pieces.
        </p>
        
        <a 
          href="/contact" 
          className="flex flex-row items-center pt-2 justify-center gap-2.5 border-b border-black px-0 py- font-['Inter'] text-sm font-medium uppercase tracking-tight text-black hover:opacity-70 transition-opacity"
        >
          CONTACT
        </a>
      </div>

      {/* Gallery Section - Same dimensions as first content section */}
      <div className="relative h-[556px] w-full mb-10">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/about_bg2.jpg"
            alt="Gallery"
            fill
            className="object-cover"
          />
        </div>
        <div className='absolute inset-0 bg-black/30'></div>

        {/* Centered Gallery Text */}
        <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-center px-20 py-20">
          <Link 
            href="/gallery"
            className="flex items-center gap-2 font-['Inter'] text-4xl  uppercase text-white hover:opacity-80 transition-opacity"
          >
            GALLERY <ChevronRight className="h-12 w-12 stroke-1 -ml-2" />
          </Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <FeaturedProducts  products={recentProducts} />
    </>
  );
}
