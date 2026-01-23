'use client';

import GalleryCard from './GalleryCard';
import Image from 'next/image';
import Link from 'next/link';

// Gallery items with artist names
const galleryItems = [
  // Row 1: 5 small images - Anna Kowalska
  { id: 'gal1', name: 'Anna Kowalska', imagePath: '/gallery/gal1_s.jpg' },
  { id: 'gal2', name: 'Anna Kowalska', imagePath: '/gallery/gal2_s.jpg' },
  { id: 'gal3', name: 'Anna Kowalska', imagePath: '/gallery/gal3_s.jpg' },
  { id: 'gal4', name: 'Anna Kowalska', imagePath: '/gallery/gal4_s.jpg' },
  { id: 'gal5', name: 'Anna Kowalska', imagePath: '/gallery/gal5_s.jpg' },
  // Row 2: 3 big images - Maria Nowak
  { id: 'gal6', name: 'Maria Nowak', imagePath: '/gallery/gal1_b.jpg' },
  { id: 'gal7', name: 'Maria Nowak', imagePath: '/gallery/gal2_b.jpg' },
  { id: 'gal8', name: 'Maria Nowak', imagePath: '/gallery/gal3_b.jpg' },
  // Row 3: 5 small images - Ewa Wiśniewska
  { id: 'gal9', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal1_s.jpg' },
  { id: 'gal10', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal2_s.jpg' },
  { id: 'gal11', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal3_s.jpg' },
  { id: 'gal12', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal4_s.jpg' },
  { id: 'gal13', name: 'Ewa Wiśniewska', imagePath: '/gallery/gal5_s.jpg' },
  // Row 4: 3 big images - Anna Kowalska
  { id: 'gal14', name: 'Anna Kowalska', imagePath: '/gallery/gal1_b.jpg' },
  { id: 'gal15', name: 'Anna Kowalska', imagePath: '/gallery/gal2_b.jpg' },
  { id: 'gal16', name: 'Anna Kowalska', imagePath: '/gallery/gal3_b.jpg' },
];

export default function Gallery() {
  return (
    <div className="mx-auto">
      <div className="space-y-0">
        {/* Row 1: 5 columns */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
          {galleryItems.slice(0, 5).map((item) => (
            <GalleryCard
              key={item.id}
              imagePath={item.imagePath}
              artistName={item.name}
            />
          ))}
        </div>

        {/* Row 2: 3 columns */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
          {galleryItems.slice(5, 8).map((item) => (
            <GalleryCard
              key={item.id}
              imagePath={item.imagePath}
              artistName={item.name}
            />
          ))}
        </div>

        {/* Row 3: 5 columns */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
          {galleryItems.slice(8, 13).map((item) => (
            <GalleryCard
              key={item.id}
              imagePath={item.imagePath}
              artistName={item.name}
            />
          ))}
        </div>

        {/* Row 4: 3 columns */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
          {galleryItems.slice(13, 16).map((item) => (
            <GalleryCard
              key={item.id}
              imagePath={item.imagePath}
              artistName={item.name}
            />
          ))}

     
        </div>


         {/* Shop CTA Section - Full width with image */}
      <div className="relative w-full mt-20  h-[60vh]">
        <Image
          src="/shop_main.jpg"
          alt="Shop"
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Black tint overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Centered SHOP link */}
        <Link 
          href="/shop"
          className="absolute inset-0 flex items-center justify-center group "
        >
          <span className="text-white text-6xl md:text-8xl font-bold uppercase tracking-wider flex items-center gap-4">
            SHOP
            <svg 
              className="w-16 h-16 md:w-24 md:h-24 transition-transform duration-300 lg:-ml-7 group-hover:translate-x-4"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
        
      </div>
              {/* Text Section */}
        <div className="py-20 px-8 text-center max-w-4xl mx-auto border-b border-gray-300">
          <p className="text-lg md:text-xl uppercase tracking-wide leading-relaxed text-gray-800">
            In 06.33.11 we believe that jewelry should be one of a kind, just as our audience is. Jewelry should be celebrated, and wearing it should make you feel special. So in our studio you will not find two identical pieces.
          </p>
          <Link 
            href="/shop"
            className="inline-block mt-8 text-sm uppercase tracking-wider underline text-gray-700 hover:text-black transition-colors"
          >
            Check it out
          </Link>
        </div>

      </div>
    </div>
  );
}
