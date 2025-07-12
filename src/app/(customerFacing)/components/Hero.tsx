"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative mt-16 flex h-[635px] w-full overflow-hidden">
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-black/5" />

        {/* Slide 1: hero1.jpg left, hero2.jpg right */}
        <div
          className={`absolute inset-0 flex transition-opacity duration-1000 ${
            currentSlide === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-1/2">
            <Image
              src="/hero1.jpg"
              alt="Hero Image 1"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative w-1/2">
            <Image
              src="/hero2.jpg"
              alt="Hero Image 2"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Slide 2: hero2.jpg left, hero1.jpg right */}
        <div
          className={`absolute inset-0 flex transition-opacity duration-1000 ${
            currentSlide === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-1/2">
            <Image
              src="/hero2.jpg"
              alt="Hero Image 2"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-1/2">
            <Image
              src="/hero1.jpg"
              alt="Hero Image 1"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-[32px] leading-9 font-[500] uppercase">
          06.33.11 Studio. A jewelry brand founded by Maks Michalak in 2024,
          based in Warsaw, Poland. In our studio we make thinks organic yet
          bold, as we hope our audience to be. Natural forms, raw and cut
          stones, molten designs and sparkle of luxury on yourself.
        </h2>
        <div className="flex justify-center">
          <a
            href="#"
            className="group relative pb-1 text-sm tracking-wider uppercase"
          >
            CHECK US OUT ;)
            <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0"></span>
          </a>
        </div>
      </div>
    </>
  );
}
