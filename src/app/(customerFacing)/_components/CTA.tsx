'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="relative mt-16 w-full">
      <div className="mx-auto">
        <div className="flex flex-col-reverse md:grid md:grid-cols-2">
          {/* Left: image (fills) */}
          <div className="relative min-h-[70vh] w-full">
            <Image
              src="/maxvert3.webp"
              alt="Unique handcrafted jewelry"
              fill
              className="object-cover"
            />
          </div>

          {/* Right: text on stone-100 background */}
          <div className="flex min-h-[70vh] w-full items-center md:bg-stone-100">
            <div className="max-w-lg p-8 md:p-16 lg:p-24">
              <h2 className="text-4xl font-extrabold tracking-tight uppercase lg:text-6xl">
                Unique handcrafted jewelry
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-700 md:text-base">
                Crafted with care, each piece is thoughtfully designed and made by hand using
                sustainable materials. Discover timeless pieces built to last and grown from a
                commitment to honest materials and skilled craftsmanship.
              </p>

              <div className="mt-6">
                <Link
                  href="/shop"
                  className="text-black/90hover:decoration-black text-sm tracking-wider uppercase underline focus:underline focus:outline-none"
                >
                  Shop the collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
