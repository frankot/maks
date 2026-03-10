'use client'

import { useMemo, useState } from 'react'
import GalleryCard from './GalleryCard'
import GalleryModal from './GalleryModal'

interface GalleryImage {
  id: string
  imagePath: string
  order: number
  artist: { name: string }
}

interface GalleryRow {
  id: string
  layout: 'THREE_COL' | 'FIVE_COL'
  order: number
  images: GalleryImage[]
}

interface ArtistGalleryProps {
  rows: GalleryRow[]
}

export default function ArtistGallery({ rows }: ArtistGalleryProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  const allImages = useMemo(() => {
    return rows.flatMap((row) =>
      [...row.images]
        .sort((a, b) => a.order - b.order)
        .map((img) => ({
          id: img.id,
          imagePath: img.imagePath,
          artistName: img.artist.name,
        }))
    )
  }, [rows])

  return (
    <div className="mx-auto">
      <div className="space-y-0">
        {rows.map((row) => {
          const gridCols =
            row.layout === 'FIVE_COL'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
              : 'grid grid-cols-1 md:grid-cols-3'

          const sortedImages = [...row.images].sort((a, b) => a.order - b.order)
          const isOddFiveCol = row.layout === 'FIVE_COL' && sortedImages.length % 2 !== 0

          return (
            <div key={row.id} className={gridCols}>
              {sortedImages.map((img, idx) => {
                const flatIdx = allImages.findIndex((ai) => ai.id === img.id)
                const isLastOdd = isOddFiveCol && idx === sortedImages.length - 1
                return (
                  <div key={img.id} className={isLastOdd ? 'col-span-2 md:col-span-1' : ''}>
                    <div className={isLastOdd ? 'mx-auto w-1/2 md:w-full' : ''}>
                      <GalleryCard
                        imagePath={img.imagePath}
                        artistName={img.artist.name}
                        onClick={() => setModalIndex(flatIdx)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {modalIndex !== null && allImages.length > 0 && (
          <GalleryModal
            images={allImages}
            currentIndex={modalIndex}
            onClose={() => setModalIndex(null)}
            onNavigate={setModalIndex}
          />
        )}
      </div>
    </div>
  )
}
