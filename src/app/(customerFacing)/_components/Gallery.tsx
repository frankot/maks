'use client';

import Image from 'next/image';

export default function Gallery() {
  return (
    <div className="mx-auto ">
      <div className="space-y-0">
        {/* Row 1: 5 columns - gall1.jpg */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`row1-${i}`} className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/gall1.jpg"
                alt={`Gallery item ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
          ))}
        </div>

        {/* Row 2: 3 columns - about_bg2.jpg */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`row2-${i}`} className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/about_bg2.jpg"
                alt={`Gallery item ${i + 6}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Row 3: 5 columns - gall1.jpg */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`row3-${i}`} className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/gall1.jpg"
                alt={`Gallery item ${i + 9}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
          ))}
        </div>

        {/* Row 4: 3 columns - about_bg2.jpg */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`row4-${i}`} className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/about_bg2.jpg"
                alt={`Gallery item ${i + 14}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
