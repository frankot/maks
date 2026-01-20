'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export default function CollectionsBar() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    <>
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

      <button
        onClick={() => router.push('/shop', { scroll: false })}
        className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
          !currentCollection ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
        }`}
      >
        All
      </button>

      {collections.map((c) => (
        <button
          key={c.id}
          onClick={() => router.push(`/shop?collection=${c.slug}`, { scroll: false })}
          className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
            currentCollection === c.slug
              ? 'font-bold text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {c.name}
        </button>
      ))}
    </>
  );
}
