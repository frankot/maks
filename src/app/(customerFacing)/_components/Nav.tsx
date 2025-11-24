'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
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
        const passed = current > 520; // show only after scrolling down a bit

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

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Floating small nav that appears on scroll up */}
      <div
        className={`fixed top-0 right-0 left-0 z-50 bg-white transition-transform duration-300 ${
          showFloating ? 'translate-y-0' : '-translate-y-full'
        }`}
        role="navigation"
        aria-label="Quick Navigation"
      >
        <div className="mx-auto px-4">
          <div className="relative flex h-20 items-center md:pr-16">
            {/* Center group: brand + nav (desktop centered) */}
            <div className="flex w-full items-center justify-between gap-4 md:justify-center md:gap-8">
              <Link
                href="/"
                className="block text-lg font-extrabold tracking-tight whitespace-nowrap text-black uppercase md:text-4xl"
              >
                <span className="inline-flex items-center gap-2 align-middle lg:mr-10">
                  <span className="font-neubold -mr-4">SPLOT</span>
                  <Image
                    src="/sun.png"
                    alt=""
                    width={50}
                    height={50}
                    className="inline-block size-4 align-middle md:size-16"
                  />
                  <span className="font-neubold -ml-4">STUDIO</span>
                </span>
              </Link>

              {/* Desktop nav links, hidden on mobile */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-xs tracking-wider text-black/90 uppercase hover:text-black md:text-sm"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Mobile cart (in-flow) */}
              <div className="md:hidden">
                <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                  <CartIcon size={18} />
                </Link>
              </div>
            </div>

            {/* Desktop cart: absolute at right-6 */}
            <div className="absolute right-6 inset-y-0 hidden md:flex items-center">
              <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                <CartIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

        {/* Static main nav replaced with small nav structure */}
        <nav className="w-full bg-white" role="navigation" aria-label="Main Navigation">
          <div className="mx-auto px-4">
            <div className="relative flex h-24 items-center md:pr-16">
              {/* Center group: brand + nav (desktop centered) */}
              <div className="flex w-full items-center justify-between gap-4 md:justify-center md:gap-8">
                <Link
                  href="/"
                  className="block text-lg font-extrabold tracking-tight whitespace-nowrap text-black uppercase md:text-4xl"
                >
                  <span className="inline-flex items-center gap-2 align-middle lg:mr-10">
                    <span className="font-neubold -mr-4">SPLOT</span>
                    <Image
                      src="/sun.png"
                      alt=""
                      width={50}
                      height={50}
                      className="inline-block size-4 align-middle md:size-16"
                    />
                    <span className="font-neubold -ml-4">STUDIO</span>
                  </span>
                </Link>

                {/* Desktop nav links, hidden on mobile */}
                <div className="hidden md:flex items-center gap-6">
                  {navLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-xs tracking-wider text-black/90 uppercase hover:text-black md:text-sm"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile cart (in-flow) */}
                <div className="md:hidden">
                  <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                    <CartIcon size={18} />
                  </Link>
                </div>
              </div>

              {/* Desktop cart: absolute at right-6 */}
              <div className="absolute right-6 inset-y-0 hidden md:flex items-center">
                <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                  <CartIcon size={18} />
                </Link>
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
        <rect
          x="5"
          y="7"
          width="14"
          height="12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
