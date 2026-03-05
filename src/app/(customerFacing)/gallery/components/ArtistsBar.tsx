'use client'

import Link from 'next/link'
import { artistNameToSlug } from '@/lib/utils/slugify'

interface ArtistsBarProps {
  artists: { id: string; name: string }[]
  highlightedArtist?: string
}

export default function ArtistsBar({ artists, highlightedArtist }: ArtistsBarProps) {
  return (
    <>
      <Link
        href="/gallery"
        scroll={false}
        className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
          !highlightedArtist ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
        }`}
      >
        All
      </Link>

      {artists.map((a) => {
        const slug = artistNameToSlug(a.name)
        return (
          <Link
            key={a.id}
            href={`/gallery/${slug}`}
            scroll={false}
            className={`text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
              highlightedArtist === slug ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
            }`}
          >
            {a.name}
          </Link>
        )
      })}
    </>
  )
}
