import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageWithHeroBar from '../_components/PageWithHeroBar'
import Gallery from './components/Gallery'
import ArtistsBar from './components/ArtistsBar'
import ArtistsBarSkeleton from './components/ArtistsBarSkeleton'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Browse the MAMI gallery — editorial photography showcasing our handmade jewelry pieces, studio sessions, and behind-the-scenes craftsmanship.',
  alternates: { canonical: 'https://mami.com.pl/gallery' },
}

export default function GalleryPage() {
  return (
    <>
      {/* Hero + Bar Wrapper */}
      <PageWithHeroBar imagePath="/gall_bg.webp" imageAlt="Gallery">
        <Suspense fallback={<ArtistsBarSkeleton />}>
          <ArtistsBar />
        </Suspense>
      </PageWithHeroBar>

      {/* Gallery content */}
      <Gallery />
    </>
  )
}
