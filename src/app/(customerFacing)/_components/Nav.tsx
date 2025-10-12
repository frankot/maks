"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
];

export default function Nav() {
  const [showFloating, setShowFloating] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const current = window.scrollY;
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const delta = current - lastY.current;
        const passed = current > 120; // show only after scrolling down a bit

        if (!passed) {
          setShowFloating(false);
        } else if (delta < -6) {
          // scrolling up
          setShowFloating(true);
        } else if (delta > 6) {
          // scrolling down
          setShowFloating(false);
        }

        lastY.current = current;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Floating small nav that appears on scroll up */}
      <div
        className={`fixed top-0 left-0 right-0 z-50  bg-white/90 backdrop-blur transition-transform duration-300 ${
          showFloating ? "translate-y-0" : "-translate-y-full"
        }`}
        role="navigation"
        aria-label="Quick Navigation"
      >
        <div className="mx-auto  px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left 1/2 - Small brand */}
            <div className="w-1/2 pr-3">
              <Link href="/" className="block text-black text-lg md:text-xl font-bold uppercase tracking-tight">
                SPLOT STUDIO
              </Link>
            </div>
            {/* Right 1/2 - Split: links (1/2) and cart (1/2) */}
            <div className="w-1/2 pl-3 flex items-center justify-between">
              <div className="w-1/2 flex items-center gap-6">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="text-xs md:text-sm uppercase tracking-wider text-black/90 hover:text-black">
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="w-1/2 flex items-center justify-end">
                <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                  <CartIcon size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static main nav at the top of the page */}
      <nav className="w-full  bg-white" role="navigation" aria-label="Main Navigation">
        <div className="mx-auto  px-4">
          <div className="flex items-start justify-between py-8 md:py-10">
            {/* Left 1/2 - Big brand */}
            <div className="w-1/2 pr-3">
              <Link
                href="/"
                className="block text-black font-extrabold uppercase leading-[0.9] whitespace-nowrap text-4xl sm:text-5xl md:text-6xl lg:text-8xl"
              >
                SPLOT STUDIO
              </Link>
            </div>
            {/* Right 1/2 - Split: links (1/2) and cart (1/2) */}
            <div className="w-1/2 pl-3 flex items-center justify-between">
              <div className="w-1/2 flex items-center gap-8">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm md:text-base uppercase tracking-wider text-black/90 hover:text-black">
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="w-1/2 flex  items-center justify-end lg:pr-10">
                <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                  <CartIcon size={32} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function CartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <rect x="5" y="7" width="14" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
