'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export default function CollectionsBar() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCollection = searchParams?.get('collection');

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

  const scrollToSection = (id: string) => {
    if (pathname === '/shop') {
      const element = document.getElementById(id);
      if (element) {
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;
        const colH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--collections-bar-height')) || 0;
        const targetY = element.getBoundingClientRect().top + window.scrollY - (navH + colH);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    } else {
      window.location.href = `/shop#${id}`;
    }
  };

  return (
    <div className="sticky top-[var(--nav-height)] z-40 bg-white border-b border-gray-200">
      <div className="py-3">
        <div className="scrollbar-hide mx-auto flex max-w-6xl items-center justify-start gap-8 overflow-x-auto px-4">
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
  );
}
