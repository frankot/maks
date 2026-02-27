'use client'

import { useEffect, useState } from 'react'

interface MarqueeState {
  description: string
  href: string
  textHref: string
}

const FALLBACK: MarqueeState = {
  description: 'mami — a jewelry brand founded by Maks Michalak in 2024, based in Warsaw, Poland',
  href: '#',
  textHref: 'CHECK US OUT ;)',
}

export default function Marquee() {
  const [state, setState] = useState<MarqueeState>(FALLBACK)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/marquee')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setState({
              description: data.description || FALLBACK.description,
              href: data.href || FALLBACK.href,
              textHref: data.textHref || FALLBACK.textHref,
            })
          }
        }
      } catch {
        // fallbacks will render
      }
    }
    void fetchData()
  }, [])

  return (
    <div className="mx-auto py-5  md:py-10">
      {/* Marquee description */}
      <div className="relative mb-4 w-full overflow-hidden">
        {/* Optional gradient edges for a subtle fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

        <div className="animate-hero-marquee flex py-2 whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, groupIndex) => (
            <span
              key={groupIndex}
              className="font-neubold mx-8 text-3xl md:text-5xl leading-9 text-black/80 uppercase"
              aria-hidden={groupIndex !== 0}
            >
              {state.description}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <a href={state.href} className="group relative pb-1 text-sm tracking-wider uppercase">
          {state.textHref}
          <span className="absolute bottom-0 left-0 h-px w-full bg-black transition-all duration-300 group-hover:left-1/2 group-hover:w-0" />
        </a>
      </div>

      <style jsx>{`
        @keyframes hero-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-hero-marquee {
          animation: hero-marquee 10s linear infinite;
        }
        @media (min-width: 768px) {
          .animate-hero-marquee {
            animation: hero-marquee 40s linear infinite;
          }
        }
      `}</style>
    </div>
  )
}
