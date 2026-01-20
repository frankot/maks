'use client';

import Image from 'next/image';
import { useNav } from '@/contexts/NavContext';

interface PageWithHeroBarProps {
  imagePath: string;
  imageAlt?: string;
  title?: string;
  children: React.ReactNode;
}

export default function PageWithHeroBar({
  imagePath,
  imageAlt = 'Hero Image',
  title,
  children,
}: PageWithHeroBarProps) {
  const { showNav } = useNav();

  return (
    <>
      <main className="pt-[var(--nav-height)]">
        {/* Hero Image */}
        <div className="relative h-[300px] w-full lg:h-[400px]">
          <div className="bg-black/10 absolute inset-0 z-10" />
          <Image
            src={imagePath}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
          {title && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <h1 className="text-3xl uppercase text-white font-semibold tracking-wider">
                {title}
              </h1>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bar Wrapper */}
      <div className={`sticky z-40 bg-white border-b border-gray-200 transition-[top] duration-300 ${
        showNav ? 'top-[var(--nav-height)]' : 'top-0'
      }`}>
        <div className="py-3">
          <div className="scrollbar-hide mx-auto flex max-w-6xl items-center justify-start gap-8 overflow-x-auto px-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
