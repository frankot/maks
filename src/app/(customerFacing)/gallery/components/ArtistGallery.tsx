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

          return (
            <div key={row.id} className={gridCols}>
              {sortedImages.map((img) => {
                const flatIdx = allImages.findIndex((ai) => ai.id === img.id)
                return (
                  <GalleryCard
                    key={img.id}
                    imagePath={img.imagePath}
                    artistName={img.artist.name}
                    onClick={() => setModalIndex(flatIdx)}
                  />
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
