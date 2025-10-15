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
          <div className="flex h-20 items-center justify-between">
            {/* Left 1/2 - Small brand */}
            <div className="flex w-1/2 pr-3">
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
              <div className="flex w-1/2 items-center gap-6">
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
            </div>
            {/* Right 1/2 - Split: links (1/2) and cart (1/2) */}

            <div className="flex w-1/2 items-center justify-end">
              <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                <CartIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Static main nav at the top of the page */}
      <nav className="w-full bg-white" role="navigation" aria-label="Main Navigation">
        <div className="mx-auto px-4">
          <div className="flex items-start justify-between py-8 md:py-10">
            {/* Left 1/2 - Big brand */}
            <div className="w-1/2 pr-3">
              <Link
                href="/"
                className="block text-4xl leading-[0.9] font-extrabold whitespace-nowrap text-black uppercase sm:text-5xl md:text-6xl lg:text-5xl"
              >
                <span className="inline-flex items-center align-middle">
                  <span className="font-neubold -mr-10">SPLOT</span>
                  <Image
                    src="/sun.png"
                    alt=""
                    width={300}
                    height={300}
                    className="inline-block align-middle sm:size-10 md:size-12 lg:size-44"
                  />
                  <span className="font-neubold -ml-8">STUDIO</span>
                </span>
              </Link>
            </div>
            {/* Right 1/2 - Split: links (1/2) and cart (1/2) */}
            <div className="flex w-1/2 items-center justify-between pl-3">
              <div className="flex w-1/2 items-center gap-8">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm tracking-wider text-black/90 uppercase hover:text-black md:text-base"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="flex w-1/2 items-center justify-end lg:pr-10">
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
