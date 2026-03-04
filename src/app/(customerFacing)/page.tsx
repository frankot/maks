import type { Metadata } from 'next'
import type { Category } from '@prisma/client'
import Hero from './_components/Hero'
import Mission from './_components/Mission'
import Marquee from './_components/Marquee'
import FeaturedProducts from './_components/FeaturedProducts'
import FeaturedProductsDynamic from './_components/FeaturedProductsDynamic'
import CTA from './_components/CTA'
import { getFeaturedSection } from '@/lib/featured-sections'
import { getProductsByCategory, getFeaturedProducts } from '@/lib/products'
import { getHeroContent } from '@/lib/hero'

export const metadata: Metadata = {
  title: 'MAMI — Handmade Jewelry from Warsaw',
  description:
    'Discover one-of-a-kind handmade jewelry by MAMI. Organic yet bold — natural forms, raw and cut stones, molten designs. Based in Warsaw, Poland.',
  alternates: { canonical: 'https://mami.com.pl' },
}

export default async function Home() {
  const [section1, section2, rings, necklaces, earrings, heroContent] = await Promise.all([
    getFeaturedSection(1),
    getFeaturedSection(2),
    getProductsByCategory('RINGS' as Category, 6),
    getProductsByCategory('NECKLACES' as Category, 6),
    getFeaturedProducts('EARRINGS' as Category),
    getHeroContent(),
  ])

  return (
    <>
      <main className="">
        <Hero initialContent={heroContent} />
        <Marquee />

     <FeaturedProductsDynamic
          initialCategory={'EARRINGS' as Category}
          categoryProducts={{
            RINGS: rings,
            NECKLACES: necklaces,
            EARRINGS: earrings,
            BRACELETS: [],
            CHAINS: [],
          }}
        />

   
    

        <Mission />

   
     <FeaturedProducts
          title={section1?.title ?? 'Rings'}
          href={section1?.href ?? '/shop/rings'}
          products={section1 ? section1.items.map((i) => i.product) : rings}
        />
    <FeaturedProducts
          title={section2?.title ?? 'Necklaces'}
          href={section2?.href ?? '/shop/necklaces'}
          products={section2 ? section2.items.map((i) => i.product) : necklaces}
        />
        <CTA />
      </main>
    </>
  )
}
