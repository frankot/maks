import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageWithHeroBar from '../_components/PageWithHeroBar'
import FeaturedProducts from '../_components/FeaturedProducts'
import { ChevronRight } from 'lucide-react'
import { getShopProducts } from '@/lib/products'

export const metadata: Metadata = {
  title: 'About',
  description:
    'MAMI — a jewelry brand founded by Maks Michalak in 2024, based in Warsaw. Organic yet bold designs with natural forms, raw and cut stones, and molten luxury.',
  alternates: { canonical: 'https://mami.com.pl/about' },
}

export default async function AboutPage() {
  const brandText = `06.33.11 STUDIO. A JEWELRY BRAND FOUNDED BY MAKS MICHALAK IN 2024, BASED IN WARSAW, POLAND. IN OUR STUDIO WE MAKE THINKS ORGANIC YET BOLD, AS WE HOPE OUR AUDIENCE TO BE. NATURAL FORMS, RAW AND CUT STONES, MOLTEN DESIGNS AND SPARKLE OF LUXURY ON YOURSELF.`

  // Fetch 10 most recent SHOP products (excludes SOLD and ORDERED)
  const allProducts = await getShopProducts()
  const recentProducts = allProducts.slice(0, 10)

  return (
    <>
      {/* Hero + Bar Wrapper */}
      <PageWithHeroBar imagePath="/about_bg.webp" imageAlt="About">
        <span className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors">
          ABOUT
        </span>
        <div className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-xs font-light tracking-[0.3em] whitespace-nowrap text-black">
          mami
        </span>
      </PageWithHeroBar>

      <div className="relative min-h-[60vh] w-full bg-white md:h-[80vh]">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-white">
          <Image
            src="/about.webp"
            alt="About 06.33.11 Studio"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.2) 100%)',
            }}
          />
        </div>

        {/* Content Section */}
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-center justify-end gap-8 px-5 pt-12 pb-0 sm:px-10 md:flex-row md:justify-center md:gap-16 md:px-20 md:py-20 lg:gap-[206px]">
          {/* Left Box - Black Background with Image-Clipped Text */}
          <div className="relative z-10 flex w-full translate-y-[100%] flex-col items-center justify-center gap-2.5 bg-black px-5 py-8 sm:px-[30px] sm:py-10 md:h-[476px] md:w-[524px] md:flex-none md:translate-y-0">
            <p
              className="flex-grow self-stretch text-lg leading-6 font-medium uppercase sm:text-xl md:text-[32px] md:leading-9"
              style={{
                backgroundImage: 'url(/about.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              {brandText}
            </p>
          </div>

          {/* Right Box - Transparent Background with Black Text */}
          <div className="hidden w-full flex-col items-center md:translate-x-12 justify-center gap-2.5 px-5 py-4 sm:px-[30px] md:flex md:h-[476px] md:w-[520px] md:flex-none md:py-10">
            <p className="flex-grow self-stretch text-lg leading-6 font-medium text-black uppercase sm:text-xl md:text-[32px] md:leading-9">
              {brandText}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Belief Statement */}
      <div className="mt-32 flex flex-col items-center justify-center gap-2.5 px-5 py-8 sm:px-[30px] sm:py-10 md:mt-0">
        <p className="max-w-[1380px] py-4 text-center text-lg leading-6 font-medium text-black uppercase sm:py-10 sm:text-xl md:text-[32px] md:leading-9">
          In mami we believe that jewelry should be one of a kind, just as our audience ought to be.
          Jewelry should be celebrated, and wearing it should make you feel special. So in our
          studio you will not find two identical pieces.
        </p>

        <a
          href="/contact"
          className="flex flex-row items-center justify-center gap-2.5 border-b border-black px-0 pt-2 pb-1 text-sm font-medium tracking-tight text-black uppercase transition-opacity hover:opacity-70"
        >
          CONTACT
        </a>
      </div>

      {/* Gallery Section */}
      <div className="relative mb-10 h-[300px] w-full bg-white sm:h-[400px] md:h-[556px]">
        {/* Background Image */}
        <div className="absolute inset-0 bg-white">
          <Image src="/about_bg2.webp" alt="Gallery" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Centered Gallery Text */}
        <div className="absolute bottom-4 left-4 max-w-xl text-white sm:bottom-6 md:bottom-10">
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 text-2xl font-bold tracking-tight uppercase transition-opacity hover:opacity-80 md:text-4xl lg:text-8xl"
          >
            GALLERY{' '}
            <ChevronRight className="-ml-2 h-8 w-8 stroke-3 duration-200 group-hover:translate-x-0.5 md:h-12 md:w-12 lg:h-24 lg:w-24" />
          </Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <FeaturedProducts products={recentProducts} />
    </>
  )
}
