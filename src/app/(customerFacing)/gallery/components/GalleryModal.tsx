'use client'

import { useCallback, useEffect } from 'react'
import Image from 'next/image'

interface GalleryModalImage {
  id: string
  imagePath: string
  artistName: string
}

interface GalleryModalProps {
  images: GalleryModalImage[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function GalleryModal({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: GalleryModalProps) {
  const current = images[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowRight':
          goNext()
          break
        case 'ArrowLeft':
          goPrev()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goNext, goPrev])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/60 transition-colors hover:text-white sm:top-6 sm:right-6"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-50 text-[10px] tracking-widest text-white/40 sm:top-6 sm:left-6 sm:text-xs">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous arrow */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          className="absolute left-4 z-50 p-3 text-white/40 transition-colors hover:text-white md:left-8"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          className="absolute right-4 z-50 p-3 text-white/40 transition-colors hover:text-white md:right-8"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      )}

      {/* Main image + artist name */}
      <div
        className="flex max-h-[90vh] w-full max-w-[90vw] flex-col items-center px-10 sm:px-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[60vh] w-full sm:h-[75vh] sm:w-[85vw] md:h-[80vh] md:w-[70vw]">
          <Image
            key={current.id}
            src={current.imagePath}
            alt={current.artistName}
            fill
            quality={95}
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 85vw"
            priority
          />
        </div>
        <p className="mt-3 text-[10px] tracking-[0.25em] text-white/50 uppercase sm:mt-4 sm:text-xs">
          {current.artistName}
        </p>
      </div>
    </div>
  )
}
