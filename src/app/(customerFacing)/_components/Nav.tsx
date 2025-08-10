"use client";

import Link from "next/link";
import { Stalinist_One } from "next/font/google";

const stalinistOne = Stalinist_One({
  weight: "400",
  subsets: ["latin"],
});

const navLinks = [
  { href: "/shop", label: "SHOP" },
  { href: "/about", label: "ABOUT" },
  { href: "/gallery", label: "GALLERY" },
];

const carouselTexts = [
  "10% ALWAYS GOES TO CHARITY",
  "WE MOSTLY USE STERLING SILVER",
  "WE BELIEVE THAT JEWELRY SHOULD BE ONE OF A KIND",
];

export default function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-800 bg-white" role="navigation" aria-label="Main Navigation">
      <div
        id="nav-carousel"
        className="relative h-6 w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1734215330444-679ebd7150ba?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Carousel Text */}
        <div className="absolute inset-0 flex items-center">
          <div className="animate-scroll flex whitespace-nowrap">
            {/* Repeat the text 3 times to ensure seamless loop */}
            {Array.from({ length: 3 }).map((_, groupIndex) => (
              <div key={groupIndex} className="flex">
                {carouselTexts.map((text, index) => (
                  <span
                    key={`${groupIndex}-${index}`}
                    className="mx-8 mr-32 text-[11px] tracking-wider text-white uppercase"
                  >
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-10 grid-cols-3 items-center">
          {/* Left - Navigation Links */}
          <div className="flex items-center justify-start space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-base text-xs tracking-wider text-black uppercase transition-colors hover:text-gray-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center - Logo */}
          <div className="flex justify-center">
            <Link
              href="/"
              className={`text-xl text-gray-900 uppercase antialiased ${stalinistOne.className}`}
            >
              Klejnoty Maksa
            </Link>
          </div>

          {/* Right - Contact and Cart */}
          <div className="flex items-center justify-end space-x-6">
            <Link
              href="/contact"
              className="text-xs tracking-wider text-black uppercase transition-colors hover:text-gray-600"
            >
              CONTACT
            </Link>
            <Link
              href="/cart"
              className="text-black transition-colors hover:text-gray-600"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="shop=bag">
                  <rect
                    id="Rectangle 2"
                    x="5"
                    y="7"
                    width="14"
                    height="12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    id="Rectangle 2_2"
                    d="M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </nav>
  );
}
