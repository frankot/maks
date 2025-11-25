'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import NavCarousel from './NavCarousel';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
];

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface NavProps {
  showCollectionsBar?: boolean;
}

export default function Nav({ showCollectionsBar = false }: NavProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCollection = searchParams?.get('collection');
  const isHomePage = pathname === '/';

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };
    fetchCollections();
  }, []);

  // Handle scroll behavior on home page
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        // Always show nav at the top
        setShowNav(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowNav(false);
      } else {
        // Scrolling up
        setShowNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, lastScrollY]);

  // Handle scroll to section on page load if hash is present
  useEffect(() => {
    if (pathname === '/shop' && typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash) {
        // Wait for content to load
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            // account for fixed nav + collections bar height
            const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;
            const colH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--collections-bar-height')) || 0;
            const targetY = element.getBoundingClientRect().top + window.scrollY - (navH + colH);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [pathname]);

  const scrollToSection = (id: string) => {
    // Check if we're on the shop page
    if (pathname === '/shop') {
      const element = document.getElementById(id);
      if (element) {
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;
        const colH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--collections-bar-height')) || 0;
        const targetY = element.getBoundingClientRect().top + window.scrollY - (navH + colH);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    } else {
      // Navigate to shop page with hash for scroll target
      window.location.href = `/shop#${id}`;
    }
  };

  return (
    <>
      {/* Fixed main nav */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-white transition-transform duration-300 ${
          isHomePage && !showNav ? '-translate-y-full' : 'translate-y-0'
        }`} 
        role="navigation" 
        aria-label="Main Navigation"
      >
        <NavCarousel />
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
              <div className="hidden items-center gap-6 md:flex">
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
            <div className="absolute inset-y-0 right-6 hidden items-center md:flex">
              <Link href="/cart" aria-label="Cart" className="text-black hover:text-gray-700">
                <CartIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Collections bar - fixed for product pages, sticky for shop page */}
      {showCollectionsBar && (
        <div className="fixed top-[var(--nav-height)] left-0 right-0 z-40 bg-white border-b border-gray-200">
          <div className="py-3">
            <div className="scrollbar-hide mx-auto flex max-w-7xl items-center justify-center gap-8 overflow-x-auto px-4">
              {/* Categories */}
              <button
                onClick={() => scrollToSection('rings')}
                className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors hover:text-black"
              >
                Rings
              </button>
              <button
                onClick={() => scrollToSection('necklaces')}
                className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors hover:text-black"
              >
                Necklaces
              </button>
              <button
                onClick={() => scrollToSection('earrings')}
                className="text-xs tracking-widest whitespace-nowrap text-gray-500 uppercase transition-colors hover:text-black"
              >
                Earrings
              </button>

              <div className="mx-2 h-4 w-px bg-gray-300" />

              <Link
                href="/shop"
                className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
                  !currentCollection ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                All
              </Link>

              {collections.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?collection=${c.slug}`}
                  className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
                    currentCollection === c.slug
                      ? 'font-bold text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
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
