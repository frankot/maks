'use client';

import { useEffect, useState } from 'react';
import type { HeroContent } from '@prisma/client';

interface MarqueeState {
  href?: string | null;
  textHref?: string | null;
}

export default function Marquee() {
  const [state, setState] = useState<MarqueeState>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hero');
        if (res.ok) {
          const data: HeroContent = await res.json();
          setState({
            href: data?.href ?? undefined,
            textHref: data?.textHref ?? undefined,
          });
        }
      } catch {
        // ignore; fallbacks will render
      }
    };
    void fetchData();
  }, []);

  // Always use hardcoded description
  const description =
    'SPLOT STUDIO A jewelry brand founded by Maks Michalak in 2024, based in Warsaw, Poland';
  const href = state.href ?? '#';
  const textHref = state.textHref ?? 'CHECK US OUT ;)';

  return (
    <div className="mx-auto py-10">
      {/* Marquee description */}
      <div className="relative mb-4 w-full overflow-hidden">
        {/* Optional gradient edges for a subtle fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

        <div className="animate-hero-marquee flex py-2 whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, groupIndex) => (
            <span
              key={groupIndex}
              className="font-neubold mx-8 text-5xl leading-9 text-black/80 uppercase"
              aria-hidden={groupIndex !== 0}
            >
              {description}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <a href={href} className="group relative pb-1 text-sm tracking-wider uppercase">
          {textHref}
          <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0" />
        </a>
      </div>

      <style jsx>{`
        @keyframes hero-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-hero-marquee {
          animation: hero-marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
