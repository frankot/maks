'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { artistNameToSlug } from '@/lib/utils/slugify'

interface PhotoArtist {
  id: string
  name: string
}

interface ArtistsBarProps {
  highlightedArtist?: string
}

export default function ArtistsBar({ highlightedArtist }: ArtistsBarProps) {
  const [artists, setArtists] = useState<PhotoArtist[]>([])

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch('/api/photo-artists')
        if (res.ok) {
          const data: PhotoArtist[] = await res.json()
          setArtists(data)
        }
      } catch {
        // silently fail — bar just won't show artist links
      }
    }
    void fetchArtists()
  }, [])

  return (
    <>
      <Link
        href="/gallery"
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
