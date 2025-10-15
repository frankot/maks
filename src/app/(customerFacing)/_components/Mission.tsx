'use client';

import Image from 'next/image';

export default function Mission() {
  return (
    <section className="relative mt-16 w-full">
      {/* Container keeps aspect, image fills */}
      <div className="relative h-[720px] w-full">
        <Image src="/maxHor.jpg" alt="Our mission" fill priority={false} className="object-cover object-bottom" />

        {/* Subtle gradient for text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent" />

        {/* Top-left text */}
        <div className="absolute top-6 left-4 max-w-xl text-white md:top-10">
          <h2 className=" text-2xl font-bold tracking-tight uppercase md:text-4xl lg:text-8xl">
            Mission
          </h2>
          <p className="mt-3 text-sm leading-relaxed opacity-95 md:text-base">
            Splot Studio crafts timeless jewelry with a focus on material honesty, sustainable
            processes, and everyday wearability. Designed in Warsaw, made to last.
          </p>
        </div>
      </div>
    </section>
  );
}
