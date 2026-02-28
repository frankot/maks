'use client'

import { useEffect, useMemo, useState } from 'react'
import GalleryCard from './GalleryCard'
import GalleryModal from './GalleryModal'
import Image from 'next/image'
import Link from 'next/link'

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
]

function FallbackGallery({ openModal }: { openModal: (index: number) => void }) {
  return (
    <>
      {/* Row 1: 5 columns — 2col mobile, last item centered */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {fallbackItems.slice(0, 4).map((item, i) => (
          <GalleryCard
            key={item.id}
            imagePath={item.imagePath}
            artistName={item.name}
            onClick={() => openModal(i)}
            portrait
          />
        ))}
        <div className="col-span-2 flex justify-center md:col-span-1">
          <div className="w-1/2 md:w-full">
            <GalleryCard
              key={fallbackItems[4].id}
              imagePath={fallbackItems[4].imagePath}
              artistName={fallbackItems[4].name}
              onClick={() => openModal(4)}
              portrait
            />
          </div>
        </div>
      </div>
      {/* Row 2: 3 columns — 1col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {fallbackItems.slice(5, 8).map((item, i) => (
          <GalleryCard
            key={item.id}
            imagePath={item.imagePath}
            artistName={item.name}
            onClick={() => openModal(5 + i)}
          />
        ))}
      </div>
      {/* Row 3: 5 columns — 2col mobile, last item centered */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {fallbackItems.slice(8, 12).map((item, i) => (
          <GalleryCard
            key={item.id}
            imagePath={item.imagePath}
            artistName={item.name}
            onClick={() => openModal(8 + i)}
            portrait
          />
        ))}
        <div className="col-span-2 flex justify-center md:col-span-1">
          <div className="w-1/2 md:w-full">
            <GalleryCard
              key={fallbackItems[12].id}
              imagePath={fallbackItems[12].imagePath}
              artistName={fallbackItems[12].name}
              onClick={() => openModal(12)}
              portrait
            />
          </div>
        </div>
      </div>
      {/* Row 4: 3 columns — 1col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {fallbackItems.slice(13, 16).map((item, i) => (
          <GalleryCard
            key={item.id}
            imagePath={item.imagePath}
            artistName={item.name}
            onClick={() => openModal(13 + i)}
          />
        ))}
      </div>
    </>
  )
}

export default function Gallery() {
  const [rows, setRows] = useState<GalleryRow[] | null>(null)
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch('/api/gallery/rows')
        if (res.ok) {
          const data: GalleryRow[] = await res.json()
          if (data.length > 0) {
            setRows(data)
          }
        }
      } catch {
        // fallback will render
      }
    }
    void fetchRows()
  }, [])

  // Flatten all images for modal navigation
  const allImages = useMemo(() => {
    if (rows && rows.length > 0) {
      return rows.flatMap((row) =>
        [...row.images]
          .sort((a, b) => a.order - b.order)
          .map((img) => ({
            id: img.id,
            imagePath: img.imagePath,
            artistName: img.artist.name,
          }))
      )
    }
    return fallbackItems.map((item) => ({
      id: item.id,
      imagePath: item.imagePath,
      artistName: item.name,
    }))
  }, [rows])

  // Track cumulative index offset for each row to map card click → flat index
  const openModal = (flatIndex: number) => setModalIndex(flatIndex)

  return (
    <div className="mx-auto">
      <div className="space-y-0">
        {rows && rows.length > 0 ? (
          rows.map((row) => {
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
                      onClick={() => openModal(flatIdx)}
                    />
                  )
                })}
              </div>
            )
          })
        ) : (
          <FallbackGallery openModal={openModal} />
        )}

        {modalIndex !== null && (
          <GalleryModal
            images={allImages}
            currentIndex={modalIndex}
            onClose={() => setModalIndex(null)}
            onNavigate={setModalIndex}
          />
        )}

        {/* Shop CTA Section - Full width with image */}
        <div className="relative mt-10 h-[40vh] w-full sm:mt-16 md:mt-20 md:h-[60vh]">
          <Image src="/shop_main.jpg" alt="Shop" fill className="object-cover" sizes="100vw" />
          {/* Black tint overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Centered SHOP link */}
          <Link href="/shop" className="group absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 text-4xl font-bold tracking-wider text-white uppercase sm:gap-4 sm:text-6xl md:text-8xl">
              SHOP
              <svg
                className="h-10 w-10 transition-transform duration-300 group-hover:translate-x-4 sm:h-16 sm:w-16 md:h-24 md:w-24 lg:-ml-7"
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
        <div className="mx-auto max-w-4xl border-b border-gray-300 px-5 py-12 text-center sm:px-8 sm:py-20">
          <p className="text-sm leading-relaxed tracking-wide text-gray-800 uppercase sm:text-lg md:text-xl">
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
  )
}
