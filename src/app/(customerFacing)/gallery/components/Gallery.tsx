'use client';

import { useEffect, useState } from 'react';
import GalleryCard from './GalleryCard';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryImage {
  id: string;
  imagePath: string;
  order: number;
  artist: { name: string };
}

interface GalleryRow {
  id: string;
  layout: 'THREE_COL' | 'FIVE_COL';
  order: number;
  images: GalleryImage[];
}

// Hardcoded fallback items
const fallbackItems = [
  { id: 'gal1', name: 'Anna Kowalska', imagePath: '/gallery/gal1_s.jpg' },
  { id: 'gal2', name: 'Anna Kowalska', imagePath: '/gallery/gal2_s.jpg' },
  { id: 'gal3', name: 'Anna Kowalska', imagePath: '/gallery/gal3_s.jpg' },
  { id: 'gal4', name: 'Anna Kowalska', imagePath: '/gallery/gal4_s.jpg' },
  { id: 'gal5', name: 'Anna Kowalska', imagePath: '/gallery/gal5_s.jpg' },
  { id: 'gal6', name: 'Maria Nowak', imagePath: '/gallery/gal1_b.jpg' },
  { id: 'gal7', name: 'Maria Nowak', imagePath: '/gallery/gal2_b.jpg' },
  { id: 'gal8', name: 'Maria Nowak', imagePath: '/gallery/gal3_b.jpg' },
  { id: 'gal9', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal1_s.jpg' },
  { id: 'gal10', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal2_s.jpg' },
  { id: 'gal11', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal3_s.jpg' },
  { id: 'gal12', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal4_s.jpg' },
  { id: 'gal13', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal5_s.jpg' },
  { id: 'gal14', name: 'Anna Kowalska', imagePath: '/gallery/gal1_b.jpg' },
  { id: 'gal15', name: 'Anna Kowalska', imagePath: '/gallery/gal2_b.jpg' },
  { id: 'gal16', name: 'Anna Kowalska', imagePath: '/gallery/gal3_b.jpg' },
];

function FallbackGallery() {
  return (
    <>
      {/* Row 1: 5 columns */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
        {fallbackItems.slice(0, 5).map((item) => (
          <GalleryCard key={item.id} imagePath={item.imagePath} artistName={item.name} />
        ))}
      </div>
      {/* Row 2: 3 columns */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
        {fallbackItems.slice(5, 8).map((item) => (
          <GalleryCard key={item.id} imagePath={item.imagePath} artistName={item.name} />
        ))}
      </div>
      {/* Row 3: 5 columns */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
        {fallbackItems.slice(8, 13).map((item) => (
          <GalleryCard key={item.id} imagePath={item.imagePath} artistName={item.name} />
        ))}
      </div>
      {/* Row 4: 3 columns */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
        {fallbackItems.slice(13, 16).map((item) => (
          <GalleryCard key={item.id} imagePath={item.imagePath} artistName={item.name} />
        ))}
      </div>
    </>
  );
}

export default function Gallery() {
  const [rows, setRows] = useState<GalleryRow[] | null>(null);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch('/api/gallery/rows');
        if (res.ok) {
          const data: GalleryRow[] = await res.json();
          if (data.length > 0) {
            setRows(data);
          }
        }
      } catch {
        // fallback will render
      }
    };
    void fetchRows();
  }, []);

  return (
    <div className="mx-auto">
      <div className="space-y-0">
        {rows && rows.length > 0
          ? rows.map((row) => {
              const gridCols =
                row.layout === 'FIVE_COL'
                  ? 'grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5'
                  : 'grid grid-cols-2 gap-0 md:grid-cols-3';

              const sortedImages = [...row.images].sort((a, b) => a.order - b.order);

              return (
                <div key={row.id} className={gridCols}>
                  {sortedImages.map((img) => (
                    <GalleryCard
                      key={img.id}
                      imagePath={img.imagePath}
                      artistName={img.artist.name}
                    />
                  ))}
                </div>
              );
            })
          : <FallbackGallery />}

        {/* Shop CTA Section - Full width with image */}
        <div className="relative mt-20 h-[60vh] w-full">
          <Image src="/shop_main.jpg" alt="Shop" fill className="object-cover" sizes="100vw" />
          {/* Black tint overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Centered SHOP link */}
          <Link href="/shop" className="group absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-4 text-6xl font-bold tracking-wider text-white uppercase md:text-8xl">
              SHOP
              <svg
                className="h-16 w-16 transition-transform duration-300 group-hover:translate-x-4 md:h-24 md:w-24 lg:-ml-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
        {/* Text Section */}
        <div className="mx-auto max-w-4xl border-b border-gray-300 px-8 py-20 text-center">
          <p className="text-lg leading-relaxed tracking-wide text-gray-800 uppercase md:text-xl">
            In 06.33.11 we believe that jewelry should be one of a kind, just as our audience is.
            Jewelry should be celebrated, and wearing it should make you feel special. So in our
            studio you will not find two identical pieces.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block text-sm tracking-wider text-gray-700 uppercase underline transition-colors hover:text-black"
          >
            Check it out
          </Link>
        </div>
      </div>
    </div>
  );
}
